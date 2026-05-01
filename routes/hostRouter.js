const express = require("express")
const path = require("path");
const { 
    addHomes, 
    getAddHomes, 
    getHomeListings, 
    getEditHomeList, 
    postEditHome, 
    postDeleteHome 
} = require("../controllers/hostAddHome")

const hostRouter = express.Router()

hostRouter.get("/host/home-added", addHomes);

hostRouter.post("/host/home-added", getAddHomes)

hostRouter.get("/host/manage-listing", getHomeListings)

hostRouter.get("/host/edit-home/:homeID", getEditHomeList)

hostRouter.post("/host/edit-home", postEditHome)

hostRouter.post("/host/delete-home/:homeId", postDeleteHome)

exports.hostRouter = hostRouter;

