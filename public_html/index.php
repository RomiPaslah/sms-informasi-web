<?php
/**
 * SMS Informasi Web - Dynamic Meta-Tag Injector
 * Handles frontend routing while providing perfect meta tags for link scraping
 */

// 1. Dapatkan konten React app standar
$htmlFile = __DIR__ . '/index.html';
if (!file_exists($htmlFile)) {
    die("Sistem dalam perawatan. Silakan kembali beberapa saat lagi.");
}
$html = file_get_contents($htmlFile);

// 2. Periksa apakah rute saat ini adalah halaman detail berita
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($requestUri, PHP_URL_PATH);

if (preg_match('#^/berita/([a-fA-F0-9\-]+)/?$#', $path, $matches)) {
    $newsId = $matches[1];
    
    // Sambungkan ke database (Gunakan config API)
    $configFile = __DIR__ . '/api/config.php';
    if (file_exists($configFile)) {
        require_once $configFile;
        
        // PENTING: config.php mengubah response menjadi application/json. 
        // Kita harus mengembalikannya ke text/html agar browser me-render webnya!
        header('Content-Type: text/html; charset=utf-8');
        
        try {
            $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            if (!$db->connect_error) {
                // Cari berita berdasar ID
                $stmt = $db->prepare('SELECT title, excerpt, image FROM news WHERE id = ? AND published = 1 LIMIT 1');
                if ($stmt) {
                    $stmt->bind_param('s', $newsId);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    
                    if ($result && $news = $result->fetch_assoc()) {
                        // Update Meta Tags HTML untuk keperluan Social Share
                        $title = htmlspecialchars($news['title'], ENT_QUOTES);
                        $desc = htmlspecialchars($news['excerpt'], ENT_QUOTES);
                        $image = htmlspecialchars($news['image'], ENT_QUOTES);
                        
                        // WhatsApp/FB tidak mendukung base64 "data:image/...", kita pakai renderer PHP dinamis:
                        if (strpos($image, 'data:image') === 0) {
                            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
                            $image = rtrim($protocol . $_SERVER['HTTP_HOST'], '/') . '/api/image.php?id=' . urlencode($newsId);
                        } else if (strpos($image, 'http') !== 0 && !empty($image)) {
                            // Jika format folder /uploads biasa
                            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
                            $image = rtrim($protocol . $_SERVER['HTTP_HOST'], '/') . '/' . ltrim($image, '/');
                        }
                        
                        // Buat Canonical URL Dinamis
                        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
                        $currentUrl = rtrim($protocol . $_SERVER['HTTP_HOST'], '/') . "/berita/" . $newsId;
                        
                        // Replace standard tags
                        $html = str_replace('<title>Sinergi Muda Strategis - SMS</title>', "<title>$title | SMS</title>", $html);
                        $html = preg_replace('/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i', "<meta name=\"title\" content=\"$title\" />", $html);
                        $html = preg_replace('/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i', "<meta name=\"description\" content=\"$desc\" />", $html);
                        $html = preg_replace('/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i', "<link rel=\"canonical\" href=\"$currentUrl\" />", $html);
                        
                        // Open Graph
                        $html = preg_replace('/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i', "<meta property=\"og:title\" content=\"$title\" />", $html);
                        $html = preg_replace('/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i', "<meta property=\"og:description\" content=\"$desc\" />", $html);
                        $html = preg_replace('/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"$image\" />", $html);
                        $html = preg_replace('/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"$currentUrl\" />", $html);
                        
                        // Twitter
                        $html = preg_replace('/<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:title\" content=\"$title\" />", $html);
                        $html = preg_replace('/<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:description\" content=\"$desc\" />", $html);
                        $html = preg_replace('/<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:image\" content=\"$image\" />", $html);
                        $html = preg_replace('/<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:url\" content=\"$currentUrl\" />", $html);
                    }
                    $stmt->close();
                }
                $db->close();
            }
        } catch (Throwable $e) {
            // Abaikan error koneksi agar situs tetap tampil normal tanpa SEO dinamis (Fallback)
        }
    }
}

// 3. Tampilkan HTML ke browser
echo $html;
