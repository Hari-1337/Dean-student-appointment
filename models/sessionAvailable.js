const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sessionsAvailable  = new Schema({
    deanId:{
        type:Number,
        required:true
    },
    available_slots:{
        type:[Date],
        required:true
    },
})

const availableSchema = mongoose.model('sessionsavailable',sessionsAvailable)
module.exports=availableSchema