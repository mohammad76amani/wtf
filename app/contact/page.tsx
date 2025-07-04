"use client";
import React, { useEffect, useState } from 'react';
import { FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

const ContactUs = () => {
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
    return (
      <div className="relative overflow-hidden bg-white py-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading contact information...</p>
        </div>
      </div>
    );
  }

  if (error || !salonData) {
    return (
      <div className="relative overflow-hidden bg-white py-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Could not load contact information. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white py-16">
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

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-2">تماس با ما</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600">ما منتظر شنیدن از شما هستیم</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-10">
          {/* Contact Information */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg border border-pink-100"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-6">اطلاعات تماس</h2>
                <p className="text-gray-600 mb-8">
                  ما خوشحال می‌شویم از شما بشنویم! برای هرگونه سوال درباره خدمات، قیمت‌ها یا هر چیز دیگری، تیم ما آماده پاسخگویی به تمام سوالات شماست.
                </p>
              </div>
              
              <div className="space-y-8 mt-auto">
                {/* Phone Numbers */}
                {salonData.salonPhoneNumber.map((phone, index) => (
                  <div key={index} className="flex items-start transform hover:scale-105 transition-transform duration-300 p-4 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50">
                    <div className="bg-gradient-to-br from-pink-200 to-purple-200 p-4 rounded-2xl shadow-lg ml-4 transform hover:rotate-0 transition-all duration-300">
                      <FaPhone className="text-pink-600 text-2xl" />
                    </div>
                    <div className="text-right">
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">تلفن</h3>
                      <p className="text-gray-600 hover:text-pink-600 transition-colors duration-300">{phone}</p>
                    </div>
                  </div>
                ))}
                
                {/* Address */}
                <div className="flex items-start transform hover:scale-105 transition-transform duration-300 p-4 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50">
                  <div className="bg-gradient-to-br from-pink-200 to-purple-200 p-4 rounded-2xl shadow-lg ml-4 transform hover:rotate-0 transition-all duration-300">
                    <FaMapMarkerAlt className="text-pink-600 text-2xl" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">آدرس</h3>
                    <p className="text-gray-600 hover:text-pink-600 transition-colors duration-300">{salonData.salonAddress}</p>
                  </div>
                </div>
                
                {/* Working Hours */}
                <div className="flex items-start transform hover:scale-105 transition-transform duration-300 p-4 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50">
                <div className="bg-gradient-to-br from-pink-200 to-purple-200 p-4 rounded-2xl shadow-lg ml-4 transform hover:rotate-0 transition-all duration-300">
                    <FaClock className="text-pink-600 text-2xl" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">ساعات کاری</h3>
                    <p className="text-gray-600 hover:text-pink-600 transition-colors duration-300">
                      {salonData.salonWorkingHours.start} تا {salonData.salonWorkingHours.end}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
       {/* Map Section */}
<motion.div 
  className="mt-16"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: 0.6 }}
>
  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-6 text-center">موقعیت ما</h2>
  <div className="h-96 bg-gray-200 rounded-xl overflow-hidden shadow-lg">
    {/* Convert the regular URL to an embed URL */}
    <iframe 
      src={salonData.salonLocation.includes('maps/embed') 
        ? salonData.salonLocation 
        : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.9661341165196!2d51.416972!3d35.591878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f91feb20c97f037%3A0xbd4b7355445eab7e!2sHaft-e-Tir%20Hospital!5e0!3m2!1sen!2s!4v1650826381244!5m2!1sen!2s`}
      width="100%" 
      height="100%" 
      style={{ border: 0 }} 
      allowFullScreen 
      loading="lazy"
      title={`موقعیت سالن زیبایی ${salonData.salonName}`}
    ></iframe>
  </div>
</motion.div>

      </div>
    </div>
  );
};

export default ContactUs;
