'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

 const AddSalonData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    salonName: '',
    salonAddress: '',
    salonPhoneNumber: [''],
    salonLocation: '',
    salonDescription: '',
    salonLogo: '',
    salonWorkingHours: {
      start: '09:00',
      end: '21:00',
    },
    salonInstagram: '',
    salonTelegram: '',
    salonWhatsapp: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleWorkingHoursChange = (type: 'start' | 'end', field: 'hour' | 'minute', value: string) => {
    // Convert to number and validate
    let numValue = parseInt(value);
    
    // Validate hour (0-23)
    if (field === 'hour') {
      if (isNaN(numValue) || numValue < 0) numValue = 0;
      if (numValue > 23) numValue = 23;
      
      // Format with leading zero if needed
      const formattedHour = numValue.toString().padStart(2, '0');
      const currentMinutes = formData.salonWorkingHours[type].split(':')[1];
      
      setFormData({
        ...formData,
        salonWorkingHours: {
          ...formData.salonWorkingHours,
          [type]: `${formattedHour}:${currentMinutes}`
        }
      });
    } 
    // Validate minute (0-59)
    else if (field === 'minute') {
      if (isNaN(numValue) || numValue < 0) numValue = 0;
      if (numValue > 59) numValue = 59;
      
      // Format with leading zero if needed
      const formattedMinute = numValue.toString().padStart(2, '0');
      const currentHours = formData.salonWorkingHours[type].split(':')[0];
      
      setFormData({
        ...formData,
        salonWorkingHours: {
          ...formData.salonWorkingHours,
          [type]: `${currentHours}:${formattedMinute}`
        }
      });
    }
  };

  const handlePhoneNumberChange = (index: number, value: string) => {
    const updatedPhoneNumbers = [...formData.salonPhoneNumber];
    updatedPhoneNumbers[index] = value;
    setFormData({
      ...formData,
      salonPhoneNumber: updatedPhoneNumbers,
    });
  };

  const addPhoneNumberField = () => {
    setFormData({
      ...formData,
      salonPhoneNumber: [...formData.salonPhoneNumber, ''],
    });
  };

  const removePhoneNumberField = (index: number) => {
    if (formData.salonPhoneNumber.length > 1) {
      const updatedPhoneNumbers = formData.salonPhoneNumber.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        salonPhoneNumber: updatedPhoneNumbers,
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setFormData({
          ...formData,
          salonLogo: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let logoPath = formData.salonLogo;

      // Upload the logo if a new one was selected
      if (selectedLogo) {
        const logoFormData = new FormData();
        logoFormData.append('file', selectedLogo);

        const uploadResponse = await fetch('/api/upload-logo', {
          method: 'POST',
          body: logoFormData,
        });

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(uploadResult.error || 'Error uploading logo');
        }
        
        logoPath = uploadResult.filePath;
      }

      // Update the form data with the logo path
      const updatedFormData = {
        ...formData,
        salonLogo: logoPath,
      };

      // Save to database
      const response = await fetch('/api/salonData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('اطلاعات سالن با موفقیت ثبت شد!');
        // Reset form after successful submission
        setFormData({
          salonName: '',
          salonAddress: '',
          salonPhoneNumber: [''],
          salonLocation: '',
          salonDescription: '',
          salonLogo: '',
          salonWorkingHours: {
            start: '09:00',
            end: '21:00',
          },
          salonInstagram: '',
          salonTelegram: '',
          salonWhatsapp: '',
        });
        setLogoPreview(null);
        setSelectedLogo(null);
      } else {
        toast.error(data.message || 'خطا در ثبت اطلاعات سالن');
      }
    } catch (error) {
      toast.error('خطا در ارسال فرم');
      console.error('Error submitting salon data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">ثبت اطلاعات سالن</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salon Name */}
          <div>
            <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 mb-1">
              نام سالن *
            </label>
            <input
              type="text"
              id="salonName"
              name="salonName"
              value={formData.salonName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="نام سالن را وارد کنید"
            />
          </div>

          {/* Salon Address */}
          <div>
            <label htmlFor="salonAddress" className="block text-sm font-medium text-gray-700 mb-1">
              آدرس *
            </label>
            <input
              type="text"
              id="salonAddress"
              name="salonAddress"
              value={formData.salonAddress}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="آدرس سالن را وارد کنید"
            />
          </div>

          {/* Salon Location (Google Maps URL) */}
          <div>
            <label htmlFor="salonLocation" className="block text-sm font-medium text-gray-700 mb-1">
              لینک گوگل مپ *
            </label>
            <input
              type="url"
              id="salonLocation"
              name="salonLocation"
              value={formData.salonLocation}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://maps.google.com/..."
              dir="ltr"
            />
          </div>

          {/* Working Hours - Modified to use number inputs for 24-hour format */}
          <div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">از ساعت</p>
                <div className="flex items-center">
                   <input
                    type="phone"
                    min="0"
                    max="59"
                    value={parseInt(formData.salonWorkingHours.start.split(':')[1])}
                    onChange={(e) => handleWorkingHoursChange('start', 'minute', e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="دقیقه"
                  />
                  <span className="mx-0.5">:</span>
                  <input
                    type="phone"
                    min="0"
                    max="23"
                    value={parseInt(formData.salonWorkingHours.start.split(':')[0])}
                    onChange={(e) => handleWorkingHoursChange('start', 'hour', e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="ساعت"
                  />
                
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">تا ساعت</p>
                <div className="flex items-center">
                <input
                    type="phone"
                    min="0"
                    max="59"
                    value={parseInt(formData.salonWorkingHours.end.split(':')[1])}
                    onChange={(e) => handleWorkingHoursChange('end', 'minute', e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="دقیقه"
                  />
                  <span className="mx-0.5">:</span>
                  <input
                    type="phone"
                    min="0"
                    max="23"
                    value={parseInt(formData.salonWorkingHours.end.split(':')[0])}
                    onChange={(e) => handleWorkingHoursChange('end', 'hour', e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="ساعت"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Numbers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            شماره تلفن *
          </label>
          {formData.salonPhoneNumber.map((phone, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="شماره تلفن را وارد کنید"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => removePhoneNumberField(index)}
                className="mr-2 p-2 text-red-500 hover:text-red-700"
                disabled={formData.salonPhoneNumber.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPhoneNumberField}
            className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            افزودن شماره تلفن دیگر
          </button>
        </div>

        {/* Salon Description */}
        <div>
          <label htmlFor="salonDescription" className="block text-sm font-medium text-gray-700 mb-1">
            توضیحات
          </label>
          <textarea
            id="salonDescription"
            name="salonDescription"
            value={formData.salonDescription}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="توضیحات سالن را وارد کنید"
            ></textarea>
          </div>
  
          {/* Salon Logo */}
          <div>
            <label htmlFor="salonLogo" className="block text-sm font-medium text-gray-700 mb-1">
              لوگوی سالن *
            </label>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex-1">
                <input
                  type="file"
                  id="salonLogo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">برای بهترین نتیجه، تصویر مربعی آپلود کنید</p>
              </div>
              {logoPreview && (
                <div className="w-20 h-20 relative border rounded-md overflow-hidden">
                  <Image 
                    src={logoPreview} 
                    alt="پیش‌نمایش لوگو" 
                    fill 
                    className="object-cover" 
                  />
                </div>
              )}
            </div>
          </div>
  
          {/* Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram */}
            <div>
              <label htmlFor="salonInstagram" className="block text-sm font-medium text-gray-700 mb-1">
                اینستاگرام *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                  @
                </span>
                <input
                  type="text"
                  id="salonInstagram"
                  name="salonInstagram"
                  value={formData.salonInstagram}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="نام کاربری اینستاگرام"
                  dir="ltr"
                />
              </div>
            </div>
  
            {/* Telegram */}
            <div>
              <label htmlFor="salonTelegram" className="block text-sm font-medium text-gray-700 mb-1">
                تلگرام
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                  @
                </span>
                <input
                  type="text"
                  id="salonTelegram"
                  name="salonTelegram"
                  value={formData.salonTelegram}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="نام کاربری تلگرام"
                  dir="ltr"
                />
              </div>
            </div>
  
            {/* WhatsApp */}
            <div>
              <label htmlFor="salonWhatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                واتساپ
              </label>
              <input
                type="text"
                id="salonWhatsapp"
                name="salonWhatsapp"
                value={formData.salonWhatsapp}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="شماره واتساپ (مثال: 09123456789)"
                dir="ltr"
              />
            </div>
          </div>
  
          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ذخیره...
                </div>
              ) : (
                'ذخیره اطلاعات سالن'
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
  
  export default AddSalonData;
  
