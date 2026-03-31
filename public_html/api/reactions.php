<?php
/**
 * SMS Informasi Web — Reactions API
 * Delegates to comments.php shared logic
 */
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Method tidak diizinkan'], 405);
}

$input  = getInput();
$newsId = trim($input['newsId'] ?? '');
$emoji  = trim($input['emoji'] ?? '');

if (!$newsId) sendJSON(['error' => 'ID berita diperlukan'], 400);
if (!$emoji)  sendJSON(['error' => 'Emoji diperlukan'], 400);

// Try to get current user
$currentUser = null;
try {
    $currentUser = getAuthUser();
} catch (Exception $e) {
    // Not logged in - will be guest reaction
}

if ($currentUser) {
    handleUserReaction($newsId, $emoji, $currentUser);
} else {
    handleGuestReaction($newsId, $emoji, $input);
}

// ── User Reaction Handler ────────────────────────────────────────────────────
function handleUserReaction(string $newsId, string $emoji, array $currentUser): void {
    if (!$currentUser['approved'] && $currentUser['role'] !== 'admin') {
        sendJSON(['error' => 'Akun belum disetujui'], 403);
    }

    $db     = getDB();
    $userId = (string)$currentUser['id'];

    // Check current reaction
    $chkStmt = $db->prepare('SELECT emoji FROM reactions WHERE news_id = ? AND user_id = ? LIMIT 1');
    $chkStmt->bind_param('ss', $newsId, $userId);
    $chkStmt->execute();
    $existing = $chkStmt->get_result()->fetch_assoc();
    $chkStmt->close();

    if ($existing && $existing['emoji'] === $emoji) {
        // Same emoji → remove (toggle off)
        $delStmt = $db->prepare('DELETE FROM reactions WHERE news_id = ? AND user_id = ?');
        $delStmt->bind_param('ss', $newsId, $userId);
        $delStmt->execute();
        $delStmt->close();
        $newEmoji = '';
    } else {
        // Different emoji or no existing → upsert
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
}

// ── Guest Reaction Handler ───────────────────────────────────────────────────
function handleGuestReaction(string $newsId, string $emoji, array $input): void {
    $guestId = trim($input['guestId'] ?? '');
    
    if (!$guestId) {
        sendJSON(['error' => 'Guest ID diperlukan'], 400);
    }

    $db = getDB();

    // Check current reaction
    $chkStmt = $db->prepare('SELECT emoji FROM reactions WHERE news_id = ? AND guest_id = ? LIMIT 1');
    $chkStmt->bind_param('ss', $newsId, $guestId);
    $chkStmt->execute();
    $existing = $chkStmt->get_result()->fetch_assoc();
    $chkStmt->close();

    if ($existing && $existing['emoji'] === $emoji) {
        // Same emoji → remove (toggle off)
        $delStmt = $db->prepare('DELETE FROM reactions WHERE news_id = ? AND guest_id = ?');
        $delStmt->bind_param('ss', $newsId, $guestId);
        $delStmt->execute();
        $delStmt->close();
        $newEmoji = '';
    } else {
        // Different emoji or no existing → upsert
        $upsStmt = $db->prepare(
            'INSERT INTO reactions (news_id, guest_id, emoji) VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE emoji = VALUES(emoji)'
        );
        $upsStmt->bind_param('sss', $newsId, $guestId, $emoji);
        $upsStmt->execute();
        $upsStmt->close();
        $newEmoji = $emoji;
    }

    $db->close();
    sendJSON(['success' => true, 'emoji' => $newEmoji]);
}
