import React, { useState } from 'react'
import Layout from '../../components/layout/Layout'
import HeroSection from './Sections/HeroSection'
import ProductsGrid from './Sections/ProductsGrid'
import FeatureGrid from './Sections/FeatureGrid'
import ReviewSection from '../../components/testimonial/ReviewSection'
import FounderSection from './Sections/FounderSection'
import BengalTilesSection from './Sections/BengalTilesSection'
import BrandPartnerSection from './Sections/BrandPartnerSection'
import ServiceAreaSection from './Sections/ServiceAreaSection'


const reviews = [
  {
    id: 1,
    name: "Nitin Kumar",
    role: "Interior Designer",
    text: "Bengal Tiles has an outstanding collection of vitrified tiles and Italian marble. The showroom experience was remarkable, and their guidance helped us select the perfect slabs for our client's villa.",
    bgColor: "bg-indigo-600"
  },
  {
    id: 2,
    name: "Riya Singh",
    role: "Homeowner",
    text: "We renovated our home flooring with marble and designer wall tiles from Bengal Tiles. The quality is top-notch, pricing was very competitive, and delivery was right on time. Truly the best showroom in West Bengal!",
    bgColor: "bg-pink-600"
  },
  {
    id: 3,
    name: "Payel Mandal",
    role: "Architect",
    text: "From consultation to site delivery, the service was seamless. Wide variety of brand partner tiles like Kajaria and Somany with premium finishes that brought our architectural project to life.",
    bgColor: "bg-teal-600"
  },
  {
    id: 4,
    name: "Subhashis Das",
    role: "Civil Contractor",
    text: "As a builder, finding reliable supply with consistent lot shades is crucial. Bengal Tiles has been our most dependable partner for large granite and vitrified tile orders across West Bengal.",
    bgColor: "bg-amber-600"
  }
];

function Home() {

  return (

    <div>
      <div className='space-y-4  sm:space-y-5  lg:space-y-16 pb-8'>
      <BengalTilesSection />
        <HeroSection />
        <BrandPartnerSection />
        <ProductsGrid />
        <ReviewSection reviews={reviews} />
        <ServiceAreaSection />
        <FounderSection />
      </div>
    </div>
  )
}

export default Home