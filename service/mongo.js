const mongoose = require('mongoose')
const {mongoPath} = require('../config')

module.exports = async () => {
    await mongoose.connect(mongoPath,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    mongoose.set('strictQuery', false)
    return mongoose
}