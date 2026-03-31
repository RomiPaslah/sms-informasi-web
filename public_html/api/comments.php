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

    // Try to get current user (optional - untuk differentiate guest vs registered)
    $currentUser = null;
    try {
        $currentUser = getAuthUser();
    } catch (Exception $e) {
        // Not logged in - will be guest comment
    }

    if ($currentUser) {
        // Registered user comment
        handleAddUserComment($input, $newsId, $content, $db, $currentUser);
    } else {
        // Guest comment
        handleAddGuestComment($input, $newsId, $content, $db);
    }
}

function handleAddGuestComment(array $input, string $newsId, string $content, mysqli $db): void {
    $userName  = trim($input['userName'] ?? '');
    $guestEmail = trim($input['guestEmail'] ?? '');

    if (!$userName)  sendJSON(['error' => 'Nama diperlukan'], 400);
    if (!$guestEmail) sendJSON(['error' => 'Email diperlukan'], 400);

    // Basic email validation
    if (!filter_var($guestEmail, FILTER_VALIDATE_EMAIL)) {
        sendJSON(['error' => 'Email tidak valid'], 400);
    }

    $commentId = generateUUID();

    $stmt = $db->prepare(
        'INSERT INTO comments (id, news_id, user_id, user_name, guest_email, content) VALUES (?, ?, NULL, ?, ?, ?)'
    );
    $stmt->bind_param('sssss', $commentId, $newsId, $userName, $guestEmail, $content);
    $stmt->execute();
    $stmt->close();
    $db->close();

    sendJSON([
        'success' => true,
        'comment' => [
            'id'        => $commentId,
            'userName'  => $userName,
            'guestEmail' => $guestEmail,
            'content'   => $content,
            'createdAt' => date('Y-m-d H:i:s'),
        ],
    ], 201);
}

function handleAddUserComment(array $input, string $newsId, string $content, mysqli $db, array $currentUser): void {
    // Only approved users can comment
    if (!$currentUser['approved'] && $currentUser['role'] !== 'admin') {
        sendJSON(['error' => 'Akun Anda belum disetujui. Tidak bisa berkomentar.'], 403);
    }

    $commentId = generateUUID();
    $userId    = (int)$currentUser['id'];
    $userName  = $currentUser['name'];
    $userEmail = $currentUser['email'];

    $stmt = $db->prepare(
        'INSERT INTO comments (id, news_id, user_id, user_name, user_email, content) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('ssisss', $commentId, $newsId, $userId, $userName, $userEmail, $content);
    $stmt->execute();
    $stmt->close();
    $db->close();

    sendJSON([
        'success' => true,
        'comment' => [
            'id'        => $commentId,
            'userId'    => (string)$userId,
            'userName'  => $userName,
            'userEmail' => $userEmail,
            'content'   => $content,
            'createdAt' => date('Y-m-d H:i:s'),
        ],
    ], 201);
}

function handleDeleteComment(string $id): void {
    if (!$id) sendJSON(['error' => 'ID komentar diperlukan'], 400);

    $input = getInput();
    $db    = getDB();
    
    // Get the comment
    $stmt = $db->prepare('SELECT id, user_id, guest_email FROM comments WHERE id = ? LIMIT 1');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $comment = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$comment) {
        $db->close();
        sendJSON(['error' => 'Komentar tidak ditemukan'], 404);
    }

    // Try to get current user
    $currentUser = null;
    $canDelete = false;
    
    try {
        $currentUser = getAuthUser();
        
        // Admin atau editor bisa delete semua
        if (in_array($currentUser['role'], ['admin', 'editor'])) {
            $canDelete = true;
        }
        
        // Owner dapat delete komentar mereka
        if ((int)$comment['user_id'] === (int)$currentUser['id']) {
            $canDelete = true;
        }
    } catch (Exception $e) {
        // Tidak login - cek apakah guest dan ada email
        if ($comment['guest_email']) {
            $providedEmail = trim($input['guestEmail'] ?? '');
            if ($providedEmail === $comment['guest_email']) {
                $canDelete = true;
            }
        }
    }

    if (!$canDelete) {
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
