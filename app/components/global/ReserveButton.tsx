'use client';
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import ReserveModal from './ReserveModal';

const ReserveButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const buttonStyle = {
    backgroundColor: '#D8A1B1',
    opacity: 0.9,
    color: 'white',
    borderRadius: '9999px',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(216, 161, 177, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    width: '90%',
    maxWidth: '300px',
    margin: '0 auto'
  };

  const containerStyle = {
    position: 'fixed' as const,
    zIndex: 50,
    bottom: '1rem',
    left: 0,
    right: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: isVisible ? 'translateY(0)' : 'translateY(100px)',
    opacity: isVisible ? 1 : 0,
  };

  // Apply different styles for medium screens and up


  return (
    <>
      <div 
        style={containerStyle}
        className="md:bottom-8 md:right-8 md:left-auto md:w-auto md:justify-end opacity-80"
      >
        <button
          onClick={openModal}
          style={buttonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#B6798A';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 15px rgba(216, 161, 177, 0.4)';
            // Animate the icon
            const icon = e.currentTarget.querySelector('svg');
            if (icon) icon.style.transform = 'scale(1.1) rotate(5deg)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#D8A1B1';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 10px rgba(216, 161, 177, 0.3)';
            // Reset icon animation
            const icon = e.currentTarget.querySelector('svg');
            if (icon) icon.style.transform = 'scale(1) rotate(0)';
          }}
        >
          <FaCalendarAlt style={{ marginRight: '0.5rem', transition: 'transform 0.3s ease' }} />
          <span className='mx-2 font-extrabold text-lg'>رزرو خدمات</span>
        </button>
      </div>

      <ReserveModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default ReserveButton;
