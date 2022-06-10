const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const User = require("../models/user")
const router = new express.Router()
const auth = require("../middleware/auth") //authenticate if user is not login to the site and want to access the doc 
//get data from client and store data using async-await
router.post("/users", async (req, res) =>{
    const user = new User(req.body)

    try {
         await user.save()
         const token = await user.generateAuthToken()
        res.status(201).send({user, token})

     } catch (error) {
         res.status(400).send(error)
     }

})

//user login 
router.post("/users/login", async(req, res) =>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)//this is for considering all users 
        const token = await user.generateAuthToken() //this is only for one user   
        // res.send({ user:user.getPublicProfile(), token })
        res.send({ user, token })
        // console.log("user login " + user)
    } catch (error) {
        res.status(400).send("Login Problem...")        
    }
})

router.post("/users/logout", auth, async(req, res) =>{
    try {
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
        })
        await req.user.save()

        res.send("Log out successfully...")
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/users/logoutAll", auth, async(req, res) =>{
    try {
        req.user.tokens = []
        await req.user.save()

        res.send("Log out successfully...")
    } catch (error) {
        res.status(500).send(error)
    }
})

//find all i.e not specfic data
// router.get("/users", auth, async(req, res) =>{
//     try {
//         const users = await User.find({})
//         res.send(users)

//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

//get own profile
router.get("/users/me", auth, async(req, res) =>{
    res.send(req.user)
})

//upload user profile pic 
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
           return cb(new Error("Ohh no avatar format should be in .jpeg/.jpg/.png format"))
        }
        cb(undefined, true)
    }
})

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) =>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("File is uploaded")
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message})
})

//delete avatar
router.delete("/users/me/avatar", auth, async(req, res) =>{
    if(!req.user.avatar){
       return res.status(400).send("ohh no cannot delete if it doest exits")    
    }
    req.user.avatar = undefined
    await req.user.save()
   res.send("File deleted successfully")
})

router.get("/users/:id/avatar", async (req, res) =>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error("Not found")
        }
        //tell to requester what type of data he will get
        res.set("Content-Type", "image/png")
        res.send(user.avatar) 

    }catch(error) {
        res.status(400).send("Error")
    }
})

//Specific data
// router.get("/users/:id", async (req,res) =>{
//     const id = req.params.id

//     try {
//         const user = await User.findById(id)
//         if(!user){
//             return res.status(404).send("Requested data not found")
//         }
//         res.send(user)

//     } catch (error) {
//         res.status(500).send()
//     }
// })

//Update data
router.patch("/users/me",auth, async(req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "email", "password", "age"]
    const isValidUpdate = updates.every((update) =>{
        return allowedUpdates.includes(update)
    })

    if(!isValidUpdate){
        return res.status(400).send("error: Invalid Update ")
    }

    try {
        // const user = await User.findById(req.user._id)

        updates.forEach((update) =>{
            req.user[update] = req.body[update]
        })
        await req.user.save()

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators: true}) //new:true get updated data in user 
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/users/me",auth, async(req, res)=>{
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // res.send(user)
        await req.user.remove()
        res.send(req.user)

    } catch (error) {
        res.status(500).send("Error: " + error)
    }
})

module.exports = router