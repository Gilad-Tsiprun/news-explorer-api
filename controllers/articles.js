const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const PermissionError = require('../errors/perm-err');
const RequestError = require('../errors/request-err');
const {
  articleNotFound,
  articleNotAuthToDelete,
  articleBadRequest,
} = require('../utils/errors');

module.exports.getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .then((article) => {
      res.send({ data: article });
    })
    .catch(next);
};

// the delete article handler
module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id).select('+owner')
    .orFail(() => {
      throw new NotFoundError(articleNotFound);
    })
    .then((article) => {
      if (!article.owner.equals(req.user._id)) {
        throw new PermissionError(articleNotAuthToDelete);
      }
      Article.findByIdAndRemove(req.params.id)
        .orFail(() => {
          throw new NotFoundError(articleNotFound);
        })
        .then((deletedArticle) => res.send({ data: deletedArticle }))
        .catch(next);
    })
    .catch(next);
};

// the createarticle request handler
module.exports.createArticle = (req, res, next) => {
  const {
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
  } = req.body;
  const owner = req.user._id;
  if (!keyword || !title || !text || !date || !source || !link || !image || !owner) {
    throw new RequestError(articleBadRequest);
  }

  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner,
  })
    .then((article) => {
      // eslint-disable-next-line no-underscore-dangle
      const { owner: articleOwner, ...articleData } = article._doc;
      return res.send({ data: articleData });
    })
    .catch(next);
};
