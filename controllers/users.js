const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuthError = require('../errors/auth-err');
const EmailExistsError = require('../errors/email-exists-err');
const RequestError = require('../errors/request-err');
const { userNotAuth, userEmailExists } = require('../utils/errors');

const { NODE_ENV, JWT_SECRET } = process.env;

// the getUser request handler
module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new AuthError(userNotAuth); // error thrown so .catch handles it instead .then
    })
    .then((user) => res.send(user))
    .catch(next);
};

// the createUser request handler
module.exports.createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    })
      .then((user) => {
        // eslint-disable-next-line no-underscore-dangle
        const { password: hashedPassword, ...userData } = user._doc;
        return res.send({ data: userData });
      })
      // .catch(next));
      .catch((err) => {
        if (err.code === 11000) {
          next(new EmailExistsError(userEmailExists));
        }
      })
      .catch(next));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(password, email)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });
      // we return the token
      res.send({ token });
    })
    // .catch(next));
    .catch((err) => next(new RequestError(err.message)));
};

// module.exports.updateProfile = (req, res, next) => {
//   const { name, about } = req.body;
//   User.findByIdAndUpdate(
//     req.user._id,
//     { name, about },
//     // pass the options object:
//     {
//       new: true, // the then handler receives the updated entry as input
//       runValidators: true, // the data will be validated before the update
//     },
//   )
//     .orFail(() => {
//       throw new AuthError('Not authorized'); // error thrown so .catch handles it instead .then
//     })
//     .then((card) => res.send({ data: card }))
//     .catch(next);
// };
