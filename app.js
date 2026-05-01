require('dotenv').config();
const express = require("express")
const {userRouter} = require("./routes/userRouter")
const {hostRouter} = require("./routes/hostRouter")
const {authRouter} = require("./routes/authRouter")
const error = require("./controllers/error404")

const path = require("path");
const { default: mongoose } = require('mongoose');

const app = express()
const session = require("express-session")
const MongodbStore = require("connect-mongodb-session")(session);

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static(path.join(__dirname, 'uploads')))
app.use("/host/uploads", express.static(path.join(__dirname, 'uploads')))
app.use("/home-list/uploads", express.static(path.join(__dirname, 'uploads')))


const DB_URL = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || 'AirBnb';

// Handle MongoDB connection - singleton pattern
const connectDB = async () => {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.log("Already connected to Mongoose");
        return;
    }
    
    try {
        await mongoose.connect(DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to Mongoose");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        throw err;
    }
};

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
        secure: isProduction, // Only use secure in production
        sameSite: 'lax'
    }
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

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).send('Something went wrong!');
});

// Start server
const startServer = async () => {
    await connectDB();
    
    // Use dynamic port for Vercel
    const PORT = process.env.PORT || 3004;
    
    const server = app.listen(PORT, () => {
        console.log(`SERVER RUNNING AT http://localhost:${PORT}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully...');
        server.close(() => {
            mongoose.connection.close(false, () => {
                console.log('Server closed');
                process.exit(0);
            });
        });
    });
};

startServer();

module.exports = app;
