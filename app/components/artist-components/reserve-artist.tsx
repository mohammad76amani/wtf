'use client';

import React, { useState, useEffect } from 'react';
import moment from 'moment-jalaali';
import Link from 'next/link';
import { toast } from 'react-toastify';


interface Reservation {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  guestInfo?: {
    name: string;
    phoneNumber: string;
  };
  service: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    category: string;
  };
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  artist?: {
    _id: string;
    username: string;
    phoneNumber: string;
  };
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

const statusTranslations = {
  pending: "در انتظار",
  confirmed: "تایید شده",
  cancelled: "لغو شده",
  completed: "انجام شده",
};
export default function ReserveArtist() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<'date' | 'status' | 'createdAt'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
    const [activeTab, setActiveTab] = useState('all');
    const [token, setToken] = useState<string | null>(null);
    
    // Check for token in useEffect to avoid localStorage errors during SSR
    useEffect(() => {
      // Now this code only runs in the browser
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }, []);
  
    const fetchReservations = async () => {
      if (!token) return; // Don't fetch if no token
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/reserve/artist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          toast.error('خطا در دریافت رزروها:');
        }
        
        const data = await response.json();
        setReservations(data.reservations);
      } catch (err) {
        setError((err as Error).message);
        console.error('خطا در دریافت رزروها:', err);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (token) {
        fetchReservations();
      }
    }, []); // Only fetch when token is available

      

  // Filter reservations based on the active tab
  const getFilteredReservations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if(!reservations) return [];
    return reservations.filter(res => {
      // Apply search filter
      const clientName = res.user?.name || res.guestInfo?.name || '';
      const serviceName = res.service?.name || '';
      const searchFields = `${clientName} ${serviceName} ${res.notes || ''}`.toLowerCase();
      
      if (searchTerm && !searchFields.includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (filterStatus && res.status !== filterStatus) {
        return false;
      }
      
      // Apply tab filters
      const resDate = new Date(res.date);
      
      if (activeTab === 'today') {
        const resDay = new Date(resDate);
        resDay.setHours(0, 0, 0, 0);
        return resDay.getTime() === today.getTime();
      }
      
      if (activeTab === 'upcoming') {
        return resDate > today;
      }
      
      if (activeTab === 'past') {
        return resDate < today;
      }
      
      return true; // 'all' tab
    });
  };

  // Sort the filtered reservations
  const filteredAndSortedReservations = getFilteredReservations().sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortField === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else {
      return sortDirection === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleSort = (field: 'date' | 'status' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus(undefined);
  };

  // Format date to Persian (Jalali) format
  const formatPersianDate = (dateString: string) => {
    const date = moment(dateString);
    return date.format('jYYYY/jMM/jDD');
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading && reservations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mr-3">در حال بارگذاری...</p>
      </div>
    );
  }
  if (token === null) {
    // Still checking for token
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mr-3">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!token||!reservations) {
    return (
      <div className="flex justify-center items-center h-screen" dir="rtl">
        <div className="bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">ورود به حساب کاربری</h2>
          <p>برای دسترسی به این صفحه باید وارد حساب کاربری خود شوید.</p>
          <Link href="/auth">
            <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              ورود به حساب کاربری
            </button>
          </Link>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800" dir="rtl">
        <h3 className="font-bold">خطا در بارگذاری رزروها</h3>
        <p>{error}</p>
        <button 
          onClick={fetchReservations} 
          className="mt-2 px-4 py-2 bg-white border border-red-300 rounded-md hover:bg-red-50"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }
if (reservations) {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">مدیریت رزروهای من</h2>
          <p className="text-gray-500">مشاهده و مدیریت رزروهای اختصاص داده شده به شما</p>
        </div>
        <button 
          onClick={fetchReservations} 
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          بروزرسانی
        </button>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('all')}
          >
            همه رزروها
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'today' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('today')}
          >
            امروز
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'upcoming' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            آینده
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'past' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('past')}
          >
            گذشته
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="جستجو در رزروها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="pending">در انتظار</option>
            <option value="confirmed">تایید شده</option>
            <option value="cancelled">لغو شده</option>
            <option value="completed">انجام شده</option>
          </select>
          
          <button 
            onClick={resetFilters}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Reservations Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 ">
            <tr>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            
                  نام مشتری
                </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سرویس
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                تاریخ و زمان
                {sortField === 'date' && (
                  <span className="mr-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                وضعیت
                {sortField === 'status' && (
                  <span className="mr-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                یادداشت
              </th>
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedReservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-8 text-center text-gray-500">
                  هیچ رزروی یافت نشد
                </td>
              </tr>
            ) : (
              filteredAndSortedReservations.map((reservation) => (
                <tr key={reservation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.user?.name || reservation.guestInfo?.name || 'ناشناس'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reservation.user ? 'کاربر ثبت‌نام شده' : 'مهمان'}
                    </div>
                    {reservation.guestInfo?.phoneNumber && (
                      <div className="text-sm text-gray-500">
                        {reservation.guestInfo.phoneNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.service.name}</div>
                    <div className="text-sm text-gray-500">
                      {reservation.service.price} تومان • {reservation.service.duration} دقیقه
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPersianDate(reservation.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(reservation.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reservation.status]}`}>
                      {statusTranslations[reservation.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-[200px] truncate">
                      {reservation.notes || '-'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        نمایش {filteredAndSortedReservations.length} از {reservations.length} رزرو
      </div>
      
      {/* Add custom styles for RTL support */}
      <style jsx>{`
        /* Fix for RTL layout */
        .mr-1 {
          margin-right: 0.25rem;
        }
        .ml-2 {
          margin-left: 0.5rem;
        }
        .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
          --tw-space-x-reverse: 1;
          margin-right: calc(0.5rem * var(--tw-space-x-reverse));
          margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
        }
      `}</style>
    </div>
  );}
}

