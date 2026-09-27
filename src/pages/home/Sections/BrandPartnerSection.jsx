import React from 'react';

// Brand partner logo assets
import brand1 from '../../../assets/brands/brand_1.png';
import brand2 from '../../../assets/brands/brand_2.png';
import brand3 from '../../../assets/brands/brand_3.png';
import brand4 from '../../../assets/brands/brand_4.png';
import brand5 from '../../../assets/brands/brand_5.png';
import brand6 from '../../../assets/brands/brand_6.png';
import brand7 from '../../../assets/brands/brand_7.png';
import brand8 from '../../../assets/brands/brand_8.png';
import brand9 from '../../../assets/brands/brand_9.png';
import brand10 from '../../../assets/brands/brand_10.png';
import brand11 from '../../../assets/brands/brand_11.png';
import brand12 from '../../../assets/brands/brand_12.png';
import brand13 from '../../../assets/brands/brand_13.png';
import brand14 from '../../../assets/brands/brand_14.png';
import brand15 from '../../../assets/brands/brand_15.png';
import brand16 from '../../../assets/brands/brand_16.png';

const BRANDS = [
  { id: 1, name: 'Kajaria', img: brand1 },
  { id: 2, name: 'Johnson Tiles', img: brand2 },
  { id: 3, name: 'Italica', img: brand3 },
  { id: 4, name: 'Hindware', img: brand4 },
  { id: 5, name: 'Emcer', img: brand5 },
  { id: 6, name: 'AGL', img: brand6 },
  { id: 7, name: 'Admin Vitrified', img: brand7 },
  { id: 8, name: 'LV International', img: brand8 },
  { id: 9, name: 'Hollis Vitrified', img: brand9 },
  { id: 10, name: 'Rey Cera', img: brand10 },
  { id: 11, name: 'Brand Partner 11', img: brand11 },
  { id: 12, name: 'Brand Partner 12', img: brand12 },
  { id: 13, name: 'Brand Partner 13', img: brand13 },
  { id: 14, name: 'Brand Partner 14', img: brand14 },
  { id: 15, name: 'Brand Partner 15', img: brand15 },
  { id: 16, name: 'Brand Partner 16', img: brand16 },
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
