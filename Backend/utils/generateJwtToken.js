const jwt = require('jsonwebtoken')

module.exports.generateJwtToken = async (payload) => {
    let token = await jwt.sign(payload, process.env.JWT_SECRET_KEY)
    return token
}