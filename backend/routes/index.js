const express = require('express');
const authController = require('../controller/authController');

const router = express.Router();

// testing
router.get('/test', (req,res) => res.json({msg:'Working!'}));
// user register
router.post('/register', authController.register);
// user login
router.post('/login', authController.login);

module.exports = router;






// mongodb+srv://rabia:<password>@cluster0.lhv27pr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
