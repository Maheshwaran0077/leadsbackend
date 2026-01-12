const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
 const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); 
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/videos', express.static('uploads/videos'));

const authRoutes = require('./routes/auth');
 app.use('/api/auth', authRoutes);
 
 mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('MongoDB connected');
  app.listen(5000, () => console.log('Server running on port 5000'));
})
.catch(err => console.error(err));
