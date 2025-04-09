const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', passport.authenticate('local'), login);
router.post('/logout', logout);

module.exports = router;