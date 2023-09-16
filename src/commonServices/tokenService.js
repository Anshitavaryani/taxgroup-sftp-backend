const jwt = require('jsonwebtoken')
const moment = require('moment')
const config = require('../config/config');

const { UserToken } = require('../models');
const { tokenTypes } = require('../config/token');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/db');


const generateToken = (userId, expires, type, user_type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        userType: user_type,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};


const saveToken = async (token, userId, user_type, expires, type, fcm_token) => {
    console.log(expires, "EXPIRED STRING" );
    let sql = `INSERT INTO user_tokens ( user_id, user_type, token_type, token, status, expired_at, created_at, updated_at, fcm_token) values (
	  '${userId}', '${user_type}', '${type}', '${token}', 1,'${expires}' ,now(), now(), '${fcm_token}')`;


    let tokenDoc = await sequelize.query(
        sql, {
        type: QueryTypes.INSERT
    });
    return tokenDoc;
};


const verifyToken = async (token, type) => {
    
    const payload = jwt.verify(token, config.jwt.secret);
    
    console.log("payload============<",payload)
    if (!payload) {
        throw new Error('Invalid Token');
    };
    const tokenDoc = await UserToken.findOne({
        where: {
            token: token,
            user_type: payload.userType,
            token_type: type,
            user_id: payload.sub,
            status: 1
        }
    });
    
    if (!tokenDoc) {
        throw new Error('Token not found , Please login');
    }
    return tokenDoc.dataValues;
};


const generateAuthTokens = async (user) => {
    let user_type = ""
    if(user.user_type === 'USER'){
        user_type = user.user_type
    }
    else{
        user_type = user.admin_type
    }
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS, user_type);

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH, user_type);
    await saveToken(refreshToken, user.id, user_type, moment().format('YYYY-MM-DD HH:mm:ss'),
    tokenTypes.REFRESH, user.fcm_token);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};


module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
};
