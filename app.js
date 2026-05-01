const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express = require("express")
const {userRouter} = require("./routes/userRouter")
const {hostRouter} = require("./routes/hostRouter")
const {authRouter} = require("./routes/authRouter")
const error = require("./controllers/error404")

const path = require("path");
const { default: mongoose } = require('mongoose');

const multer = require('multer')

const app = express()
const session = require("express-session")
const MongodbStore = require("connect-mongodb-session")(session);

app.set('view engine', 'ejs')
app.set('views', 'views')


const randomString = (length)=>{
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    file = ""

    for(let i =0; i<length; i++){
        file += characters.charAt(Math.floor(Math.random()* characters.length))
    }

    return file
}

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{

        if (file.fieldname === 'rules'){
            cb(null, "rules/")
        }else{
        cb(null, "uploads/")
        }
    },
    filename: (res, file, cb)=>{
        cb(null, randomString(10) + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb)=>{
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype ==='application/pdf'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const multerOptions = {
    storage,
    fileFilter
}
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(multer(multerOptions).fields([
    {name :'image', maxCount : 1},
    {name: 'rules', maxCount : 1}
]))
app.use("/uploads", express.static(path.join(__dirname, 'uploads')))
app.use("/host/uploads", express.static(path.join(__dirname, 'uploads')))
app.use("/home-list/uploads", express.static(path.join(__dirname, 'uploads')))




const DB_URL = process.env.MONGODB_URI;

const store = new MongodbStore({
    uri: DB_URL,
    collection: 'sessions'
});

store.on('error', function(error) {
    console.log('Session store error:', error);
});

app.use(session({
    secret: 'AirBnb',
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use((req, res, next) => {
    // Always set res.locals from session - this ensures nav bar works correctly
    if (req.session && req.session.isLoggedIn) {
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user || null;
    } else {
        res.locals.isLoggedIn = false;
        res.locals.user = null;
        
    }
    next();
})

app.use(authRouter)
app.use(userRouter)
app.use(hostRouter)

app.use(error.showError);

const PORT = 3004

mongoose.connect(DB_URL).then(() => {
    console.log("Connected to Mongoose")
    app.listen(PORT, () => {
        console.log(`SERVER RUNNING AT http://localhost:${PORT}`)
    })
}).catch(err => {
    console.log("Error occured", err)
})
