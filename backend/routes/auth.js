const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const User = require('../models/User');
const { imageUpload, videoUpload } = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register Super Admin
router.post('/register-superadmin', imageUpload.single('profilePic'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already used' });

    const hashed = await bcrypt.hash(password, 10);
    const profilePicPath = req.file ? `/uploads/${req.file.filename}` : '';

    const newUser = new User({
      name,
      email,
      password: hashed,
      profilePic: profilePicPath,
      role: 'superAdmin',
    });

    await newUser.save();
    res.status(201).json({ message: 'Super Admin registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Register Trainer
router.post('/register-trainer', authMiddleware, imageUpload.single('profilePic'), async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Only Super Admins can add trainers.' });

    const { name, email, password, course, salary, contactNumber, dateOfJoin } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const newTrainer = new User({
      name,
      email,
      password: hashed,
      profilePic: req.file ? `/uploads/${req.file.filename}` : '',
      role: 'trainer',
      course,
      salary,
      contactNumber,
      dateOfJoin
    });

    await newTrainer.save();
    res.status(201).json({ message: 'Trainer registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trainer name & id
router.get('/trainers', authMiddleware, async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' }, '_id name');
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trainers' });
  }
});

// Get all trainer details
router.get('/all-trainers', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Unauthorized' });
    const trainers = await User.find({ role: 'trainer' });
    res.status(200).json(trainers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainers' });
  }
});

// Delete trainer
router.delete('/trainer/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Unauthorized' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trainer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting trainer' });
  }
});

// Edit trainer
router.put('/trainer/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Unauthorized' });

    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedTrainer = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Trainer updated successfully', trainer: updatedTrainer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating trainer' });
  }
});



// Register Student
router.post('/register-student',
  authMiddleware,
  imageUpload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'documents', maxCount: 5 }]),
  async (req, res) => {
    try {
      if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Unauthorized' });

      const {
        name, email, password, age, course, parentName,
        parentOccupation, fee, coach,address,
        mobile, alternateMobile, dateOfJoin
      } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const profilePic = req.files.profilePic?.[0]?.filename || '';
      const documents = req.files.documents.map(doc => doc.filename);

      const student = new User({
        name, email, password: hashedPassword, age,
        profilePic, course, parentName, parentOccupation, address,
        mobile,
        alternateMobile,
        dateOfJoin,
        fee, coach, documents, role: 'student'
      });

      await student.save();
      res.status(201).json({ message: 'Student registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to register student' });
    }
  }
);
// Get all students (superAdmin only)
router.get('/all-students', authMiddleware, async (req, res) => {
  if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Unauthorized' });
  const students = await User.find({ role: 'student' });
  res.json(students);
});

// Update student with optional password
router.put('/student/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Unauthorized' });

  const updates = { ...req.body };
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  } else {
    delete updates.password;
  }

  await User.findByIdAndUpdate(req.params.id, updates);
  res.json({ message: 'Student updated successfully' });
});

// Delete student
router.delete('/student/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Unauthorized' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Student deleted successfully' });
});


// Get students by course
router.get('/students-by-course', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') return res.status(403).json({ message: 'Only trainers can access this route' });

    const trainer = await User.findById(req.user.id);
    if (!trainer || !trainer.course) return res.status(404).json({ message: 'Trainer or course not found' });

    const students = await User.find({ role: 'student', course: trainer.course }).select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Upload Video
router.post('/upload-video', authMiddleware, videoUpload.single('video'), async (req, res) => {
  try {
    if (req.user.role !== 'trainer') return res.status(403).json({ message: 'Only trainers can upload videos' });

    const { email, title } = req.body;
    const student = await User.findOne({ email, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.videos.push({
      title,
      url: `/uploads/videos/${req.file.filename}`,
    });

    await student.save();
    res.status(200).json({ message: 'Video uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Delete Video
router.delete('/delete-video', authMiddleware, async (req, res) => {
  const { email, url } = req.body;
  const student = await User.findOne({ email: email || req.user.email, role: 'student' });

  if (!student) return res.status(404).json({ message: 'Student not found' });

  student.videos = student.videos.filter(video => video.url !== url);
  await student.save();

  res.status(200).json({ message: 'Video deleted successfully' });
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

module.exports = router;
