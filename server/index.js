require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

const app = express();

// Set up CORS policy
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
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

// Connect to the database
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Database Connected'))
.catch(() => console.log('Database not connected', err))


// Middleware
app.use(express.json({limit : "10mb"}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/api', authRoutes);
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')))
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); - pag nasa host server na

// Error handling middleware for CORS
app.use((err, req, res, next) => {
  if (err) {
    console.error('CORS Error:', err.message);
    res.status(500).send('CORS Error: ' + err.message);
  } else {
    next();
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
