const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');
const Profile = require('../../models/Profile');

//@route GET api/profile/me
//@desc Get current user profile
//@access Private

router.get('/me', auth, async (req, res) => {
  try {
    // const token = req.header('x-auth-token');
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    // res.json(token);
    console.log(req.user, 'iduser');
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//@route POST api/profile
//@desc Create Or Update user profile
//@access Private

router.post(
  '/',
  [
    auth,
    [check('status', 'status is required').not().isEmpty(), check('skills', 'skills is required').not().isEmpty()],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    console.log(req.body);
    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (bio) profileFields.bio = bio;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }
    console.log(company, 'company');

    //build profile social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
        return res.json(profile);
      }
      ///create profile
      profile = new Profile(profileFields);
      await profile.save();
      console.log(profileFields, 'profields');
      console.log(profile, 'profile');
      res.json(profile);
    } catch (err) {
      console.log(err, 'checking error');
      res.status(500).send('server error');
    }
  }
);

//@route GET api/profile/
//@desc GET ALL profile
//@access Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).send('server error');
  }
});

//@route GET api/profile/user/:user_id
//@desc GET ALL user id
//@access Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
    if (!profile) return res.status(400).json({ msg: 'there is no profile for this user' });
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'profile not found' });
    }
    res.status(500).send('server error');
  }
});
//@route delete api/profile
//@desc delete profile user & posts
//@access Private

router.delete('/', auth, async (req, res) => {
  try {
    //@todo -remove user posts
    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove user id
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'user delete' });
  } catch (err) {
    console.log(err);
    res.status(500).send('server error');
  }
});
//@route put api/profile/exprience
//@desc add profile experience
//@access Private
router.put(
  '/exprience',
  [
    auth,
    [
      check('title', 'title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { title, company, location, from, to, current, description } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(400).send('server error');
    }
  }
);

//@route delete api/profile/exprience/:exp_id
//@desc delete experience from  profile
//@access Private

router.delete('/exprience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get remove index
    const removeIndex = profile.experience.map((item) => item.id.indexOf(req.params.exp_id));
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(400).send('server error');
  }
});

// @route put api/profile/education
// @desc add profile education
// @access Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required').not().isEmpty(),
      check('degree', 'degree is required').not().isEmpty(),
      check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
      check('from', 'From is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(400).send('server error');
    }
  }
);

//@route delete api/profile/education/:exp_id
//@desc delete experience from  profile
//@access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get remove index
    const removeIndex = profile.education.map((item) => item.id.indexOf(req.params.edu_id));
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(400).send('server error');
  }
});
//@route delete api/profile/github/:username
//@desc get user repos from github
//@access Public
router.get('/github/:username', (req, res) => {
  try {
    const option = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:
      asc&client_id=${config.get('githubUserID')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };
    request(option, (error, response, body) => {
      if (error) console.error(error);

      if (response.status !== 200) {
        res.status(404).json({ msg: 'no github profile found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).send('server error');
  }
});

module.exports = router;
