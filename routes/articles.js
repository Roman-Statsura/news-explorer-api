const articleRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const { Messages } = require('../utils/messages');
const BadRequest = require('../errors/bad-request');
const {
  getArticles,
  createArticle,
  deleteArticleById,
} = require('../controllers/articles');

articleRouter.get('/', getArticles);

articleRouter.post('/', celebrate({
  body: Joi.object().keys({
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    keyword: Joi.string().required(),
    link: Joi.required().custom((value) => {
      if (!validator.isURL(value)) {
        throw new BadRequest(Messages.linkRequired);
      } else {
        return value;
      }
    }),
    image: Joi.required().custom((value) => {
      if (!validator.isURL(value)) {
        throw new BadRequest(Messages.imageRequired);
      } else {
        return value;
      }
    }),
  }),
}), createArticle);

articleRouter.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), deleteArticleById);

module.exports = articleRouter;
