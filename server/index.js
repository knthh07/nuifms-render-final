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
  'https://nuifms-9d4130efadd1.herokuapp.com'
  // 'https://nuifms.netlify.app',
  // 'http://localhost:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('Request Origin:', origin); // Log the origin of the request
      if (!origin) return callback(null, true);  // Allow non-origin requests (like server-to-server)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        console.log(msg); // Log CORS error message
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Connect to the database
mongoose.connect(process.env.MONGODB_URI, { dbName: 'nuifms' })
  .then(() => console.log('Database Connected'))
  .catch((err) => console.log('Database not connected', err))


// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/api', authRoutes);
// app.use('/Uploads', express.static(path.join(__dirname, 'Uploads'))) - localhost
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
// - pag nasa host server na

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

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
