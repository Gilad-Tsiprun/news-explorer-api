const router = require('express').Router();
// const { celebrate, Joi } = require('celebrate'); // incase a name edit route is implemented
const {
  getUser,
} = require('../controllers/users');

router.get('/me', getUser);
// router.patch('/me', celebrate({
//   body: Joi.object().keys({
//     name: Joi.string().required().min(2).max(30),
//   }),
// }), updateProfile);

module.exports = router;
