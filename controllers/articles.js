const Article = require('../models/article');
const { Messages } = require('../utils/messages');

const BadRequest = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found');
const Forbidden = require('../errors/forbidden');

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .populate('user')
    .then((articles) => res.send({ data: articles }))
    .catch(next);
};

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const userId = req.user._id;
  Article.create({
    keyword, title, text, date, source, link, image, owner: userId,
  })
    .then((article) => res.send({ data: article }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(Messages.articleValuesMissing));
      } else {
        next(new Error(Messages.serverError));
      }
    });
};

module.exports.deleteArticleById = (req, res, next) => {
  Article.findById(req.params.id)
    .orFail(new NotFoundError(Messages.articleNotFound))
    .then((article) => {
      const { owner } = article;
      if (req.user._id === owner.toString()) {
        Article.deleteOne(article)
          .then(() => res.status(200).send({ message: Messages.articleDeleted }));
      } else {
        throw new Forbidden(Messages.articleForbidden);
      }
    })
    .catch(next);
};
