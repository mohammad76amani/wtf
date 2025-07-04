'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SalonData {
  salonName: string;
  salonLogo: string;
  salonAddress?: string;
  salonPhoneNumber?: string[];
  salonLocation?: string;
  salonDescription?: string;
  salonWorkingHours?: {
    start: string;
    end: string;
  };
  salonInstagram?: string;
  salonTelegram?: string;
  salonWhatsapp?: string;
}

interface SalonContextType {
  salonData: SalonData | null;
  loading: boolean;
  refreshSalonData: () => Promise<void>;
  updateSalonData: (newData: SalonData) => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export function SalonProvider({ children }: { children: ReactNode }) {
  const [salonData, setSalonData] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSalonData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/salonData');
      if (response.ok) {
        const data = await response.json();
        setSalonData(data);
      } else {
        console.error('Failed to fetch salon data');
      }
    } catch (error) {
      console.error('Error fetching salon data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonData();
  }, []);

  const updateSalonData = (newData: SalonData) => {
    setSalonData(newData);
  };

  return (
    <SalonContext.Provider value={{ salonData, loading, refreshSalonData: fetchSalonData, updateSalonData }}>
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
}
