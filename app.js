const express = require('express')
const app = express()
const mongoose =require('mongoose')
const userSchema = require('./models/userSchema')
const { v4: uuidv4 } = require('uuid');
const sessionAvailable = require('./models/sessionAvailable')
const pendingSessions = require('./models/pendingSessions')

app.use(express.json())

mongoose.connect('mongodb://localhost:27017/BackendAssignment').then(()=>{
    console.log("MongoDB connected")
}).catch((err)=>{console.log(err)})

app.get('/',(req,res)=>{
    res.end('<h1>Hello</h1>')
})

//verification middleware
const verifyAuth = async(req,res,next) =>{
    const token = req.headers.authorization
    try {
        // console.log(token.split(" ")[1])
        const user = await userSchema.findOne({token:token.split(" ")[1]})
        if(!user){
            res.status(404);
            res.json({
                status:404,
                message:"UnAuthenticated User"
            })
        }else{
            next()
        }
        // res.json(user)
        // console.log(user)
    } catch (error) {
        console.log(error)
    }

}



//regitser the new user from this route
app.post('/register',async (req,res)=>{ 
    const {id , password,name} = req.body;
    try {   
        const userCheck = await userSchema.findOne({userId:id})
        if(!userCheck){
            const user = new userSchema({
                userId : id,
                name,
                password
            })
            const result = await user.save()
            res.json(result)
        }else{
            res.status(404)
            res.json({
                message:"User Already exists"
            })
        }
        
        
    } catch (error) {
        console.log(error)
    }
    
})

//login user from this route and it saves token in db and sends token
app.post('/login',async(req,res)=>{
    const {id,password} = req.body
    try {
        const user = await userSchema.findOne({userId:id,password})
        console.log(user)
        if(!user){
            res.status(404)
            res.json({
                status:404,
                message:"Invalid credentials"
            })
        }else{
            const uuid = uuidv4()
            user.token=uuid;
            await user.save()
            // await updateuser.save()
            res.json({token:uuid})
            
            // console.log(uuid)
        }
        
    } catch (error) {
        console.log(error)
    }
    
})


// add slots its for testing i added this route
app.post('/dean/addSlots',(req,res)=>{
    const {deanId}= req.body
    const date1 = new Date("2023-07-20");
    date1.setHours(15)
    const available_slots = [date1,new Date("2023-07-21").setHours(15)]
    const slot = new sessionAvailable({
        deanId,
        available_slots
    })
    slot.save().then((resu)=>{
        res.json(resu)
    }).catch((err)=>{
        res.json(err)
    })
})


// check for free sessions 
app.get('/dean/freesessions',verifyAuth,async(req,res)=>{
    try {
        const sessions = await sessionAvailable.find({},{deanId:1,available_slots:1,_id:0})
        if(!sessions){
            res.json({msg:"No sessions available"})
        }else{
            res.json(sessions)
        }
    } catch (error) {
        console.log(error)
    }
})

// Book sessions
app.patch('/dean/bookSession',verifyAuth,async(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    try {
        const {deanId,slot}=req.body
        const user = await userSchema.findOne({token})
        const update = await sessionAvailable.findOne({deanId})
        if(update){
            const result = await sessionAvailable.updateOne({deanId},{$pull:{available_slots:new Date(slot).setHours(15)}})
            if(result.modifiedCount==0){
                res.json({
                    msg:"No slot found"
                })
            }else{
                const doc = new pendingSessions({
                    deanId:deanId,
                    stdId:user.userId,
                    startDate:new Date(slot),
                    name:user.name
                })
                await doc.save()
                res.json({
                    message:`Successfully Booked on ${slot}`
                })
            }
            
        }
        
        else{
            res.status(404)
            res.json({
                message:"No Dean Found with that ID"
            })
        }
        
        
    } catch (error) {
        console.log(error)
    }
    
})

// pending sessions
app.get('/dean/pendings',verifyAuth,async(req,res)=>{
    try {
        const token = req.headers.authorization.split(' ')[1]
        const dean = await userSchema.findOne({token})
        if(!dean){
            res.status(404)
            res.json({
                message:"No dean found with that id"
            })
        }else{
            const pend = await pendingSessions.find({deanId:dean.userId,startDate:{$gt:new Date()}},{deanId:0,_id:0})
            res.json(pend)
        }
        
    } catch (error) {
        
    }
})

//Available Students
app.get('/available',verifyAuth,async (req,res)=>{
    try {
        const stud = await pendingSessions.find({},{stdId:1,_id:0})
        const arr = stud.map((data)=> data.stdId)
        // console.log(arr)
        const users = await userSchema.find({role:{$exists:true},userId:{$nin:arr}},{userId:1,name:1})
        res.json(users)
        // console.log(stud)
    } catch (error) {
        console.log(error)
    }
    
})


//ERROR HANDLERS
app.use((req,res,next)=>{
    const err= new Error("Not Found");
    err.status = 404;
    next(err)
});
// error handler
app.use((err,req,res,next)=>{
    res.status(err.status || 500);
    res.send({
        error:{
            status:err.status || 500,
            message:err.message
        }
    });
});

app.listen(3000,()=>{
    console.log(`Server running on port 3000`)
})