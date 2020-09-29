const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { Messages } = require('../utils/messages');

const BadRequest = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found');
const Unauthorized = require('../errors/unauthorized');
const Conflict = require('../errors/conflict');

module.exports.login = (req, res, next) => {
  const { NODE_ENV, JWT_SECRET } = process.env;
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send(Messages.auhorizationSuccessful)
        .end();
    })
    .catch(() => {
      next(new Unauthorized(Messages.authorizationFailed));
    });
};

module.exports.createNewUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  if (!password) {
    return next(new BadRequest(Messages.passwordRequired));
  }
  if (password.length < 8) {
    return next(new BadRequest(Messages.passwordIsToShort));
  }
  return bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest(Messages.auhorizationRequired));
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new Conflict(Messages.userAlreadyExists));
      }
      return next(new Error('Произошла ошибка'));
    });
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError(Messages.userNotFound))
    .then((users) => res.send({ data: users }))
    .catch(next);
};
