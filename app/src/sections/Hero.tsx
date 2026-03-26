import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const headlineWords = ['DIGITAL', 'INDEPENDEN', 'MEMPERJUANGKAN', 'KEADILAN'];

  const scrollToAbout = () => {
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Hero Background"
          className={`w-full h-full object-cover transition-all duration-[1500ms] ${
            isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Red Gradient Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-[#d90429]/70 via-[#ef233c]/50 to-[#d90429]/40 transition-all duration-[1200ms] delay-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            transitionTimingFunction: 'var(--ease-dramatic)',
            backgroundSize: '200% 200%',
            animation: isLoaded ? 'gradientShift 8s ease infinite' : 'none'
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Floating Red Shape */}
      <div 
        className={`absolute -right-20 top-1/4 w-96 h-96 bg-[#d90429]/30 rounded-full blur-3xl transition-all duration-1000 delay-[1200ms] ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
        }`}
        style={{ 
          transitionTimingFunction: 'var(--ease-out-expo)',
          animation: isLoaded ? 'float 6s ease-in-out infinite' : 'none'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-20 pt-20">
        <div className="max-w-5xl">
          {/* Headline */}
          <div className="space-y-1 mb-8">
            {headlineWords.map((word, index) => (
              <div
                key={word}
                className={`overflow-hidden ${index === 3 ? 'mt-4' : ''}`}
              >
                <h1
                  className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-[0.9] tracking-tight transition-all duration-800 ${
                    isLoaded 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-full opacity-0'
                  } ${index === 3 ? 'text-gradient bg-gradient-to-r from-white to-[#ef233c] bg-clip-text text-transparent' : ''}`}
                  style={{ 
                    transitionDelay: `${400 + index * 150}ms`,
                    transitionTimingFunction: 'var(--ease-out-expo)',
                    textShadow: index === 3 ? '0 0 40px rgba(217, 4, 41, 0.5)' : 'none'
                  }}
                >
                  {word}
                </h1>
              </div>
            ))}
          </div>

          {/* Subheadline */}
          <p
            className={`text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mb-10 leading-relaxed transition-all duration-600 ${
              isLoaded 
                ? 'translate-y-0 opacity-100 blur-0' 
                : 'translate-y-8 opacity-0 blur-sm'
            }`}
            style={{ 
              transitionDelay: '1400ms',
              transitionTimingFunction: 'var(--ease-smooth)'
            }}
          >
            Sinergi Muda Strategis (SMS) — Kanal berita online yang mengusung semangat{' '}
            <span className="text-[#ef233c] font-semibold">digital independen</span> untuk menjadi jembatan informasi yang akurat, tajam, dan edukatif.
          </p>

          {/* CTA Button */}
          <div
            className={`transition-all duration-500 ${
              isLoaded 
                ? 'scale-100 opacity-100' 
                : 'scale-0 opacity-0'
            }`}
            style={{ 
              transitionDelay: '1600ms',
              transitionTimingFunction: 'var(--ease-elastic)'
            }}
          >
            <button
              onClick={scrollToAbout}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#d90429] text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(217,4,41,0.4)]"
            >
              <span className="relative z-10">Pelajari Lebih Lanjut</span>
              <ChevronDown className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#ef233c] to-[#d90429] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div 
          className={`absolute bottom-10 left-4 sm:left-6 lg:left-12 xl:left-20 transition-all duration-600 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '1800ms' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-0.5 bg-[#d90429]" />
            <span className="text-white/70 text-sm tracking-widest uppercase">
              Digital Independen — Memperjuangkan Keadilan
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-600 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        style={{ transitionDelay: '2000ms' }}
      >
        <button
          onClick={scrollToAbout}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
        >
          <span className="text-xs tracking-wider uppercase">Scroll</span>
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default Hero;
