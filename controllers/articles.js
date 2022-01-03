const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const PermissionError = require('../errors/perm-err');
const RequestError = require('../errors/request-err');

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    // .orFail(() => {
    //   throw new NotFoundError('No articles found'); // error thrown to invoke .catch
    // })
    .then((article) => {
      res.send({ data: article });
    })
    .catch(next);
};

// the delete article handler
module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id)
    .orFail(() => {
      throw new NotFoundError('No article with matching ID found'); // Remember to throw an error so .catch handles it instead of .then
    })
    .then((article) => {
      if (!article.owner._id.equals(req.user._id)) {
        throw new PermissionError('Not authorized to delete a article that doesnt belong to you');
      }
      Article.findByIdAndRemove(req.params.id)
        .orFail(() => {
          throw new NotFoundError('No article with matching ID found'); // Remember to throw an error so .catch handles it instead of .then
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
    throw new RequestError('incorrect request for article creation');
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
