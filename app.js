require('dotenv').config();
const express = require("express");
const { userRouter } = require("./routes/userRouter");
const { hostRouter } = require("./routes/hostRouter");
const { authRouter } = require("./routes/authRouter");
const error = require("./controllers/error404");

const path = require("path");
const mongoose = require('mongoose');

const app = express();
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);

// Vercel sits behind a proxy, this is required for 'secure' cookies to work
app.set('trust proxy', 1);

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Legacy support for local uploads - Optional for Cloud version
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
app.use("/host/uploads", express.static(path.join(__dirname, 'uploads')));
app.use("/home-list/uploads", express.static(path.join(__dirname, 'uploads')));

const DB_URL = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || 'AirBnb';

// Connect to MongoDB immediately
mongoose.connect(DB_URL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log("Connected to Mongoose"))
.catch(err => console.error("MongoDB connection error:", err.message));

const store = new MongodbStore({
    uri: DB_URL,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 7 // 1 week
});

store.on('error', function(error) {
    console.log('Session store error:', error);
});

// Determine if running in production (Vercel sets this automatically)
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: isProduction, // Use secure cookies only in HTTPS/Production
        sameSite: 'lax'
    }
}));

app.use((req, res, next) => {
    // Nav bar state management
    if (req.session && req.session.isLoggedIn) {
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user || null;
    } else {
        res.locals.isLoggedIn = false;
        res.locals.user = null;
    }
    next();
});

// Routes
app.use(authRouter);
app.use(userRouter);
app.use(hostRouter);

// 404 Handler
app.use(error.showError);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).send('Something went wrong!');
});

// ENVIRONMENT-SPECIFIC STARTUP
if (process.env.NODE_ENV !== 'production') {
    // Only run the server listener locally. 
    // Vercel manages the listener on its own infrastructure.
    const PORT = process.env.PORT || 3004;
    app.listen(PORT, () => {
        console.log(`SERVER RUNNING AT http://localhost:${PORT}`);
    });
}

// CRITICAL: Export the app for Vercel's Serverless Functions
module.exports = app;