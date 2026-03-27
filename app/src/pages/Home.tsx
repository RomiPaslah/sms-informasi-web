import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { Ad } from '@/components/Ad';

export function Home() {
  const { homeContent } = useSiteContent();
  const { canAccessAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const timer = window.setTimeout(() => {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  const handleAdminEditMedia = (mediaId: string) => {
    if (!canAccessAdmin) {
      return;
    }

    navigate(`/admin?tab=homepage&media=${mediaId}`);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-gray-950">
      <section
        id="hero"
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900 pb-10 pt-20"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute right-10 top-32 h-96 w-96 animate-blob rounded-full bg-[#d90429] blur-3xl" />
          <div
            className="absolute -bottom-32 left-10 h-96 w-96 animate-blob rounded-full bg-blue-600 blur-3xl"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-96 w-96 animate-blob rounded-full bg-orange-500 blur-3xl"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[length:100px_100px] opacity-20" />

        <div className="relative z-10 max-w-7xl px-4 text-center text-white">
          <div className="mb-8 space-y-0 leading-none">
            <h1 className="text-7xl font-black tracking-tighter md:text-8xl lg:text-9xl">
              <span
                className="block animate-slideInUp text-white"
                style={{ animationDelay: '0.1s' }}
              >
                DIGITAL
              </span>
              <span
                className="block animate-slideInUp bg-gradient-to-r from-[#d90429] via-[#ef233c] to-red-500 bg-clip-text font-black text-transparent drop-shadow"
                style={{ animationDelay: '0.2s' }}
              >
                INDEPENDEN
              </span>
            </h1>
          </div>

          <div className="mb-12 space-y-0 leading-none">
            <h2 className="text-6xl font-black tracking-tighter md:text-7xl lg:text-8xl">
              <span
                className="block animate-slideInUp text-white"
                style={{ animationDelay: '0.3s' }}
              >
                MEMPERJUANGKAN
              </span>
              <span
                className="block animate-slideInUp bg-gradient-to-r from-orange-400 via-red-500 to-[#d90429] bg-clip-text font-black text-transparent"
                style={{ animationDelay: '0.4s' }}
              >
                KEADILAN
              </span>
            </h2>
          </div>

          <p
            className="mx-auto mb-12 max-w-3xl animate-fadeIn text-lg font-light leading-relaxed text-gray-300 md:text-xl"
            style={{ animationDelay: '0.6s' }}
          >
            Sinergi Muda Strategis adalah kanal berita digital independen yang menghadirkan
            informasi akurat, tajam, dan edukatif untuk memberdayakan pemuda menjadi motor
            perubahan menuju keadilan.
          </p>

          <div
            className="mb-12 grid gap-6 animate-fadeIn md:grid-cols-3"
            style={{ animationDelay: '0.7s' }}
          >
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <div className="text-3xl font-bold text-[#d90429]">100%</div>
              <div className="text-sm text-gray-300">Data Terverifikasi</div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <div className="text-3xl font-bold text-[#ef233c]">24/7</div>
              <div className="text-sm text-gray-300">Liputan Terkini</div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <div className="text-3xl font-bold text-red-500">50+</div>
              <div className="text-sm text-gray-300">Artikel Publikasi</div>
            </div>
          </div>

          <div
            className="mb-20 flex flex-col justify-center gap-4 animate-fadeIn sm:flex-row"
            style={{ animationDelay: '0.8s' }}
          >
            <Link
              to="/berita"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#d90429] to-[#ef233c] px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50"
            >
              <span className="relative z-10">Mulai Jelajahi</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#ef233c] to-red-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              to="/berita"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl hover:shadow-white/50"
            >
              <span className="relative z-10">Baca Berita Terbaru</span>
              <MessageCircle className="relative z-10 h-5 w-5" />
              <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
            </Link>
          </div>

          <div className="flex animate-bounce flex-col items-center gap-2" style={{ animationDuration: '2s' }}>
            <span className="text-sm text-gray-400">Geser ke bawah untuk lanjut</span>
            <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-2">
              <div className="h-2 w-1 animate-pulse rounded-full bg-white/60" />
            </div>
          </div>
        </div>
      </section>

      <Ad position="header" />

      <section id="about" className="relative bg-white py-24 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="animate-fadeInLeft">
              <div className="mb-4 inline-block">
                <span className="text-sm font-bold uppercase tracking-widest text-[#d90429]">
                  {homeContent.aboutBadge}
                </span>
              </div>
              <h2 className="mb-6 text-5xl font-black text-gray-900 dark:text-white md:text-6xl">
                {homeContent.aboutTitle}
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                {homeContent.aboutDescription}
              </p>
              <blockquote className="rounded-r-lg border-l-4 border-[#d90429] bg-gray-50 py-4 pl-6 italic text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                "{homeContent.aboutQuote}"
                <div className="mt-3 text-sm font-bold not-italic text-[#d90429]">
                  - {homeContent.aboutQuoteAuthor}
                </div>
              </blockquote>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#d90429] to-[#ef233c] opacity-30 blur-xl transition duration-300 group-hover:opacity-100" />
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 dark:from-gray-800 dark:to-gray-900">
                <div className="space-y-4">
                  <div className="rounded-lg bg-[#d90429]/20 py-6 text-center font-bold text-[#d90429]">
                    <div className="text-lg">{homeContent.activitiesTitle}</div>
                    <p className="mt-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {homeContent.activitiesDescription}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {homeContent.activitiesMedia.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAdminEditMedia(item.id)}
                        className={`overflow-hidden rounded-lg bg-white text-left shadow-sm dark:bg-gray-900 ${
                          canAccessAdmin
                            ? 'group/media transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#d90429]'
                            : 'cursor-default'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <iframe
                            src={item.src}
                            title={item.title}
                            className="h-36 w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        ) : (
                          <img src={item.src} alt={item.title} className="h-36 w-full object-cover" />
                        )}
                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                          {canAccessAdmin && (
                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d90429]">
                              Klik untuk edit
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="vision"
        className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-24 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-[#d90429]">
              Panduan Kami
            </span>
            <h2 className="mt-2 text-5xl font-black text-gray-900 dark:text-white md:text-6xl">
              Visi <span className="text-[#d90429]">&</span> Misi
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="group animate-slideInUp" style={{ animationDelay: '0.1s' }}>
              <div className="relative h-full overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition duration-300 hover:shadow-2xl dark:bg-gray-700">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#d90429]/20 to-transparent" />
                <div className="relative z-10">
                  <div className="mb-4 inline-block rounded-lg bg-[#d90429]/20 p-3">
                    <Zap className="h-6 w-6 text-[#d90429]" />
                  </div>
                  <h3 className="mb-4 text-2xl font-black text-gray-900 dark:text-white">Visi</h3>
                  <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                    Menjadi <strong>platform media digital independen</strong> yang paling
                    terpercaya dalam menggerakkan potensi pemuda menuju tatanan masyarakat yang{' '}
                    <strong>adil, transparan, dan inovatif</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="group animate-slideInUp" style={{ animationDelay: '0.2s' }}>
              <div className="relative h-full overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition duration-300 hover:shadow-2xl dark:bg-gray-700">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-400/20 to-transparent" />
                <div className="relative z-10">
                  <div className="mb-4 inline-block rounded-lg bg-red-500/20 p-3">
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="mb-4 text-2xl font-black text-gray-900 dark:text-white">
                    Misi Kami
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Akurasi & Integritas: Data valid terpertanggungjawab',
                      'Pemberdayaan Pemuda: Wadah kolaborasi strategis',
                      'Advokasi Publik: Awal isu hukum & sosial',
                      'Inovasi Digital: Teknologi konten positif',
                    ].map((mission) => (
                      <li key={mission} className="flex gap-3 text-gray-700 dark:text-gray-300">
                        <span className="font-bold text-[#d90429]">✓</span>
                        <span>{mission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pillars" className="relative bg-white py-24 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-[#d90429]">
              Fondasi Kami
            </span>
            <h2 className="mt-2 text-5xl font-black text-gray-900 dark:text-white md:text-6xl">
              <span className="text-[#d90429]">Empat Pilar</span> Keunggulan
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Progresif, Kolaboratif, Berbasis Data
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                icon: '📈',
                title: 'VISIONER',
                desc: 'Melihat jauh ke depan dalam merespons perubahan zaman dengan strategi jangka panjang.',
              },
              {
                icon: '🔍',
                title: 'TRANSPARAN',
                desc: 'Terbuka dalam informasi dan akuntabel dalam setiap tindakan yang kami ambil.',
              },
              {
                icon: '💡',
                title: 'INOVATIF',
                desc: 'Terus mencari cara baru untuk memberikan dampak positif kepada masyarakat luas.',
              },
              {
                icon: '⚡',
                title: 'RESPONSIF',
                desc: 'Cepat tanggap terhadap persoalan dan isu yang terjadi di tengah masyarakat.',
              },
            ].map((pillar, idx) => (
              <div
                key={pillar.title}
                className="group animate-slideInUp"
                style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
              >
                <div className="h-full rounded-2xl border-2 border-transparent bg-gradient-to-br from-gray-50 to-gray-100 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#d90429] hover:shadow-xl dark:from-gray-800 dark:to-gray-900">
                  <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110">
                    {pillar.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-black text-gray-900 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border-2 border-[#d90429]/30 bg-gradient-to-r from-[#d90429]/20 to-red-500/20 p-8 text-center dark:from-[#d90429]/10 dark:to-red-500/10">
            <p className="font-bold text-gray-900 dark:text-white">
              Keempat pilar ini menjadi <span className="text-[#d90429]">fondasi</span> dalam
              setiap gerakan SMS untuk memastikan setiap langkah selalu berorientasi pada{' '}
              <span className="text-[#d90429]">kebaikan bersama</span>.
            </p>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="relative bg-gradient-to-b from-gray-50 to-white py-24 dark:from-gray-800 dark:to-gray-950"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-[#d90429]">
              {homeContent.contactBadge}
            </span>
            <h2 className="mt-2 text-5xl font-black text-gray-900 dark:text-white md:text-6xl">
              {homeContent.contactTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {homeContent.contactDescription}
            </p>
          </div>

          <div className="mb-12 grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {homeContent.contacts.map((contact, idx) => (
              <a
                id={contact.id}
                key={contact.id}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block animate-slideInUp transition-all duration-500"
                style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
              >
                <div
                  className={`relative flex h-full flex-col justify-center overflow-hidden rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                    contact.highlight
                      ? 'bg-gradient-to-br from-[#d90429] to-[#ef233c] text-white shadow-lg lg:scale-[1.02]'
                      : 'border-2 border-gray-200 bg-white text-gray-900 hover:border-[#d90429] dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                  }`}
                >
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative z-10">
                    <div className="mb-4 text-5xl">{contact.icon}</div>
                    <h3
                      className={`mb-2 text-xl font-black ${
                        contact.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {contact.title}
                    </h3>
                    <p
                      className={`text-lg font-bold ${
                        contact.highlight ? 'text-white/90' : 'text-[#d90429]'
                      }`}
                    >
                      {contact.value}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
