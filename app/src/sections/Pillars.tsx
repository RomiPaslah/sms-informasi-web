import { useEffect, useRef, useState } from 'react';
import { Compass, BookOpen, Lightbulb, Zap } from 'lucide-react';

const Pillars = () => {
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

  const pillars = [
    {
      icon: Compass,
      title: 'VISIONER',
      description: 'Melihat jauh ke depan dalam merespons perubahan zaman.',
      color: 'from-[#d90429] to-[#ef233c]'
    },
    {
      icon: BookOpen,
      title: 'TRANSPARAN',
      description: 'Terbuka dalam informasi dan akuntabel dalam tindakan.',
      color: 'from-[#2b2d42] to-[#4a4d6b]'
    },
    {
      icon: Lightbulb,
      title: 'INOVATIF',
      description: 'Terus mencari cara baru untuk memberikan dampak positif.',
      color: 'from-[#d90429] to-[#ef233c]'
    },
    {
      icon: Zap,
      title: 'RESPONSIF',
      description: 'Cepat tanggap terhadap persoalan yang terjadi di tengah masyarakat.',
      color: 'from-[#2b2d42] to-[#4a4d6b]'
    }
  ];

  return (
    <section
      id="pillars"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d90429]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#2b2d42]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`section-label transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Empat Pilar
          </span>
          <h2
            className={`section-title mt-4 transition-all duration-600 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <span className="text-[#d90429]">Progresif</span>,{' '}
            <span className="text-black">Kolaboratif</span>,{' '}
            <span className="text-[#d90429]">Berbasis Data</span>
          </h2>
        </div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isOdd = index % 2 === 0;
            
            return (
              <div
                key={pillar.title}
                className={`group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                  isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-[-5deg]'
                } ${isOdd ? 'lg:-translate-y-4' : 'lg:translate-y-4'}`}
                style={{ 
                  transitionDelay: `${600 + index * 100}ms`,
                  transitionTimingFunction: 'var(--ease-elastic)'
                }}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6 transition-all duration-400 group-hover:scale-110 group-hover:rotate-3`}
                  style={{ 
                    animationDelay: `${800 + index * 100}ms`,
                    animation: isVisible ? 'bounceIn 0.4s var(--ease-bounce) forwards' : 'none'
                  }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-black mb-3 group-hover:text-[#d90429] transition-colors duration-300">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {pillar.description}
                </p>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#d90429]/30 transition-colors duration-300" />
                
                {/* Corner Accent */}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#d90429]/10 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>

        {/* Connecting Lines (Visual Decoration) */}
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-px">
          <svg
            className={`w-full h-20 transition-all duration-1000 ${
              isVisible ? 'opacity-30' : 'opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d90429" stopOpacity="0" />
                <stop offset="50%" stopColor="#d90429" stopOpacity="1" />
                <stop offset="100%" stopColor="#d90429" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="10"
              x2="100%"
              y2="10"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray="8 8"
              className={isVisible ? 'animate-dash' : ''}
            />
          </svg>
        </div>

        {/* Bottom Statement */}
        <div
          className={`mt-16 text-center transition-all duration-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '1200ms' }}
        >
          <p className="text-gray-500 max-w-2xl mx-auto">
            Keempat pilar ini menjadi fondasi dalam setiap gerakan SMS untuk memastikan 
            setiap langkah yang diambil selalu berorientasi pada kebaikan bersama.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translateY(-30px) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
        
        .animate-dash {
          animation: dash 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Pillars;
