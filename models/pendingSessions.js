const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pendingSes = new Schema({
    deanId:{
        type:Number
    },
    stdId:{
        type:Number
    },
    name:{
        type:String
    },
    startDate:{
        type : Date
    }
})

const sessionsPending = mongoose.model('pendingsessions',pendingSes);
module.exports = sessionsPending;