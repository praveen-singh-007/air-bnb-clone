const path = require("path");
const Home = require("../models/home");
const Query = require("../models/query");
// const Favourite = require("../models/favourite");
const User = require("../models/user")


exports.showAddedHomes = (req, res, next) => {
    console.log("Sesion details", req.session)
    Home.find().then(registeredHomes => {
        res.render('store/home-list', { homes: registeredHomes, currentPage: 'home', isLoggedIn: res.locals.isLoggedIn, user: res.locals.user });
    }).catch(err => {
        console.log("Error fetching homes:", err);
        // next(err);
    });
};
    

exports.contactQuery = (req, res, next) => {
    Query.find({user  : req.session.user._id}).then(registeredQueries=>{
        res.render('contact', {userQueries: registeredQueries, currentPage: 'contact', isLoggedIn: res.locals.isLoggedIn, user: res.locals.user});
    }).catch(err=>{
        console.log("Error fetching queries:", err)
    })
}


exports.getContactQuery = (req, res, next) => {
    console.log("Customer Query Received:", req.body);
    const newQuery = new Query({userQuery : req.body.userQuery, user: req.session.user._id})
    newQuery.save().then(()=>{
    res.sendFile(path.join(__dirname, '../','views','query-submitted.html'))})
}

exports.getBookings = async (req, res, next)=>{
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate('bookings.home')

    if (req.session.user){
        req.session.user.bookings = user.bookings.map(booked=> booked.home._id.toString())
    }
    res.render('store/bookings', {currentPage:'bookings', isLoggedIn: res.locals.isLoggedIn, user: res.locals.user, bookedHomes : user.bookings})
}


exports.postBookings = async (req, res, next)=>{
    const homeId = req.body.homeID;
    const userId = req.session.user._id;
    const user = await User.findById(userId);   
    const { homeID, startDate, duration, notes } = req.body;

    const isAlreadyBooked = user.bookings.some(booked=> booked.toString() === homeId)

    if(!isAlreadyBooked){
        user.bookings.push({
    home: homeID,
    startDate: startDate,
    duration: duration,
    notes: notes
})
        await user.save()

        if(req.session.user){
            req.session.user.bookings = user.bookings.map(booked=> booked.toString())
        }
    }
    res.redirect("/bookings")

}


exports.getFavourites = async (req, res, next) =>{
    const userId = req.session.user._id
    const user = await User.findById(userId).populate('favourites')
    
    // Sync session with latest DB data
    if (req.session.user) {
        req.session.user.favourites = user.favourites.map(fav => fav._id.toString());
    }
    
    res.render('store/favourite-list', {currentPage:'favourites', favHomes: user.favourites, isLoggedIn: res.locals.isLoggedIn, user: req.session.user})
}

exports.getHomeDetails = (req, res, next)=>{
    const homeID = req.params.homeID;
    Home.findById(homeID).then(home=>{
        res.render('store/home-detail', { home: home, currentPage: "home" , isLoggedIn: res.locals.isLoggedIn, user: res.locals.user})
    }).catch(err=>{
        console.log("Error finding home:", err)
        // next(err);
    })
}

exports.postFavourites = async (req, res, next) => {
    const houseId = req.body.homeID;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    // Check if already favourite by comparing string versions
    const isAlreadyFavourite = user.favourites.some(fav => fav.toString() === houseId);
    
    if (!isAlreadyFavourite) {
        user.favourites.push(houseId);
        await user.save();
        
        // Also update session if it exists
        if (req.session.user) {
            req.session.user.favourites = user.favourites.map(fav => fav.toString());
        }
    }
    res.redirect("/favourites");
};

exports.getUpdatedFavList = async (req, res, next) => {
    const homeID = req.params.homeID;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    // Use some() for proper comparison of string vs ObjectId
    const isFavourite = user.favourites.some(fav => fav.toString() === homeID);
    
    if (isFavourite) {
        user.favourites = user.favourites.filter(fav => fav.toString() !== homeID);
        await user.save();
        
        // Also update session if it exists
        if (req.session.user) {
            req.session.user.favourites = user.favourites.map(fav => fav.toString());
        }
    }
    res.redirect("/favourites");
};



exports.getRulesPdf = [
    (req, res, next) => {
        if (!req.session.isLoggedIn) {
            return res.redirect("/login");
        }
        next();
    },
    (req, res, next) => {
        // 1. Get ID from params (matching your <a> tag link)
        const homeID = req.params.homeID;

        Home.findById(homeID)
            .then(home => {
                const filePath = path.join(process.cwd(), home.rulesUrl)

                res.download(filePath, 'Rules.pdf');
            })
            .catch(err => {
                console.log(err);
                res.status(500).send("File not found");
            });
    }
];

