<?php
/**
 * SMS Informasi Web — Site Content API
 * =======================================
 * Endpoints:
 *   GET /api/site_content.php?key=homepage     — Get homepage content
 *   PUT /api/site_content.php?key=homepage     — Update homepage content (admin)
 *   GET /api/site_content.php?key=ad_settings  — Get ad settings
 *   PUT /api/site_content.php?key=ad_settings  — Update ad settings (admin)
 */

require_once 'config.php';

$method  = $_SERVER['REQUEST_METHOD'];
$key     = $_GET['key'] ?? 'homepage';
$allowed = ['homepage', 'ad_settings'];

if (!in_array($key, $allowed)) {
    sendJSON(['error' => 'Key tidak valid. Gunakan: homepage atau ad_settings'], 400);
}

switch ($method) {
    case 'GET':  handleGet($key);  break;
    case 'PUT':  handlePut($key);  break;
    default: sendJSON(['error' => 'Method tidak diizinkan'], 405);
}

function handleGet(string $key): void {
    $db   = getDB();
    $stmt = $db->prepare('SELECT content_value FROM site_content WHERE content_key = ? LIMIT 1');
    $stmt->bind_param('s', $key);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $db->close();

    if (!$row) {
        sendJSON(['error' => 'Konten tidak ditemukan'], 404);
    }

    $value = json_decode($row['content_value'], true);
    sendJSON(['success' => true, 'data' => $value]);
}

function handlePut(string $key): void {
    requireAdmin();

    $input = getInput();
    if (empty($input)) {
        sendJSON(['error' => 'Data konten diperlukan'], 400);
    }

    $value = json_encode($input, JSON_UNESCAPED_UNICODE);
    $db    = getDB();

    // Upsert
    $stmt = $db->prepare(
        'INSERT INTO site_content (content_key, content_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE content_value = VALUES(content_value), updated_at = NOW()'
    );
    $stmt->bind_param('ss', $key, $value);
    $stmt->execute();
    $stmt->close();
    $db->close();

    sendJSON(['success' => true, 'message' => 'Konten berhasil disimpan']);
}
