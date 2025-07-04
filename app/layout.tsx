import './globals.css'
import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google'
import Navbar from './components/static/navbar'
import { Footer } from './components/global/footer'
import { SalonProvider } from './context/SalonContext';
import { ToastContainer } from 'react-toastify'


const vazirmatn = Vazirmatn({ 
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'سالن زیبایی گلستان | Golestan Beauty Salon',
  description: 'رزرو آنلاین خدمات آرایشی و زیبایی',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-vazir bg-gradient-to-b from-pink-50 to-white min-h-screen`}>

        <SalonProvider>
        <Navbar />
        {children}  
        <Footer />
        </SalonProvider>
        <ToastContainer/>

      </body>

    </html>
  )
}
