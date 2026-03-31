import { useEffect, useRef, useState } from 'react';
import { TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';

export interface TickerItem {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'index' | 'stock' | 'currency' | 'crypto';
}

// ── Binance symbols (direct, CORS-friendly) ───────────────────────────────────
const BINANCE_SYMBOLS: { binance: string; label: string }[] = [
  { binance: 'BTCUSDT', label: 'BTC'  },
  { binance: 'ETHUSDT', label: 'ETH'  },
  { binance: 'BNBUSDT', label: 'BNB'  },
  { binance: 'SOLUSDT', label: 'SOL'  },
];

// ── Display config ────────────────────────────────────────────────────────────
const TYPE_TAG: Record<TickerItem['type'], { label: string; cls: string }> = {
  index:    { label: 'IDX',    cls: 'text-yellow-300'  },
  stock:    { label: 'IDX',    cls: 'text-sky-300'     },
  currency: { label: 'VALAS',  cls: 'text-emerald-300' },
  crypto:   { label: 'CRYPTO', cls: 'text-purple-300'  },
};

function formatPrice(price: number, type: TickerItem['type']): string {
  if (type === 'index')    return price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (type === 'stock')    return `Rp${price.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  if (type === 'currency') return `Rp${price.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  if (type === 'crypto')   return price >= 1000
    ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : `$${price.toFixed(2)}`;
  return String(price);
}

// ── Fetch stock/index/forex from our PHP proxy ────────────────────────────────
async function fetchFromProxy(): Promise<TickerItem[]> {
  const url = '/api/market_data.php';
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const rawItems: {
    symbol: string; label: string; type: string;
    price: number; change: number; changePercent: number;
  }[] = json.items ?? [];
  return rawItems
    .filter((it) => it.price > 0)
    .map((it) => ({
      symbol:        it.symbol,
      label:         it.label,
      type:          it.type as TickerItem['type'],
      price:         it.price,
      change:        it.change,
      changePercent: it.changePercent,
    }));
}

// ── Fetch crypto from Binance (no CORS restriction) ───────────────────────────
async function fetchFromBinance(): Promise<TickerItem[]> {
  const symbols = JSON.stringify(BINANCE_SYMBOLS.map((s) => s.binance));
  const url     = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`;
  const res     = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
  const list: { symbol: string; lastPrice: string; priceChange: string; priceChangePercent: string }[] = await res.json();
  return list.map((it) => {
    const meta = BINANCE_SYMBOLS.find((s) => s.binance === it.symbol)!;
    return {
      symbol:        it.symbol,
      label:         meta.label,
      type:          'crypto' as const,
      price:         parseFloat(it.lastPrice),
      change:        parseFloat(it.priceChange),
      changePercent: parseFloat(it.priceChangePercent),
    };
  });
}

// ── Skeleton placeholder while data loads ─────────────────────────────────────
const SKELETONS = [
  'IHSG', 'BBCA', 'TLKM', 'BMRI', 'ASII', 'BBRI', 'UNVR', 'GOTO',
  'USD/IDR', 'EUR/IDR', 'GBP/IDR', 'SGD/IDR',
  'BTC', 'ETH', 'BNB', 'SOL',
];

// ── Component ─────────────────────────────────────────────────────────────────
export function MarketTicker() {
  const [items, setItems]       = useState<TickerItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [paused, setPaused]     = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [proxyItems, cryptoItems] = await Promise.allSettled([
        fetchFromProxy(),
        fetchFromBinance(),
      ]);

      const merged: TickerItem[] = [];

      if (proxyItems.status === 'fulfilled') {
        merged.push(...proxyItems.value);
      }
      if (cryptoItems.status === 'fulfilled') {
        merged.push(...cryptoItems.value);
      }

      if (merged.length > 0) {
        setItems(merged);
        setLastUpdate(new Date());
      }
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 60_000);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex items-stretch h-7 w-full overflow-hidden"
      style={{ background: 'linear-gradient(90deg, #0f0f1a 0%, #1a1a2e 50%, #0f172a 100%)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* LIVE badge */}
      <button
        onClick={loadAll}
        title="Refresh data pasar"
        className="flex-shrink-0 flex items-center gap-1.5 px-3 border-r border-white/10 cursor-pointer hover:brightness-110 transition-all"
        style={{ background: '#d90429' }}
      >
        {loading
          ? <RefreshCw className="w-2.5 h-2.5 text-white animate-spin" />
          : <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        }
        <span className="text-white text-[9px] font-black tracking-widest uppercase whitespace-nowrap">
          LIVE
        </span>
      </button>

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden relative">
        {loading && items.length === 0 ? (
          /* Skeleton while first load */
          <div
            className="flex items-center whitespace-nowrap h-full"
            style={{ animation: 'ticker-scroll 80s linear infinite' }}
          >
            {[...SKELETONS, ...SKELETONS].map((label, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3.5 border-r border-white/[0.07] h-7">
                <span className="w-8 h-2 rounded bg-white/10 animate-pulse" />
                <span className="text-white/50 text-[10px] font-semibold">{label}</span>
                <span className="w-14 h-2 rounded bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex items-center whitespace-nowrap h-full"
            style={{
              animation: paused ? 'none' : 'ticker-scroll 80s linear infinite',
            }}
          >
            {[...items, ...items].map((item, idx) => (
              <TickerCell key={`${item.symbol}-${idx}`} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Timestamp + Clock */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 border-l border-white/10 hidden sm:flex">
        {lastUpdate && (
          <span className="text-white/30 text-[8px] hidden lg:block">
            upd {lastUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <span className="text-white/40 text-[9px] font-mono whitespace-nowrap">
          <LiveClock />
        </span>
      </div>
    </div>
  );
}

function TickerCell({ item }: { item: TickerItem }) {
  const isUp = item.changePercent >= 0;
  const tag  = TYPE_TAG[item.type];

  return (
    <div className="flex items-center gap-1.5 px-3.5 border-r border-white/[0.07] h-7">
      <span className={`text-[8px] font-bold tracking-wider uppercase ${tag.cls}`}>
        {tag.label}
      </span>
      <span className="text-white/90 text-[10px] font-semibold">
        {item.label}
      </span>
      <span className={`text-[10px] font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {formatPrice(item.price, item.type)}
      </span>
      <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp
          ? <TrendingUp className="w-2.5 h-2.5 flex-shrink-0" />
          : <TrendingDown className="w-2.5 h-2.5 flex-shrink-0" />
        }
        {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
      </span>
    </div>
  );
}

function LiveClock() {
  const fmt = () =>
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const t = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{time} WIB</>;
}
