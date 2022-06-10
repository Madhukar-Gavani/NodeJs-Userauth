const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("../models/task")

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0) {
                throw new Error("Error!! Age must be positive") 
            }
        } 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email!!")
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if(value.toLowerCase().includes("password") ){
                throw new Error("Ohh create your own not what is said...")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
      avatar:  {
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: "Tasks",
    localField: "_id",
    foreignField: "owner"//relationship between user and task
})

//toJSON ==> getPublicProfile
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

//methods are accessible to instances of models
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token: token}) //this is because if user login with both devices //this not clear too much refers video again 6 generate auth @9
    await user.save()
    return token
}
//call handle for findByCredentials 
//since we call to this at here because before saving or before everything is done
//static accessible to model call model methods  
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email: email})

    if(!user){
        throw new Error("Unable to find user")
    }
    // console.log(user);
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error("Unable to login") // don't expose to specific that user have different password
        //this will gives an problem
    }
    // console.log(isMatch);
    return user
}

//middleware this will executes before/after some opration is going to perform
//such as save, delete etc
userSchema.pre("save", async function (next) {
  //in this we have access to "this" document which means "this"
  //gives us access to the individual user that is going to save
   const user = this

    //only hash the password if it is not changed 
    //i.e we don't want to hash the password which is hashed before
    
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 9)//9 number of loops to hash
    }

   next() //this is because as this process is async so we don't know 
   //when it finish as soon as it finishes it's process proceed to next process with a call of next()
   
   //if we are updating this method will not get fired so need to change update method of user try before this
   //update mongoose query by pass middleware

})

userSchema.pre("remove", async function (next) {
    const user = this    
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model("User", userSchema)

module.exports = User