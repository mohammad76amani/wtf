"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Category {
  _id: string;
  name: string;
  description: string;
}

export const CategoryManage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/category");
      const data = await res.json();
      setCategories(data.categories);
    } catch (error) {
      toast.error("خطا در دریافت دسته‌بندی‌ها");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing category
        const res = await fetch("/api/category", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, name, description }),
        });
        
        if (res.ok) {
          toast.success("دسته‌بندی با موفقیت به‌روزرسانی شد");
          resetForm();
          fetchCategories();
        } else {
          toast.error("خطا در به‌روزرسانی دسته‌بندی");
        }
      } else {
        // Create new category
        const res = await fetch("/api/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        
        if (res.ok) {
          toast.success("دسته‌بندی با موفقیت ایجاد شد");
          resetForm();
          fetchCategories();
        } else {
          toast.error("خطا در ایجاد دسته‌بندی");
        }
      }
    } catch (error) {
      toast.error("خطایی رخ داد");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) {
      try {
        const res = await fetch("/api/category", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        
        if (res.ok) {
          toast.success("دسته‌بندی با موفقیت حذف شد");
          fetchCategories();
        } else {
          toast.error("خطا در حذف دسته‌بندی");
        }
      } catch (error) {
        toast.error("خطایی رخ داد");
        console.error(error);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  return (
    <div className="p-3 bg-white rounded-lg shadow-md" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">مدیریت دسته‌بندی‌ها</h1>
      
      {/* Form for adding/editing categories */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              نام دسته‌بندی
            </label>
            <input
              id="name"
              type="text"
              placeholder="نام دسته‌بندی را وارد کنید"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات
            </label>
            <input
              id="description"
              type="text"
              placeholder="توضیحات را وارد کنید"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 space-x-reverse">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {editingId ? "به‌روزرسانی دسته‌بندی" : "افزودن دسته‌بندی"}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mr-3"
            >
              انصراف
            </button>
          )}
        </div>
      </form>
      
      {/* Categories list */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">دسته‌بندی‌های موجود</h2>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">در حال بارگذاری دسته‌بندی‌ها...</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-center py-4">هیچ دسته‌بندی یافت نشد. اولین دسته‌بندی خود را در بالا اضافه کنید.</p>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">توضیحات</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 break-words max-w-[300px]">{category.description || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 ml-4"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManage;
