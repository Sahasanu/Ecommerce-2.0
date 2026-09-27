import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import founderDefaultImg from '../../../assets/founder.jpg';

export default function FounderSection() {
  const { config } = useSiteConfig();
  const companyName = config?.companyName || "Bengal Tiles";
  const founderName = config?.founderName || "SK Abdul Ohid";
  const imglink = "https://firebasestorage.googleapis.com/v0/b/bengal-tiles---website.firebasestorage.app/o/company%2Fbengal_tiles_owner_1.jpeg?alt=media&token=e9760f80-9e5c-4462-8d95-78181928e15d";
  const founderPhoto = config?.founderPhoto || imglink || founderDefaultImg;

  return (
    <section className="max-w-5xl mx-auto px-1 sm:px-2 lg:px-8 py-3 sm:py-6">
      <div className="relative overflow-hidden rounded-3xl bg-bg-surface border border-border-base shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 p-6 sm:p-10 lg:p-12 transition-all duration-300">
        
        {/* Soft Ambient Background Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Elegant Founder Portrait */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group/portrait w-full max-w-[280px] sm:max-w-[320px] md:max-w-none">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-primary/20 bg-bg-base/50">
                <img
                  src={founderPhoto}
                  alt={founderName}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/portrait:scale-105"
                  loading="lazy"
                />
              </div>
              {/* Subtle Ambient Frame Glow on Hover */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20 pointer-events-none transition-all duration-300 group-hover/portrait:ring-primary/40" />
            </div>
          </div>

          {/* Typography & Refined Minimal CTA */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-4 text-center md:text-left">
            
            {/* Eyebrow Accent */}
            {/* <div className="inline-flex items-center justify-center md:justify-start gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              <span className="w-5 h-[1.5px] bg-primary/60 rounded-full" />
              <span>Leadership & Vision</span>
            </div> */}

            {/* Founder Name & Title */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-base tracking-tight font-h1 leading-tight">
                {founderName}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-primary/90">
                Founder, {companyName}
              </p>
            </div>

            {/* Concise Vision Statement */}
            <p className="text-sm sm:text-base text-text-muted leading-relaxed font-normal max-w-lg mx-auto md:mx-0">
              "Great spaces are built around people, uncompromising quality, and relationships anchored in long-term trust."
            </p>

            {/* Refined Minimal CTA with Smooth Arrow Slide */}
            <div className="pt-2 flex justify-center md:justify-start">
              <Link
                to="/founder"
                className="group/cta inline-flex items-center gap-3 text-xs sm:text-sm font-bold text-text-base hover:text-primary transition-colors duration-300 cursor-pointer"
              >
                <span className="relative pb-0.5">
                  Meet Our Founder
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/cta:w-full" />
                </span>
                <span className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover/cta:bg-primary group-hover/cta:text-compli group-hover/cta:border-primary group-hover/cta:translate-x-1.5 transition-all duration-300 shadow-2xs">
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
