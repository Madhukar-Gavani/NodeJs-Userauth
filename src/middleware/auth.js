const jwt = require("jsonwebtoken")
const User = require("../models/user")
const auth = async (req, res, next) =>{
 try {
     const token = req.header("Authorization").replace("Bearer ",'')
      //using this token decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      //now find the user using token id also chek for that token is exist in database i.e he is not logout
      //or if logout is still exit token
      const user = await User.findOne({_id: decoded._id, "tokens.token" : token})
       
      if(!user) {
          throw new Error()
      }
      req.token = token
      //give access to all ther route since we don't need again to user log in each time to new path request 
      req.user = user
      next()
 }catch(error){
     res.status(401).send({"error" : "Please authorize"})
 }
}
module.exports = auth