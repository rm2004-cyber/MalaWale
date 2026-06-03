"use client";

import { useState, useEffect, useRef } from "react";
import { bannerService, categoryService } from "../utils/service";
import { toast } from "react-hot-toast";

interface DBBanner {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  categoryLink: { _id: string, name: string } | null;
  image: string;
}

export default function BannerWorkspace() {
  const [banners, setBanners] = useState<DBBanner[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", subtitle: "", description: "", tag: "", categoryLink: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [banRes, catRes] = await Promise.all([
        bannerService.getBanners(),
        categoryService.getCategories()
      ]);
      setBanners(banRes.data.banners || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      toast.error("Data load error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

const handleSaveBanner = async () => {
    if (!editingId && !selectedFile) {
        toast.error("Please select an image.");
        return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("subtitle", formData.subtitle);
    data.append("description", formData.description);
    data.append("tag", formData.tag);
    data.append("categoryLink", formData.categoryLink);
    
    if (selectedFile) {
        data.append("images", selectedFile); // Backend ka upload.single('images') yahi dhoond raha hai
    }

    try {
        setPublishing(true);
        // Yahan headers hata do, Axios ko handle karne do
        if (editingId) {
            await bannerService.updateBanner(editingId, data);
            toast.success("Banner updated!");
        } else {
            await bannerService.createBanner(data);
            toast.success("Banner published!");
        }
        clearForm();
        fetchData();
    } catch (err: any) {
        // Backend se aa raha error message print karo
        console.log(err.response?.data); 
        toast.error(err.response?.data?.message || "Upload failed");
    } finally {
        setPublishing(false);
    }
};

  const startEdit = (b: DBBanner) => {
    setEditingId(b._id);
    setFormData({
      title: b.title,
      subtitle: b.subtitle,
      description: b.description,
      tag: b.tag,
      categoryLink: b.categoryLink?._id || ""
    });
    setPreviewUrl(b.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this?")) return;
    try {
      await bannerService.deleteBanner(id);
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setFormData({ title: "", subtitle: "", description: "", tag: "", categoryLink: "" });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Banner" : "Add New Banner"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="border p-2 rounded-lg text-sm w-full" placeholder="Title*" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <input className="border p-2 rounded-lg text-sm w-full" placeholder="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
          <input className="sm:col-span-2 border p-2 rounded-lg text-sm w-full" placeholder="Description*" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <input className="border p-2 rounded-lg text-sm w-full" placeholder="Tag (e.g. Divine Collection)" value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} />
          <select className="border p-2 rounded-lg text-sm w-full bg-white" value={formData.categoryLink} onChange={(e) => setFormData({...formData, categoryLink: e.target.value})}>
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input
            type="file"
            className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-[#9B1B1B]/10 file:text-[#9B1B1B] hover:file:bg-[#9B1B1B]/20"
            style={{
              padding: "7px",
              borderRadius: "30px",
              border: "2px solid #ccc"
            }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFile(e.target.files[0]);
                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
        </div>
        {previewUrl && <img src={previewUrl} className="mt-4 w-full h-48 object-cover rounded-xl" />}
        <div className="flex gap-2 mt-4">
          <button onClick={handleSaveBanner} disabled={publishing} className="bg-[#9B1B1B] text-white px-6 py-2 rounded-lg text-sm font-bold">{publishing ? "Saving..." : "Save Banner"}</button>
          {editingId && <button onClick={clearForm} className="bg-stone-200 px-6 py-2 rounded-lg text-sm font-bold">Cancel</button>}
        </div>
      </div>

      <div className="grid gap-4">
        {banners.map((b) => (
          <div key={b._id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border sm:items-center">
            <img src={b.image} className="w-full sm:w-48 h-28 object-cover rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate">{b.title}</h3>
              <p className="text-sm text-stone-500 mt-1 line-clamp-2">{b.description}</p>
              <p className="text-xs font-bold text-[#9B1B1B] mt-2">{b.categoryLink?.name || "No Category"}</p>
            </div>
            <div className="flex sm:flex-col gap-3 sm:gap-2 justify-end sm:justify-start mt-2 sm:mt-0">
              <button onClick={() => startEdit(b)} className="text-blue-500 font-bold text-sm">Edit</button>
              <button onClick={() => handleDelete(b._id)} className="text-red-500 font-bold text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}