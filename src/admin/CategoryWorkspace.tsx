"use client";

import { useState, useEffect } from "react";
import { categoryService } from "../utils/service";
import { toast } from "react-hot-toast";

interface DBCategory {
  _id: string;
  name: string;
  image?: string;
}

export default function CategoryWorkspace() {
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Category name is required!");
    
    const formData = new FormData();
    formData.append("name", name);
    if (selectedFile) formData.append("images", selectedFile);

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData);
        toast.success("Category updated successfully!");
      } else {
        if (!selectedFile) return toast.error("Image required for new category!");
        await categoryService.createCategory(formData);
        toast.success("Category added successfully!");
      }
      resetForm();
      loadCategories();
    } catch (err) {
      toast.error("Action failed! Check logs.");
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedFile(null);
    setEditingId(null);
  };

  const startEdit = (c: DBCategory) => {
    setEditingId(c._id);
    setName(c.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Category Management</h2>
        <p className="text-stone-500">Add or update your collection circles.</p>
      </div>

      {/* Form Section */}
      <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm space-y-4">
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Category Name..." 
          className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#9B1B1B]/20" 
        />
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} 
            className="text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#9B1B1B]/10 file:text-[#9B1B1B] hover:file:bg-[#9B1B1B]/20"
          />
          <button onClick={handleSubmit} className="bg-[#9B1B1B] text-white px-6 py-2 rounded-xl font-bold uppercase text-xs tracking-widest">
            {editingId ? "Update Circle" : "Append Circle"}
          </button>
          {editingId && <button onClick={resetForm} className="text-stone-400 text-xs">Cancel</button>}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="bg-white border p-4 rounded-2xl flex flex-col items-center hover:shadow-md transition">
            <img src={c.image} className="h-20 w-20 rounded-full object-cover border" alt={c.name} />
            <span className="font-semibold text-sm mt-3">{c.name}</span>
            <div className="flex gap-2 mt-3">
              <button onClick={() => startEdit(c)} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Edit</button>
              <button onClick={() => categoryService.deleteCategory(c._id).then(loadCategories)} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}