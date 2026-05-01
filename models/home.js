// const { getDB } = require('../utils/database');
// const { ObjectId } = require('mongodb');

// module.exports = class Home {
//     constructor(houseName, location, price, description, facing, instructions, contactEmail, _id) {
//         this.houseName = houseName;
//         this.location = location;
//         this.price = price;
//         this.description = description;
//         this.facing = facing;
//         this.instructions = instructions;
//         this.contactEmail = contactEmail;
//         // Only convert to ObjectId if an ID exists (editing mode)
//         if (_id) {
//             this._id = new ObjectId(String(_id));
//         }
//     }

//     save() {
//         const db = getDB();
//         if (this._id) {
//             // Update existing
//             return db.collection("homes").updateOne({ _id: this._id }, { $set: this });
//         } else {
//             // Insert new
//             return db.collection("homes").insertOne(this);
//         }
//     }

//     static fetchAll() {
//         const db = getDB();
//         return db.collection("homes").find().toArray();
//     }

//     static findById(homeID) {
//         const db = getDB();
//         return db.collection("homes")
//             .find({ _id: new ObjectId(String(homeID)) })
//             .next();
//     }

//     static delete(homeId) {
//         const db = getDB();
//         return db.collection("homes").deleteOne({ _id: new ObjectId(String(homeId)) });
//     }
// }

const mongoose = require("mongoose")
// const favourite = require("./favourite")

const homeSchema = new mongoose.Schema({
    houseName : {type: String, required: true},
    location :{type: String, required: true},
    price : {type: Number, requires: true},
    description : String,
    facing : String,
    instructions :  String,
    imageUrl: {type: String, required: false},
    rulesUrl: {type: String, required: false},
    contactEmail : {type: String, required : true}

})

// homeSchema.pre('findOneAndDelete', async function (){
//     const homeId = this.getQuery()._id
//     await favourite.deleteMany({homeId: homeId})

// })

module.exports = mongoose.model("Home", homeSchema)

// this.houseName = houseName;
// //         this.location = location;
// //         this.price = price;
// //         this.description = description;
// //         this.facing = facing;
// //         this.instructions = instructions;
// //         this.contactEmail = contactEmail;