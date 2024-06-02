const Joi = require("joi");
const errorHandler = require("../middleware/errorHandler");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");
const RefreshToken = require("../models/token")

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
    async register(req, res, next) {
        // 1.Validate User Input
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });
        const {error} = userRegisterSchema.validate(req.body);
        // 2.if error in validation return error via middleware
        if(error){
            return next(error);
        }
        // 3.If username or email is already registered -> return an error
        const { username, name, email, password } = req.body;
        // 4.Check if email already registered
        try {
            const emailInUse = await User.exists({email});
            
            const usernameInUse = await User.exists({username});

                if (emailInUse){
                    const error = {
                        status: 409,
                        message: 'Email already registered, use another email',
                    }
                    return next(error);   
                }

                if (usernameInUse){
                    const error = {
                        status : 409,
                        message: 'Username not available, choose another',
                    }
                    return next(error);
                }
        } catch (error) {

            return next(error);
        }
        // 4.password Hash
        const hashedPassword = await bcrypt.hash(password, 10); 

        // 5.Store user data in db
        let accessToken;
        let refreshToken;
        let user;

         try {
            const userToRegister = new User({
                // if key and value same then only one can be used
                username,
                email,
                name,
                password: hashedPassword
            }); 
           user =  await userToRegister.save();

        //   token genertion
        accessToken = JWTService.signAccessToken({_id: user._id, username: user.username},'30m');

        refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m');

         } catch (error) {
            return next(error);
         }

        //  store refresh token in db
        await JWTService.storeRefreshToken(refreshToken, user._id);
        
        // send tokens in cookie
         res.cookie('accessToken', accessToken, {
            maxAge: 1000*60*60*24,
            httpOnly: true
         });

         res.cookie('refreshToken', refreshToken, {
            maxAge: 1000*60*60*24,
            httpOnly: true
         });
        
        // 6. respoonse send
        const userDto = new UserDTO(user);

        return res.status(201).json({user: userDto, auth: true});
    },
    async login(req, res, next) {
        // 1.validate user input
        // we expect input data to be in such shape
        const userLoginSchema = Joi.object({
            username: Joi.string().max(30),
            password: Joi.string().pattern(passwordPattern)
        });
        
        const {error} = userLoginSchema.validate(req.body);

        if (error){
            return next(error);
        }

        const {username, password} = req.body;
        // const username = req.body.username
        // const password = req.body.password
        let user;
        try {
            // match username
         user = await User.findOne({username: username});

            if(!user){
                const error = {
                    status: 401,
                    message: "Invalid Username or Password"
                }
                return next(error);
            }
            // match password
            // red.body.password -> hash -> match
            const match = await bcrypt.compare(password, user.password);

            if(!match){
                const error = {
                    status: 401,
                    message: "Invalid password"
                }
                return next(error);
            }
        } catch (error) {

            return next(error);
        }

        // To access more fields you can add here i.e:username:user.username, email:user.email etc
        const accessToken = JWTService.signAccessToken({_id: user._id}, '30m');
        const refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m');
        
        // update refresh Token in database
 
        try {
            await RefreshToken.updateOne({
                _id: user._id
            },
    
            {token: refreshToken},
            {upsert: true}  
            // above line: if it finds some matching record then updates it otherwise inserts new one    
        )
            
        } catch (error) {
            return next(error);
        }
        

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

        res.cookie('refreshToken', refreshToken, {
            mxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

            const userDto = new UserDTO(user);
            
            return res.status(200).json({user: userDto, auth:true});
    },

    async logout(req, res, next){
        const {refreshToken} = req.cookies;

        try {
            await RefreshToken.deleteOne({token: refreshToken});
        } catch (error) {

            return next(error);
        }
        //  delete cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // response
        res.status(200).json({user: null, auth: false});
    }
}

module.exports = authController;