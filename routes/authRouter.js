const express = require("express")
const authRouter = express.Router()
const path = require("path");
const getLoginDetails = require("../controllers/authController")
const postLoginDetails = require("../controllers/authController")
const postLogout = require("../controllers/authController")
const getRegister = require("../controllers/authController")
const postRegister = require("../controllers/authController")



authRouter.get("/login", getLoginDetails.getLoginDetails)

authRouter.post("/login", postLoginDetails.postLoginDetails)

authRouter.post("/logout", postLogout.postLogout)

authRouter.get("/register", getRegister.getRegister)

authRouter.post('/register', postRegister.postRegister)

exports.authRouter = authRouter