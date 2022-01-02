const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getArticles,
  deleteArticle,
  createArticle,
} = require('../controllers/articles');
const { validateUrl } = require('../utils/validate');

router.get('/', getArticles);
router.delete('/:id', celebrate({
  // validate parameters
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), deleteArticle);
router.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().required().custom(validateUrl),
    image: Joi.string().required().custom(validateUrl),
  }),
}), createArticle);

module.exports = router;
