<?php
/**
 * SMS Informasi Web — Auto News Generator via AI
 * =================================================
 * Script ini dipanggil oleh Cron Job cPanel 2x sehari.
 * Menggunakan Google Gemini API untuk membuat berita otomatis.
 *
 * Cara setting Cron di cPanel:
 *   0 6  * * *  php /home/sinw8647/public_html/api/auto_news.php >> /home/sinw8647/logs/autonews.log 2>&1
 *   0 18 * * *  php /home/sinw8647/public_html/api/auto_news.php >> /home/sinw8647/logs/autonews.log 2>&1
 *
 * Keamanan: Script ini hanya bisa dijalankan dari CLI (cron), bukan dari browser.
 */

// ── Keamanan: Hanya izinkan akses dari CLI ──────────────────────────────────
if (php_sapi_name() !== 'cli') {
    // Bila diakses via HTTP, cek secret key
    $secret = $_GET['secret'] ?? '';
    if ($secret !== AUTO_NEWS_SECRET) {
        http_response_code(403);
        echo json_encode(['error' => 'Akses ditolak']);
        exit();
    }
}

// ── Load konfigurasi database ────────────────────────────────────────────────
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    die('[ERROR] config.php tidak ditemukan.' . PHP_EOL);
}

// Override header behavior untuk CLI
if (!function_exists('sendJSON')) {
    function sendJSON(array $data, int $code = 200): never {
        echo json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL;
        exit($code >= 400 ? 1 : 0);
    }
}
if (!function_exists('header')) {
    // header() tidak diperlukan di CLI
}

// Load database helpers (skip CORS headers di CLI)
require_once $configPath;

// ── Konfigurasi ────────────────────────────────────────────────────────────
define('GEMINI_API_KEY', 'GANTI_DENGAN_API_KEY_GEMINI_ANDA');
define('AUTO_NEWS_SECRET', 'GANTI_DENGAN_SECRET_KEY_UNIK');   // Untuk akses via HTTP
define('ARTICLES_PER_RUN', 2);   // Jumlah artikel per sekali jalan
define('AUTO_AUTHOR_NAME', 'Redaksi SMS');
define('AUTO_AUTHOR_ID', 1);      // ID user admin di database

// ── Topik berita yang akan di-generate ──────────────────────────────────────
$TOPIC_POOLS = [
    'Politik & Hukum' => [
        'kebijakan pemerintah daerah Majalengka terbaru',
        'isu hukum dan keadilan di Jawa Barat',
        'peraturan daerah baru yang berdampak pada masyarakat',
        'perkembangan politik nasional yang relevan bagi pemuda',
        'transparansi anggaran dan pengawasan publik',
    ],
    'Pemuda & Sosial' => [
        'program pemberdayaan pemuda Indonesia terbaru',
        'gerakan sosial anak muda yang menginspirasi',
        'tantangan pengangguran pemuda dan solusinya',
        'inovasi digital oleh startup pemuda Indonesia',
        'isu pendidikan dan beasiswa untuk generasi muda',
    ],
    'Ekonomi & Bisnis' => [
        'perkembangan ekonomi UMKM di Majalengka',
        'peluang investasi untuk pemuda di Jawa Barat',
        'dampak kebijakan ekonomi nasional terhadap daerah',
        'pertumbuhan sektor pertanian digital di Indonesia',
        'program kewirausahaan pemuda Indonesia',
    ],
    'Lingkungan & Kesehatan' => [
        'isu lingkungan hidup dan bencana alam terkini',
        'program kesehatan masyarakat Indonesia terbaru',
        'gerakan lingkungan hygienik di Jawa Barat',
        'perubahan iklim dan dampaknya bagi petani lokal',
    ],
];

log_message('====================================================');
log_message('Auto News Generator — Mulai: ' . date('Y-m-d H:i:s'));
log_message('====================================================');

$totalCreated = 0;

for ($i = 0; $i < ARTICLES_PER_RUN; $i++) {
    // Pilih kategori dan topik secara acak
    $categories = array_keys($TOPIC_POOLS);
    $category   = $categories[array_rand($categories)];
    $topics     = $TOPIC_POOLS[$category];
    $topic      = $topics[array_rand($topics)];

    log_message("[$i] Membuat artikel tentang: \"$topic\" (Kategori: $category)");

    $article = generateArticle($topic, $category);

    if (!$article) {
        log_message("[$i] GAGAL: Gemini API tidak merespons.");
        continue;
    }

    $saved = saveArticle($article['title'], $article['content'], $article['excerpt'], $category);

    if ($saved) {
        $totalCreated++;
        log_message("[$i] BERHASIL disimpan: \"{$article['title']}\"");
    } else {
        log_message("[$i] GAGAL menyimpan ke database.");
    }

    // Jeda 2 detik antar request agar tidak hit rate limit
    if ($i < ARTICLES_PER_RUN - 1) sleep(2);
}

log_message("Selesai. Total artikel dibuat: {$totalCreated}/" . ARTICLES_PER_RUN);
log_message('====================================================');

// ── Fungsi Generate Artikel via Gemini API ───────────────────────────────────

function generateArticle(string $topic, string $category): ?array
{
    $prompt = <<<PROMPT
Anda adalah jurnalis berpengalaman dari portal berita digital "Sinergi Muda Strategis (SMS)" 
yang fokus pada isu pemuda, hukum, dan keadilan sosial di Indonesia.

Tugas Anda: Buat artikel berita LENGKAP dalam Bahasa Indonesia tentang topik berikut:
TOPIK: "{$topic}"
KATEGORI: "{$category}"

Pedoman penulisan:
- Gaya: Jurnalistik profesional, faktual, dan edukatif
- Target pembaca: Pemuda Indonesia usia 18-35 tahun
- Sudut pandang: Analitis dan berimbang
- WAJIB menggunakan fakta yang masuk akal (jika tidak ada data terkini, gunakan data historis yang relevan)
- Jangan mencantumkan tanggal spesifik jika tidak yakin faktanya

Hasilkan dalam format JSON berikut (HANYA JSON, tanpa keterangan lain):
{
  "title": "Judul artikel yang menarik dan informatif (maksimal 90 karakter)",
  "excerpt": "Ringkasan singkat artikel dalam 1-2 kalimat (150-200 karakter) untuk preview",
  "content": "Isi artikel lengkap dalam HTML (gunakan <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>). Minimal 400 kata."
}
PROMPT;

    $apiKey = GEMINI_API_KEY;
    $url    = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}";

    $payload = json_encode([
        'contents' => [[
            'parts' => [['text' => $prompt]]
        ]],
        'generationConfig' => [
            'temperature'     => 0.7,
            'maxOutputTokens' => 2048,
            'responseMimeType' => 'application/json',
        ],
        'safetySettings' => [
            ['category' => 'HARM_CATEGORY_HARASSMENT',        'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_HATE_SPEECH',       'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
        ],
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        log_message("CURL Error: $curlErr");
        return null;
    }

    if ($httpCode !== 200) {
        log_message("Gemini API HTTP $httpCode: " . substr($response, 0, 300));
        return null;
    }

    $data = json_decode($response, true);
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

    if (!$text) {
        log_message('Gemini API: respons kosong atau diblokir.');
        log_message('Finish reason: ' . ($data['candidates'][0]['finishReason'] ?? 'unknown'));
        return null;
    }

    // Parse JSON di dalam respons (kadang dibalut markdown)
    $text = preg_replace('/^```json\s*/m', '', $text);
    $text = preg_replace('/^```\s*/m', '', $text);
    $text = trim($text);

    $article = json_decode($text, true);

    if (!$article || empty($article['title']) || empty($article['content'])) {
        log_message("JSON parse gagal atau field tidak lengkap.");
        log_message("Raw: " . substr($text, 0, 500));
        return null;
    }

    // Sanitasi dasar
    $article['title']   = strip_tags($article['title']);
    $article['excerpt'] = strip_tags($article['excerpt']);
    // content dibiarkan HTML (sudah dikontrol lewat prompt)

    return $article;
}

// ── Fungsi Simpan ke Database ────────────────────────────────────────────────

function saveArticle(string $title, string $content, string $excerpt, string $category): bool
{
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($db->connect_error) {
        log_message('DB Error: ' . $db->connect_error);
        return false;
    }
    $db->set_charset('utf8mb4');

    // Cek duplikat judul (hindari artikel yang sama)
    $checkStmt = $db->prepare('SELECT COUNT(*) as cnt FROM news WHERE title = ?');
    $checkStmt->bind_param('s', $title);
    $checkStmt->execute();
    $cnt = $checkStmt->get_result()->fetch_assoc()['cnt'];
    $checkStmt->close();

    if ($cnt > 0) {
        log_message("Judul duplikat, dilewati: \"$title\"");
        $db->close();
        return false;
    }

    $id        = generateUUID();
    $published = 1; // Langsung dipublikasikan
    $authorId  = AUTO_AUTHOR_ID;
    $authorName = AUTO_AUTHOR_NAME;
    $image     = ''; // Kosong — admin bisa tambahkan gambar manual jika mau

    $stmt = $db->prepare(
        'INSERT INTO news (id, title, content, excerpt, image, category, author, author_id, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param(
        'ssssssiii',
        $id, $title, $content, $excerpt, $image, $category, $authorName, $authorId, $published
    );
    $ok = $stmt->execute();
    $stmt->close();
    $db->close();

    return $ok;
}

// ── Helper Log ───────────────────────────────────────────────────────────────

function log_message(string $msg): void
{
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg;
    echo $line . PHP_EOL;
}
