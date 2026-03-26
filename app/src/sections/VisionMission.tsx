import { useEffect, useRef, useState } from 'react';
import { Eye, Target, CheckCircle } from 'lucide-react';

const VisionMission = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const missions = [
    {
      title: 'Akurasi & Integritas',
      description: 'Menyajikan informasi berita berdasarkan data yang valid dan dapat dipertanggungjawabkan.'
    },
    {
      title: 'Pemberdayaan Pemuda',
      description: 'Menjadi wadah kolaborasi bagi pemuda untuk menyampaikan gagasan strategis dan solusi kreatif.'
    },
    {
      title: 'Advokasi Publik',
      description: 'Mengawal isu-isu hukum dan sosial demi memperjuangkan keadilan bagi seluruh lapisan masyarakat.'
    },
    {
      title: 'Inovasi Digital',
      description: 'Memanfaatkan teknologi informasi untuk mempercepat penyebaran konten positif dan edukatif.'
    }
  ];

  return (
    <section
      id="vision"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-[#f8f9fa] overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#d90429]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#d90429]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`section-label transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Arah dan Tujuan
          </span>
          <h2
            className={`section-title mt-4 transition-all duration-600 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Visi <span className="text-[#d90429]">&</span> Misi
          </h2>
        </div>

        {/* Cards Container */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 relative">
          {/* Central Divider (Desktop) */}
          <div
            className={`hidden lg:block absolute left-1/2 top-0 w-0.5 bg-gradient-to-b from-[#d90429] to-[#ef233c] transition-all duration-800 ${
              isVisible ? 'h-full opacity-100' : 'h-0 opacity-0'
            }`}
            style={{ 
              transitionTimingFunction: 'var(--ease-out-expo)',
              transform: 'translateX(-50%)'
            }}
          />

          {/* Vision Card */}
          <div
            className={`bg-white rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-700 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-24 opacity-0'
            }`}
            style={{ 
              transitionDelay: '200ms',
              transitionTimingFunction: 'var(--ease-out-expo)'
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-16 h-16 bg-[#d90429]/10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isVisible ? 'rotate-0 scale-100' : '-rotate-180 scale-0'
                }`}
                style={{ 
                  transitionDelay: '500ms',
                  transitionTimingFunction: 'var(--ease-elastic)'
                }}
              >
                <Eye className="w-8 h-8 text-[#d90429]" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-black">Visi</h3>
            </div>
            
            <p className="text-gray-600 leading-relaxed text-lg">
              "Menjadi platform media digital independen yang paling terpercaya dalam menggerakkan potensi pemuda menuju tatanan masyarakat yang{' '}
              <span className="text-[#d90429] font-semibold">adil</span>,{' '}
              <span className="text-[#d90429] font-semibold">transparan</span>, dan{' '}
              <span className="text-[#d90429] font-semibold">inovatif</span>."
            </p>

            {/* Decorative Element */}
            <div className="mt-8 flex items-center gap-2">
              <div className="w-8 h-1 bg-[#d90429] rounded-full" />
              <div className="w-4 h-1 bg-[#d90429]/50 rounded-full" />
              <div className="w-2 h-1 bg-[#d90429]/30 rounded-full" />
            </div>
          </div>

          {/* Mission Card */}
          <div
            className={`bg-white rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-700 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-24 opacity-0'
            }`}
            style={{ 
              transitionDelay: '200ms',
              transitionTimingFunction: 'var(--ease-out-expo)'
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-16 h-16 bg-[#d90429]/10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isVisible ? 'rotate-0 scale-100' : 'rotate-180 scale-0'
                }`}
                style={{ 
                  transitionDelay: '500ms',
                  transitionTimingFunction: 'var(--ease-elastic)'
                }}
              >
                <Target className="w-8 h-8 text-[#d90429]" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-black">Misi</h3>
            </div>

            {/* Mission List */}
            <ul className="space-y-4">
              {missions.map((mission, index) => (
                <li
                  key={mission.title}
                  className={`flex items-start gap-3 transition-all duration-400 ${
                    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${600 + index * 100}ms`,
                    transitionTimingFunction: 'var(--ease-smooth)'
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-[#d90429] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-black">{mission.title}:</span>{' '}
                    <span className="text-gray-600">{mission.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Motto */}
        <div
          className={`mt-16 text-center transition-all duration-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-lg">
            <span className="text-gray-500">Motto:</span>
            <span className="font-bold text-[#d90429]">Progresif</span>
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <span className="font-bold text-[#d90429]">Kolaboratif</span>
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <span className="font-bold text-[#d90429]">Berbasis Data</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
