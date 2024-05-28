const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');

const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const { email, password, firstName, lastName, image, country, frontBaseUrl} = req.body;
    const encriptedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        email,
        firstName,
        lastName,
        image,
        password: encriptedPassword,
        country
    });

    const code = require('crypto').randomBytes(32).toString('hex')
    const link = `${frontBaseUrl}${code}`;

    await EmailCode.create({
        code: code,
        userId: user.id,
    });

    await sendEmail({
        to: email,
        subject: "verificate email for user app",
        html: `
            <h1>hola ${firstName} ${lastName}</h1>
            <p>gracias por crear una cuenta con nosotros</p>
            <p>para verificar tu email </p>
            <a href="${link}">${link}</a>
        `
    });

    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const { email, firstName, lastName, image, country} = req.body;
    const result = await User.update(
        { email, firstName, lastName, image, country},
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const verifyCode = catchError(async(req, res) => {
    const { code } = req.params;
    const emailCode = await EmailCode.findOne({ where: { code : code}});
    if (!emailCode) return res.status(401).json({message: 'Invalid code '});

    const user = await User.findByPk(emailCode.userId);
    user.isVerified = true;
    await user.save();
    await emailCode.destroy();
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyCode
}