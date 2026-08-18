<?php
/**
 * 3TRES6 Records — Events API (community calendar + map feed)
 *
 * Serves/merges the static calendar (data/events/events.json) with a live
 * community feed stored OUTSIDE the docroot (~/3tres6-events/live.json) so
 * GitHub Pages mirrors stay read-only and rsync --delete never wipes it.
 *
 *   GET    api/events.php         merged feed (approved static + community)
 *   POST   api/events.php         submit a party (Barcelona / Ciudad de México)
 *   DELETE api/events.php?id&key  admin yank (token from server-local config)
 *   OPTIONS                       CORS preflight
 *
 * Geocoding: reuse curated venue coords when the venue matches one in
 * data/venues/index.json, else Nominatim (keyless, no Google). Failure is
 * graceful: event still shows on the calendar with coords=null.
 *
 * Requires config at <home>/3tres6-events/config.php (created by
 * scripts/setup-events-api.sh). Without it, POST/DELETE are disabled and the
 * API is read-only.
 */

declare(strict_types=1);

error_reporting(E_ALL & ~E_DEPRECATED);
ini_set('display_errors', '0');

const STATIC_EVENTS_FILE = __DIR__ . '/../data/events/events.json';

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

function config(): ?array
{
    $dir = __DIR__;
    for ($i = 0; $i < 6; $i++) {
        $candidate = $dir . '/3tres6-events/config.php';
        if (is_file($candidate)) {
            $vars = [];
            include $candidate;
            return [
                'store' => $vars['EVENTS_STORE'] ?? '',
                'rate' => $vars['RATE_STORE'] ?? '',
                'key' => $vars['ADMIN_KEY'] ?? '',
            ];
        }
        $parent = dirname($dir);
        if ($parent === $dir) {
            break;
        }
        $dir = $parent;
    }
    return null;
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
    $cfg = config();
    if (!$cfg || $cfg['store'] === '' || !is_file($cfg['store'])) {
        return [];
    }
    $data = json_decode((string) file_get_contents($cfg['store']), true);
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

function curated_match(string $venue, string $address, string $city): ?array
{
    $file = __DIR__ . '/../data/venues/index.json';
    if (!is_file($file)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($file), true);
    $venues = is_array($data) && isset($data['venues']) && is_array($data['venues']) ? $data['venues'] : [];
    $needle = normalize_key(($venue . ' ' . $address));
    foreach ($venues as $v) {
        $hay = normalize_key(($v['name'] ?? '') . ' ' . ($v['address'] ?? ''));
        if ($hay !== '' && $needle !== '' && strpos($hay, $needle) !== false) {
            if (($v['city'] ?? '') === $city) {
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

function geocode(string $venue, string $address, string $city): ?array
{
    if ($ven = curated_match($venue, $address, $city)) {
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

function rate_allowed(string $ip): bool
{
    $cfg = config();
    if (!$cfg || $cfg['rate'] === '') {
        return true;
    }
    $state = [];
    if (is_file($cfg['rate'])) {
        $state = json_decode((string) file_get_contents($cfg['rate']), true);
        $state = is_array($state) ? $state : [];
    }
    $now = time();
    $bucket = $state[$ip] ?? ['times' => []];
    $times = array_values(array_filter($bucket['times'] ?? [], static fn($t) => ($now - $t) < 86400));
    foreach ($state as $k => $v) {
        if (is_array($v) && isset($v['times']) && ($now - max([0, ...$v['times']])) > 86400) {
            unset($state[$k]);
        }
    }
    $state[$ip] = ['times' => $times];

    $valid = true;
    $recentMinute = array_filter($times, static fn($t) => ($now - $t) < 60);
    if (count($times) >= MAX_SUBMISSIONS_PER_IP_DAY || count($recentMinute) >= MAX_SUBMISSIONS_PER_IP_MINUTE) {
        $valid = false;
    } else {
        $state[$ip]['times'][] = $now;
    }
    // Persist best-effort; rate limiting is advisory, not a hard guarantee.
    write_json_atomic($cfg['rate'], $state);
    return $valid;
}

function submit($body): void
{
    $website = trim((string) ($body['website'] ?? ''));
    if ($website !== '') {
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
    if (!write_json_atomic(config()['store'], $live)) {
        send_json(500, ['success' => false, 'error' => 'No pudimos guardar el evento. Intenta en un minuto.']);
    }

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
    $cfg = config();
    if (!$cfg || $cfg['key'] === '' || !hash_equals($cfg['key'], $key)) {
        send_json(403, ['success' => false, 'error' => 'No autorizado.']);
    }
    $live = live_store();
    foreach ($live as $k => $e) {
        if (($e['id'] ?? '') === $id) {
            array_splice($live, $k, 1);
            write_json_atomic($cfg['store'], $live);
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
    if (config() === null) {
        send_json(503, ['success' => false, 'error' => 'Community API not configured.']);
    }
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!rate_allowed($ip)) {
        send_json(429, ['success' => false, 'error' => 'Muchas solicitudes. Espera un momento.']);
    }
    submit(body_json());
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