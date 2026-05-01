
// const fs = require('fs')
// const path = require('path')
// module.exports = class Query{
//     constructor(query){
//         this.query = query
//     }

//     save(cb) {
//         Query.fetchAll((registeredQuery)=>{
//         registeredQuery.push(this);
//         const filePath = path.join(__dirname, "../", "data", "queryData.json");
//         fs.writeFile(filePath, JSON.stringify(registeredQuery), (err)=>{

//             {cb ? cb() : console.log(err)}
        
//         })})
        

//     }

//     static fetchAll(callback){
//         const filePath = path.join(__dirname, "../", "data", "queryData.json");
//         fs.readFile(filePath, (err, data)=>{
//             let queries = [];
//             if (!err && data && data.length > 0) {
//                 try {
//                     queries = JSON.parse(data);
//                 } catch (e) {
//                     console.log("Error parsing queryData.json:", e);
//                 }
//             }
//             callback(queries);
//         })
//     }
        
// }

const mongoose = require('mongoose')

const querySchema = mongoose.Schema({
    userQuery : {type: String, required: true},
    user : {type: mongoose.Schema.Types.ObjectId, ref: "User", requires: true},
    createdAt : {type: Date, default: Date.now}
})

module.exports = mongoose.model('Query', querySchema)