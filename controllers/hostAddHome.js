const path = require("path");
const Home = require("../models/home");
const fs = require("fs")

exports.addHomes = (req, res, next) => {
    res.render("host/home-added", { editing: false, home: {} , isLoggedIn: res.locals.isLoggedIn, user: res.locals.user, currentPage: 'home-added'});
}

exports.getAddHomes = (req, res, next) => {

    const {houseName,location, price, description, facing, instructions, contactEmail, image, rules } = req.body
    
    const home = new Home({
        houseName, 
        location, 
        price, 
        description, 
        facing, 
        instructions,
        imageUrl: image,
        rulesUrl : rules,
        contactEmail,
        hostId: req.session.user._id
    });

    home.save()
        .then(() => {
            console.log("Save successful, redirecting...");
            return res.redirect("/host/manage-listing"); 
        })
        .catch(err => {
            console.log("Save error:", err);

        });
};

exports.getHomeListings = (req, res, next) => {
    Home.find()
        .then(registeredHomes => {
            res.render('host/manage-listing', { homes: registeredHomes, isLoggedIn: res.locals.isLoggedIn, user: res.locals.user, currentPage: 'manage-listing'});
        })
        .catch(err => {
            console.log("Error fetching listings:", err);
            // next(err);
        });
}

exports.getEditHomeList = (req, res, next) => {
    const homeId = req.params.homeID;
    const param = req.query.editing === "true";

    Home.findById(homeId)
        .then(home => {
            if (!home) {
                return res.redirect("/host/manage-listing");
            }
            res.render("host/home-added", { editing: param, home: home, isLoggedIn: res.locals.isLoggedIn, user: res.locals.user, currentPage: 'home-added'});
        })
        .catch(err => {
            console.log("Error finding home to edit:", err);
            // next(err);
        });
}

exports.postEditHome = (req, res, next) => {
    const homeId = req.body.homeId
    const { houseName, location, price, description, facing, instructions, contactEmail, imageUrl, rulesUrl } = req.body
    
    Home.findById(homeId).then((home) => {
        if (!home) {
            return res.redirect("/host/manage-listing");
        }

        home.houseName = houseName;
        home.location = location;
        home.price = price;
        home.description = description;
        home.facing = facing;
        home.instructions = instructions;
        home.contactEmail = contactEmail;
        if(imageUrl) home.imageUrl = imageUrl;
        if(rulesUrl) home.rulesUrl = rulesUrl    

        // MOVE REDIRECT INSIDE HERE
        return home.save().then(result => {
            console.log("Home updated", result);
            res.redirect("/host/manage-listing"); // Browser stops spinning now
        });

    }).catch(err => {
        console.log("Error", err);
        res.redirect("/host/manage-listing"); // Redirect even on error to stop the spin
    });
}

exports.postDeleteHome = (req, res, next) => {
    const homeId = req.params.homeId;
    Home.findByIdAndDelete(homeId)
        .then(() => {
            res.redirect("/host/manage-listing");
        })
        .catch(err => {
            console.log("Error deleting home:", err);
            // next(err);
        });
}
