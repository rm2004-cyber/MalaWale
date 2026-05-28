const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes'); 
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => console.log('📿 Sanwariya Cluster: MongoDB Cloud Connected Directly! 🔥'))
  .catch((err) => console.log('❌ DB Absolute Error:', err.message));

app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/feedback', feedbackRoutes); 
app.use('/api/order', orderRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/admin', adminRoutes);

app.use(express.static(path.join(__dirname, '../dist')));

app.use(express.static(path.join(__dirname, '../dist')));

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

let activeViewers = 0;

io.on('connection', (socket) => {
  activeViewers++;
  io.emit('liveViewersUpdate', { count: activeViewers });

  socket.on('disconnect', () => {
    activeViewers = activeViewers > 0 ? activeViewers - 1 : 0;
    io.emit('liveViewersUpdate', { count: activeViewers });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🔥 Server is running like a beast with Sockets on port ${PORT}`);
});