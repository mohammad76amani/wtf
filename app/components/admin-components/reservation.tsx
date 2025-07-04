'use client';

import React, { useState, useEffect } from 'react';
import moment from 'moment-jalaali';

interface User {
  _id: string;
  username: string;
  phoneNumber: string;
  role: string;
}

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

export default function ReservationAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'status' | 'createdAt'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Artist assignment modal state
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [artistSearchTerm, setArtistSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reserve');
      if (!response.ok) {
        throw new Error('دریافت رزروها با خطا مواجه شد');
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

  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/users?role=artist');
      if (!response.ok) {
        throw new Error('دریافت لیست آرایشگران با خطا مواجه شد');
      }
      const data = await response.json();
      setArtists(data.users);
    } catch (err) {
      console.error('خطا در دریافت لیست آرایشگران:', err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchArtists();
  }, []);

  const updateReservationStatus = async (id: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/reserve/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, artist: selectedArtist, id: id }),
      });
      
      if (!response.ok) {
        throw new Error('بروزرسانی وضعیت رزرو با خطا مواجه شد');
      }
      
      // Update the local state to reflect the change
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res._id === id ? { ...res, status: newStatus } : res
        )
      );
    } catch (err) {
      console.error('خطا در بروزرسانی وضعیت رزرو:', err);
      alert('بروزرسانی وضعیت با خطا مواجه شد. لطفا دوباره تلاش کنید.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const assignArtistToReservation = async () => {
    if (!selectedReservation || !selectedArtist) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/reserve/${selectedReservation}/assign-artist`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artistId: selectedArtist }),
      });
      
      if (!response.ok) {
        throw new Error('تخصیص آرایشگر با خطا مواجه شد');
      }
      
      const data = await response.json();
      
      // Update the local state to reflect the change
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res._id === selectedReservation ? { ...res, artist: data.artist } : res
        )
      );
      
      // Close the modal and reset state
      setShowArtistModal(false);
      setSelectedReservation(null);
      setSelectedArtist(null);
      setArtistSearchTerm('');
      
    } catch (err) {
      console.error('خطا در تخصیص آرایشگر:', err);
      alert('تخصیص آرایشگر با خطا مواجه شد. لطفا دوباره تلاش کنید.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openArtistModal = (reservationId: string) => {
    setSelectedReservation(reservationId);
    setShowArtistModal(true);
    
    // Find the current artist for this reservation
    const reservation = reservations.find(r => r._id === reservationId);
    if (reservation?.artist) {
      setSelectedArtist(reservation.artist._id);
    } else {
      setSelectedArtist(null);
    }
  };

  // Filter reservations based on the active tab
  const getFilteredReservations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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

  // Filter artists based on search term
  const filteredArtists = artists.filter(artist => 
    artist.username.toLowerCase().includes(artistSearchTerm.toLowerCase()) ||
    artist.phoneNumber.includes(artistSearchTerm)
  );

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

  return (
    <div className="max-w-[375px] md:max-w-full bg-white rounded-lg shadow-sm p-3 sm:p-6 " dir="rtl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-y-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">مدیریت رزروها</h2>
          <p className="text-gray-500">مشاهده و مدیریت تمام رزروهای سالن</p>
        </div>
        <button 
          onClick={fetchReservations} 
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center sm:justify-start w-full sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          بروزرسانی
        </button>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 overflow-x-auto max-w-sm md:max-w-full"> 
        <div className="flex border-b border-gray-200 min-w-max">
          <button
            className={`px-3 sm:px-4 py-2 font-medium ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('all')}
          >
            همه رزروها
          </button>
          <button
            className={`px-3 sm:px-4 py-2 font-medium ${activeTab === 'today' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('today')}
          >
            امروز
          </button>
          <button
            className={`px-3 sm:px-4 py-2 font-medium ${activeTab === 'upcoming' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            آینده
          </button>
          <button
            className={`px-3 sm:px-4 py-2 font-medium ${activeTab === 'past' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('past')}
          >
            گذشته
          </button>
        </div>
      </div>
      
           {/* Search and Filters */}
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
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
        
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex-1 sm:flex-none"
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
      
      {/* Reservations Table - Mobile Responsive */}
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                مشتری
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سرویس
              </th>
              <th 
                scope="col" 
                className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                تاریخ و زمان
                {sortField === 'date' && (
                  <span className="mr-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                وضعیت
                {sortField === 'status' && (
                  <span className="mr-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                آرایشگر
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                یادداشت
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedReservations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 sm:px-6 py-8 text-center text-gray-500">
                  هیچ رزروی یافت نشد
                </td>
              </tr>
            ) : (
              filteredAndSortedReservations.map((reservation) => (
                <tr key={reservation._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
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
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.service.name}</div>
                    <div className="text-sm text-gray-500">
                      {reservation.service.price} تومان • {reservation.service.duration} دقیقه
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPersianDate(reservation.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(reservation.date)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reservation.status]}`}>
                      {statusTranslations[reservation.status]}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    {reservation.artist ? (
                      <div className="text-sm text-gray-900">
                        {reservation.artist.username}
                      </div>
                    ) : (
                      <button
                        onClick={() => openArtistModal(reservation._id)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs hover:bg-indigo-200"
                      >
                        تخصیص آرایشگر
                      </button>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-[120px] sm:max-w-[200px] truncate">
                      {reservation.notes || '-'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2 space-x-reverse">
                      <select 
                        defaultValue={reservation.status}
                        onChange={(e) => updateReservationStatus(reservation._id, e.target.value as 'pending' | 'confirmed' | 'cancelled' | 'completed')}
                        disabled={isUpdating}
                        className="block w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="pending">در انتظار</option>
                        <option value="confirmed">تایید</option>
                        <option value="cancelled">لغو</option>
                        <option value="completed">تکمیل</option>
                      </select>
                      
                      {reservation.artist ? (
                        <button
                          onClick={() => openArtistModal(reservation._id)}
                          className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 whitespace-nowrap"
                          title="تغییر آرایشگر"
                        >
                          تغییر
                        </button>
                      ) : null}
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
      
      {/* Artist Assignment Modal */}
      {showArtistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">تخصیص آرایشگر</h3>
              <button
                onClick={() => setShowArtistModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                جستجوی آرایشگر
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="نام یا شماره تماس آرایشگر..."
                  value={artistSearchTerm}
                  onChange={(e) => setArtistSearchTerm(e.target.value)}
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto mb-4 border rounded-md">
              {filteredArtists.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  هیچ آرایشگری یافت نشد
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredArtists.map((artist) => (
                    <div 
                      key={artist._id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedArtist === artist._id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setSelectedArtist(artist._id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="artist"
                          checked={selectedArtist === artist._id}
                          onChange={() => setSelectedArtist(artist._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 ml-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{artist.username}</div>
                          <div className="text-sm text-gray-500">{artist.phoneNumber}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setShowArtistModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                انصراف
              </button>
              <button
                               onClick={assignArtistToReservation}
                               disabled={!selectedArtist || isUpdating}
                               className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                 !selectedArtist || isUpdating
                                   ? 'bg-indigo-300 cursor-not-allowed'
                                   : 'bg-indigo-600 hover:bg-indigo-700'
                               }`}
                             >
                               {isUpdating ? 'در حال ذخیره...' : 'تخصیص آرایشگر'}
                             </button>
                           </div>
                         </div>
                       </div>
                     )}
                     
                     {/* Add custom styles for RTL support and mobile responsiveness */}
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
                       
                       /* Responsive table styles */
                       @media (max-width: 640px) {
                         .overflow-x-auto {
                           -webkit-overflow-scrolling: touch;
                         }
                         
                         table {
                           width: 100%;
                           min-width: 650px; /* Ensure table has minimum width to show all columns */
                         }
                         
                         th, td {
                           padding-left: 8px;
                           padding-right: 8px;
                         }
                       }
                     `}</style>
                   </div>
                 );
               }
               