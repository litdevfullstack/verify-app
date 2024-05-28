const { getAll, create, getOne, remove, update, verifyCode } = require('../controllers/user.controller');
const express = require('express');

const userRouter = express.Router();

userRouter.route('/users')
    .get(getAll)
    .post(create);

userRouter.route('users/verify/:code')
    .get(verifyCode)

userRouter.route('/users/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = userRouter;