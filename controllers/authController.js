const { check, validationResult } = require('express-validator');
const User = require("../models/user")
const bcrypt = require("bcryptjs")


exports.getLoginDetails = (req, res, next)=>{
    console.log("Login clicked")
    res.render("auth/login", {currentPage: "login", isLoggedIn: false, oldInput: {email:""}, errors: [], user: {}})
}

exports.postLoginDetails = async (req, res, next)=>{

    const {email, password} = req.body;
    const user = await User.findOne({email})

    if (!user){
        return res.status(422).render("auth/login",{
            currentPage : "login",
            isLoggedIn: false,
            errors : ["Invalid e-mail or password"],
            oldInput : {email},
            user: {}
    })
}

    const isSame = await bcrypt.compare(password, user.password);
    if (!isSame){
            return res.status(422).render("auth/login",{
            currentPage : "login",
            isLoggedIn: false,
            errors : ["Invalid e-mail or password"],
            oldInput : {email},
            user: {}
    })

    }
// Set logged in status FIRST
    req.session.isLoggedIn = true
    // Store plain user data instead of Mongoose document to avoid serialization issues
    // Make sure userType is explicitly set and stored
    // Convert favourites array to strings for consistent comparison
    const userFavourites = user.favourites ? user.favourites.map(fav => fav.toString()) : [];
    req.session.user = {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType || 'guest',  // Ensure userType is always set
        favourites: userFavourites
    }
    
    // Save session and wait for it to complete before redirecting
    await new Promise((resolve, reject) => {
        req.session.save((err) => {
            if (err) reject(err)
            else resolve()
        })
    })
    
    console.log("Session after login:", req.session)
    console.log("User type stored:", req.session.user.userType)
    
    res.redirect("/")
}


exports.postLogout = (req, res, next)=>{
    req.session.destroy(()=>{
          res.redirect("/login")

    })
  

}
exports.getRegister = (req, res, next)=>{
    res.render("auth/register", {
            currentPage : "register",
            isLoggedIn: false,
            errors: [],
            oldInput : {firstName: "", lastName: "", email: "", password: "", userType: "guest", user : {}}

        })
}

exports.postRegister = [
    check('firstName')
    .trim()
    .isLength({min : 2})
    .withMessage("First Name must contain at least 2 Characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name must only contain Alphabets."),

    check('lastName')
    .trim()
    .isLength({min : 2})
    .withMessage("Last Name must contain at least 2 Characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name must only contain Alphabets."),

    check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),

    check('password')
    .isLength({min: 8})
    .withMessage("Password should be atleast 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain atleast one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain atleast one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain atleast one number")
    .matches(/[!@&]/)
    .withMessage("Password should contain atleast one special character")
    .trim(),

    check('confirm_password')
    .trim()
    .custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error("Passwords do not match")
        }
        return true
    }),

    check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(['guest', 'host'])
    .withMessage("Invalid user type"),

    check('terms')
    .notEmpty()
    .custom((value , {req})=>{
        if(value !== "on"){
            throw new Error("Please accept terms and conditions to continue further")
        }return true
    }),
    (req, res, next)=>{
    const {firstName, lastName, email, password, userType} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render("auth/register",{
            currentPage : "register",
            isLoggedIn: false,
            errors : errors.array().map(err=> err.msg),
            oldInput : {firstName, lastName, email, password, userType, user : {}}

        })
    }

    bcrypt.hash(password, 12).then(hashedPassword=>{
        const user = new User({firstName, lastName, email, password: hashedPassword, userType});
        return user.save()
    }).then(()=>{
        res.redirect("/login")
    }).catch(err=>{
        res.status(422).render("auth/register", {
            currentPage: 'register',
            isLoggedIn: false,
            errors : [err.msg],
            oldInput : {firstName, lastName, email, password, userType, user:{}}
        })
    })
    

    
}]
