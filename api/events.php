<?php
/**
 * 3TRES6 Records — Events API (community calendar + map feed)
 *
 * Serves/merges the static calendar (data/events/events.json) with a live
 * community feed stored in data/events/live/ (inside the docroot, but that
 * folder is excluded from rsync deploys and blocked from web access by its
 * own .htaccess). GitHub Pages mirrors stay read-only — they read this API
 * from the store host via CORS.
 *
 *   GET    api/events.php         merged feed (approved static + community)
 *   POST   api/events.php         submit a party (Barcelona / Ciudad de México)
 *   DELETE api/events.php?id&key  admin yank (key = data/events/live/admin.key)
 *   OPTIONS                       CORS preflight
 *
 * Geocoding: reuse curated venue coords when the venue matches one in
 * data/venues/index.json, else Nominatim (keyless, no Google). Failure is
 * graceful: event still shows on the calendar with coords=null.
 *
 * The store is self-bootstrapping: the folder, deny rules and admin key are
 * created on first write, so no manual server setup is required.
 */

declare(strict_types=1);

error_reporting(E_ALL & ~E_DEPRECATED);
ini_set('display_errors', '0');

const STATIC_EVENTS_FILE = __DIR__ . '/../data/events/events.json';
const LIVE_DIR = __DIR__ . '/../data/events/live';
const EVENTS_FILE = LIVE_DIR . '/events.json';
const RATE_FILE = LIVE_DIR . '/ratelimit.json';
const KEY_FILE = LIVE_DIR . '/admin.key';
const HTACCESS_FILE = LIVE_DIR . '/.htaccess';

const ALLOWED_ORIGINS = [
    'https://3tres6records.albto.me' => true,
    'https://torresalberto.github.io' => true,
    'http://localhost:3000' => true,
    'http://localhost:8080' => true,
];

const CITY_COUNTRY = [
    'Barcelona' => 'ES',
    'Ciudad de México' => 'MX',
];

const BBOX = [
    'Barcelona' => ['minLat' => 41.28, 'maxLat' => 41.48, 'minLng' => 1.98, 'maxLng' => 2.25],
    'Ciudad de México' => ['minLat' => 19.15, 'maxLat' => 19.65, 'minLng' => -99.35, 'maxLng' => -98.90],
];

const MAX_FIELDS = [
    'title' => 120,
    'venue' => 120,
    'address' => 160,
    'description' => 600,
];

const MAX_DJS_TO_STORE = 6;
const MAX_SUBMISSIONS_PER_IP_DAY = 3;
const MAX_SUBMISSIONS_PER_IP_MINUTE = 1;

function send_json(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit(0);
}

function cors(): void
{
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    if ($origin !== '' && isset(ALLOWED_ORIGINS[$origin])) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
}

function store_ready(): bool
{
    if (is_dir(LIVE_DIR) && is_writable(LIVE_DIR)) {
        return true;
    }
    return @mkdir(LIVE_DIR, 0700, true) && is_writable(LIVE_DIR);
}

function bootstrap(): bool
{
    if (!store_ready()) {
        return false;
    }
    @chmod(LIVE_DIR, 0700);
    if (!is_file(HTACCESS_FILE)) {
        @file_put_contents(HTACCESS_FILE, "Require all denied\n");
    }
    if (!is_file(EVENTS_FILE)) {
        @file_put_contents(EVENTS_FILE, "[]\n");
    }
    if (!is_file(RATE_FILE)) {
        @file_put_contents(RATE_FILE, "{}\n");
    }
    if (!is_file(KEY_FILE)) {
        try {
            $key = bin2hex(random_bytes(24));
        } catch (Throwable $e) {
            $key = hash('sha256', (string) uniqid('', true));
        }
        @file_put_contents(KEY_FILE, $key . "\n");
        @chmod(KEY_FILE, 0600);
    }
    return is_file(EVENTS_FILE) && is_file(RATE_FILE) && is_file(KEY_FILE);
}

function admin_key(): string
{
    if (!is_file(KEY_FILE)) {
        return '';
    }
    return trim((string) file_get_contents(KEY_FILE));
}

function static_events(): array
{
    if (!is_file(STATIC_EVENTS_FILE)) {
        return [];
    }
    $data = json_decode((string) file_get_contents(STATIC_EVENTS_FILE), true);
    return is_array($data) ? $data : [];
}

function live_store(): array
{
    if (!is_file(EVENTS_FILE)) {
        return [];
    }
    $data = json_decode((string) file_get_contents(EVENTS_FILE), true);
    return is_array($data) ? $data : [];
}

function write_json_atomic(string $path, array $data): bool
{
    $tmp = $path . '.tmp.' . getmypid();
    if (file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n") === false) {
        return false;
    }
    if (!@chmod($tmp, 0600)) {
        // fsync + rename still important; chmod may fail on some NFS setups.
    }
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        return false;
    }
    return true;
}

function normalize_city(string $city): ?string
{
    $c = mb_strtolower(trim($city));
    $c = str_replace(['á', 'é', 'í', 'ó', 'ú', 'ü'], ['a', 'e', 'i', 'o', 'u', 'u'], $c);
    if (in_array($c, ['barcelona', 'bcn', 'barna'], true)) {
        return 'Barcelona';
    }
    if (in_array($c, ['mexico', 'mexico city', 'ciudad de mexico', 'cdmx', 'df', 'mexico df', 'ciudad de méxico'], true)) {
        return 'Ciudad de México';
    }
    return null;
}

function clean_string(?string $value, int $max): string
{
    if ($value === null) {
        return '';
    }
    $value = trim($value);
    $value = (string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value);
    $value = strip_tags($value);
    return mb_substr($value, 0, $max);
}

function valid_date(string $date): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return false;
    }
    [$y, $m, $d] = array_map('intval', explode('-', $date));
    return checkdate($m, $d, $y);
}

function curated_match(string $venue, string $city): ?array
{
    $file = __DIR__ . '/../data/venues/index.json';
    if (!is_file($file)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($file), true);
    $venues = is_array($data) && isset($data['venues']) && is_array($data['venues']) ? $data['venues'] : [];
    $needle = venue_tokens($venue);
    if (!$needle) {
        return null;
    }
    foreach ($venues as $v) {
        if (($v['city'] ?? '') === $city) {
            $hay = venue_tokens(($v['name'] ?? '') . ' ' . ($v['address'] ?? ''));
            $allFound = true;
            foreach (array_keys($needle) as $t) {
                if (!isset($hay[$t])) {
                    $allFound = false;
                    break;
                }
            }
            if ($allFound) {
                return [
                    'id' => $v['id'] ?? null,
                    'coords' => $v['coordinates'] ?? null,
                ];
            }
        }
    }
    return null;
}

function normalize_key(string $str): string
{
    $str = mb_strtolower(trim($str));
    $str = @iconv('UTF-8', 'ASCII//TRANSLIT', $str);
    $str = $str === false ? strtolower(trim($str)) : $str;
    return (string) preg_replace('/[^a-z0-9]+/', ' ', $str);
}

const VENUE_STOPWORDS = [
    'club', 'sala', 'room', 'rooms', 'bar', 'radio', 'festival', 'stage',
    'space', 'music', 'house', 'techno', 'disco', 'studio', 'church',
    'barcelona', 'mexico', 'cdmx', 'city', 'carrer', 'calle', 'street',
    'espacio', 'black',
];

function venue_tokens(string $name): array
{
    $words = explode(' ', normalize_key($name));
    $out = [];
    foreach ($words as $w) {
        $w = trim($w);
        if ($w === '' || strlen($w) <= 3 || in_array($w, VENUE_STOPWORDS, true)) {
            continue;
        }
        $out[$w] = true;
    }
    return $out;
}

function geocode(string $venue, string $address, string $city): ?array
{
    if ($ven = curated_match($venue, $city)) {
        $coords = $ven['coords'];
        if ($coords && is_numeric($coords['lat'] ?? null) && is_numeric($coords['lng'] ?? null)) {
            return [
                'lat' => (float) $coords['lat'],
                'lng' => (float) $coords['lng'],
                'source' => 'curated',
                'venue_id' => $ven['id'],
            ];
        }
    }

    $bt = BBOX[$city] ?? null;
    if (!$bt) {
        return null;
    }

    $query = trim(implode(', ', array_filter([$venue, $address, $city], static fn($s) => $s !== '')));
    if ($query === '') {
        return null;
    }

    $url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=' . rawurlencode($query);
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 6,
            'header' => "User-Agent: 3TRES6Records/1.0 (community events API)\r\n",
            'ignore_errors' => true,
        ],
    ]);

    foreach (['curl' => function () use ($url) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 6,
            CURLOPT_USERAGENT => '3TRES6Records/1.0 (community events API)',
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        $body = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        return $err !== '' ? null : $body;
    }, 'stream' => static fn() => (string) @file_get_contents($url, false, $ctx)] as $method => $fn) {
        $body = $fn();
        if ($body === null || $body === '') {
            continue;
        }
        $results = json_decode($body, true);
        if (!is_array($results)) {
            continue;
        }
        foreach ($results as $r) {
            $rlat = (float) ($r['lat'] ?? 0);
            $rlng = (float) ($r['lon'] ?? 0);
            if ($rlat === 0.0 || $rlng === 0.0) {
                continue;
            }
            if (in_range($rlat, $bt['minLat'], $bt['maxLat']) && in_range($rlng, $bt['minLng'], $bt['maxLng'])) {
                return ['lat' => $rlat, 'lng' => $rlng, 'source' => 'nominatim', 'venue_id' => null];
            }
        }
        break;
    }
    return null;
}

function in_range(float $v, float $min, float $max): bool
{
    return $v >= $min && $v <= $max;
}

function normalize_url(?string $url, int $max = 200): string
{
    $url = clean_string($url, $max);
    if ($url !== '' && !preg_match('~^https?://~i', $url)) {
        $url = '';
    }
    return $url;
}

function body_json(): array
{
    $raw = (string) file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

function read_state(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $state = json_decode((string) file_get_contents($path), true);
    return is_array($state) ? $state : [];
}

function rate_limited(string $ip): bool
{
    if (!bootstrap()) {
        return false;
    }
    $state = read_state(RATE_FILE);
    $now = time();
    $times = array_values(array_filter($state[$ip]['times'] ?? [], static fn($t) => ($now - $t) < 86400));
    $recentMinute = array_filter($times, static fn($t) => ($now - $t) < 60);
    return count($times) >= MAX_SUBMISSIONS_PER_IP_DAY || count($recentMinute) >= MAX_SUBMISSIONS_PER_IP_MINUTE;
}

// Consume a rate slot ONLY when a submission is actually stored (or honeypot):
// a failed validation must never lock the user out of retrying.
function record_attempt(string $ip): void
{
    if (!bootstrap()) {
        return;
    }
    $state = read_state(RATE_FILE);
    $now = time();
    $state[$ip] = ['times' => array_values(array_filter($state[$ip]['times'] ?? [], static fn($t) => ($now - $t) < 86400))];
    $state[$ip]['times'][] = $now;
    foreach ($state as $k => $v) {
        $arr = array_map('intval', $v['times'] ?? []);
        $t = $arr ? max($arr) : 0;
        if (($now - $t) > 86400) {
            unset($state[$k]);
        }
    }
    write_json_atomic(RATE_FILE, $state);
}

function submit($body, string $ip): void
{
    $website = trim((string) ($body['website'] ?? ''));
    if ($website !== '') {
        record_attempt($ip);
        send_json(200, ['success' => true, 'honeypot' => true]);
    }

    $title = clean_string($body['title'] ?? '', MAX_FIELDS['title']);
    $venue = clean_string($body['venue'] ?? '', MAX_FIELDS['venue']);
    $address = clean_string($body['address'] ?? '', MAX_FIELDS['address']);
    $description = clean_string($body['description'] ?? '', MAX_FIELDS['description']);
    $date = clean_string($body['date'] ?? '', 10);
    $time = clean_string($body['time'] ?? '', 10) ?: 'TBA';
    $price = clean_string($body['price'] ?? '', 30) ?: 'TBA';
    $url = normalize_url($body['url'] ?? '');
    $email = strtolower(clean_string($body['email'] ?? '', 120));
    $city = normalize_city((string) ($body['city'] ?? ''));

    if ($title === '') {
        send_json(400, ['success' => false, 'error' => 'El nombre del evento es obligatorio.']);
    }
    if (!valid_date($date)) {
        send_json(400, ['success' => false, 'error' => 'Fecha inválida (usa AAAA-MM-DD y un día futuro).']);
    }
    if ($date < date('Y-m-d')) {
        send_json(400, ['success' => false, 'error' => 'La fecha debe ser de hoy o futura.']);
    }
    if ($venue === '') {
        send_json(400, ['success' => false, 'error' => 'El lugar / venue es obligatorio.']);
    }
    if ($city === null) {
        send_json(400, ['success' => false, 'error' => 'Solo aceptamos eventos en Barcelona o Ciudad de México.']);
    }
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_json(400, ['success' => false, 'error' => 'El email parece inválido.']);
    }

    $djs = [];
    $djsRaw = $body['djs'] ?? [];
    if (is_string($djsRaw)) {
        $djsRaw = array_map('trim', explode(',', $djsRaw));
    }
    if (!is_array($djsRaw)) {
        $djsRaw = [];
    }
    foreach (array_slice($djsRaw, 0, MAX_DJS_TO_STORE) as $dj) {
        $djClean = clean_string((string) $dj, 60);
        if ($djClean !== '') {
            $djs[] = $djClean;
        }
    }

    $live = live_store();
    $dupKey = normalize_key($title . ' ' . $date . ' ' . $venue . ' ' . $city);
    foreach (array_merge(static_events(), $live) as $ex) {
        $existing = normalize_key(($ex['title'] ?? '') . ' ' . ($ex['date'] ?? '') . ' ' . ($ex['venue'] ?? '') . ' ' . ($ex['city'] ?? ''));
        if ($existing !== '' && $existing === $dupKey) {
            send_json(409, ['success' => false, 'error' => 'Ese evento ya está en el calendario.']);
        }
    }

    $id = 'com-' . substr(hash('sha1', uniqid('', true)), 0, 16);
    $coords = geocode($venue, $address, $city);

    $record = [
        'id' => $id,
        'title' => $title,
        'date' => $date,
        'time' => $time,
        'venue' => $venue,
        'address' => $address,
        'city' => $city,
        'country' => CITY_COUNTRY[$city],
        'djs' => $djs,
        'price' => $price,
        'url' => $url,
        'email' => $email,
        'description' => $description,
        'coords' => $coords === null ? null : ['lat' => $coords['lat'], 'lng' => $coords['lng']],
        'geo_source' => $coords === null ? 'none' : $coords['source'],
        'venue_id' => $coords === null ? null : $coords['venue_id'],
        'submittedAt' => gmdate('Y-m-d\TH:i:s\Z'),
        'source' => 'submission',
        'status' => 'approved',
        'community' => true,
    ];

    $live[] = $record;
    if (!write_json_atomic(EVENTS_FILE, $live)) {
        send_json(500, ['success' => false, 'error' => 'No pudimos guardar el evento. Intenta en un minuto.']);
    }
    record_attempt($ip);

    send_json(200, ['success' => true, 'message' => 'Evento publicado', 'event' => $record]);
}

function serve_feed(): void
{
    $events = array_merge(static_events(), live_store());
    $events = array_filter(
        $events,
        static fn($e) => (($e['status'] ?? '') === 'approved')
            && isset($e['title'], $e['date'], $e['venue'])
    );
    usort($events, static fn($a, $b) => strcmp($a['date'], $b['date']));
    send_json(200, ['success' => true, 'count' => count($events), 'events' => array_values($events)]);
}

function remove_event(string $id, string $key): void
{
    $token = admin_key();
    if ($token === '' || !hash_equals($token, $key)) {
        send_json(403, ['success' => false, 'error' => 'No autorizado.']);
    }
    $live = live_store();
    foreach ($live as $k => $e) {
        if (($e['id'] ?? '') === $id) {
            array_splice($live, $k, 1);
            write_json_atomic(EVENTS_FILE, $live);
            send_json(200, ['success' => true, 'removed' => $id]);
        }
    }
    send_json(404, ['success' => false, 'error' => 'Evento no encontrado.']);
}

cors();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    serve_feed();
}

if ($method === 'POST') {
    if (!bootstrap()) {
        send_json(503, ['success' => false, 'error' => 'La comunidad no está disponible aún. Escríbenos a hola@3tres6records.com.']);
    }
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (rate_limited($ip)) {
        send_json(429, ['success' => false, 'error' => 'Muchas solicitudes. Espera un momento.']);
    }
    submit(body_json(), $ip);
}

if ($method === 'DELETE') {
    $parts = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_QUERY);
    parse_str((string) $parts, $qs);
    $id = clean_string($qs['id'] ?? '', 60);
    $key = (string) ($qs['key'] ?? '');
    if ($id === '') {
        send_json(400, ['success' => false, 'error' => 'id requerido.']);
    }
    remove_event($id, $key);
}

send_json(405, ['success' => false, 'error' => 'Método no permitido.']);