const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { login, createNewUser } = require('../controllers/users');
const users = require('./users');
const articles = require('./articles');
const auth = require('../middlewares/auth');

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
);

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  createNewUser,
);

router.use('/users', auth, users);
router.use('/articles', auth, articles);

module.exports = router;
