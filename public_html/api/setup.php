<?php
/**
 * SMS Informasi Web — Database Setup
 * =====================================
 * Jalankan sekali saat pertama kali deploy:
 * https://sinergimudastrategis.com/api/setup.php?key=SMS_SETUP_2024
 *
 * PENTING: Hapus atau ganti nama file ini setelah setup berhasil!
 */

require_once 'config.php';

// Security key to prevent unauthorized setup
$SETUP_KEY = 'SMS_SETUP_2024';

if (!isset($_GET['key']) || $_GET['key'] !== $SETUP_KEY) {
    sendJSON(['error' => 'Akses tidak diizinkan. Tambahkan ?key=' . $SETUP_KEY . ' di URL.'], 401);
}

$db = getDB();
$results = [];

// ── Create Tables ─────────────────────────────────────────────────────────────

// Users table
$db->query("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role ENUM('admin', 'editor', 'participant') NOT NULL DEFAULT 'participant',
    approved TINYINT(1) NOT NULL DEFAULT 0,
    is_primary_admin TINYINT(1) NOT NULL DEFAULT 0,
    auth_provider ENUM('local') NOT NULL DEFAULT 'local',
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
$results[] = 'Tabel users: ' . ($db->error ?: 'OK');

// News table
$db->query("CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    image LONGTEXT,
    video_url LONGTEXT,
    category VARCHAR(100),
    author VARCHAR(100),
    author_id INT,
    views INT NOT NULL DEFAULT 0,
    published TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_published (published),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_views (views)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
$results[] = 'Tabel news: ' . ($db->error ?: 'OK');

// Comments table
$db->query("CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY,
    news_id VARCHAR(36) NOT NULL,
    user_id INT,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(191),
    guest_email VARCHAR(191),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_id (news_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
$results[] = 'Tabel comments: ' . ($db->error ?: 'OK');

// Reactions table (untuk registered users dan guests)
$db->query("CREATE TABLE IF NOT EXISTS reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(100),
    guest_id VARCHAR(100),
    emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reaction (news_id, user_id),
    UNIQUE KEY unique_guest_reaction (news_id, guest_id),
    INDEX idx_news_id (news_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
$results[] = 'Tabel reactions: ' . ($db->error ?: 'OK');

// Site content table (key-value store for homepage & settings)
$db->query("CREATE TABLE IF NOT EXISTS site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_key VARCHAR(100) UNIQUE NOT NULL,
    content_value LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
$results[] = 'Tabel site_content: ' . ($db->error ?: 'OK');

// ── Insert Primary Admin ──────────────────────────────────────────────────────
$adminEmail = PRIMARY_ADMIN_EMAIL;
$adminName  = PRIMARY_ADMIN_NAME;
$adminPass  = password_hash(PRIMARY_ADMIN_DEFAULT_PASSWORD, PASSWORD_BCRYPT, ['cost' => 12]);

$checkAdmin = $db->prepare("SELECT id FROM users WHERE email = ?");
$checkAdmin->bind_param('s', $adminEmail);
$checkAdmin->execute();
$adminExists = $checkAdmin->get_result()->num_rows > 0;
$checkAdmin->close();

if (!$adminExists) {
    $insertAdmin = $db->prepare(
        "INSERT INTO users (name, email, password_hash, role, approved, is_primary_admin) 
         VALUES (?, ?, ?, 'admin', 1, 1)"
    );
    $insertAdmin->bind_param('sss', $adminName, $adminEmail, $adminPass);
    $insertAdmin->execute();
    $insertAdmin->close();
    $results[] = 'Admin utama dibuat: ' . $adminEmail;
} else {
    $results[] = 'Admin utama sudah ada: ' . $adminEmail;
}

// ── Insert Default Site Content ───────────────────────────────────────────────
$defaultContent = json_encode([
    'aboutBadge'             => 'Tentang Kami',
    'aboutTitle'             => 'Menyatukan Intelektual dan Aksi',
    'aboutDescription'       => 'Didirikan oleh Krispol Siregar, S.H., SMS lahir dari kesadaran bahwa pemuda harus menjadi motor penggerak perubahan yang berbasis data dan kolaborasi. SMS hadir sebagai wadah digital yang tidak hanya menyajikan berita, tetapi juga analisis strategis demi kepentingan publik.',
    'aboutQuote'             => 'Kami hadir untuk memastikan suara pemuda dan keadilan memiliki ruang yang jernih di dunia digital. SMS bukan sekadar portal berita, melainkan pusat pergerakan intelektual yang progresif.',
    'aboutQuoteAuthor'       => 'Krispol Siregar, S.H., Ketum SMS',
    'activitiesTitle'        => 'SMS Activities & Dokumentasi',
    'activitiesDescription'  => 'Dokumentasi kegiatan, liputan lapangan, dan media publikasi SMS yang dapat diperbarui langsung oleh admin.',
    'activitiesMedia'        => [
        ['id' => 'activity-1', 'type' => 'image', 'title' => 'Kegiatan Lapangan', 'description' => 'Dokumentasi advokasi dan penguatan jaringan SMS.', 'src' => '/images/about-img.jpg'],
        ['id' => 'activity-2', 'type' => 'image', 'title' => 'Forum Diskusi', 'description' => 'Ruang dialog strategis bersama pemuda dan masyarakat.', 'src' => '/images/majalengka-collage.jpg'],
        ['id' => 'activity-3', 'type' => 'image', 'title' => 'Profil Tokoh', 'description' => 'Dokumentasi figur dan kepemimpinan di dalam gerakan SMS.', 'src' => '/images/krispol-siregar.jpg'],
    ],
    'contactBadge'           => 'Hubungi Kami',
    'contactTitle'           => 'Kontak Media & Info',
    'contactDescription'     => 'Kami siap mendengarkan dan berkolaborasi dengan Anda',
    'contacts'               => [
        ['id' => 'contact-whatsapp', 'title' => 'WhatsApp', 'icon' => '💬', 'value' => '0821-1966-7132', 'link' => 'https://wa.me/6282119667132', 'highlight' => true],
        ['id' => 'contact-website',  'title' => 'Website',  'icon' => '🌐', 'value' => 'sinergimudastrategis.com', 'link' => 'https://www.sinergimudastrategis.com/'],
        ['id' => 'contact-email',    'title' => 'Email',    'icon' => '✉️', 'value' => 'info@sinergimudastrategis.com', 'link' => 'mailto:info@sinergimudastrategis.com'],
    ],
    'navLinks'               => [
        ['id' => 'nav-beranda', 'name' => 'Beranda', 'href' => '/#hero'],
        ['id' => 'nav-tentang', 'name' => 'Tentang', 'href' => '/#about'],
        ['id' => 'nav-kontak',  'name' => 'Kontak',  'href' => '/#contact'],
        ['id' => 'nav-berita',  'name' => 'Berita',  'href' => '/berita'],
    ],
], JSON_UNESCAPED_UNICODE);

$checkContent = $db->prepare("SELECT id FROM site_content WHERE content_key = 'homepage'");
$checkContent->execute();
if ($checkContent->get_result()->num_rows === 0) {
    $insertContent = $db->prepare("INSERT INTO site_content (content_key, content_value) VALUES ('homepage', ?)");
    $insertContent->bind_param('s', $defaultContent);
    $insertContent->execute();
    $insertContent->close();
    $results[] = 'Konten homepage default berhasil dibuat';
} else {
    $results[] = 'Konten homepage sudah ada';
}
$checkContent->close();

// Default ad settings
$defaultAds = json_encode([
    'enabled'           => false,
    'ads'               => [
        [
            'id'         => 'ad-1',
            'title'      => 'Iklan Contoh',
            'description' => 'Deskripsi singkat iklan',
            'image'      => '/images/hero-bg.jpg',
            'link'       => 'https://example.com',
            'positions'  => ['betweenContent'],
            'enabled'    => true,
            'width'      => 300,
            'height'     => 250,
        ],
    ],
    'positions'  => [
        'header'         => ['enabled' => false, 'width' => '100%', 'maxHeight' => 120],
        'sidebar'        => ['enabled' => false, 'width' => 300, 'maxHeight' => 600],
        'betweenContent' => ['enabled' => false, 'width' => 300, 'maxHeight' => 250],
        'footer'         => ['enabled' => false, 'width' => '100%', 'maxHeight' => 200],
    ],
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$checkAds = $db->prepare("SELECT id FROM site_content WHERE content_key = 'ad_settings'");
$checkAds->execute();
if ($checkAds->get_result()->num_rows === 0) {
    $insertAds = $db->prepare("INSERT INTO site_content (content_key, content_value) VALUES ('ad_settings', ?)");
    $insertAds->bind_param('s', $defaultAds);
    $insertAds->execute();
    $insertAds->close();
    $results[] = 'Pengaturan iklan default berhasil dibuat';
} else {
    $results[] = 'Pengaturan iklan sudah ada';
}
$checkAds->close();

// ── Insert Sample News ────────────────────────────────────────────────────────
$sampleNews = [
    [
        'id'        => 'news-sample-1',
        'title'     => 'SMS Resmi Meluncurkan Platform Digital Independen',
        'content'   => '<p>Sinergi Muda Strategis (SMS) dengan bangga mengumumkan peluncuran platform digitalnya yang bertujuan menjadi kanal berita online independen. Platform ini hadir untuk menjawab tantangan era disrupsi informasi dengan menyajikan berita yang akurat, tajam, dan edukatif.</p><p>"Kami hadir untuk memastikan suara pemuda dan keadilan memiliki ruang yang jernih di dunia digital," ujar Krispol Siregar, S.H., Ketua Umum SMS.</p>',
        'excerpt'   => 'SMS meluncurkan platform digital independen untuk menyajikan berita yang akurat, tajam, dan edukatif bagi masyarakat.',
        'image'     => '/images/hero-bg.jpg',
        'category'  => 'Pengumuman',
        'author'    => 'Admin SMS',
        'published' => 1,
    ],
    [
        'id'        => 'news-sample-2',
        'title'     => 'Pemuda Majalengka Diajak Aktif dalam Literasi Digital',
        'content'   => '<p>Dalam era digital yang semakin berkembang, pemuda di Majalengka diajak untuk lebih aktif dalam literasi digital. SMS mengadakan workshop literasi digital bertajuk "Digital Independen untuk Keadilan".</p><p>"Literasi digital adalah kunci untuk menjadi generasi yang kritis dan tidak mudah terpengaruh oleh informasi palsu," kata salah satu peserta workshop.</p>',
        'excerpt'   => 'SMS mengadakan workshop literasi digital untuk pemuda Majalengka guna meningkatkan kemampuan menganalisis informasi.',
        'image'     => '/images/about-img.jpg',
        'category'  => 'Kegiatan',
        'author'    => 'Admin SMS',
        'published' => 1,
    ],
    [
        'id'        => 'news-sample-3',
        'title'     => 'Mengawal Isu Ketenagakerjaan di Majalengka',
        'content'   => '<p>SMS terus mengawal isu-isu ketenagakerjaan di Kabupaten Majalengka. Tim SMS melakukan investigasi terkait kondisi buruh di beberapa pabrik tekstil di wilayah ini.</p><p>SMS berkomitmen untuk terus mengawal isu ini dan menjadi suara bagi para pekerja yang belum terwakili.</p>',
        'excerpt'   => 'Tim SMS melakukan investigasi terkait kondisi buruh di pabrik-pabrik tekstil di Majalengka.',
        'image'     => '/images/majalengka-collage.jpg',
        'category'  => 'Investigasi',
        'author'    => 'Admin SMS',
        'published' => 1,
    ],
];

foreach ($sampleNews as $n) {
    $checkNews = $db->prepare("SELECT id FROM news WHERE id = ?");
    $checkNews->bind_param('s', $n['id']);
    $checkNews->execute();
    if ($checkNews->get_result()->num_rows === 0) {
        $insertNews = $db->prepare(
            "INSERT INTO news (id, title, content, excerpt, image, category, author, published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $insertNews->bind_param('sssssssi', $n['id'], $n['title'], $n['content'], $n['excerpt'], $n['image'], $n['category'], $n['author'], $n['published']);
        $insertNews->execute();
        $insertNews->close();
        $results[] = 'Berita sample dibuat: ' . $n['title'];
    }
    $checkNews->close();
}

$db->close();

sendJSON([
    'success' => true,
    'message' => '✅ Setup database berhasil! SEGERA hapus atau rename file setup.php ini.',
    'detail'  => $results,
    'login'   => [
        'email'    => PRIMARY_ADMIN_EMAIL,
        'password' => PRIMARY_ADMIN_DEFAULT_PASSWORD . ' (segera ganti!)',
    ],
]);
