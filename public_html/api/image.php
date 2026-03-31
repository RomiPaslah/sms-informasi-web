<?php
/**
 * Dynamic Image Renderer untuk OG Tags WhatsApp/Facebook
 * Men-decode base64 dari database menjadi file gambar asli 
 * URL ini akan dipanggil oleh bot: /api/image.php?id=<news_id>
 */
require_once __DIR__ . '/config.php';

// Membatalkan Header JSON yang diset oleh config.php
header_remove('Content-Type');

if (!isset($_GET['id'])) {
    http_response_code(400);
    exit;
}

$id = $_GET['id'];
$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($db->connect_error) {
    http_response_code(500);
    exit;
}

$stmt = $db->prepare('SELECT image FROM news WHERE id = ? LIMIT 1');
if ($stmt) {
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $row = $result->fetch_assoc()) {
        $base64 = $row['image'] ?? '';
        
        // Cek jika format adalah data URI (contoh: data:image/jpeg;base64,/9j/4AAQ...)
        if (strpos($base64, 'data:image/') === 0) {
            $parts = explode(',', $base64);
            if (count($parts) === 2) {
                // Ekstrak MIME tipe asli
                $formatParts = explode(';', $parts[0]);
                $mime = str_replace('data:', '', $formatParts[0]);
                
                // Decode binary
                $binary = base64_decode($parts[1]);
                
                // Tampilkan sebagai gambar statis murni
                header('Content-Type: ' . $mime);
                header('Content-Length: ' . strlen($binary));
                header('Cache-Control: public, max-age=604800'); // Cache agar WA merender cepat
                echo $binary;
                
                $stmt->close();
                $db->close();
                exit;
            }
        }
    }
    $stmt->close();
}
$db->close();

// Jika gagal, tampilkan logo default dari server
$fallbackPath = __DIR__ . '/../images/sms-logo.png';
if (file_exists($fallbackPath)) {
    header('Content-Type: image/png');
    readfile($fallbackPath);
}
