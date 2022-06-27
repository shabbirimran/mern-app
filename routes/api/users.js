const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route POST api/users
//@desc Register User
//@access Public

router.post(
  '/',
  [
    check('name', 'Name is require').not().isEmpty(),
    check('email', 'please include valid email').isEmail(),
    check('password', 'Please enter a password with 6 0r more character').isLength({ min: 6 }),
  ],
  async (req, res) => {
    // console.log(req, 'Chekciong');
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    //See if user exists

    const { name, email, password } = req.body;
    console.log(req.body, 'req.body');
    try {
      let user = await User.findOne({ email });
      console.log(user, 'user');
      if (user) {
        return res.status(400).json({ err: [{ msg: 'user is already exists' }] });
      }

      //get users avatar

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      console.log(user, 'newuser');
      console.log(password, 'new user');
      // encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      console.log(user.password, 'user.password');

      await user.save();
      //return jsonwebtokeny
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
      console.log(user, 'payload');
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);

module.exports = router;
