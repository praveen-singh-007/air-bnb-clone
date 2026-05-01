const express = require("express")
const userRouter = express.Router()

const { 
    showAddedHomes, 
    contactQuery, 
    getContactQuery,
    getBookings,
    getFavourites,
    getHomeDetails,
    postFavourites,
    getUpdatedFavList,
    getRulesPdf,
    postBookings
} = require("../controllers/userPageRender");

userRouter.get("/", showAddedHomes)

userRouter.get("/contact", contactQuery);

userRouter.post("/contact", getContactQuery)

userRouter.get("/bookings", getBookings)

userRouter.post("/bookings", postBookings)

userRouter.get("/favourites", getFavourites)

userRouter.get("/home-list/:homeID", getHomeDetails)

userRouter.post("/favourites", postFavourites)

userRouter.post("/remove-favourites/:homeID", getUpdatedFavList )

userRouter.get("/download-rules/:homeID", getRulesPdf)


exports.userRouter = userRouter;
