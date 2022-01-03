const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes/routes');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { limiter } = require('./middlewares/rateLimiter');
const { errorHandler } = require('./middlewares/errorHandler');
// include these before other routes

const { PORT = 3000 } = process.env;
const app = express();
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/news-explorerdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.options('*', cors()); // enable requests for all routes

app.use('/', limiter);

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required().min(6),
    email: Joi.string().required().email(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required().min(6),
    email: Joi.string().required().email(),
    name: Joi.string().required(),
  }),
}), createUser);
// routes up until this point don't require authentication,
app.use(auth); // from this point on all routes require authentication

app.use('/users', require('./routes/users'));
app.use('/articles', require('./routes/articles'));

app.use('/', routes);

app.use(errorLogger); // enabling the error logger

app.use(errors()); // celebrate error handler

// eslint-disable-next-line no-unused-vars
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port: ${PORT}`);
});
