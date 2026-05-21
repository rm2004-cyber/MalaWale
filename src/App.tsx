import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroBanner from './components/Herobanner';
import CategoryScroll from './components/CategoryScroll';
import ProductCard, { products } from './components/Productcard';
import ProductModal from './components/Productmodal';
import History from './components/History';
import DivineBackground from './components/DivineBackground';
import type { Product } from './components/Productcard';
import Footer from './components/Footer';
import Bestsellers from './components/Bestsellers';
import CollectionCircles from './components/CollectionCircles';
import TrendingShuffle from './components/TrendingShuffle';

// 🔥 Secret Admin Panel UI Import
import AdminDashboard from '../src/admin/Admindashboard';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter products for the featured section
  const filteredProducts = products.filter(
    (product) => selectedCategory === 'all' || product.category === selectedCategory
  );

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    setCartCount((count) => count + 1);
  };

  const handleModalAddToCart = () => {
    setCartCount((count) => count + 1);
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="relative bg-[#fff9f2] min-h-screen font-sans text-gray-800 antialiased">
      {/* ॐ Persistent Global Background Fluid Layer */}
      <DivineBackground />

      <Routes>
        {/* 🛒 PUBLIC DUKAAN ROUTE: Full user flow mapped cleanly */}
        <Route
          path="/"
          element={
            <>
              <Header cartCount={cartCount} favCount={0} />
              <HeroBanner />
              
              {/* Japam Format Bestsellers Section (Passing static/backend array safely) */}
              <Bestsellers />

              <CategoryScroll selected={selectedCategory} onSelect={setSelectedCategory} />

              {/* 📿 Featured Products Section */}
              <section className="container mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-[#8b4513]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Featured Products
                  </h2>
                  <span className="text-sm text-[#a07a5a] font-medium">{filteredProducts.length} items</span>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewDetails}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full rounded-3xl border border-orange-100 bg-white p-8 text-center text-sm text-[#8b4513]">
                      No products found in this category.
                    </div>
                  )}
                </div>
              </section>

              {/* Detailed Expandable Interactive Popup Modal Component */}
              <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={closeModal}
                onAddToCart={handleModalAddToCart}
              />

              {/* Circular Sourcing Inventory Push Collections */}
              <CollectionCircles />

              {/* Shuffle / Random Dynamic Discovery Section */}
              <TrendingShuffle
                onViewDetails={handleViewDetails}
                onAddToCart={handleAddToCart}
              />

              {/* Sanwariya Handicraft Brand Sourcing Trust Section */}
              <History />
              
              <Footer />
            </>
          }
        />

        {/* 🤫 SECRET ADMINISTRATIVE DASHBOARD ROUTE (Fully Isolated Layout) */}
        <Route path="/malawale2026-admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;