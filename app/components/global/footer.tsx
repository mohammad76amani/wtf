'use client'

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSpa, FaInstagram, FaTelegram, FaWhatsapp, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

// Define the type for salon data
interface SalonDataType {
  salonName: string;
  salonAddress: string;
  salonPhoneNumber: string[];
  salonLocation: string;
  salonDescription?: string;
  salonLogo: string;
  salonWorkingHours: {
    start: string;
    end: string;
  };
  salonInstagram: string;
  salonTelegram?: string;
  salonWhatsapp?: string;
}

export const Footer = () => {
  const [salonData, setSalonData] = useState<SalonDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const response = await fetch('/api/salonData');
        if (!response.ok) {
          throw new Error('Failed to fetch salon data');
        }
        const data = await response.json();
        setSalonData(data);
      } catch (err) {
        console.error('Error fetching salon data:', err);
        setError('Could not load salon information');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, []);

  if (loading) {
    return <footer className="mt-12 mx-4 md:mx-8 lg:mx-12 mb-4 rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-slate-100/70 backdrop-blur-sm shadow-2xl p-8 text-center">
        <p>Loading salon information...</p>
      </div>
    </footer>;
  }

  if (error || !salonData) {
    return <footer className="mt-12 mx-4 md:mx-8 lg:mx-12 mb-4 rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-slate-100/70 backdrop-blur-sm shadow-2xl p-8 text-center">
        <p>گلستان</p>
      </div>
    </footer>;
  }

  return (
    <footer className="mt-12 mx-4 md:mx-8 lg:mx-12 mb-4 rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-slate-100/70 backdrop-blur-sm shadow-2xl">
        <div className="container mx-auto px-3 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            {/* Logo and About */}
            <div className="flex flex-col items-center md:items-start">
              <motion.div 
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FaSpa className="text-2xl text-transparent bg-gradient-primary bg-clip-text" />
                <span className="text-3xl font-bold text-primary-500">{salonData.salonName}</span>
              </motion.div>
              <p className="text-gray-600 text-center md:text-right max-w-xs">
                {salonData.salonDescription || 'مرکز تخصصی زیبایی و آرایش با بهترین خدمات و متخصصین حرفه‌ای'}
              </p>
            </div>
            
            {/* Contact Information */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-bold mb-3 text-primary-700">تماس با ما</h3>
              <ul className="space-y-2">
                {salonData.salonPhoneNumber.map((phone, index) => (
                  <li key={index} className="flex items-center justify-center md:justify-end">
                    <span className="text-gray-600">{phone}</span>
                    <FaPhone className="mr-2 ml-2 text-primary-500" />
                  </li>
                ))}
              
                <li>
                  <a 
                    href={salonData.salonLocation} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center md:justify-end text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    <span>مشاهده روی نقشه</span>
                    <FaMapMarkerAlt className="mr-2 ml-2" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-bold mb-3 text-primary-700">ما را دنبال کنید</h3>
              <div className="flex space-x-3 space-x-reverse justify-center md:justify-end">
                {salonData.salonInstagram && (
                  <motion.a
                    href={salonData.salonInstagram}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-black hover:shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaInstagram />
                  </motion.a>
                )}
                
                {salonData.salonTelegram && (
                  <motion.a
                    href={salonData.salonTelegram}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-black hover:shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTelegram />
                  </motion.a>
                )}
                
                {salonData.salonWhatsapp && (
                  <motion.a
                    href={salonData.salonWhatsapp}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-black hover:shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaWhatsapp />
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
