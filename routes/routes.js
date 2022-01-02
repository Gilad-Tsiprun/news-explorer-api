const router = require('express').Router();

const NotFoundError = require('../errors/not-found-err');

router.get('*', () => {
  throw new NotFoundError('Page not found');
});

module.exports = router;
