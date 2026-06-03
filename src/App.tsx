"use client";

import { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroBanner from './components/Herobanner';
import CategoryScroll from './components/CategoryScroll';
import ProductCard, { products as fallbackProducts } from './components/Productcard';
import ProductModal from './components/Productmodal';
import History from './components/History';
import DivineBackground from './components/DivineBackground';
import type { Product } from './components/Productcard';
import type { CollectionItem } from './components/CollectionCircles';
import Footer from './components/Footer';
import Bestsellers from './components/Bestsellers';
import CollectionCircles from './components/CollectionCircles';
import TrendingShuffle from './components/TrendingShuffle';
import AdminDashboard from '../src/admin/Admindashboard';
import TrackOrder from './components/TrackOrder';
import { productService, cartService } from './utils/service';
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import { Toaster, toast } from "react-hot-toast";

// ─── Helper: scroll to the products grid ────────────────────────────────────
function scrollToProducts() {
  const el = document.getElementById("featured-products-section");
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

// ─── Smart URL Category Interceptor Wrapper ──────────────────────────────────
function HomeShopPortal({
  liveProducts,
  cartCount,
  handleProductSelectFromHeader,
  handleViewDetails,
  handleAddToCart,
  selectedProduct,
  isModalOpen,
  closeModal,
  handleModalAddToCart,
}: any) {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchProductIdFilter, setSearchProductIdFilter] = useState<string | null>(null);

  useEffect(() => {
    if (categorySlug) {
      setSearchProductIdFilter(null);
      setSelectedCategory(categorySlug);
      setTimeout(scrollToProducts, 500);
    } else {
      setSelectedCategory("all");
    }
  }, [categorySlug]);

  const filteredProducts = liveProducts.filter((product: Product) => {
    if (searchProductIdFilter) {
      return product._id === searchProductIdFilter || String(product.id) === searchProductIdFilter;
    }

    const categoryId =
      product?.category && typeof product.category === "object"
        ? String((product.category as any)?._id || (product.category as any)?.id || "")
        : String(product?.category ?? "");

    const categoryName =
      product?.category && typeof product.category === "object"
        ? (product.category as any)?.name ?? ""
        : String(product?.category ?? "");

    const slugifiedName = categoryName.toLowerCase().replace(/\s+/g, "-");

    return (
      selectedCategory === "all" ||
      categoryId === selectedCategory ||
      categoryName === selectedCategory ||
      slugifiedName === selectedCategory
    );
  });

  const handleCategoryChangeAction = (cat: string) => {
    if (cat === "all") {
      navigate("/");
    } else {
      navigate(`/category/${cat}`);
    }
    setTimeout(scrollToProducts, 120);
  };

  const handleCollectionClick = (item: CollectionItem) => {
    const filterKey = String(item.id);
    setSearchProductIdFilter(null);
    setSelectedCategory(filterKey);
    setTimeout(scrollToProducts, 80);
  };

  return (
    <>
      <Header
        cartCount={cartCount}
        favCount={0}
        onProductSelect={handleProductSelectFromHeader}
        onCategoryChange={handleCategoryChangeAction}
      />
      <HeroBanner />

      <Bestsellers onViewDetails={handleViewDetails} onAddToCart={handleAddToCart} />

      <CategoryScroll selected={selectedCategory} onSelect={handleCategoryChangeAction} />

      <section
        id="featured-products-section"
        className={`container mx-auto px-4 py-10 transition-all duration-500 ${
          searchProductIdFilter ? "bg-[#fdf4e7] rounded-3xl my-6 border border-[#D4AF37]/20 px-6" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#9B1B1B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {searchProductIdFilter ? "🔍 Your Search Result" : "Featured Products"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#a07a5a] font-medium">{filteredProducts.length} items</span>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => { setSelectedCategory("all"); setSearchProductIdFilter(null); navigate("/"); }}
                className="px-3 py-1.5 text-xs font-bold rounded-full bg-[#9B1B1B] text-white border border-[#9B1B1B] hover:bg-[#D84315] transition shadow-md cursor-pointer"
              >
                ✕ View All
              </button>
            )}
            {searchProductIdFilter && (
              <button
                type="button"
                onClick={() => setSearchProductIdFilter(null)}
                className="px-3 py-1.5 text-xs font-bold rounded-full bg-[#9B1B1B] text-white border border-[#9B1B1B] hover:bg-[#D84315] transition shadow-md cursor-pointer"
              >
                ✕ View All Products
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product: Product) => (
            <div
              key={product._id || product.id}
              id={`product-card-${product._id || product.id}`}
              className={searchProductIdFilter ? "scale-105 transition-transform duration-300" : ""}
            >
              <ProductCard
                product={product}
                onViewDetails={handleViewDetails}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full rounded-3xl border border-orange-100 bg-white p-8 text-center text-sm text-[#9B1B1B]">
              No products found in this category.
            </div>
          )}
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddToCart={handleModalAddToCart}
      />

      <CollectionCircles onItemClick={handleCollectionClick} />

      <TrendingShuffle onViewDetails={handleViewDetails} onAddToCart={handleAddToCart} />

      <History />
      <Footer onCategorySelect={(id: string) => { setSelectedCategory(id); setTimeout(scrollToProducts, 80); }} />
    </>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
function App() {
  const { user, setIsLoginOpen } = useAuth();
  const { cartCount, addToCart } = useCart() as any;
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);

  useEffect(() => {
  const currentHash = window.location.hash;

  // Agar URL mein "#/" hai aur wo admin path nahi hai, toh reset karo
  // iska matlab "#/category/", "#/products/", ya koi bhi aur path hoga to wo clean ho jayega
  if (currentHash !== "#/" && currentHash !== "" && !currentHash.includes("malawale2026-admin")) {
    window.location.hash = "/";
  }
}, []);
  useEffect(() => {
    async function fetchLiveProducts() {
      try {
        const response = await productService.getAllProducts();
        if (response?.data?.success) {
          setLiveProducts(response.data.products || []);
        } else {
          setLiveProducts(fallbackProducts);
        }
      } catch (error) {
        console.error(error);
        setLiveProducts(fallbackProducts);
      }
    }
    fetchLiveProducts();
  }, []);

  useEffect(() => {
    if (location.pathname === "/track-order" && !user) {
      toast.error("You have to login first! 🙏");
      navigate("/");
      if (setIsLoginOpen) setIsLoginOpen(true);
    }
  }, [location.pathname, user, navigate, setIsLoginOpen]);

  const handleProductSelectFromHeader = (name: string, id: string) => {
    const matched = liveProducts.find(p => p._id === id || String(p.id) === id);
    if (matched) {
      setSelectedProduct(matched);
      setIsModalOpen(true);
      
      if (location.pathname !== "/" && !location.pathname.startsWith("/category")) {
        navigate("/");
      }
      setTimeout(scrollToProducts, 120);
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {};

  const handleModalAddToCart = () => {
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const sharedProps = {
    liveProducts, cartCount,
    handleProductSelectFromHeader, handleViewDetails, handleAddToCart,
    selectedProduct, isModalOpen, closeModal, handleModalAddToCart,
  };

  return (
    <div className="relative bg-[#FCF8F2] min-h-screen font-sans text-gray-800 antialiased">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2500,
          style: { background: "#9B1B1B", color: "#fff", border: "1px solid #D4AF37", zIndex: 999999 },
        }}
      />
      <DivineBackground />

      <Routes>
        <Route path="/" element={<HomeShopPortal {...sharedProps} />} />
        <Route path="/category/:categorySlug" element={<HomeShopPortal {...sharedProps} />} />

        <Route
          path="/track-order"
          element={
            user ? (
              <>
                <Header
                  cartCount={cartCount}
                  favCount={0}
                  onProductSelect={handleProductSelectFromHeader}
                  onCategoryChange={(cat) => navigate(`/category/${cat}`)}
                />
                <div className="pt-28 pb-12 bg-gradient-to-b from-[#FCF8F2] to-[#fff3e8] min-h-[85vh]">
                  <TrackOrder />
                </div>
                <Footer />
              </>
            ) : (
              <div className="min-h-screen bg-[#FCF8F2]" />
            )
          }
        />

        <Route path="/malawale2026-admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;