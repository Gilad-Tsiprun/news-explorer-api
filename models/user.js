const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'email is not valid',
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // doesn't return field in mongoose.model.find methods
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
  },
});

userSchema.path('email').validate((val) => validator.isEmail(val), 'Invalid Email');

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (password, email) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Incorrect email or password'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Incorrect email or password'));
          }
          return user; // now user is available
        });
    });
};

module.exports = mongoose.model('user', userSchema);
