'use client'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import Image from "next/image";
import fallbackImage from '@/public/vercel.svg';

// Import fallback image for when gallery images aren't loaded

// Define the gallery image type
interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch gallery images from the database
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.galleryImages && data.galleryImages.length > 0) {
            setGalleryImages(data.galleryImages);
          } else {
            // If no images in database, use fallback images
            setGalleryImages(Array(6).fill(null).map((_, index) => ({
              id: `fallback-${index}`,
              src: fallbackImage.src,
              alt: `سالن زیبایی ${index + 1}`
            })));
          }
        } else {
          // If API call fails, use fallback images
          setGalleryImages(Array(6).fill(null).map((_, index) => ({
            id: `fallback-${index}`,
            src: fallbackImage.src,
            alt: `سالن زیبایی ${index + 1}`
          })));
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        // If error, use fallback images
        setGalleryImages(Array(6).fill(null).map((_, index) => ({
          id: `fallback-${index}`,
          src: fallbackImage.src,
          alt: `سالن زیبایی ${index + 1}`
        })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  return (
    <section id="gallery" className="py-10">
      <div className="container mx-auto px-0 md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-4">
            گالری تصاویر سالن
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نمونه‌ای از کارهای انجام شده در سالن زیبایی ما را مشاهده کنید
          </p>
        </motion.div>

        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-3">
            {Array(6).fill(null).map((_, index) => (
              <div key={`skeleton-${index}`} className="h-[300px] bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          // Gallery grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-3">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative h-[300px] md:h-[300px] overflow-hidden rounded-xl shadow-lg"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
