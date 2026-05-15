const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDatabase();

// Route files
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const walletRoutes = require('./routes/walletRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const materialRoutes = require('./routes/materialRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
const corsOriginFn = function (origin, callback) {
  if (!origin) return callback(null, true);
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL,
  ].filter(Boolean);
  if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(
  cors({
    origin: corsOriginFn,
    credentials: true,
  })
);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Karyfix API is running',
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start HTTP server and Socket.io when not on Vercel
if (!process.env.VERCEL) {
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: corsOriginFn,
      credentials: true,
    },
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join booking room
    socket.on('join-booking', (bookingId) => {
      socket.join(`booking-${bookingId}`);
      console.log(`User ${socket.id} joined booking room: ${bookingId}`);
    });

    // Leave booking room
    socket.on('leave-booking', (bookingId) => {
      socket.leave(`booking-${bookingId}`);
      console.log(`User ${socket.id} left booking room: ${bookingId}`);
    });

    // Handle location updates (technician sharing location for a specific booking)
    socket.on('update-location', (data) => {
      const { bookingId, coordinates } = data;
      io.to(`booking-${bookingId}`).emit('location-updated', coordinates);
    });

    // Join technician-specific room for receiving job requests
    socket.on('join-technician', (technicianId) => {
      if (technicianId) {
        socket.join(`technician-${technicianId}`);
        console.log(`User ${socket.id} joined technician room: ${technicianId}`);
      }
    });

    // Handle technician real-time location updates
    socket.on('technician-location-update', async (data, callback) => {
      const { technicianId, coordinates } = data;
      try {
        if (!technicianId || !coordinates) {
          if (typeof callback === 'function') callback({ success: false, error: 'Missing data' });
          return;
        }
        const TechnicianProfile = require('./models/TechnicianProfile');
        await TechnicianProfile.findOneAndUpdate(
          { userId: technicianId },
          {
            $set: {
              'currentLocation.type': 'Point',
              'currentLocation.coordinates': coordinates,
              'currentLocation.updatedAt': new Date()
            }
          },
          { upsert: true } // Creates profile if it doesn't exist
        );
        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        console.error('Socket location update error:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Make io accessible to routes
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}

// Export for Vercel serverless function
module.exports = app;
