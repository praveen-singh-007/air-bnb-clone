const path = require("path");
const Home = require("../models/home");
const fs = require("fs")

exports.addHomes = (req, res, next) => {
    res.render("host/home-added", { editing: false, home: {} , isLoggedIn: res.locals.isLoggedIn, user: res.locals.user, currentPage: 'home-added'});
}

exports.getAddHomes = (req, res, next) => {
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);
    
    const imageArray = req.files ? req.files['image'] : undefined;
    const rulesArray = req.files ? req.files['rules'] : undefined;

    console.log("imageArray:", imageArray);
    console.log("rulesArray:", rulesArray);

    // // Validate that files were uploaded
    // if (!imageArray || imageArray.length === 0) {
    //     console.log("Error: No image file uploaded");
    //     return res.status(400).render("host/home-added", { 
    //         editing: false, 
    //         home: req.body,
    //         error: "Please upload a property photo",
    //         isLoggedIn: res.locals.isLoggedIn, 
    //         user: res.locals.user
    //     });
    // }

    // if (!rulesArray || rulesArray.length === 0) {
    //     console.log("Error: No rules file uploaded");
    //     return res.status(400).render("host/home-added", { 
    //         editing: false, 
    //         home: req.body,
    //         error: "Please upload a property rules PDF",
    //         isLoggedIn: res.locals.isLoggedIn, 
    //         user: res.locals.user
    //     });
    // }

    const imagePath = imageArray[0].path;
    const rulesPath = rulesArray[0].path;

    console.log("imagePath:", imagePath);
    console.log("rulesPath:", rulesPath);

    const {houseName,location, price, description, facing, instructions, contactEmail } = req.body
    
    const home = new Home({
        houseName, 
        location, 
        price, 
        description, 
        facing, 
        instructions,
        imageUrl: imagePath,
        rulesUrl : rulesPath,
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
            // res.status(500).render("host/home-added", { 
            //     editing: false, 
            //     home: req.body,
            //     error: "Database Save Failed: " + err.message,
            //     isLoggedIn: res.locals.isLoggedIn, 
            //     user: res.locals.user
            // });
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
    const { houseName, location, price, description, facing, instructions, contactEmail } = req.body
    
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

        if (req.files) {
            // 1. Handle Image Update
            if (req.files['image']) {
                const imagePath = req.files['image'][0].path;
                if (home.imageUrl) {
                    fs.unlink(home.imageUrl, (err) => {
                        if (err) console.log("Error deleting old image:", err);
                    });
                }
                home.imageUrl = imagePath;
            }

            // 2. Handle Rules Update
            if (req.files['rules']) {
                const rulesPath = req.files['rules'][0].path;
                if (home.rulesUrl) {
                    fs.unlink(home.rulesUrl, (err) => {
                        if (err) console.log("Error deleting old rules:", err);
                    });
                }
                home.rulesUrl = rulesPath;
            }
        }

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
