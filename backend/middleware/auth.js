const jwt = require("jsonwebtoken");
const User = require("../models/user");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");

const auth = async (req, res, next) => {
    // 1. refresh/access token validtion
    const {accessToken, refreshToken} = req.cookies;

    if(!accessToken || !refreshToken){
        const error = {
            status: 401,
            message: "unauthurized"
        }
        return next(error);
    }

    let _id;

    try {
        _id = JWTService.verifyAccessToken(accessToken);
    } catch (error) {
        return next(error);
    }
    
    try {
        
    } catch (error) {
        
    }
}
