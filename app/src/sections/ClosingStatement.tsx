import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

const ClosingStatement = () => {
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
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black via-[#2b2d42] to-[#1a1a2e]"
        style={{
          backgroundSize: '400% 400%',
          animation: isVisible ? 'gradientFlow 15s ease infinite' : 'none'
        }}
      />
      
      {/* Red Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d90429]/10 rounded-full blur-3xl" />
      
      {/* Diagonal Clip */}
      <div 
        className="absolute inset-0 bg-black"
        style={{
          clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)',
          zIndex: -1
        }}
      />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 transition-all duration-800 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              transitionDelay: '200ms',
              transitionTimingFunction: 'var(--ease-out-expo)',
              textShadow: isVisible ? '0 0 30px rgba(217, 4, 41, 0.3)' : 'none'
            }}
          >
            <span className="text-[#ef233c]">Digital Independen</span> untuk Keadilan
          </h2>

          {/* Body Text */}
          <div className="space-y-6 mb-12">
            <p
              className={`text-lg text-white/80 leading-relaxed transition-all duration-600 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ 
                transitionDelay: '400ms',
                transitionTimingFunction: 'var(--ease-smooth)'
              }}
            >
              Dengan simbol kepalan tangan yang dikelilingi orbit dinamis dan bintang merah, 
              SMS menegaskan kekuatannya untuk mendobrak kebekuan informasi.
            </p>
            <p
              className={`text-lg text-white/80 leading-relaxed transition-all duration-600 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ 
                transitionDelay: '500ms',
                transitionTimingFunction: 'var(--ease-smooth)'
              }}
            >
              SMS kini hadir sebagai referensi utama bagi publik yang mendambakan pemberitaan 
              yang berani namun tetap menjunjung tinggi kode etik jurnalistik.
            </p>
          </div>

          {/* Quote */}
          <div
            className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/10 transition-all duration-700 ${
              isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            style={{ 
              transitionDelay: '600ms',
              transitionTimingFunction: 'var(--ease-out-expo)'
            }}
          >
            <Quote className="absolute -top-4 left-8 w-8 h-8 text-[#d90429]" />
            <blockquote className="text-xl lg:text-2xl italic text-white leading-relaxed">
              "Motor penggerak progresif ada di tangan kita. Melalui peran pemuda, 
              kita perjuangkan keadilan lewat literasi digital yang kuat."
            </blockquote>
            <cite className="block mt-6 text-white/60 not-italic">
              — <span className="text-white font-semibold">Krispol Siregar, S.H.</span>
            </cite>
          </div>

          {/* Logo */}
          <div
            className={`mt-12 transition-all duration-600 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            <img
              src="/images/sms-logo.png"
              alt="SMS Logo"
              className="h-20 w-auto mx-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
};

export default ClosingStatement;
