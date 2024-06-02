const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../config/index");
const RefreshToken = require("../models/token");


class JWTService{
    // sign access token
   static signAccessToken(payload, expiryTime){
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: expiryTime});
    }
    // sign refresh token
    static signRefreshToken(payload, expiryTime){
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: expiryTime});
    }
    // verify access token
    static verifyAccessToken(token){
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }
    // verify refresh token
    static verifyRefreshToke(token){
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    }
    // save refresh token
    static async storeRefreshToken(token, userId){
        try {
            const newToken = newRefreshToken({
                token: token,
                userId: userId
            });
            // store new token in db
            await newToken.save();
        } catch (error) {

            console.log(error);
        }
    }
}

module.exports = JWTService;