const path = require("path");


exports.showError = (req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "../", "views", "error.html"))
    console.log(path.join(__dirname,"../", "views", "error.html"))
}

