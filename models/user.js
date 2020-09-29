const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { Messages } = require('../utils/messages');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: Messages.emailRequired,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password, next) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(Messages.userNotFound));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error(Messages.authorizationFailed));
          }
          return user;
        });
    })
    .catch(next);
};

module.exports = mongoose.model('user', userSchema);
