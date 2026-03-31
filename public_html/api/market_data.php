<?php
/**
 * SMS — Market Data Proxy
 * ========================
 * Fetch data pasar real-time dari Yahoo Finance secara server-side (bypass CORS).
 * Hasil di-cache selama 60 detik untuk menghindari rate limit.
 *
 * Endpoint: GET /api/market_data.php
 * Response : JSON { items: [ { symbol, label, price, change, changePercent, type } ] }
 */

// ── CORS & Headers ────────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Cache ─────────────────────────────────────────────────────────────────────
$cacheFile = sys_get_temp_dir() . '/sms_market_cache.json';
$cacheTTL  = 60; // seconds

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTTL) {
    $cached = file_get_contents($cacheFile);
    if ($cached) {
        echo $cached;
        exit();
    }
}

// ── Watchlist ─────────────────────────────────────────────────────────────────
$watchlist = [
    // Index
    ['symbol' => '^JKSE',    'label' => 'IHSG',    'type' => 'index'   ],
    // IDX Blue chips
    ['symbol' => 'BBCA.JK',  'label' => 'BBCA',    'type' => 'stock'   ],
    ['symbol' => 'TLKM.JK',  'label' => 'TLKM',    'type' => 'stock'   ],
    ['symbol' => 'BMRI.JK',  'label' => 'BMRI',    'type' => 'stock'   ],
    ['symbol' => 'ASII.JK',  'label' => 'ASII',    'type' => 'stock'   ],
    ['symbol' => 'BBRI.JK',  'label' => 'BBRI',    'type' => 'stock'   ],
    ['symbol' => 'UNVR.JK',  'label' => 'UNVR',    'type' => 'stock'   ],
    ['symbol' => 'GOTO.JK',  'label' => 'GOTO',    'type' => 'stock'   ],
    // Forex vs IDR
    ['symbol' => 'USDIDR=X', 'label' => 'USD/IDR', 'type' => 'currency'],
    ['symbol' => 'EURIDR=X', 'label' => 'EUR/IDR', 'type' => 'currency'],
    ['symbol' => 'GBPIDR=X', 'label' => 'GBP/IDR', 'type' => 'currency'],
    ['symbol' => 'SGDIDR=X', 'label' => 'SGD/IDR', 'type' => 'currency'],
];

// ── Fetch from Yahoo Finance ───────────────────────────────────────────────────
function fetchYahoo(array $watchlist): array
{
    $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36';
    $items     = [];

    foreach ($watchlist as $entry) {
        $sym  = $entry['symbol'];
        $url  = 'https://query1.finance.yahoo.com/v8/finance/chart/' . urlencode($sym)
              . '?interval=1d&range=2d&includePrePost=false';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERAGENT      => $userAgent,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER     => [
                'Accept: application/json',
                'Accept-Language: en-US,en;q=0.9',
            ],
            CURLOPT_FOLLOWLOCATION => true,
        ]);

        $body   = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($status !== 200 || !$body) {
            continue;
        }

        $data = json_decode($body, true);
        $meta = $data['chart']['result'][0]['meta'] ?? null;

        if (!$meta || empty($meta['regularMarketPrice'])) {
            continue;
        }

        $price      = (float) $meta['regularMarketPrice'];
        $prevClose  = (float) ($meta['previousClose'] ?? $meta['chartPreviousClose'] ?? $price);
        $change     = $price - $prevClose;
        $changePct  = $prevClose != 0 ? ($change / $prevClose) * 100 : 0;
        $currency   = $meta['currency'] ?? 'IDR';

        $items[] = [
            'symbol'        => $sym,
            'label'         => $entry['label'],
            'type'          => $entry['type'],
            'price'         => round($price, 4),
            'change'        => round($change, 4),
            'changePercent' => round($changePct, 2),
            'currency'      => $currency,
            'updatedAt'     => date('c'),
        ];
    }

    return $items;
}

$items = fetchYahoo($watchlist);

$response = json_encode(
    ['items' => $items, 'fetchedAt' => date('c'), 'source' => 'Yahoo Finance'],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);

// Save to cache
file_put_contents($cacheFile, $response);

echo $response;
