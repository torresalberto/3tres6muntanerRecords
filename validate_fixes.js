#!/usr/bin/env node
/**
 * Validation script to verify all fixes are correct
 * Tests: YouTube ID extraction, CSS padding values, HTML structure
 */

const fs = require('fs');
const path = require('path');

let allPassed = true;
const results = [];

function test(name, condition, details = '') {
    const status = condition ? '✅ PASS' : '❌ FAIL';
    results.push({ name, status, details });
    if (!condition) allPassed = false;
    console.log(`${status}: ${name}${details ? ' - ' + details : ''}`);
}

// ========================================
// Test 1: YouTube ID Extraction (QuickView regex)
// ========================================
console.log('\n=== Test 1: YouTube ID Extraction (QuickView) ===');

function extractYouTubeIdQuickView(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

const testUrls = [
    { url: 'https://www.youtube.com/watch?v=JvVw1XFBL7c', expected: 'JvVw1XFBL7c' },
    { url: 'https://www.youtube.com/watch?v=DwjfXA5SC8w', expected: 'DwjfXA5SC8w' },
    { url: 'https://www.youtube.com/watch?v=6TJR6szPHxk', expected: '6TJR6szPHxk' },
    { url: 'https://www.youtube.com/watch?v=JaU4V0rQF_Y', expected: 'JaU4V0rQF_Y' },
    { url: 'https://www.youtube.com/watch?v=Nm-ISatLDG0', expected: 'Nm-ISatLDG0' },
    { url: 'https://www.youtube.com/watch?v=cZ2RYr_E8SE', expected: 'cZ2RYr_E8SE' },
    { url: 'https://www.youtube.com/watch?v=wKpmFSfA59c', expected: 'wKpmFSfA59c' },
    { url: 'https://www.youtube.com/watch?v=DwFs1PNz0fc', expected: 'DwFs1PNz0fc' },
    { url: 'https://youtu.be/JvVw1XFBL7c', expected: 'JvVw1XFBL7c' },
    { url: 'https://www.youtube.com/embed/JvVw1XFBL7c', expected: 'JvVw1XFBL7c' },
];

testUrls.forEach(({ url, expected }) => {
    const result = extractYouTubeIdQuickView(url);
    test(`QuickView extractYouTubeId("${url.substring(0, 50)}...")`, result === expected, `got: ${result}, expected: ${expected}`);
});

// ========================================
// Test 2: YouTube ID Extraction (HeroPlaylist regex - fixed)
// ========================================
console.log('\n=== Test 2: YouTube ID Extraction (HeroPlaylist - fixed) ===');

function extractYouTubeIdHeroPlaylist(url) {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : null;
}

testUrls.forEach(({ url, expected }) => {
    const result = extractYouTubeIdHeroPlaylist(url);
    test(`HeroPlaylist extractYouTubeId("${url.substring(0, 50)}...")`, result === expected, `got: ${result}, expected: ${expected}`);
});

// ========================================
// Test 3: CSS - Section padding
// ========================================
console.log('\n=== Test 3: CSS Padding Values ===');

const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');

// Check .section padding is 80px 40px
const sectionPaddingMatch = cssContent.match(/\.section\s*\{[^}]*padding:\s*([^;]+);/);
if (sectionPaddingMatch) {
    const padding = sectionPaddingMatch[1].trim();
    test('.section padding is 80px 40px', padding === '80px 40px', `got: "${padding}"`);
} else {
    test('.section padding found', false, 'Could not find .section padding');
}

// Check .calendar-section padding is 80px 40px (not 100px)
const calendarPaddingMatch = cssContent.match(/\.calendar-section\s*\{[^}]*padding:\s*([^;]+);/);
if (calendarPaddingMatch) {
    const padding = calendarPaddingMatch[1].trim();
    test('.calendar-section padding is 80px 40px', padding === '80px 40px', `got: "${padding}"`);
} else {
    test('.calendar-section padding found', false, 'Could not find .calendar-section padding');
}

// Check .instagram-carousel-wrapper has no extra padding
const carouselWrapperMatch = cssContent.match(/\.instagram-carousel-wrapper\s*\{[^}]*padding:\s*([^;]+);/);
if (carouselWrapperMatch) {
    const padding = carouselWrapperMatch[1].trim();
    test('.instagram-carousel-wrapper padding is 0', padding === '0', `got: "${padding}"`);
} else {
    test('.instagram-carousel-wrapper padding found', false, 'Could not find .instagram-carousel-wrapper padding');
}

// Check blog-grid has overflow: hidden
const blogGridMatch = cssContent.match(/\.blog-grid\s*\{([^}]*)\}/);
if (blogGridMatch) {
    const hasOverflow = blogGridMatch[1].includes('overflow: hidden');
    test('.blog-grid has overflow: hidden', hasOverflow, blogGridMatch[1].trim());
} else {
    test('.blog-grid found', false, 'Could not find .blog-grid');
}

// Check a.blog-card-image has display: flex
const blogCardImageMatch = cssContent.match(/a\.blog-card-image\s*\{([^}]*)\}/);
if (blogCardImageMatch) {
    const hasDisplay = blogCardImageMatch[1].includes('display: flex');
    test('a.blog-card-image has display: flex', hasDisplay, blogCardImageMatch[1].trim());
} else {
    test('a.blog-card-image found', false, 'Could not find a.blog-card-image');
}

// ========================================
// Test 4: JavaScript - data-image in fallback products
// ========================================
console.log('\n=== Test 4: JavaScript - data-image in fallback products ===');

const jsContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// Check that loadFallbackProducts has data-image attribute
const hasDataImage = jsContent.includes('data-image="${this.getPlaceholderImage()}"');
test('loadFallbackProducts quick-view button has data-image attribute', hasDataImage);

// Check HeroPlaylist.extractYouTubeId uses match[7]
const heroPlaylistExtractMatch = jsContent.match(/HeroPlaylist[\s\S]*?extractYouTubeId\(url\)\s*\{([^}]*)\}/);
if (heroPlaylistExtractMatch) {
    const hasMatch7 = heroPlaylistExtractMatch[1].includes('match[7]');
    const hasMatch8 = heroPlaylistExtractMatch[1].includes('match[8]');
    test('HeroPlaylist.extractYouTubeId uses match[7] (not match[8])', hasMatch7 && !hasMatch8, heroPlaylistExtractMatch[1].trim());
} else {
    test('HeroPlaylist.extractYouTubeId found', false, 'Could not find HeroPlaylist.extractYouTubeId');
}

// ========================================
// Test 5: HTML Structure
// ========================================
console.log('\n=== Test 5: HTML Structure ===');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Check blog-card-image is an <a> tag
const blogCardImageHtmlMatch = htmlContent.match(/<a[^>]*class="blog-card-image"[^>]*>/);
test('blog-card-image is an <a> tag', !!blogCardImageHtmlMatch, blogCardImageHtmlMatch ? blogCardImageHtmlMatch[0] : 'not found');

// Check live-streams-banner is inside calendar-section
const calendarSectionMatch = htmlContent.match(/class="section calendar-section"[\s\S]*?class="live-streams-banner"/);
test('live-streams-banner is inside calendar-section', !!calendarSectionMatch);

// Check live-embed-container is inside calendar-section
const liveEmbedMatch = htmlContent.match(/class="section calendar-section"[\s\S]*?class="live-embed-container"/);
test('live-embed-container is inside calendar-section', !!liveEmbedMatch);

// Check instagram-carousel-wrapper is inside instagram-section
const instagramMatch = htmlContent.match(/class="section instagram-section"[\s\S]*?class="instagram-carousel-wrapper"/);
test('instagram-carousel-wrapper is inside instagram-section', !!instagramMatch);

// ========================================
// Summary
// ========================================
console.log('\n=== SUMMARY ===');
const passed = results.filter(r => r.status.includes('PASS')).length;
const failed = results.filter(r => r.status.includes('FAIL')).length;
console.log(`Total: ${results.length} tests`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Ready to push to GitHub.');
} else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    process.exit(1);
}
