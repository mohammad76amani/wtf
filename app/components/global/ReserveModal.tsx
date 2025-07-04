'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaCalendarAlt } from 'react-icons/fa';

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReserveModal: React.FC<ReserveModalProps> = ({ isOpen, onClose }) => {
  const handleOnlineReservation = () => {
    window.location.href = '/reserve';
    onClose();
  };

  const handleCallReservation = () => {
    window.location.href = 'tel:+1234567890';
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1],
              delay: 0.1
            }}
            className="bg-white rounded-xl p-7 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{ 
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '0.75rem',
                fontFamily: "'Playfair Display', serif"
              }}
            >
              رزرو نوبت
            </motion.h2>
            
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              style={{ 
                color: '#666',
                marginBottom: '1.75rem'
              }}
            >
              روش رزرو نوبت خود را انتخاب کنید:
            </motion.p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                onClick={handleOnlineReservation}
                whileHover={{ 
                  y: -5, 
                  backgroundColor: '#B6798A',
                  boxShadow: '0 8px 15px rgba(216, 161, 177, 0.4)'
                }}
                style={{
                  backgroundColor: '#D8A1B1',
                  color: 'white',
                  borderRadius: '0.5rem',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(216, 161, 177, 0.3)',
                }}
              >
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                  <FaCalendarAlt style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }} />
                </motion.div>
                <span>رزرو آنلاین</span>
              </motion.button>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                onClick={handleCallReservation}
                whileHover={{ 
                  y: -5, 
                  backgroundColor: '#5F7A87',
                  boxShadow: '0 8px 15px rgba(138, 158, 167, 0.4)'
                }}
                style={{
                  backgroundColor: '#8A9EA7',
                  color: 'white',
                  borderRadius: '0.5rem',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(138, 158, 167, 0.3)',
                }}
              >
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                  <FaPhone style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }} />
                </motion.div>
                <span>تماس تلفنی</span>
              </motion.button>
            </div>
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              onClick={onClose}
              whileHover={{ 
                backgroundColor: '#f5f5f5',
                borderColor: '#ccc'
              }}
              style={{
                marginTop: '1.75rem',
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                backgroundColor: 'transparent',
                color: '#666',
                cursor: 'pointer',
              }}
            >
              انصراف
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReserveModal;
