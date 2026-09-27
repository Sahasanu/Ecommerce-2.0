import React from 'react';

// Brand partner logo assets (new uploads)
import brand1 from '../../../assets/brands/brand (1).jpg';
import brand2 from '../../../assets/brands/brand (2).jpg';
import brand3 from '../../../assets/brands/brand (3).jpg';
import brand4 from '../../../assets/brands/brand (4).jpg';
import brand5 from '../../../assets/brands/brand (5).jpg';
import brand6 from '../../../assets/brands/brand (6).jpg';
import brand7 from '../../../assets/brands/brand (7).jpg';
import brand8 from '../../../assets/brands/brand (8).jpg';
import brand9 from '../../../assets/brands/brand (9).jpg';
import brand10 from '../../../assets/brands/brand (10).jpg';
import brand11 from '../../../assets/brands/brand (11).jpg';
import brand12 from '../../../assets/brands/brand (12).jpg';
import brand13 from '../../../assets/brands/brand (13).jpg';
import brand14 from '../../../assets/brands/brand (14).jpg';
import brand15 from '../../../assets/brands/brand (15).jpg';
import brand16 from '../../../assets/brands/brand (16).jpg';
import brand17 from '../../../assets/brands/brand (17).jpg';
import brand18 from '../../../assets/brands/brand (18).jpg';
import brand19 from '../../../assets/brands/brand (19).jpg';
import brand20 from '../../../assets/brands/brand (20).jpg';

const BRANDS = [
  { id: 1, name: 'Brand Partner 1', img: brand1 },
  { id: 2, name: 'Brand Partner 2', img: brand2 },
  { id: 3, name: 'Brand Partner 3', img: brand3 },
  { id: 4, name: 'Brand Partner 4', img: brand4 },
  { id: 5, name: 'Brand Partner 5', img: brand5 },
  { id: 6, name: 'Brand Partner 6', img: brand6 },
  { id: 7, name: 'Brand Partner 7', img: brand7 },
  { id: 8, name: 'Brand Partner 8', img: brand8 },
  { id: 9, name: 'Brand Partner 9', img: brand9 },
  { id: 10, name: 'Brand Partner 10', img: brand10 },
  { id: 11, name: 'Brand Partner 11', img: brand11 },
  { id: 12, name: 'Brand Partner 12', img: brand12 },
  { id: 13, name: 'Brand Partner 13', img: brand13 },
  { id: 14, name: 'Brand Partner 14', img: brand14 },
  { id: 15, name: 'Brand Partner 15', img: brand15 },
  { id: 16, name: 'Brand Partner 16', img: brand16 },
  { id: 17, name: 'Brand Partner 17', img: brand17 },
  { id: 18, name: 'Brand Partner 18', img: brand18 },
  { id: 19, name: 'Brand Partner 19', img: brand19 },
  { id: 20, name: 'Brand Partner 20', img: brand20 },
];

/**
 * BrandPartnerSection
 * Infinite scrolling marquee showcasing authorized brand partners and dealers.
 */
export default function BrandPartnerSection() {
  // Double list for seamless continuous infinite marquee scroll
  const marqueeList = [...BRANDS, ...BRANDS];

  return (
    <section className="w-full py-4 sm:py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-5 sm:mb-8">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-text-base tracking-tight">
            Brand Partner and Dealer
          </h2>
          <div className="w-12 h-1 bg-primary/70 rounded-full mx-auto mt-2" />
        </div>

        {/* Marquee Wrapper with soft edge fades */}
        <div className="relative w-full overflow-hidden group">
          
          {/* Subtle Left and Right Vignette Fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-bg-base via-bg-base/60 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-bg-base via-bg-base/60 to-transparent z-10" />

          {/* Marquee Track */}
          <div className="flex w-max animate-brand-marquee group-hover:[animation-play-state:paused] py-2 gap-3 sm:gap-4 select-none">
            {marqueeList.map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="w-[130px] sm:w-[160px] md:w-[175px] h-[72px] sm:h-[84px] md:h-[90px] rounded-xl sm:rounded-2xl bg-bg-surface border border-border-base/70 shadow-2xs hover:shadow-md transition-all duration-300 flex items-center justify-center p-3 sm:p-4 shrink-0 hover:scale-105"
              >
                <img
                  src={brand.img}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain filter contrast-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
