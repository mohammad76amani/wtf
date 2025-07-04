'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpa, FaHome, FaCalendarAlt, FaImages, FaPhoneAlt, FaUser, FaBars, FaTimes } from 'react-icons/fa'
import { useSalon } from '@/app/context/SalonContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { salonData, loading } = useSalon()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 }
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 transition-all duration-500 ${scrolled ? 'mt-0' : 'mt-3'}`}>
        <nav className={`max-w-7xl mx-auto transition-all duration-500 ${
          scrolled 
            ? 'bg-slate-100/60 backdrop-blur-sm shadow-lg' 
            : 'bg-white/30 backdrop-blur-sm'
          } rounded-lg px-4 py-2`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 py-2">
              {loading ? (
                <motion.div
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl text-transparent bg-gradient-primary bg-clip-text"
                >
                  <FaSpa />
                </motion.div>
              ) : salonData && salonData.salonLogo ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-10 h-10  rounded-full"
                >
                  <Image 
                    src={salonData.salonLogo} 
                    alt={salonData.salonName || "Salon Logo"} 
                    fill
                    className="object-cover"
                    sizes="40px"
                    priority
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl text-transparent bg-gradient-primary bg-clip-text"
                >
                  <FaSpa />
                </motion.div>
              )}
              <motion.span 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-bold text-primary-500"
              >
                {salonData?.salonName || "گلستان"}
              </motion.span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu} 
              className="p-2 text-2xl text-primary-500 focus:outline-none lg:hidden"
              aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <ul className="flex items-center gap-3">
                <li>
                  <Link href="/" className="flex items-center gap-2 px-3 py-2 font-medium transition-colors rounded-full text-primary-700 hover:bg-primary-50">
                    <FaHome className="text-primary-500" />
                    <span>صفحه اصلی</span>
                  </Link>
                </li>
                <li>
                  <Link href="/reserve" className="flex items-center gap-2 px-3 py-2 font-medium transition-colors rounded-full text-primary-700 hover:bg-primary-50">
                    <FaCalendarAlt className="text-primary-500" />
                    <span>رزرو نوبت</span>
                  </Link>
                </li>
               
                <li>
                  <Link href="/gallery" className="flex items-center gap-2 px-3 py-2 font-medium transition-colors rounded-full text-primary-700 hover:bg-primary-50">
                    <FaImages className="text-primary-500" />
                    <span>گالری</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center gap-2 px-3 py-2 font-medium transition-colors rounded-full text-primary-700 hover:bg-primary-50">
                    <FaPhoneAlt className="text-primary-500" />
                    <span>تماس با ما</span>
                  </Link>
                </li>
              </ul>
              <div className="flex items-center gap-2">
                <Link href="/auth" className="flex items-center gap-2 px-3 py-1.5 font-medium transition-all border rounded-full text-primary-600 border-primary-300 hover:bg-primary-50">
                  <FaUser />
                  <span>ورود</span>
                </Link>
               
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Dropdown - Completely separate from navbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed top-20 left-4 right-4 z-40 lg:hidden"
          >
            <div className="bg-slate-300/70 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
              <motion.ul className="flex flex-col gap-2 p-4">
                <motion.li variants={itemVariants}>
                  <Link 
                    href="/" 
                    className="flex items-center gap-3 px-4 py-3 font-medium transition-colors rounded-xl text-primary-700 hover:bg-primary-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaHome className="text-xl text-primary-500" />
                    <span>صفحه اصلی</span>
                  </Link>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <Link 
                    href="/reserve" 
                    className="flex items-center gap-3 px-4 py-3 font-medium transition-colors rounded-xl text-primary-700 hover:bg-primary-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaCalendarAlt className="text-xl text-primary-500" />
                    <span>رزرو نوبت</span>
                  </Link>
                </motion.li>
             
                <motion.li variants={itemVariants}>
                  <Link 
                    href="/gallery" 
                    className="flex items-center gap-3 px-4 py-3 font-medium transition-colors rounded-xl text-primary-700 hover:bg-primary-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaImages className="text-xl text-primary-500" />
                    <span>گالری</span>
                  </Link>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <Link 
                    href="/contact" 
                    className="flex items-center gap-3 px-4 py-3 font-medium transition-colors rounded-xl text-primary-700 hover:bg-primary-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaPhoneAlt className="text-xl text-primary-500" />
                    <span>تماس با ما</span>
                  </Link>
                </motion.li>
              </motion.ul>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col gap-3 p-4 border-t border-gray-100"
              >
                <Link 
                  href="/auth" 
                  className="flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all border rounded-xl text-primary-600 border-primary-200 hover:bg-primary-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser />
                  <span>ورود</span>
                </Link>
               
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
