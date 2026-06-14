const userModel = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const tokenBlacklistModel = require("../models/blacklist.model")
const cookieParser = require("cookie-parser")

/**
 * @name registerUserController  
 * @description register a new user , expects username, email and password in the request 
 * @acess Public 
 */
async function registerUserController(req,res){
    try{
        const {username,email,password} = req.body

    if(!username || !email || !password){
        
        return res.status(400).json({
            message:"please provide username,eamil, password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{username},{email}]
    })

    if(isUserAlreadyExists){
       
        return res.status(400).json({
            message:"Account already exists with same email or username"
        })
    }
    const hash = await bcrypt.hash(password,10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id,username: user.username},
        process.env.JWT_SECRET,
        { expiresIn: "1d"}
    )
    res.cookie("token",token)

    res.status(201).json({
        message:"User registered successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}
    
    
    catch (error) {
        // THIS IS THE IMPORTANT PART: 
        // If anything above fails, this code runs and tells Postman what happened.
        console.error("Registration Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }

}

/**
 * @name loginUserController
 * @description login a user, exprects email
 * @access Public
 */
async function loginUserController(req,res){
    try {
        const {email,password} = req.body
        const user= await userModel.findOne({email})

        if(!user){
            return res.status(400).json({
                message:"Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password,user.password)

        if(!isPasswordValid){
            return res.status(400).json({
                message:"Invalid email or password"
            })
        }

        const token = jwt.sign(
            {id: user._id,username: user.username},
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        )

        res.cookie("token",token)
        res.status(200).json({
            message:"user loggedIn successfully",
            user:{
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}
/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req,res){
    try {
        const token = req.cookies.token

        if(token){
            await tokenBlacklistModel.create({token})
        }
        res.clearCookie("token")
        res.status(200).json({
            message:"user logged out successfully."
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

/**
 * @name getMeController
 * @description get current logged in user details.
 */
async function getMeController(req,res){
    try {
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message:"user details fetched successfully",
            user:{
                id:user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports = {registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}