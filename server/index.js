require('dotenv').config({ path: '.env' });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

const app = express();

// Set up CORS policy
const allowedOrigins = [
  'https://nuifms.onrender.com',
  // 'http://localhost:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);  // Allow non-origin requests (like server-to-server)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Set up Helmet with customized configurations
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'sha256-7ueFnx9h3jcj8eQsi8V63uwMZRUk48dNllg9RQlriYc='", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "https://res.cloudinary.com/dt3bksrzv/", "data:", "blob:"],
      connectSrc: ["'self'"],
      scriptSrcAttr: ["'self'"],
    },
  },
  frameguard: { action: 'deny' }, 
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'noSniff');
  next();
});

app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), fullscreen=()');
  next();
});

// Connect to the database
mongoose.connect(process.env.MONGODB_URI, { dbName: 'nuifms' })
  .then(() => console.log('Database Connected'))
  .catch((err) => console.log('Database not connected', err));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/api', authRoutes);
// app.use('/Uploads', express.static(path.join(__dirname, 'Uploads'))); // Optional, if you still use it for other files

app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Error handling middleware for CORS
app.use((err, req, res, next) => {
  if (err) {
    console.error('CORS Error:', err.message);
    res.status(500).send('CORS Error: ' + err.message);
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
