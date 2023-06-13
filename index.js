const express = require("express")
const app = express()
const cors = require("cors")
const http = require('http').Server(app);
const config = require('./config').config;
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});
const mongoose = require('mongoose')
const mongo = require('./service/mongo')
const messageSchema = require('./schema/messageSchema');
const { setTimeout } = require("timers");

app.use(cors())

process.on('SIGINT', () => {
    mongoose.connection.close(function () {
        console.error('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

const compare = (a, b) =>{ 
    return a.date - b.date;
}

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`)

    socket.on("getMessages", async (channelId, callback) => {
        console.log('wysylam wiadomosci')
        let channel = mongoose.model('chat#' + channelId, messageSchema)
        let messages = null
        let count = await channel.count()
        messages = await channel.find().sort({"date":-1}).limit(20)
        messages.sort(compare)
        //console.log(messages[0].date)
        if(count<=20){
            callback({
                messages: messages,
                isMore: false
            })
        } else {
            callback({
                messages: messages,
                isMore: true
            })
        }
    })
 
    socket.on("getNextMessages", async (channelId, page, callback) => {
        let channel = mongoose.model('chat#' + channelId, messageSchema)
        let count = await channel.count()
        //let messages = await channel.find().skip(count - (20 * page)).limit(20 * (page - 1))
        let messages = await channel.find().sort({"date":-1}).skip(20*page).limit(20)
        messages.sort(compare)
        
        messages.forEach(element => {
            console.log(element)
        });
        // console.log(typeof(messages))
        if((count-20)>(page*20)){
            callback({
                messages: messages,
                isMore: true
            })
        } else {
            callback({
                messages: messages,
                isMore: false
            })
        }
        
    })

    socket.on("message", async (channelId, message, callback) => {
        console.log('odbieram wiadomosci')
        let channel = mongoose.model('chat#' + channelId, messageSchema)
        message.date = new Date( new Date().toLocaleString("en-GB", {timeZone: "Europe/London"}) )
        console.log(message.date)
        let qwe = await channel.create(message).then(result => result._id.toString())
        console.log(qwe)
        message._id = qwe
        socket.broadcast.emit("newMessage", message)
        callback({
            date: message.date, 
            _id: qwe 
        })

        
    })

    socket.on("messageDelete", async (channelId, messageId) => {
        let channel = mongoose.model('chat#' + channelId, messageSchema)
        try {
            console.log(messageId)
            await channel.findOneAndDelete({ "_id": messageId })
        } catch (error) {
            
        }
        
        socket.broadcast.emit("deleteMessage", messageId)
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        socket.disconnect()
    })
})

http.listen(config.port, async () => {
    console.log(`Server listening on ${config.port}`);
    await mongo().then((mongoose) => {
        console.log('connected to database')
    })
})