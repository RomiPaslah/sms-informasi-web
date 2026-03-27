<?php
/**
 * SMS Informasi Web — News API
 * ==============================
 * Endpoints:
 *   GET    /api/news.php              — List semua berita (admin: all, public: published only)
 *   GET    /api/news.php?id=X         — Detail satu berita
 *   POST   /api/news.php              — Buat berita baru (admin/editor only)
 *   PUT    /api/news.php?id=X         — Update berita (admin/editor only)
 *   DELETE /api/news.php?id=X         — Hapus berita (admin only)
 *   POST   /api/news.php?action=toggle_publish&id=X — Toggle publish status (admin only)
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? '';
$action = $_GET['action'] ?? '';

if ($action === 'toggle_publish' && $method === 'POST') {
    handleTogglePublish($id);
}

switch ($method) {
    case 'GET':
        if ($id) {
            handleGetSingle($id);
        } else {
            handleGetList();
        }
        break;
    case 'POST':
        handleCreate();
        break;
    case 'PUT':
        if (!$id) sendJSON(['error' => 'ID berita diperlukan'], 400);
        handleUpdate($id);
        break;
    case 'DELETE':
        if (!$id) sendJSON(['error' => 'ID berita diperlukan'], 400);
        handleDelete($id);
        break;
    default:
        sendJSON(['error' => 'Method tidak diizinkan'], 405);
}

// ── Helper: Format news row ───────────────────────────────────────────────────

function formatNews(array $row, array $comments = [], array $reactions = []): array {
    return [
        'id'        => $row['id'],
        'title'     => $row['title'],
        'content'   => $row['content'],
        'excerpt'   => $row['excerpt'] ?? '',
        'image'     => $row['image'] ?? '',
        'category'  => $row['category'] ?? 'Lainnya',
        'author'    => $row['author'] ?? 'Admin SMS',
        'published' => (bool)$row['published'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
        'comments'  => $comments,
        'reactions' => $reactions,
    ];
}

function getNewsComments(mysqli $db, string $newsId): array {
    $stmt = $db->prepare(
        'SELECT id, user_id, user_name, content, created_at FROM comments 
         WHERE news_id = ? ORDER BY created_at ASC'
    );
    $stmt->bind_param('s', $newsId);
    $stmt->execute();
    $result = $stmt->get_result();
    $comments = [];
    while ($row = $result->fetch_assoc()) {
        $comments[] = [
            'id'        => $row['id'],
            'userId'    => (string)$row['user_id'],
            'userName'  => $row['user_name'],
            'content'   => $row['content'],
            'createdAt' => $row['created_at'],
        ];
    }
    $stmt->close();
    return $comments;
}

function getNewsReactions(mysqli $db, string $newsId): array {
    $stmt = $db->prepare('SELECT user_id, emoji FROM reactions WHERE news_id = ?');
    $stmt->bind_param('s', $newsId);
    $stmt->execute();
    $result    = $stmt->get_result();
    $reactions = [];
    while ($row = $result->fetch_assoc()) {
        $reactions[$row['user_id']] = $row['emoji'];
    }
    $stmt->close();
    return $reactions;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function handleGetList(): void {
    $currentUser = getCurrentUser();
    $isAdmin     = $currentUser && in_array($currentUser['role'], ['admin', 'editor']);
    $db          = getDB();

    if ($isAdmin) {
        $result = $db->query(
            'SELECT id, title, content, excerpt, image, category, author, published, created_at, updated_at 
             FROM news ORDER BY created_at DESC'
        );
    } else {
        $result = $db->query(
            'SELECT id, title, content, excerpt, image, category, author, published, created_at, updated_at 
             FROM news WHERE published = 1 ORDER BY created_at DESC'
        );
    }

    $news = [];
    while ($row = $result->fetch_assoc()) {
        // For list view, get reaction counts only (not full detail)
        $reactionStmt = $db->prepare('SELECT user_id, emoji FROM reactions WHERE news_id = ?');
        $reactionStmt->bind_param('s', $row['id']);
        $reactionStmt->execute();
        $reactionResult = $reactionStmt->get_result();
        $reactions = [];
        while ($r = $reactionResult->fetch_assoc()) {
            $reactions[$r['user_id']] = $r['emoji'];
        }
        $reactionStmt->close();

        $commentCountStmt = $db->prepare('SELECT COUNT(*) as cnt FROM comments WHERE news_id = ?');
        $commentCountStmt->bind_param('s', $row['id']);
        $commentCountStmt->execute();
        $commentCount = $commentCountStmt->get_result()->fetch_assoc()['cnt'];
        $commentCountStmt->close();

        $item           = formatNews($row, [], $reactions);
        $item['commentCount'] = (int)$commentCount;
        $news[]         = $item;
    }

    $db->close();
    sendJSON(['news' => $news]);
}

function handleGetSingle(string $id): void {
    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT id, title, content, excerpt, image, category, author, published, created_at, updated_at 
         FROM news WHERE id = ? LIMIT 1'
    );
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        $db->close();
        sendJSON(['error' => 'Berita tidak ditemukan'], 404);
    }

    // Non-admin cannot see draft news
    $currentUser = getCurrentUser();
    $isAdmin     = $currentUser && in_array($currentUser['role'], ['admin', 'editor']);
    if (!$row['published'] && !$isAdmin) {
        $db->close();
        sendJSON(['error' => 'Berita tidak ditemukan'], 404);
    }

    $comments  = getNewsComments($db, $id);
    $reactions = getNewsReactions($db, $id);
    $db->close();

    sendJSON(['news' => formatNews($row, $comments, $reactions)]);
}

function handleCreate(): void {
    $currentUser = requireAdmin();
    $input       = getInput();

    $title    = trim($input['title'] ?? '');
    $content  = trim($input['content'] ?? '');
    $excerpt  = trim($input['excerpt'] ?? '');
    $image    = trim($input['image'] ?? '');
    $category = trim($input['category'] ?? 'Lainnya');
    $published = isset($input['published']) ? (int)(bool)$input['published'] : 0;

    if (!$title)   sendJSON(['error' => 'Judul berita wajib diisi'], 400);
    if (!$content) sendJSON(['error' => 'Konten berita wajib diisi'], 400);
    if (!$excerpt) sendJSON(['error' => 'Ringkasan berita wajib diisi'], 400);

    $id = generateUUID();
    $db = getDB();

    $stmt = $db->prepare(
        'INSERT INTO news (id, title, content, excerpt, image, category, author, author_id, published) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $authorId = (int)$currentUser['id'];
    $stmt->bind_param(
        'sssssssii',
        $id, $title, $content, $excerpt, $image, $category,
        $currentUser['name'], $authorId, $published
    );
    $stmt->execute();
    $stmt->close();

    // Fetch the created row
    $fetchStmt = $db->prepare('SELECT * FROM news WHERE id = ?');
    $fetchStmt->bind_param('s', $id);
    $fetchStmt->execute();
    $row = $fetchStmt->get_result()->fetch_assoc();
    $fetchStmt->close();
    $db->close();

    sendJSON(['success' => true, 'news' => formatNews($row)], 201);
}

function handleUpdate(string $id): void {
    $currentUser = requireAdmin();
    $input       = getInput();
    $db          = getDB();

    // Check exists
    $checkStmt = $db->prepare('SELECT count(*) as cnt FROM news WHERE id = ?');
    $checkStmt->bind_param('s', $id);
    $checkStmt->execute();
    $cnt = $checkStmt->get_result()->fetch_assoc()['cnt'];
    $checkStmt->close();
    
    if ($cnt == 0) {
        $db->close();
        sendJSON(['error' => 'Berita tidak ditemukan'], 404);
    }

    // Build dynamic update
    $fields  = [];
    $types   = '';
    $values  = [];

    if (isset($input['title']))     { $fields[] = 'title = ?';     $types .= 's'; $values[] = trim($input['title']); }
    if (isset($input['content']))   { $fields[] = 'content = ?';   $types .= 's'; $values[] = trim($input['content']); }
    if (isset($input['excerpt']))   { $fields[] = 'excerpt = ?';   $types .= 's'; $values[] = trim($input['excerpt']); }
    if (isset($input['image']))     { $fields[] = 'image = ?';     $types .= 's'; $values[] = trim($input['image']); }
    if (isset($input['category']))  { $fields[] = 'category = ?';  $types .= 's'; $values[] = trim($input['category']); }
    if (isset($input['published'])) { $fields[] = 'published = ?'; $types .= 'i'; $values[] = (int)(bool)$input['published']; }

    if (empty($fields)) {
        $db->close();
        sendJSON(['error' => 'Tidak ada field yang diperbarui'], 400);
    }

    $fields[]  = 'updated_at = NOW()';
    $sql       = 'UPDATE news SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $types    .= 's';
    $values[]  = $id;

    $updStmt = $db->prepare($sql);
    $updStmt->bind_param($types, ...$values);
    $updStmt->execute();
    $updStmt->close();

    $fetchStmt = $db->prepare('SELECT * FROM news WHERE id = ?');
    $fetchStmt->bind_param('s', $id);
    $fetchStmt->execute();
    $row = $fetchStmt->get_result()->fetch_assoc();
    $fetchStmt->close();

    $comments  = getNewsComments($db, $id);
    $reactions = getNewsReactions($db, $id);
    $db->close();

    sendJSON(['success' => true, 'news' => formatNews($row, $comments, $reactions)]);
}

function handleDelete(string $id): void {
    requireAdmin();

    $db   = getDB();
    $stmt = $db->prepare('DELETE FROM news WHERE id = ?');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected > 0) {
        // Also delete related comments & reactions
        $db->prepare('DELETE FROM comments WHERE news_id = ?')->execute();
        $db->prepare('DELETE FROM reactions WHERE news_id = ?')->execute();
    }

    $db->close();

    if ($affected === 0) sendJSON(['error' => 'Berita tidak ditemukan'], 404);
    sendJSON(['success' => true]);
}

function handleTogglePublish(string $id): void {
    requireAdmin();
    if (!$id) sendJSON(['error' => 'ID berita diperlukan'], 400);

    $db   = getDB();
    $stmt = $db->prepare('SELECT published FROM news WHERE id = ? LIMIT 1');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        $db->close();
        sendJSON(['error' => 'Berita tidak ditemukan'], 404);
    }

    $newPublished = $row['published'] ? 0 : 1;
    $updStmt      = $db->prepare('UPDATE news SET published = ?, updated_at = NOW() WHERE id = ?');
    $updStmt->bind_param('is', $newPublished, $id);
    $updStmt->execute();
    $updStmt->close();
    $db->close();

    sendJSON(['success' => true, 'published' => (bool)$newPublished]);
}
