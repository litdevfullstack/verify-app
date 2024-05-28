const EmailCode = require('./EmailCode')
const user = require('./User')

EmailCode.belongsTo(user);
user.hasOne(EmailCode);