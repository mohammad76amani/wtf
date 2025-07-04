'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

const GalleryManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(Array(6).fill(null));
  const [imagePreviews, setImagePreviews] = useState<string[]>(Array(6).fill(''));
  const [imageAlts, setImageAlts] = useState<string[]>(Array(6).fill('سالن زیبایی'));
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load current gallery images on component mount
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.galleryImages) {
            setGalleryImages(data.galleryImages);
            
            // Initialize previews with existing images
            const previews = Array(6).fill('');
            const alts = Array(6).fill('سالن زیبایی');
            
            data.galleryImages.forEach((img: GalleryImage, index: number) => {
              if (index < 6) {
                previews[index] = img.src;
                alts[index] = img.alt;
              }
            });
            
            setImagePreviews(previews);
            setImageAlts(alts);
          }
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        toast.error('خطا در بارگیری تصاویر گالری');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
        const newPreviews = [...imagePreviews];
        newPreviews[index] = base64String;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
      
      // Store selected file
      const newSelectedFiles = [...selectedFiles];
      newSelectedFiles[index] = file;
      setSelectedFiles(newSelectedFiles);
    }
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newAlts = [...imageAlts];
    newAlts[index] = e.target.value;
    setImageAlts(newAlts);
  };

  const handleUpload = async (index: number) => {
    if (!selectedFiles[index]) {
      toast.error('لطفا یک تصویر انتخاب کنید');
      return;
    }
    
    setIsLoading(true);

    try {
      // Upload the gallery image
      const formData = new FormData();
      formData.append('file', selectedFiles[index]!);
      formData.append('index', index.toString());
      formData.append('alt', imageAlts[index]);

      const uploadResponse = await fetch('/api/upload-gallery', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'خطا در آپلود تصویر');
      }
      
      toast.success(`تصویر ${index + 1} گالری با موفقیت بروزرسانی شد!`);
      
      // Update the gallery images state
      const newGalleryImages = [...galleryImages];
      const existingIndex = newGalleryImages.findIndex(img => img.id === uploadResult.galleryImage.id);
      
      if (existingIndex >= 0) {
        newGalleryImages[existingIndex] = uploadResult.galleryImage;
      } else {
        newGalleryImages.push(uploadResult.galleryImage);
      }
      
      setGalleryImages(newGalleryImages);
      
      // Reset selected file for this index
      const newSelectedFiles = [...selectedFiles];
      newSelectedFiles[index] = null;
      setSelectedFiles(newSelectedFiles);
    } catch (error) {
      toast.error('خطا در بروزرسانی تصویر گالری');
      console.error('Error updating gallery image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">مدیریت تصاویر گالری</h2>
      
      {isInitialLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(null).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-gray-700">تصویر {index + 1}</h3>
              
              {/* Image Preview */}
              <div className="mb-4">
                <div className="relative w-full h-48 border rounded-md overflow-hidden bg-gray-100">
                  {imagePreviews[index] ? (
                    <Image 
                      src={imagePreviews[index]} 
                      alt={`تصویر ${index + 1}`} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">تصویری انتخاب نشده</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* File Input */}
              <div className="mb-3">
                <label htmlFor={`galleryImage${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  انتخاب تصویر
                </label>
                <input
                  type="file"
                  id={`galleryImage${index}`}
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              {/* Alt Text Input */}
              <div className="mb-4">
                <label htmlFor={`galleryAlt${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  توضیح تصویر
                </label>
                <input
                  type="text"
                  id={`galleryAlt${index}`}
                  value={imageAlts[index]}
                  onChange={(e) => handleAltChange(e, index)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="توضیح تصویر را وارد کنید"
                />
              </div>
              
              {/* Upload Button */}
              <button
                onClick={() => handleUpload(index)}
                disabled={isLoading || !selectedFiles[index]}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'در حال بارگذاری...' : 'بارگذاری تصویر'}
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>برای بهترین نتیجه، تصاویر با نسبت ۴:۳ آپلود کنید</p>
      </div>
    </div>
  );
};

export default GalleryManager;
