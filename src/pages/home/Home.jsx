import React, { useState } from 'react'
import Layout from '../../components/layout/Layout'
import HeroSection from './Sections/HeroSection'
import ProductsGrid from './Sections/ProductsGrid'
import FeatureGrid from './Sections/FeatureGrid'
import ReviewSection from '../../components/testimonial/ReviewSection'
import FounderSection from './Sections/FounderSection'


const reviews = [
  {
    id: 1,
    name: "Nitin Kumar",
    role: "Art Enthusiast",
    img: "https://firebasestorage.googleapis.com/v0/b/e-commerce-d6aae.appspot.com/o/Reviews%2Freview1.jpeg?alt=media&token=3d88aabe-c582-4058-92e2-ee2b86ffa8a6",
    text: "I ordered a custom handmade portrait drawing from this website, and I was blown away by the artistry and attention to detail. The portrait perfectly captured the essence of the subject, and the quality exceeded my expectations. I highly recommend these talented artists!",
    bgColor: "bg-indigo-600"
  },
  {
    id: 2,
    name: "Riya Singh",
    role: "Freelancer",
    img: "https://firebasestorage.googleapis.com/v0/b/e-commerce-d6aae.appspot.com/o/Reviews%2Freview%202.jpg?alt=media&token=36b984d2-a643-45b3-baf4-26e568132e6c",
    text: "I wanted to surprise my spouse with a special gift, and this website delivered beyond my imagination. The handmade portrait drawing conveyed the love and sentiment in every stroke. It's a heartfelt creation that brought tears of joy. Thank you for making the occasion truly memorable!",
    bgColor: "bg-pink-600"
  },
  {
    id: 3,
    name: "Payel Mandal",
    role: "Professor",
    img: "https://firebasestorage.googleapis.com/v0/b/e-commerce-d6aae.appspot.com/o/Reviews%2Freview%203.jpg?alt=media&token=f9cb6261-b9d1-4944-bf08-394f8161b598",
    text: "From start to finish, the experience with this website was exceptional. The customer service was prompt and friendly, and the final portrait exceeded all expectations. The attention to detail, color accuracy, and overall quality make this platform stand out. I'm a delighted customer and will be ordering again!",
    bgColor: "bg-teal-600"
  }
];

function Home() {

  return (

    <div className='space-y-4  sm:space-y-5  lg:space-y-16 pb-8'>
      <HeroSection />
      <ProductsGrid />
      <FounderSection />
      {/* <FeatureGrid />
      <ReviewSection reviews={reviews} /> */}
    </div>
  )
}

export default Home