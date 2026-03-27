<?php
/**
 * SMS Informasi Web — Reactions API
 * Delegates to comments.php shared logic
 */
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Method tidak diizinkan'], 405);
}

$currentUser = requireAuth();
if (!$currentUser['approved'] && $currentUser['role'] !== 'admin') {
    sendJSON(['error' => 'Akun belum disetujui'], 403);
}

$input  = getInput();
$newsId = trim($input['newsId'] ?? '');
$emoji  = trim($input['emoji'] ?? '');
$userId = (string)$currentUser['id'];

if (!$newsId) sendJSON(['error' => 'ID berita diperlukan'], 400);
if (!$emoji)  sendJSON(['error' => 'Emoji diperlukan'], 400);

$db = getDB();

// Check current reaction
$chkStmt = $db->prepare('SELECT emoji FROM reactions WHERE news_id = ? AND user_id = ? LIMIT 1');
$chkStmt->bind_param('ss', $newsId, $userId);
$chkStmt->execute();
$existing = $chkStmt->get_result()->fetch_assoc();
$chkStmt->close();

if ($existing && $existing['emoji'] === $emoji) {
    // Same emoji → toggle off
    $delStmt = $db->prepare('DELETE FROM reactions WHERE news_id = ? AND user_id = ?');
    $delStmt->bind_param('ss', $newsId, $userId);
    $delStmt->execute();
    $delStmt->close();
    $newEmoji = '';
} else {
    // Upsert new emoji
    $upsStmt = $db->prepare(
        'INSERT INTO reactions (news_id, user_id, emoji) VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE emoji = VALUES(emoji)'
    );
    $upsStmt->bind_param('sss', $newsId, $userId, $emoji);
    $upsStmt->execute();
    $upsStmt->close();
    $newEmoji = $emoji;
}

$db->close();
sendJSON(['success' => true, 'emoji' => $newEmoji]);
