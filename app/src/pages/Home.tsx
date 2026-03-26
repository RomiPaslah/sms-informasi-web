import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Shield, Zap } from 'lucide-react';
import { useSiteContent } from '@/context/SiteContentContext';

export function Home() {
  const { homeContent } = useSiteContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      <section id="hero" className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900 flex flex-col items-center justify-center pt-20 pb-10">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-32 right-10 w-96 h-96 bg-[#d90429] rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-32 left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[length:100px_100px] opacity-20"></div>

        <div className="relative z-10 text-center text-white px-4 max-w-7xl">
          <div className="mb-8 space-y-0 leading-none">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter">
              <span className="block animate-slideInUp text-white" style={{ animationDelay: '0.1s' }}>
                DIGITAL
              </span>
              <span
                className="block bg-gradient-to-r from-[#d90429] via-[#ef233c] to-red-500 bg-clip-text text-transparent animate-slideInUp font-black drop-shadow"
                style={{ animationDelay: '0.2s' }}
              >
                INDEPENDEN
              </span>
            </h1>
          </div>

          <div className="mb-12 space-y-0 leading-none">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter">
              <span className="block animate-slideInUp text-white" style={{ animationDelay: '0.3s' }}>
                MEMPERJUANGKAN
              </span>
              <span
                className="block bg-gradient-to-r from-orange-400 via-red-500 to-[#d90429] bg-clip-text text-transparent animate-slideInUp font-black"
                style={{ animationDelay: '0.4s' }}
              >
                KEADILAN
              </span>
            </h2>
          </div>

          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fadeIn font-light leading-relaxed" style={{ animationDelay: '0.6s' }}>
            Sinergi Muda Strategis adalah kanal berita digital independen yang menghadirkan informasi akurat, tajam, dan edukatif untuk memberdayakan pemuda menjadi motor perubahan menuju keadilan.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-[#d90429]">100%</div>
              <div className="text-sm text-gray-300">Data Terverifikasi</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-[#ef233c]">24/7</div>
              <div className="text-sm text-gray-300">Liputan Terkini</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-500">50+</div>
              <div className="text-sm text-gray-300">Artikel Publikasi</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <Link to="/berita" className="group relative px-8 py-4 bg-gradient-to-r from-[#d90429] to-[#ef233c] text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2">
              <span className="relative z-10">Mulai Jelajahi</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#ef233c] to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link to="/berita" className="group relative px-8 py-4 border-2 border-white text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/50 hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2">
              <span className="relative z-10">Baca Berita Terbaru</span>
              <MessageCircle className="w-5 h-5 relative z-10" />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          </div>

          <div className="flex flex-col items-center gap-2 animate-bounce" style={{ animationDuration: '2s' }}>
            <span className="text-sm text-gray-400">Geser ke bawah untuk lanjut</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative py-24 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInLeft">
              <div className="inline-block mb-4">
                <span className="text-[#d90429] text-sm font-bold uppercase tracking-widest">{homeContent.aboutBadge}</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">{homeContent.aboutTitle}</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{homeContent.aboutDescription}</p>
              <blockquote className="border-l-4 border-[#d90429] pl-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-r-lg italic text-gray-700 dark:text-gray-300">
                "{homeContent.aboutQuote}"
                <div className="text-sm font-bold text-[#d90429] mt-3 not-italic">- {homeContent.aboutQuoteAuthor}</div>
              </blockquote>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#d90429] to-[#ef233c] rounded-2xl opacity-30 group-hover:opacity-100 blur-xl transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 overflow-hidden">
                <div className="space-y-4">
                  <div className="bg-[#d90429]/20 text-[#d90429] font-bold text-center py-6 rounded-lg">
                    <div className="text-lg">{homeContent.activitiesTitle}</div>
                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300 px-4">
                      {homeContent.activitiesDescription}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {homeContent.activitiesMedia.map((item) => (
                      <div key={item.id} className="rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                        {item.type === 'video' ? (
                          <iframe
                            src={item.src}
                            title={item.title}
                            className="w-full h-36"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        ) : (
                          <img src={item.src} alt={item.title} className="w-full h-36 object-cover" />
                        )}
                        <div className="p-3">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="vision" className="relative py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-[#d90429] text-sm font-bold uppercase tracking-widest">Panduan Kami</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mt-2">
              Visi <span className="text-[#d90429]">&</span> Misi
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group animate-slideInUp" style={{ animationDelay: '0.1s' }}>
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-700 p-8 shadow-lg hover:shadow-2xl transition duration-300 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d90429]/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="inline-block mb-4 p-3 bg-[#d90429]/20 rounded-lg">
                    <Zap className="w-6 h-6 text-[#d90429]" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Visi</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Menjadi <strong>platform media digital independen</strong> yang paling terpercaya dalam menggerakkan potensi pemuda menuju tatanan masyarakat yang <strong>adil, transparan, dan inovatif</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="group animate-slideInUp" style={{ animationDelay: '0.2s' }}>
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-700 p-8 shadow-lg hover:shadow-2xl transition duration-300 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="inline-block mb-4 p-3 bg-red-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Misi Kami</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-[#d90429] font-bold flex-shrink-0">✓</span>
                      <span><strong>Akurasi & Integritas:</strong> Data valid terpertanggungjawab</span>
                    </li>
                    <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-[#d90429] font-bold flex-shrink-0">✓</span>
                      <span><strong>Pemberdayaan Pemuda:</strong> Wadah kolaborasi strategis</span>
                    </li>
                    <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-[#d90429] font-bold flex-shrink-0">✓</span>
                      <span><strong>Advokasi Publik:</strong> Awal isu hukum & sosial</span>
                    </li>
                    <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-[#d90429] font-bold flex-shrink-0">✓</span>
                      <span><strong>Inovasi Digital:</strong> Teknologi konten positif</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pillars" className="relative py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-[#d90429] text-sm font-bold uppercase tracking-widest">Fondasi Kami</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mt-2">
              <span className="text-[#d90429]">Empat Pilar</span> Keunggulan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Progresif, Kolaboratif, Berbasis Data</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '📈', title: 'VISIONER', desc: 'Melihat jauh ke depan dalam merespons perubahan zaman dengan strategi jangka panjang.' },
              { icon: '🔍', title: 'TRANSPARAN', desc: 'Terbuka dalam informasi dan akuntabel dalam setiap tindakan yang kami ambil.' },
              { icon: '💡', title: 'INOVATIF', desc: 'Terus mencari cara baru untuk memberikan dampak positif kepada masyarakat luas.' },
              { icon: '⚡', title: 'RESPONSIF', desc: 'Cepat tanggap terhadap persoalan dan isu yang terjadi di tengah masyarakat.' },
            ].map((pillar, idx) => (
              <div key={pillar.title} className="group animate-slideInUp" style={{ animationDelay: `${0.1 + idx * 0.1}s` }}>
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border-2 border-transparent hover:border-[#d90429] transition-all duration-300 h-full hover:shadow-xl hover:-translate-y-2">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{pillar.icon}</div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{pillar.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-[#d90429]/20 to-red-500/20 dark:from-[#d90429]/10 dark:to-red-500/10 rounded-2xl border-2 border-[#d90429]/30 text-center">
            <p className="text-gray-900 dark:text-white font-bold">
              Keempat pilar ini menjadi <span className="text-[#d90429]">fondasi</span> dalam setiap gerakan SMS untuk memastikan setiap langkah selalu berorientasi pada <span className="text-[#d90429]">kebaikan bersama</span>.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="relative py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-[#d90429] text-sm font-bold uppercase tracking-widest">Hubungi Kami</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mt-2">
              Kontak <span className="text-[#d90429]">Media & Info</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Kami siap mendengarkan dan berkolaborasi dengan Anda</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { title: 'WhatsApp', icon: '💬', value: '0821-1966-7132', link: 'https://wa.me/6282119667132', highlight: true },
              { title: 'Website', icon: '🌐', value: 'sinergimudastrategis.com', link: 'https://www.sinergimudastrategis.com/' },
              { title: 'Email', icon: '✉️', value: 'info@sinergimudastrategis.com', link: 'mailto:info@sinergimudastrategis.com' },
            ].map((contact, idx) => (
              <a
                key={contact.title}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group animate-slideInUp block transition-all duration-500 ${contact.highlight ? 'md:scale-105 md:row-span-2' : ''}`}
                style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
              >
                <div className={`relative overflow-hidden rounded-2xl p-8 h-full flex flex-col justify-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${contact.highlight ? 'bg-gradient-to-br from-[#d90429] to-[#ef233c] text-white shadow-lg' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-[#d90429]'}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-4">{contact.icon}</div>
                    <h3 className={`text-xl font-black mb-2 ${contact.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{contact.title}</h3>
                    <p className={`font-bold text-lg ${contact.highlight ? 'text-white/90' : 'text-[#d90429]'}`}>{contact.value}</p>
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
