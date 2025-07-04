'use client'

import { motion } from 'framer-motion'
import { FaCalendarAlt, FaStar, FaClock, FaGem } from 'react-icons/fa'
import Image from 'next/image'
import ReserveModal from '../global/ReserveModal'
import { useState, useEffect } from 'react'

interface MountainData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [heroImageSrc] = useState('/images/hero/hero-image.webp');
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // Default fallback image in case the hero image doesn't exist
  const fallbackImage = '/assets/images/postcss.config.webp';
  
  useEffect(() => {
    // Set timestamp after component mounts to avoid hydration mismatch
    setTimestamp(Date.now());
  }, []);

  const mountainData: MountainData[] = [
    {
      title: "سالن زیبایی گلستان",
      description: "با بهترین خدمات و متخصصین حرفه‌ای، تجربه‌ای متفاوت از زیبایی را با ما داشته باشید. ما برای زیبایی شما ارزش قائلیم.",
      buttonText: "رزرو نوبت",
      buttonLink: "/appointments"
    },
  ];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Only add timestamp after component has mounted (client-side)
  const imageSrc = imageError 
    ? fallbackImage 
    : timestamp 
      ? `${heroImageSrc}?t=${timestamp}` 
      : heroImageSrc;
  
  const handleImageError = () => {
    console.log('Image failed to load, using fallback');
    setImageError(true);
  };
  
  return (
    <section className="relative overflow-hidden bg-white py-16">
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-20 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30 blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div 
        className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-gradient-to-tr from-pink-200/20 to-blue-200/20 blur-xl"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
      />

      {mountainData.map((mountain, index) => (
        <motion.div 
          key={index} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex flex-col items-center mx-auto lg:flex-row lg:max-w-6xl lg:mt-10"
        >
          <motion.div 
            className="w-full h-64 lg:w-1/2 lg:h-auto overflow-hidden rounded-2xl shadow-2xl"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                className="h-full w-full object-cover" 
                src={imageSrc} 
                alt={mountain.title} 
                width={2000} 
                height={2333} 
                priority
                onError={handleImageError}
              />
            </motion.div>
            
            {/* Floating badge */}
            <motion.div
              className="absolute top-4 right-4 z-20 px-4 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-pink-500/90 to-purple-500/90 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              ٪۲۰ تخفیف ویژه
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="max-w-lg bg-white md:max-w-2xl md:z-10 md:shadow-xl md:absolute md:top-0 lg:w-3/5 lg:left-0 lg:mt-20 xl:ml-12 rounded-xl overflow-hidden"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex flex-col p-8 md:px-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text lg:text-4xl">{mountain.title}</h2>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <p className="mt-4 text-gray-600 leading-relaxed">{mountain.description}</p>
              </motion.div>
              
              <motion.div 
                className="mt-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <motion.button 
                  className="px-6 py-3 text-white font-medium rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaCalendarAlt />
                  <div onClick={openModal}>{mountain.buttonText}</div>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ))}

      <div className='max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-2">ویژگی‌های برجسته ما</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          {[
            { 
              icon: <FaStar className="text-yellow-400 text-xl" />, 
              title: "کیفیت برتر",
              description: "ارائه خدمات با بالاترین کیفیت و استفاده از محصولات درجه یک"
            },
            {
              icon: <FaClock className="text-pink-500 text-xl" />,
              title: "صرفه‌جویی در زمان",
              description: "رزرو آنلاین و مدیریت زمان برای احترام به وقت شما"
            },
            {
              icon: <FaGem className="text-purple-500 text-xl" />,
              title: "تجربه لوکس",
              description: "محیطی آرام و دلنشین برای لذت بردن از خدمات زیبایی"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              className="p-8 text-center bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-pink-100"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">{feature.title}</h3>
              <div className="w-12 h-1 bg-gradient-to-r from-pink-300 to-purple-300 mx-auto mb-4 rounded-full"></div>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
        <ReserveModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </section>
  )
}
