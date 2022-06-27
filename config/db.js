const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectdb = async () => {
  try {
    await mongoose.connect(db, {
      useNewURLParser: true,
    });
    console.log('mongo db connected');
  } catch (err) {
    console.error(err.message);
    //exit process with failure
    process.exit(1);
  }
};
module.exports = connectdb;
