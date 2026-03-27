<?php
/**
 * SMS Informasi Web — Database Configuration
 * ============================================
 * PENTING: Ganti nilai DB_USER, DB_PASS, DB_NAME
 * sesuai pengaturan MySQL di cPanel hosting Anda.
 * 
 * Di cPanel: MySQL Databases → buat database & user → catat nama & password
 */

// ── Database Configuration ────────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_USER', 'sinw8647_sinergimudastrategis');    // ← Ganti dengan DB username dari cPanel
define('DB_PASS', 'sinergimuda'); // ← Ganti dengan DB password dari cPanel
define('DB_NAME', 'sinw8647_db_website');        // ← Ganti dengan nama database dari cPanel

// ── Primary Admin ─────────────────────────────────────────────────────────────
define('PRIMARY_ADMIN_EMAIL', 'sinergimudastrategis@gmail.com');
define('PRIMARY_ADMIN_NAME', 'Admin Utama SMS');
define('PRIMARY_ADMIN_DEFAULT_PASSWORD', 'admin123'); // Segera ubah setelah deploy!

// ── CORS Headers ──────────────────────────────────────────────────────────────
// Allow same-origin for production, broader for dev
$allowedOrigins = [
    'https://sinergimudastrategis.com',
    'https://www.sinergimudastrategis.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // For same-origin requests (prod) and non-browser requests
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session for auth
if (session_status() === PHP_SESSION_NONE) {
    session_name('sms_session');
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
    ]);
}

// ── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Get database connection
 */
function getDB(): mysqli
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        sendJSON(['error' => 'Koneksi database gagal. Hubungi administrator.'], 500);
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

/**
 * Send JSON response and exit
 */
function sendJSON(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Get JSON input from request body
 */
function getInput(): array
{
    $raw = file_get_contents('php://input');
    if (empty($raw))
        return [];
    return json_decode($raw, true) ?? [];
}

/**
 * Get current logged-in user from session
 */
function getCurrentUser(): ?array
{
    if (!isset($_SESSION['user_id']))
        return null;

    $db = getDB();
    $stmt = $db->prepare(
        'SELECT id, name, email, role, approved, is_primary_admin, created_at 
         FROM users WHERE id = ?'
    );
    $stmt->bind_param('i', $_SESSION['user_id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $db->close();

    if (!$row) {
        session_destroy();
        return null;
    }

    return $row;
}

/**
 * Require authentication and return user
 */
function requireAuth(): array
{
    $user = getCurrentUser();
    if (!$user) {
        sendJSON(['error' => 'Sesi tidak valid. Silakan login kembali.'], 401);
    }
    return $user;
}

/**
 * Require admin role
 */
function requireAdmin(): array
{
    $user = requireAuth();
    if ($user['role'] !== 'admin' && $user['role'] !== 'editor') {
        sendJSON(['error' => 'Akses ditolak. Memerlukan hak admin.'], 403);
    }
    return $user;
}

/**
 * Format user data for API response (without sensitive fields)
 */
function formatUser(array $user): array
{
    return [
        'id' => (string) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'approved' => (bool) ($user['approved'] ?? false),
        'isPrimaryAdmin' => (bool) ($user['is_primary_admin'] ?? false),
        'createdAt' => $user['created_at'] ?? date('Y-m-d H:i:s'),
        'authProvider' => $user['auth_provider'] ?? 'local',
    ];
}

/**
 * Generate UUID v4
 */
function generateUUID(): string
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    );
}
