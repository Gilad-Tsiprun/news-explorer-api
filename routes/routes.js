const router = require('express').Router();

const NotFoundError = require('../errors/not-found-err');
router.use('/users', require('./users'));
router.use('/articles', require('./articles'));

router.get('*', () => {
  throw new NotFoundError('Page not found');
});

module.exports = router;
