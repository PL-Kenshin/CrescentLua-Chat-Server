const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({

    userId:String,
    userName:String,
    date:Date,
    content:String
}) 

module.exports = messageSchema