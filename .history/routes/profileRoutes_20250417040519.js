// ProfileRoutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware');  // Middleware for user authentication

// Get Profile Data
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });  // Assuming req.user.id is set after login
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update Profile Data
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email, about, socialLinks, profilePic } = req.body;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new Profile({
        user: req.user.id,
        name,
        email,
        about,
        socialLinks,
        profilePic
      });
      await profile.save();
    } else {
      profile.name = name || profile.name;
      profile.email = email || profile.email;
      profile.about = about || profile.about;
      profile.socialLinks = socialLinks || profile.socialLinks;
      profile.profilePic = profilePic || profile.profilePic;

      await profile.save();
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add Profile Picture (Image upload)
router.post('/upload-profile-pic', authMiddleware, async (req, res) => {
  // Handle image upload logic (using libraries like multer or cloud storage)
  // Update profile with new profilePic URL
});

module.exports = router;
