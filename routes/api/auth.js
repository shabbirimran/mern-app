const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');

const { check, validationResult } = require('express-validator');
//@route GET api/auth
//@desc Test Route
//@access Public

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      console.log(user, 'user');
      res.json(user);
    } else {
      console.log('error');
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});
// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
// router.post(
//   '/',
//   check('email', 'Please include a valid email').isEmail(),
//   check('password', 'Password is required').exists(),
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;

//     try {
//       let user = await User.findOne({ email });

//       if (!user) {
//         return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);

//       if (!isMatch) {
//         return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
//       }

//       const payload = {
//         user: {
//           id: user.id,
//         },
//       };

//       jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '5 days' }, (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       });
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server error');
//     }
//   }
// );
// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/',
  [check('email', 'please input valid email').isEmail(), check('password', 'please write valid password').exists()],
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      console.log(err.message);
      res.status(500).send('error');
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Password' }] });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '2 hour' }, (error, token) => {
        if (error) throw error;
        res.json({ token });
      });
    } catch (err) {
      res.status(400).send({ err: 'server error' });
    }
  }
);
module.exports = router;
