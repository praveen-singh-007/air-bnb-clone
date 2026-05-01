const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName : { type: String, required: [true, 'First Name is Required']},
    lastName : { type: String, required: [true, 'Last Name is Required'], unique: true},
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password : {type: String, required:[true, 'Password is required']},
    userType : {type: String, enum:['guest', 'host'], default: 'guest'},
    favourites : [{type: mongoose.Schema.Types.ObjectId, ref :"Home"}],
    bookings : [{
        home : {type: mongoose.Schema.Types.ObjectId, ref :"Home"},
        startDate : Date,
        duration : Number,
        notes : String,
        bookedAt: { type: Date, default: Date.now }
    }]
})


module.exports = mongoose.model("User", userSchema)