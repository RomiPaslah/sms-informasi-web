import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

const About = () => {
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

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d90429] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d90429] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            {/* Section Label */}
            <div
              className={`transition-all duration-600 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionTimingFunction: 'steps(12)' }}
            >
              <span className="section-label">Tentang SMS</span>
            </div>

            {/* Headline */}
            <h2
              className={`section-title mt-4 mb-8 transition-all duration-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ 
                transitionDelay: '100ms',
                transitionTimingFunction: 'var(--ease-out-expo)'
              }}
            >
              Menyatukan{' '}
              <span className="text-[#d90429]">Intelektual</span> dan{' '}
              <span className="text-[#d90429]">Aksi</span>
            </h2>

            {/* Body Text */}
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p
                className={`transition-all duration-600 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
                }`}
                style={{ 
                  transitionDelay: '300ms',
                  transitionTimingFunction: 'var(--ease-smooth)'
                }}
              >
                Didirikan oleh <strong className="text-black">Krispol Siregar, S.H.</strong>, SMS lahir dari sebuah kesadaran bahwa pemuda harus menjadi motor penggerak perubahan yang berbasis pada data dan kolaborasi.
              </p>
              <p
                className={`transition-all duration-600 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
                }`}
                style={{ 
                  transitionDelay: '450ms',
                  transitionTimingFunction: 'var(--ease-smooth)'
                }}
              >
                Sebagai sosok yang berlatar belakang hukum dan kepemimpinan organisasi, Krispol Siregar, S.H memandang perlu adanya wadah digital yang tidak hanya menyajikan berita, tetapi juga mampu melakukan analisis strategis demi kepentingan publik.
              </p>
            </div>

            {/* Quote */}
            <div
              className={`mt-10 relative pl-6 border-l-4 border-[#d90429] transition-all duration-700 ${
                isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
              style={{ 
                transitionDelay: '600ms',
                transitionTimingFunction: 'var(--ease-out-expo)'
              }}
            >
              <Quote className="absolute -left-3 -top-2 w-6 h-6 text-[#d90429] bg-white" />
              <blockquote className="text-lg italic text-gray-700 leading-relaxed">
                "Kami hadir untuk memastikan suara pemuda dan keadilan memiliki ruang yang jernih di dunia digital. SMS bukan sekadar portal berita, melainkan pusat pergerakan intelektual yang progresif."
              </blockquote>
              <cite className="block mt-4 text-sm font-semibold text-black not-italic">
                — Krispol Siregar, S.H., <span className="text-[#d90429]">Ketum SMS</span>
              </cite>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            {/* Red Accent Block */}
            <div
              className={`absolute -bottom-6 -right-6 w-full h-full bg-[#d90429] rounded-2xl transition-all duration-400 ${
                isVisible ? 'scale-100 rotate-[-2deg]' : 'scale-0 rotate-[-5deg]'
              }`}
              style={{ 
                transitionDelay: '800ms',
                transitionTimingFunction: 'var(--ease-elastic)'
              }}
            />
            
            {/* Main Image */}
            <div
              className={`relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ 
                transitionDelay: '200ms',
                transitionTimingFunction: 'var(--ease-dramatic)',
                clipPath: isVisible ? 'inset(0)' : 'inset(100% 0 0 0)'
              }}
            >
              <img
                src="/images/about-img.jpg"
                alt="SMS Activities"
                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Floating Badge */}
            <div
              className={`absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 transition-all duration-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ 
                transitionDelay: '1000ms',
                transitionTimingFunction: 'var(--ease-out-expo)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#d90429]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#d90429] font-bold text-lg">S</span>
                </div>
                <div>
                  <p className="font-semibold text-black">Sinergi Muda</p>
                  <p className="text-sm text-gray-500">Strategis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
