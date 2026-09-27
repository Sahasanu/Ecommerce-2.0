import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import showroomImg from '../../../assets/showroom.jpg';
import showroomMImg from '../../../assets/showroomM.png';

/**
 * BengalTilesSection
 * Showcase banner for Bengal Tiles showroom & dealership with direct WhatsApp CTA.
 */
export default function BengalTilesSection() {
  const { config } = useSiteConfig();

  const title = config?.companyName || "Bengal Tiles";
  const subtitle = "The Premium Tiles, Marble, Granite Showroom & Dealer in West Bengal";

  // Resolve WhatsApp URL from site config or default contact
  const getWhatsAppUrl = () => {
    // 1. Configured WhatsApp social link
    const waSocial = config?.socialLinks?.find(
      (s) => s.platform === "whatsapp" && s.isActive && s.url
    );
    if (waSocial?.url) {
      const u = waSocial.url.trim();
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      const digits = u.replace(/\D/g, "");
      if (digits) {
        return `https://wa.me/${digits}?text=${encodeURIComponent(
          `Hi ${title}, I would like to inquire about your tiles, marble, and granite collection.`
        )}`;
      }
    }

    // 2. Configured phone numbers with WhatsApp enabled
    const waPhone =
      config?.phones?.find((p) => p.isWhatsapp && p.number) ||
      config?.phones?.[0];

    if (waPhone?.number) {
      const digits = waPhone.number.replace(/\D/g, "");
      if (digits.length >= 10) {
        const fullNumber = digits.length === 10 ? `91${digits}` : digits;
        return `https://wa.me/${fullNumber}?text=${encodeURIComponent(
          `Hi ${title}, I would like to inquire about your tiles, marble, and granite collection.`
        )}`;
      }
    }

    // 3. Verified store WhatsApp fallback
    return `https://wa.me/919564140786?text=${encodeURIComponent(
      `Hi ${title}, I would like to inquire about your tiles, marble, and granite collection.`
    )}`;
  };

  const whatsappUrl = getWhatsAppUrl();

  return (
    <section className="relative w-auto -mx-4 sm:-mx-4 md:-mx-6 lg:-mx-10 xl:-mx-20 overflow-hidden rounded-none border-y border-border-base/15 shadow-xl group">
      {/* Background Image Container */}
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] lg:h-[580px] xl:h-[640px] overflow-hidden">
        <picture className="absolute inset-0 w-full h-full">
          <source media="(max-width: 767px)" srcSet={showroomMImg} />
          <img
            src={showroomImg}
            alt={title}
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </picture>

        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10 pointer-events-none" />

        {/* Content Centered at Bottom Half */}
        <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-4 sm:px-8 pb-10 sm:pb-14 lg:pb-16 z-10">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            
            {/* Main Title */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {title}
            </h2>

            {/* Tagline / Subtitle */}
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-2">
              {subtitle}
            </p>

            {/* Primary CTA redirecting to WhatsApp */}
            <div className="pt-2 sm:pt-4 flex justify-center items-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 bg-primary hover:bg-primary-hover text-compli font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-black/40 hover:shadow-black/60 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <FaWhatsapp className="text-lg sm:text-xl text-white" />
                <span>Contact us</span>
              </a>
            </div>

          </div>
        </div>

       

      </div>
    </section>
  );
}
