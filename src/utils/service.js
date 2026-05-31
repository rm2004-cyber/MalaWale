import axios from 'axios';

const API_BASE_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api' 
  : '/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  firebaseLogin: (data) => api.post('/auth/firebase-login', data),
};

export const productService = {
  getAllProducts: () => api.get('/product/all'),
  getBestsellers: () => api.get('/product/bestsellers'),
  getTrendingBase: () => api.get('/product/trending-base'),
searchProducts: (queryStr) => api.get('/product/search', { params: { keyword: queryStr } }),  createProduct: (formData) => api.post('/product/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, formData) => api.put(`/product/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id) => api.delete(`/product/delete/${id}`),
  toggleStock: (data) => api.put('/product/admin/toggle-stock', data),
};

export const cartService = {
  getCart: () => api.get('/cart/get'),
  addToCart: (data) => api.post('/cart/add', data),
  removeFromCart: (data) => api.post('/cart/remove', data),
  updateQuantity: (data) => api.put('/cart/update-quantity', data),
};

export const orderService = {
  placeOrder: (data) => api.post('/order/place', data),
  getUserOrders: () => api.get('/order/my-orders'),
  updateOrderStatus: (data) => api.put('/order/admin/update-status', data),
  cancelOrder: (data) => api.post('/order/customer-cancel', data),
  rejectOrder: (data) => api.post('/order/admin-reject', data),
};

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getAllOrders: (page) => api.get(`/admin/orders?page=${page}`),
};

export const couponService = {
  createCoupon: (data) => api.post('/coupon/create', data),
  getAllCoupons: () => api.get('/coupon/all'),
  deleteCoupon: (id) => api.delete(`/coupon/delete/${id}`),
  validateCoupon: (data) => api.post('/coupon/validate', data),
};

export const paymentService = {
  createOrder: (data) => api.post('/payment/create', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
};
export const bannerService = {
  getBanners: () => api.get('/banner/all'),
  createBanner: (formData) => api.post('/banner/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateBanner: (id, formData) => api.put(`/banner/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteBanner: (id) => api.delete(`/banner/delete/${id}`),
};

export const bannerService1 = {
  getBanners: () => api.get('/banner/all'),
  
  // Header hata diya hai, Axios apne aap sahi "Content-Type" aur "boundary" set kar dega
  createBanner: (formData) => api.post('/banner/create', formData),
  
  // Update mein bhi same
  updateBanner: (id, formData) => api.put(`/banner/update/${id}`, formData),
  
  deleteBanner: (id) => api.delete(`/banner/delete/${id}`),
};
export const categoryService = {
  getCategories: () => api.get('/category/all'),
  createCategory: (formData) => api.post('/category/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCategory: (id, formData) => api.put(`/category/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCategory: (id) => api.delete(`/category/delete/${id}`),
};

export const reviewService = {
  addReview: (data) => api.post('/review/add', data),
  getProductReviews: (productId) => api.get(`/review/product/${productId}`),
};

export const favoriteService = {
  toggleFavorite: (data) => api.post('/favorite/toggle', data),
  getFavorites: () => api.get('/favorite/all'),
};

export const feedbackService = {
  submitFeedback: (data) => api.post('/feedback/submit', data),
  getAllFeedbacks: () => api.get('/feedback/all'),
};

export default api;