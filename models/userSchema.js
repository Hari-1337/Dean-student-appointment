const mongoose = require('mongoose');
const Schema = mongoose.Schema

const user = new Schema({
    userId :{
        type : Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    password :{
        type : String,
        required:true
    },
    token : String
})

const userSchema = mongoose.model('user',user)
module.exports = userSchema