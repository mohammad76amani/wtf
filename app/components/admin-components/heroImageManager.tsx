'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

const HeroImageManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [selectedHero, setSelectedHero] = useState<File | null>(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  // Load current hero image on component mount
  useEffect(() => {
    // Set the current hero image with timestamp to prevent caching
    setHeroPreview(`/images/hero/hero-image.webp?t=${timestamp}`);
  }, [timestamp]);

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('فایل انتخاب شده باید تصویر باشد');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setHeroPreview(base64String);
      };
      reader.readAsDataURL(file);
      
      // Store selected file
      setSelectedHero(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHero) {
      toast.error('لطفا یک تصویر انتخاب کنید');
      return;
    }
    
    setIsLoading(true);

    try {
      // Upload the hero image
      const heroFormData = new FormData();
      heroFormData.append('file', selectedHero);

      const uploadResponse = await fetch('/api/upload-hero', {
        method: 'POST',
        body: heroFormData,
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'خطا در آپلود تصویر');
      }
      
      // Update timestamp to force image refresh
      setTimestamp(Date.now());
      
      toast.success('تصویر هدر با موفقیت بروزرسانی شد!');
      
      // Reset selected file
      setSelectedHero(null);
    } catch (error) {
      toast.error('خطا در بروزرسانی تصویر هدر');
      console.error('Error updating hero image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">مدیریت تصویر هدر</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Hero Image Preview */}
        {heroPreview && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">تصویر فعلی</h3>
            <div className="relative w-full h-64 border rounded-md overflow-hidden">
              <Image 
                src={heroPreview} 
                alt="تصویر هدر" 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
        )}
        
        {/* Hero Image Upload */}
        <div>
          <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700 mb-1">
            آپلود تصویر جدید هدر *
          </label>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex-1">
              <input
                type="file"
                id="heroImage"
                accept="image/*"
                onChange={handleHeroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">برای بهترین نتیجه، تصویر با نسبت 16:9 آپلود کنید</p>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={isLoading || !selectedHero}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال بروزرسانی...
              </div>
            ) : (
              'بروزرسانی تصویر هدر'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>* فیلدهای ضروری</p>
      </div>
    </div>
  );
};

export default HeroImageManager;
