import { useEffect, useRef, useState } from 'react';
import { Globe, Mail, ExternalLink, MessageCircle } from 'lucide-react';
import { useSiteContent } from '@/context/SiteContentContext';

const Contact = () => {
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

  const { homeContent } = useSiteContent();

  const contacts = homeContent?.contacts?.length
    ? homeContent.contacts.map((item) => ({
        icon:
          item.title.toLowerCase().includes('whatsapp') ? MessageCircle :
          item.title.toLowerCase().includes('website') ? Globe :
          item.title.toLowerCase().includes('email') ? Mail :
          MessageCircle,
        title: item.title,
        info: item.value,
        cta: item.title === 'Email' ? 'Kirim Email' : item.title === 'WhatsApp' ? 'Hubungi Sekarang' : 'Kunjungi',
        href: item.link,
        featured: !!item.highlight,
      }))
    : [
        {
          icon: MessageCircle,
          title: 'WhatsApp',
          info: '0821-1966-7132',
          cta: 'Hubungi Sekarang',
          href: 'https://wa.me/6282119667132',
          featured: false,
        },
        {
          icon: Globe,
          title: 'Website',
          info: 'www.sinergimudastrategis.com',
          cta: 'Kunjungi Website',
          href: 'https://www.sinergimudastrategis.com',
          featured: true,
        },
        {
          icon: Mail,
          title: 'Email',
          info: 'info@sinergimudastrategis.com',
          cta: 'Kirim Email',
          href: 'mailto:info@sinergimudastrategis.com',
          featured: false,
        },
      ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-[#f8f9fa] overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#d90429]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#2b2d42]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`section-label transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Hubungi Kami
          </span>
          <h2
            className={`section-title mt-4 transition-all duration-500 ${
              isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
            style={{ 
              transitionDelay: '100ms',
              transitionTimingFunction: 'var(--ease-elastic)'
            }}
          >
            Kontak <span className="text-[#d90429]">Media</span>
          </h2>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            const isLeft = index === 0;
            const isRight = index === 2;
            
            return (
              <div
                key={contact.title}
                className={`group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-600 hover:-translate-y-4 hover:shadow-2xl ${
                  contact.featured ? 'md:-translate-y-4 md:scale-105 z-10' : ''
                } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ 
                  transitionDelay: `${200 + index * 100}ms`,
                  transitionTimingFunction: isLeft || isRight ? 'var(--ease-out-expo)' : 'var(--ease-elastic)',
                  transform: isVisible 
                    ? contact.featured ? 'translateY(-16px) scale(1.05)' : 'translateX(0) rotateY(0)' 
                    : isLeft ? 'translateX(-50px) rotateY(15deg)' : isRight ? 'translateX(50px) rotateY(-15deg)' : 'scale(0.8)'
                }}
              >
                {/* Featured Badge */}
                {contact.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#d90429] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Utama
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d90429] to-[#ef233c] flex items-center justify-center mb-6 mx-auto transition-all duration-400 group-hover:scale-110 group-hover:rotate-6`}
                  style={{ 
                    transitionDelay: `${300 + index * 100}ms`,
                    animation: isVisible ? 'bounceIn 0.4s var(--ease-bounce) forwards' : 'none'
                  }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-black text-center mb-2">
                  {contact.title}
                </h3>
                <p className="text-gray-600 text-center mb-6 text-sm break-words whitespace-normal truncate-none">
                  {contact.info}
                </p>

                {/* CTA Button */}
                <a
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    contact.featured
                      ? 'bg-[#d90429] text-white hover:bg-[#ef233c]'
                      : 'border-2 border-[#d90429] text-[#d90429] hover:bg-[#d90429] hover:text-white'
                  }`}
                >
                  {contact.cta}
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Hover Glow */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                  contact.featured ? 'shadow-[0_0_30px_rgba(217,4,41,0.3)]' : ''
                }`} />
              </div>
            );
          })}
        </div>

        {/* Organization Info */}
        <div
          className={`mt-16 text-center transition-all duration-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-lg">
            <img
              src="/images/sms-logo.png"
              alt="SMS Logo"
              className="h-10 w-auto"
            />
            <div className="text-left">
              <p className="font-bold text-black">SINERGI MUDA STRATEGIS</p>
              <p className="text-sm text-[#d90429]">Digital Independen — Memperjuangkan Keadilan</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
