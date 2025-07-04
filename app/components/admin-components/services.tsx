"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface Category {
  _id: string;
  name: string;
  description: string;
}




interface Service {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  available: boolean;
}

export default function ServicesComponent() {
  // Service form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [categoryId, setCategoryId] = useState("");
  const [available, setAvailable] = useState(true);
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  
  // Fetch categories and artists on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", error);
    }
  };
  
 
  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData: Service = {
      name,
      description,
      price,
      duration,
      category: categoryId,
      available
    };
    
    try {
      const res = await fetch("/api/serv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });
      
      if (res.ok) {
        // Reset form
        setName("");
        setDescription("");
        setPrice(0);
        setDuration(30);
        setCategoryId("");
        setAvailable(true);
        alert("سرویس با موفقیت اضافه شد");
      } else {
        alert("خطا در ثبت سرویس");
      }
    } catch (error) {
      console.error("خطا در ارسال فرم:", error);
    }
  };
  
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, description: categoryDescription }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setCategories([...categories, data.category]);
        setCategoryId(data.category._id);
        setIsModalOpen(false);
        setCategoryName("");
        setCategoryDescription("");
      }
    } catch (error) {
      console.error("خطا در افزودن دسته‌بندی:", error);
    }
  };
  
  return (
    <div className="rtl p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">مدیریت سرویس‌ها</h1>
      
      <form onSubmit={handleSubmitService} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">نام سرویس</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="نام سرویس را وارد کنید"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">قیمت (تومان)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              placeholder="قیمت سرویس"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">مدت زمان (دقیقه)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="5"
              step="5"
              placeholder="مدت زمان سرویس"
            />
          </div>
          
          <div className="relative">
            <label className="block text-gray-700 mb-1">دسته‌بندی</label>
            <div className="flex items-center">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute right-2 top-8 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          
          
          
          <div>
            <label className="block text-gray-700 mb-1">وضعیت</label>
            <div className="flex items-center space-x-4 space-x-reverse">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={available}
                  onChange={() => setAvailable(true)}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="mr-2">فعال</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!available}
                  onChange={() => setAvailable(false)}
                  className="form-radio h-5 w-5 text-red-600"
                />
                <span className="mr-2">غیرفعال</span>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1">توضیحات</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="توضیحات سرویس را وارد کنید"
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ثبت سرویس
          </button>
        </div>
      </form>
      
      {/* Modal for adding new category */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              افزودن دسته‌بندی جدید
            </Dialog.Title>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">نام دسته‌بندی</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="نام دسته‌بندی را وارد کنید"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">توضیحات</label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="توضیحات دسته‌بندی را وارد کنید"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  افزودن
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
