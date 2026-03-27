<?php
/**
 * SMS Informasi Web — Authentication API
 * ========================================
 * Endpoints:
 *   POST ?action=login          — Login dengan email & password
 *   POST ?action=register       — Daftar akun baru (menunggu persetujuan admin)
 *   POST ?action=logout         — Logout
 *   GET  ?action=me             — Dapatkan user yang sedang login
 *   GET  ?action=users          — Daftar semua user (admin only)
 *   POST ?action=approve        — Setujui pendaftaran user (admin only)
 *   POST ?action=reject         — Tolak & hapus user (admin only)
 *   POST ?action=promote        — Jadikan user sebagai admin (admin only)
 *   POST ?action=change_password — Ubah password
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        if ($method !== 'POST') sendJSON(['error' => 'Method tidak diizinkan'], 405);
        handleLogin();
        break;
    case 'register':
        if ($method !== 'POST') sendJSON(['error' => 'Method tidak diizinkan'], 405);
        handleRegister();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'me':
        handleMe();
        break;
    case 'users':
        handleGetUsers();
        break;
    case 'approve':
        if ($method !== 'POST') sendJSON(['error' => 'Method tidak diizinkan'], 405);
        handleApproveUser();
        break;
    case 'reject':
        if ($method !== 'POST') sendJSON(['error' => 'Method tidak diizinkan'], 405);
        handleRejectUser();
        break;
    case 'promote':
        if ($method !== 'POST') sendJSON(['error' => 'Method tidak diizinkan'], 405);
        handlePromoteUser();
        break;
    case 'change_password':
        if ($method !== 'POST') sendJSON(['error' => 'Method tidak diizinkan'], 405);
        handleChangePassword();
        break;
    default:
        sendJSON(['error' => 'Action tidak dikenal: ' . $action], 400);
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function handleLogin(): void {
    $input = getInput();
    $email    = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        sendJSON(['error' => 'Email dan password wajib diisi'], 400);
    }

    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT id, name, email, password_hash, role, approved, is_primary_admin 
         FROM users WHERE email = ? LIMIT 1'
    );
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $db->close();

    if (!$user) {
        sendJSON(['error' => 'Email atau password salah'], 401);
    }

    if (!password_verify($password, $user['password_hash'])) {
        sendJSON(['error' => 'Email atau password salah'], 401);
    }

    if (!$user['approved'] && $user['role'] !== 'admin') {
        sendJSON([
            'error'  => 'Akun Anda belum disetujui oleh Admin Utama. Mohon tunggu dan coba login kembali setelah disetujui.',
            'code'   => 'PENDING_APPROVAL',
        ], 403);
    }

    $_SESSION['user_id'] = $user['id'];
    session_regenerate_id(true);

    sendJSON([
        'success' => true,
        'user'    => formatUser($user),
    ]);
}

function handleRegister(): void {
    $input    = getInput();
    $name     = trim($input['name'] ?? '');
    $email    = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    // Validation
    $errors = [];
    if (strlen($name) < 3)     $errors[] = 'Nama minimal 3 karakter';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Format email tidak valid';
    if (strlen($password) < 6) $errors[] = 'Password minimal 6 karakter';

    if (!empty($errors)) {
        sendJSON(['error' => implode('. ', $errors)], 400);
    }

    $db = getDB();

    // Check duplicate email
    $checkStmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $checkStmt->bind_param('s', $email);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        $checkStmt->close();
        $db->close();
        sendJSON(['error' => 'Email sudah terdaftar. Gunakan email lain atau login jika sudah punya akun.'], 409);
    }
    $checkStmt->close();

    $hashedPwd = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $insertStmt = $db->prepare(
        "INSERT INTO users (name, email, password_hash, role, approved, is_primary_admin) 
         VALUES (?, ?, ?, 'participant', 0, 0)"
    );
    $insertStmt->bind_param('sss', $name, $email, $hashedPwd);
    $insertStmt->execute();
    $insertStmt->close();
    $db->close();

    sendJSON([
        'success' => true,
        'message' => 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan Admin Utama. Anda akan bisa login setelah disetujui.',
    ]);
}

function handleLogout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
    sendJSON(['success' => true]);
}

function handleMe(): void {
    if (!isset($_SESSION['user_id'])) {
        sendJSON(['user' => null]);
    }

    $user = getCurrentUser();
    if (!$user) {
        sendJSON(['user' => null]);
    }

    sendJSON(['user' => formatUser($user)]);
}

function handleGetUsers(): void {
    requireAdmin();

    $db     = getDB();
    $result = $db->query(
        'SELECT id, name, email, role, approved, is_primary_admin, auth_provider, created_at 
         FROM users ORDER BY created_at DESC'
    );

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = formatUser($row);
    }
    $db->close();

    sendJSON(['users' => $users]);
}

function handleApproveUser(): void {
    requireAdmin();

    $input = getInput();
    $email = strtolower(trim($input['email'] ?? ''));
    if (!$email) sendJSON(['error' => 'Email wajib diisi'], 400);

    $db   = getDB();
    $stmt = $db->prepare('UPDATE users SET approved = 1 WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $db->close();

    if ($affected === 0) sendJSON(['error' => 'User tidak ditemukan'], 404);
    sendJSON(['success' => true, 'message' => "User $email berhasil disetujui"]);
}

function handleRejectUser(): void {
    requireAdmin();

    $input = getInput();
    $email = strtolower(trim($input['email'] ?? ''));
    if (!$email) sendJSON(['error' => 'Email wajib diisi'], 400);

    // Protect primary admin
    if ($email === strtolower(PRIMARY_ADMIN_EMAIL)) {
        sendJSON(['error' => 'Admin Utama tidak bisa dihapus'], 403);
    }

    $db   = getDB();
    $stmt = $db->prepare('DELETE FROM users WHERE email = ? AND is_primary_admin = 0');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $db->close();

    if ($affected === 0) sendJSON(['error' => 'User tidak ditemukan atau tidak bisa dihapus'], 404);
    sendJSON(['success' => true, 'message' => "User $email ditolak dan dihapus"]);
}

function handlePromoteUser(): void {
    requireAdmin();

    $input = getInput();
    $email = strtolower(trim($input['email'] ?? ''));
    if (!$email) sendJSON(['error' => 'Email wajib diisi'], 400);

    $db   = getDB();
    $stmt = $db->prepare("UPDATE users SET role = 'admin', approved = 1 WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $db->close();

    if ($affected === 0) sendJSON(['error' => 'User tidak ditemukan'], 404);
    sendJSON(['success' => true, 'message' => "User $email dipromosikan menjadi admin"]);
}

function handleChangePassword(): void {
    $currentUser = requireAuth();

    $input           = getInput();
    $targetEmail     = strtolower(trim($input['email'] ?? ''));
    $newPassword     = $input['newPassword'] ?? '';
    $currentPassword = $input['currentPassword'] ?? '';

    if (!$targetEmail || !$newPassword) {
        sendJSON(['error' => 'Email dan password baru wajib diisi'], 400);
    }
    if (strlen($newPassword) < 6) {
        sendJSON(['error' => 'Password baru minimal 6 karakter'], 400);
    }

    $db = getDB();

    // Non-admin can only change their own password
    $isSelf = strtolower($currentUser['email']) === $targetEmail;
    if (!$isSelf && $currentUser['role'] !== 'admin') {
        $db->close();
        sendJSON(['error' => 'Tidak memiliki izin untuk mengubah password user lain'], 403);
    }

    // Verify current password when changing own password
    if ($isSelf && $currentPassword) {
        $chkStmt = $db->prepare('SELECT password_hash FROM users WHERE id = ?');
        $chkStmt->bind_param('i', $currentUser['id']);
        $chkStmt->execute();
        $row = $chkStmt->get_result()->fetch_assoc();
        $chkStmt->close();

        if ($row && !password_verify($currentPassword, $row['password_hash'])) {
            $db->close();
            sendJSON(['error' => 'Password saat ini salah'], 400);
        }
    }

    $hashedPwd = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $updStmt   = $db->prepare('UPDATE users SET password_hash = ? WHERE email = ?');
    $updStmt->bind_param('ss', $hashedPwd, $targetEmail);
    $updStmt->execute();
    $affected  = $updStmt->affected_rows;
    $updStmt->close();
    $db->close();

    if ($affected === 0) sendJSON(['error' => 'User tidak ditemukan'], 404);
    sendJSON(['success' => true, 'message' => 'Password berhasil diubah']);
}
