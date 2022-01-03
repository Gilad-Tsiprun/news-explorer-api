const router = require('express').Router();

const NotFoundError = require('../errors/not-found-err');
const { pageNotFound } = require('../utils/errors');
router.use('/users', require('./users'));
router.use('/articles', require('./articles'));

router.use('*', () => {
  throw new NotFoundError(pageNotFound);
});

module.exports = router;
