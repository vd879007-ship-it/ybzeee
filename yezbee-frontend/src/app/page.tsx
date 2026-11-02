'use client'

import { motion } from 'framer-motion'
import Hero from '@/components/home/Hero'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import FeaturedCollections from '@/components/home/FeaturedCollections'
import NewArrivals from '@/components/home/NewArrivals'
import FlashSale from '@/components/home/FlashSale'
import TrendingSection from '@/components/home/TrendingSection'
import BestSellers from '@/components/home/BestSellers'
import BrandStory from '@/components/home/BrandStory'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import InstagramFeed from '@/components/home/InstagramFeed'
import TrustBadges from '@/components/home/TrustBadges'

const fadeIn = {
  initial: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <motion.div {...fadeIn}>
        <NewArrivals />
      </motion.div>
      <motion.div {...fadeIn}>
        <FeaturedCollections />
      </motion.div>
      <motion.div {...fadeIn}>
        <FlashSale />
      </motion.div>
      <motion.div {...fadeIn}>
        <TrendingSection />
      </motion.div>
      <motion.div {...fadeIn}>
        <BestSellers />
      </motion.div>
      <motion.div {...fadeIn}>
        <BrandStory />
      </motion.div>
      <motion.div {...fadeIn}>
        <WhyChooseUs />
      </motion.div>
      <motion.div {...fadeIn}>
        <InstagramFeed />
      </motion.div>
      <TrustBadges />
    </>
  )
}
