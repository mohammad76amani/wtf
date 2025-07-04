"use client";
import React, { JSX, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaCut,
  FaCalendarAlt,
  FaStore,
  FaImages,
  FaImage,
  FaCertificate,
} from "react-icons/fa";
import GalleryManager from "@/app/components/admin-components/galleryManager";

import { User } from "@/app/components/admin-components/user";
import { useRouter } from "next/navigation";
import ServicesComponent from "@/app/components/admin-components/services";
import ReservationAdmin from "@/app/components/admin-components/reservation";
import AddSalonData from "@/app/components/admin-components/addSalonData";
import HeroImageManager from "@/app/components/admin-components/heroImageManager";
import CategoryManage from "../components/admin-components/categoryManage";

type SidebarItem =
  | "products"
  | "carts"
  | "users"
  | "blog"
  | "Addblog"
  | "Addproducts"
  | "Addcategory"
  | "analytics"
  | "profile"
  | "services"
  | "reservations"
  | "salonData"
  | "heroImage"
  | "category"
  | "gallery"; // Add this
  // Add new item for hero image management

type UserRole = "admin" | "superAdmin" | "supervisor" | "artist" | "user";

const sidebarVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: "0%", opacity: 1 },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.5 },
};

const Sidebar: React.FC<{
  selected: SidebarItem;
  onSelect: (item: SidebarItem) => void;
  onClose: () => void;
  userRole: UserRole;
}> = ({ selected, onSelect, onClose, userRole }) => {
  // Define items based on user role
  const getMenuItems = () => {
    const items: { key: SidebarItem; label: string; icon: JSX.Element; roles: UserRole[] }[] = [
      { key: "users", label: "کاربران", icon: <FaUsers size={18} />, roles: ["admin", "superAdmin", "supervisor"] },
      { key: "services", label: "مدیریت سرویس‌ها", icon: <FaCut size={18} />, roles: ["admin", "superAdmin", "supervisor"] },
      { key: "reservations", label: "مدیریت رزروها", icon: <FaCalendarAlt size={18} />, roles: ["admin", "superAdmin", "supervisor", "artist"] },
      { key: "salonData", label: "اطلاعات سالن", icon: <FaStore size={18} />, roles: ["admin", "superAdmin"] },
      { key: "heroImage", label: "مدیریت تصاویر اصلی", icon: <FaImage size={18} />, roles: ["admin", "superAdmin"] },
      // Add this new item
      { key: "gallery", label: "مدیریت گالری", icon: <FaImages size={18} />, roles: ["admin", "superAdmin"] },
      { key: "category", label: "مدیریت دسته بندی ها", icon: <FaCertificate size={18} />, roles: ["admin", "superAdmin", "supervisor", "artist"] }
    ];
  
    // Filter items based on user role
    return items.filter(item => item.roles.includes(userRole));
  };

  const visibleItems = getMenuItems();

  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ type: "spring", stiffness: 300, damping: 50 }}
      className="w-64 bg-white/10 backdrop-blur-xl text-white h-screen p-4 fixed right-0 top-0 z-[10000] overflow-y-auto"
    >
      <h2 className="text-xl font-bold mb-6">پنل مدیریت</h2>
      <ul>
        {visibleItems.map((item) => (
          <li key={item.key}>
            <button
              onClick={() => {
                onSelect(item.key);
                onClose();
              }}
              className={`w-full text-left flex items-center px-4 py-2 rounded mb-2 transition-colors duration-200 ${
                selected === item.key ? "bg-gray-600" : "hover:bg-gray-700"
              }`}
            >
              <span className="ml-2 text-yellow-400">{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const AdminContent: React.FC<{ selected: SidebarItem }> = ({ selected }) => {
  switch (selected) {
    case "users":
      return <User />;
    case "services":
      return <ServicesComponent />;
    case "reservations":
      return <ReservationAdmin />;
    case "salonData":
      return <AddSalonData />;
    case "heroImage":
      return <HeroImageManager />;
    case "gallery":
      return <GalleryManager />;
    case "category":
      return <CategoryManage />;
    default:
      return <div className="p-6 text-white text-center">به پنل مدیریت خوش آمدید</div>;
  }
};
const AdminPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<SidebarItem>("users");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const router = useRouter();

  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        router.push("/auth");
        return;
      }
  
      try {
        const response = await fetch("/api/auth/login", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        });
  
        if (!response.ok) {
          router.push("/");
          return;
        }
  
        const data = await response.json();
        console.log(data);
        // Check if user has admin, superAdmin, or supervisor role
        if (data.userrole === "admin" || data.userrole === "superAdmin" || data.userrole === "supervisor" || data.userrole === "artist") {
          setIsAuthorized(true);
          setUserRole(data.userrole);
          
          // Set initial selected item based on role
          if (data.userrole === "artist") {
            setSelectedItem("reservations");
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error(error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
  
    verifyAccess();
  }, [router]); // Add router to the dependency array
  
  useEffect(() => {
    document.title = "سالن زیبایی - پنل مدیریت";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "پنل مدیریت سالن زیبایی");
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#a37462]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500 border-solid"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#a37462] text-white">
        <h1 className="text-2xl mb-4">دسترسی محدود شده است</h1>
        <p className="mb-6">شما اجازه دسترسی به این بخش را ندارید</p>
        <button 
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#a37462] text-yellow-500 pt-20" dir="rtl">
      <div className="flex">
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                key="overlay"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black z-40"
                onClick={toggleSidebar}
              />
              <Sidebar
                key="sidebar"
                selected={selectedItem}
                onSelect={setSelectedItem}
                onClose={toggleSidebar}
                userRole={userRole}
              />
            </>
          )}
        </AnimatePresence>
        <div className="flex-1">
          <div className="flex items-center  py-4">
            <button
              onClick={toggleSidebar}
              className="text-4xl  lg:mt-4 mr-3 text-gray-300 focus:outline-none cursor-pointer"
            >
              {sidebarOpen ? "" : "☰"}
            </button>
          </div>
          <AdminContent selected={selectedItem} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
