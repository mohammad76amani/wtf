'use client';

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Tab } from '@headlessui/react';
import { Dialog, Transition } from '@headlessui/react';
import DatePicker from '@hassanmojab/react-modern-calendar-datepicker';
import '@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css';
import moment from 'moment-jalaali';

// Add these interfaces for time slots and reservations
interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

interface Reservation {
  _id: string;
  service: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    category: {
      _id: string;
      name: string;
    }
  } | string;
  date: string;
  status: string;
  notes: string;
  guestInfo?: {
    name: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}


interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  category: {
    _id: string;
    name: string;
  };
  
  available: boolean;
}

interface ReservationRequest {
  service: string;
  date: string;
  notes: string;
  guestName?: string;
  guestPhoneNumber?: string;
}


interface Category {
  _id: string;
  name: string;
  services: Service[];
}

interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

const ReservationPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<JalaliDate | null>(null);
  
  // Time slots state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Add state for existing reservations
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    notes: '',
    guestName: '',
    guestPhoneNumber: '',
  });

  // Fetch reservations for the selected date
  const fetchReservationsForDate = async (date: string) => {
    if (!date) return;
    
    try {
      const response = await fetch(`/api/reserve`);
      if (!response.ok) {
        throw new Error('دریافت رزروها با خطا مواجه شد');
      }
      
      const data = await response.json();
      
      // Filter reservations for the selected date
      const selectedDateStr = date.split('T')[0];
      
      const filteredReservations = data.reservations.filter((reservation: Reservation) => {
        const reservationDate = new Date(reservation.date);
        const reservationDateStr = reservationDate.toISOString().split('T')[0];
        return reservationDateStr === selectedDateStr;
      });
      
      console.log("Filtered reservations for date:", filteredReservations);
      setExistingReservations(filteredReservations);
    } catch (error) {
      console.error('خطا در دریافت رزروها:', error);
    }
  };
  // Wrap isTimeSlotOverlapping with useCallback
const isTimeSlotOverlapping = useCallback((timeString: string, duration: number): boolean => {
  if (!formData.date || !existingReservations.length || !selectedService) return false;
  
  // Parse the time string to get hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a date object for the slot start time
  const slotStart = new Date(formData.date);
  slotStart.setHours(hours, minutes, 0, 0);
  
  // Create a date object for the slot end time
  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + duration);
  
  // Check if this slot overlaps with any existing reservation FOR THE SAME SERVICE
  for (const reservation of existingReservations) {
    // Skip reservations for different services
    if (typeof reservation.service === 'object' && 
        reservation.service !== null && 
        reservation.service._id !== selectedService._id) {
      continue;
    }
    
    // Get the reservation date
    const reservationDate = new Date(reservation.date);
    
    // Get the reservation service duration
    let reservationDuration = 30; // Default duration if not available
    
    if (typeof reservation.service === 'object' && reservation.service !== null) {
      reservationDuration = reservation.service.duration;
    }
    
    // Calculate reservation end time
    const reservationEnd = new Date(reservationDate);
    reservationEnd.setMinutes(reservationEnd.getMinutes() + reservationDuration);
    
    // Check for overlap
    const hasOverlap = (
      (slotStart < reservationEnd && slotStart >= reservationDate) ||
      (slotEnd > reservationDate && slotEnd <= reservationEnd) ||
      (slotStart <= reservationDate && slotEnd >= reservationEnd)
    );
    
    if (hasOverlap) {
      return true;
    }
  }
  
  return false;
}, [formData.date, existingReservations, selectedService]);

  // Generate time slots based on service duration and check availability
  const generateTimeSlots = useCallback((serviceDuration: number = 30) => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9:00 AM
    const endHour = 20; // 8:00 PM
    
    // Generate slots from start to end time
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += serviceDuration) {
        // Skip if we would exceed the end hour
        if (hour === endHour - 1 && minute + serviceDuration > 60) {
          continue;
        }
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this time slot overlaps with any existing reservation
        const isAvailable = !isTimeSlotOverlapping(timeString, serviceDuration);
        
        slots.push({
          value: timeString,
          label: timeString,
          available: isAvailable
        });
      }
    }
    
    return slots;
  }, [isTimeSlotOverlapping]); 
  
  // Check if a time slot overlaps with existing reservations
 // Update the isTimeSlotOverlapping function to only check reservations for the current service


  // Fetch services and organize them by category
  const getServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/serv');
      if (!response.ok) {
        throw new Error('دریافت سرویس‌ها با خطا مواجه شد');
      }
      
      const data = await response.json();
      
      // Group services by category
      const servicesByCategory: Record<string, Service[]> = {};
      data.forEach((service: Service) => {
        if (service.category && service.available) {
          const categoryId = service.category._id;
          if (!servicesByCategory[categoryId]) {
            servicesByCategory[categoryId] = [];
          }
          servicesByCategory[categoryId].push(service);
        }
      });
      
      // Create categories array
      const categoriesArray: Category[] = Object.keys(servicesByCategory).map(categoryId => {
        const categoryName = servicesByCategory[categoryId][0].category.name;
        return {
          _id: categoryId,
          name: categoryName,
          services: servicesByCategory[categoryId]
        };
      });
      
      setCategories(categoriesArray);
    } catch (error) {
      console.error('خطا در دریافت سرویس‌ها:', error);
      setError('بارگذاری سرویس‌ها با مشکل مواجه شد');
    } finally {
      setLoading(false);
    }
  };

  // Fetch services and check login status on component mount
  useEffect(() => {
    getServices();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Set today as default selected day in Jalali calendar
    const today = moment();
    setSelectedDay({
      year: parseInt(today.format('jYYYY')),
      month: parseInt(today.format('jM')),
      day: parseInt(today.format('jD')),
    });
  }, []);

  // Update when date changes
  useEffect(() => {
    if (formData.date) {
      fetchReservationsForDate(formData.date);
    }
  }, [formData.date]);

  // Update time slots when service or date or existing reservations change
 // Update when date changes
useEffect(() => {
  if (formData.date) {
    console.log("Fetching reservations for date:", formData.date);
    fetchReservationsForDate(formData.date);
  }
}, [formData.date]);

// Update time slots when service or date or existing reservations change
useEffect(() => {
  if (selectedService) {
    console.log("Generating time slots for service:", selectedService.name);
    const duration = selectedService.duration || 30;
    setTimeSlots(generateTimeSlots(duration));
  } else {
    setTimeSlots([]);
  }
}, [selectedService, formData.date, existingReservations, generateTimeSlots]); // Add generateTimeSlots here


  // Convert Jalali date to Gregorian for API
  const convertToGregorian = (jalaliDate: JalaliDate | null) => {
    if (!jalaliDate) return '';
    
    const { year, month, day } = jalaliDate;
    const gregorianDate = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD').format('YYYY-MM-DD');
    return gregorianDate;
  };

  useEffect(() => {
    if (selectedDay) {
      const gregorianDate = convertToGregorian(selectedDay);
      setFormData(prev => ({ ...prev, date: gregorianDate }));
    }
  }, [selectedDay]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setFormData(prev => ({ 
      ...prev, 
      service: service._id,
      time: '' // Reset time when service changes
    }));
    
    // Time slots will be updated by the useEffect that watches selectedService
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user is not logged in, show guest info modal
    if (!isLoggedIn && (!formData.guestName || !formData.guestPhoneNumber)) {
      setShowGuestModal(true);
      return;
    }
    
    await submitReservation();
  };

  const submitReservation = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Get token from localStorage (if it exists)
      const token = localStorage.getItem('token');
      
      // Prepare request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add token if available
      if (token) {
        headers['token'] = token;
      }
      
      // Prepare request body
      const requestBody: ReservationRequest = {
        service: formData.service,
        date: dateTime.toISOString(),
        notes: formData.notes
      };
      
      // Only include guest info if user is not logged in
      if (!token) {
        if (!formData.guestName || !formData.guestPhoneNumber) {
          setError('لطفاً برای رزرو به عنوان مهمان، نام و شماره تماس خود را وارد کنید');
          setLoading(false);
          return;
        }
        
        requestBody.guestName = formData.guestName;
        requestBody.guestPhoneNumber = formData.guestPhoneNumber;
      }
      
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ایجاد رزرو با خطا مواجه شد');
      }
      
      setSuccess('رزرو با موفقیت انجام شد!');
      // Reset form
      setFormData({
        service: '',
        date: '',
        time: '',
        notes: '',
        guestName: '',
        guestPhoneNumber: '',
      });
      setSelectedService(null);
      setSelectedDay(null);
      
      // Redirect to confirmation page or show success message
      
      
    }catch (err: unknown) {
        console.error('خطا در ایجاد رزرو:', err);
        setError(err instanceof Error ? err.message : 'ایجاد رزرو با خطا مواجه شد');
      } finally {
      setLoading(false);
    }
  };
  
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGuestModal(false);
    submitReservation();
  };

  // Calculate end time based on selected service duration
  const calculateEndTime = () => {
    if (!selectedService || !formData.time) return '';
    
    const [hours, minutes] = formData.time.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime.getTime() + (selectedService.duration || 60) * 60000);
    return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
  };

  // Format Jalali date for display
  

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">رزرو نوبت</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {loading && !categories.length ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">در حال بارگذاری سرویس‌ها...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection Tabs */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">انتخاب سرویس</h2>
            
            {categories.length > 0 ? (
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                  {categories.map((category) => (
                    <Tab
                      key={category._id}
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                        ${selected 
                          ? 'bg-white text-blue-700 shadow' 
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                        }`
                      }
                    >
                      {category.name}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                  {categories.map((category) => (
                    <Tab.Panel
                      key={category._id}
                      className="rounded-xl bg-white p-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.services.map((service) => (
                          <div 
                            key={service._id}
                            onClick={() => handleServiceSelect(service)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedService?._id === service._id 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <h3 className="font-medium">{service.name}</h3>
                            <div className="flex justify-between mt-2 text-sm">
                              <span>{service.price} تومان</span>
                              <span>{service.duration} دقیقه</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">هیچ سرویسی در دسترس نیست</p>
              </div>
            )}
          </div>
          
          {selectedService && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-blue-800">سرویس انتخاب شده:</h3>
              <p className="text-blue-700">{selectedService.name} - {selectedService.price} تومان ({selectedService.duration} دقیقه)</p>
            </div>
          )}
          
          {/* Artist Selection - Only show if the selected service has multiple artists */}
          
          
          {/* Date and Time Selection */}
          {selectedService && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاریخ
                </label>
                <div className="persian-datepicker-container">
                  <DatePicker
                    value={selectedDay}
                    onChange={(value) => value && setSelectedDay(value)}
                    inputPlaceholder="انتخاب تاریخ"
                    shouldHighlightWeekends
                    locale="fa"
                    calendarClassName="responsive-calendar"
                    inputClassName="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    minimumDate={{
                      year: parseInt(moment().format('jYYYY')),
                      month: parseInt(moment().format('jM')),
                      day: parseInt(moment().format('jD'))
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ساعت
                </label>
                <div className="time-slots-wrapper">
                  <div className="time-slots-container">
                  {timeSlots && timeSlots.length > 0 ? (
  timeSlots.map((slot) => (
    <button
      key={slot.value}
      type="button"
      onClick={() => slot.available ? handleTimeSlotSelect(slot.value) : null}
      className={`time-slot-button ${formData.time === slot.value ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
      disabled={!slot.available}
    >
      <span className="time-label">{slot.label}</span>
      {selectedService && (
        <span className="duration-label">
          {selectedService.duration} دقیقه
        </span>
      )}
      {!slot.available && (
        <span className="reserved-label">رزرو شده</span>
      )}
    </button>
  ))
) : (
  <p className="text-gray-500 text-center py-4">در حال بارگذاری ساعت‌های قابل رزرو...</p>
)}


                  </div>
                </div>
                
                {formData.time && (
                  <p className="mt-2 text-sm text-green-600">
                    ساعت انتخاب شده: <span className="font-medium">{formData.time}</span>
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Show appointment duration */}
          {selectedService && formData.time && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                نوبت شما از <span className="font-medium">{formData.time}</span> تا <span className="font-medium">{calculateEndTime()}</span> خواهد بود
              </p>
            </div>
          )}
          
          {/* Notes */}
          {selectedService && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                توضیحات (اختیاری)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="هرگونه توضیح اضافی برای آرایشگر..."
              />
            </div>
          )}
          
          {/* Submit Button */}
          {selectedService && (
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'در حال رزرو...' : 'رزرو نوبت'}
              </button>
            </div>
          )}
        </form>
      )}
      
      {/* Guest Information Modal */}
      <Transition appear show={showGuestModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowGuestModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all" dir="rtl">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    اطلاعات مهمان
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      لطفاً برای تکمیل رزرو، اطلاعات تماس خود را وارد کنید.
                    </p>
                  </div>

                  <form onSubmit={handleGuestSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نام <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleChange}
                        required
                        placeholder="نام و نام خانوادگی"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        شماره تماس <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="guestPhoneNumber"
                        value={formData.guestPhoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="مثال: 09123456789"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="mt-4 flex justify-end space-x-3 space-x-reverse">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-3"
                        onClick={() => setShowGuestModal(false)}
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        disabled={!formData.guestName || !formData.guestPhoneNumber}
                      >
                        ادامه
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Add some custom styles for Persian calendar and time slots */}
      <style jsx global>{`
        .responsive-calendar {
          font-family: Vazirmatn, Tahoma, Arial, sans-serif;
        }
        
        .persian-datepicker-container {
          direction: rtl;
          text-align: right;
        }
        
        /* Fix for RTL layout */
        .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
          --tw-space-x-reverse: 1;
        }
        
        /* Time slot styling */
        .time-slots-wrapper {
          position: relative;
        }
        
        .time-slots-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          max-height: 250px;
          overflow-y: auto;
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
                .time-slot-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.2s;
          color: #374151;
          min-width: 80px;
          text-align: center;
        }
        
        .time-slot-button .time-label {
          font-weight: 500;
        }
        
        .time-slot-button .duration-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        
        .time-slot-button:hover:not(:disabled) {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .time-slot-button.selected {
          background-color: #4f46e5;
          color: white;
          border-color: #4338ca;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .time-slot-button.selected .duration-label {
          color: #e0e7ff;
        }
        
        .time-slot-button.unavailable {
          opacity: 0.7;
          cursor: not-allowed;
          background-color: #fee2e2;
          border-color: #fca5a5;
        }
        
        .time-slot-button .reserved-label {
          font-size: 0.7rem;
          color: #ef4444;
          margin-top: 0.25rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ReservationPage;
