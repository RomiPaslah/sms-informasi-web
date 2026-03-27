<?php
/**
 * SMS Informasi Web — Comments & Reactions API
 * ===============================================
 * Endpoints:
 *   POST   /api/comments.php              — Tambah komentar (harus login & approved)
 *   DELETE /api/comments.php?id=X         — Hapus komentar (admin atau pemilik)
 *   POST   /api/reactions.php             — Toggle reaksi emoji
 */

require_once 'config.php';

$method   = $_SERVER['REQUEST_METHOD'];
$endpoint = basename(__FILE__, '.php'); // 'comments' or 'reactions'
$id       = $_GET['id'] ?? '';

if ($endpoint === 'comments') {
    switch ($method) {
        case 'POST':   handleAddComment(); break;
        case 'DELETE': handleDeleteComment($id); break;
        default: sendJSON(['error' => 'Method tidak diizinkan'], 405);
    }
} elseif ($endpoint === 'reactions') {
    if ($method === 'POST') handleToggleReaction();
    else sendJSON(['error' => 'Method tidak diizinkan'], 405);
} else {
    sendJSON(['error' => 'Endpoint tidak ditemukan'], 404);
}

// ── Comment Handlers ──────────────────────────────────────────────────────────

function handleAddComment(): void {
    $currentUser = requireAuth();

    // Only approved users can comment
    if (!$currentUser['approved'] && $currentUser['role'] !== 'admin') {
        sendJSON(['error' => 'Akun Anda belum disetujui. Tidak bisa berkomentar.'], 403);
    }

    $input   = getInput();
    $newsId  = trim($input['newsId'] ?? '');
    $content = trim($input['content'] ?? '');

    if (!$newsId)  sendJSON(['error' => 'ID berita diperlukan'], 400);
    if (!$content) sendJSON(['error' => 'Komentar tidak boleh kosong'], 400);
    if (strlen($content) > 1000) sendJSON(['error' => 'Komentar maksimal 1000 karakter'], 400);

    $db = getDB();

    // Check news exists
    $chkStmt = $db->prepare('SELECT id FROM news WHERE id = ? LIMIT 1');
    $chkStmt->bind_param('s', $newsId);
    $chkStmt->execute();
    if ($chkStmt->get_result()->num_rows === 0) {
        $chkStmt->close();
        $db->close();
        sendJSON(['error' => 'Berita tidak ditemukan'], 404);
    }
    $chkStmt->close();

    $commentId = generateUUID();
    $userId    = (int)$currentUser['id'];
    $userName  = $currentUser['name'];

    $stmt = $db->prepare(
        'INSERT INTO comments (id, news_id, user_id, user_name, content) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssss', $commentId, $newsId, $userId, $userName, $content);
    $stmt->execute();
    $stmt->close();
    $db->close();

    sendJSON([
        'success' => true,
        'comment' => [
            'id'        => $commentId,
            'userId'    => (string)$userId,
            'userName'  => $userName,
            'content'   => $content,
            'createdAt' => date('Y-m-d H:i:s'),
        ],
    ], 201);
}

function handleDeleteComment(string $id): void {
    $currentUser = requireAuth();
    if (!$id) sendJSON(['error' => 'ID komentar diperlukan'], 400);

    $db   = getDB();
    $stmt = $db->prepare('SELECT id, user_id FROM comments WHERE id = ? LIMIT 1');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $comment = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$comment) {
        $db->close();
        sendJSON(['error' => 'Komentar tidak ditemukan'], 404);
    }

    // Only admin or the owner can delete
    $isOwner = (string)$comment['user_id'] === (string)$currentUser['id'];
    $isAdmin = in_array($currentUser['role'], ['admin', 'editor']);
    if (!$isOwner && !$isAdmin) {
        $db->close();
        sendJSON(['error' => 'Tidak memiliki izin untuk menghapus komentar ini'], 403);
    }

    $delStmt = $db->prepare('DELETE FROM comments WHERE id = ?');
    $delStmt->bind_param('s', $id);
    $delStmt->execute();
    $delStmt->close();
    $db->close();

    sendJSON(['success' => true]);
}

// ── Reaction Handlers ─────────────────────────────────────────────────────────

function handleToggleReaction(): void {
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
