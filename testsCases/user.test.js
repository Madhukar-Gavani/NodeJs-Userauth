//in this we are using supertest so we only require app(express) functionality to do
//not app.listen
//so we modify src/index.js  to index.js and app.js
const request = require("supertest")

const app = require("../src/app")
const User = require("../src/models/user")
const {userOneId, userOne, setUpDataBase} = require("../testsCases/fixtures/db")

//use mock methods to do someting that we dont want to do with this 
//This is for authentication 
//since we reqire token to do so..
// const userOneId = mongoose.Types.ObjectId()

// const userOne = {
//     _id: userOneId,
//     name: "TestCase",
//     email: "testone12@email.com",
//     password: "TestCase@12",
//     tokens:[{
//         token:jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
//     }]
// } 
// beforeEach(async() =>{
//     //wipe all data form database
//     await User.deleteMany()
//     //add only userOne for futher test cases
//     await new User(userOne).save()
// })
beforeEach(setUpDataBase)

test("Should signup a new user", async() =>{
    const  responce = await request(app).post("/users").send({
        name:"User",
        email: "googleme@gmail.com",
        password: "Apple@123"
    }).expect(201) //get status of 201
    const user =await User.findById(responce.body.user._id)
    expect(user).not.toBeNull() 
}) 

test("Should login existing user", async() =>{
    const responce = await request(app).post("/users/login").send({
        email: userOne.email,
        password:userOne.password
    }).expect(200)

    const user = await User.findById(responce.body.user._id)
    expect(user.tokens[1].token).toBe(responce.body.token) 
})

test("should not login non existing user", async() =>{
    await request(app).post("/users/login").send({
        email: "NonExist@gmail.com",
        password: "NonExist@11"
    }).expect(400)
})
//Login test cases
test("Should get profile for authorized user", async() =>{
     await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not get profile for unauthorized user", async() =>{
    await request(app)
        .get("/users/me")
        .send()
        .expect(401)
})


//For uploading images/avatars/files
test("Should upload avatar images" ,async() =>{
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "testsCases/fixtures/First.jpg")//the first argument name should be same as with .single name of multer
        .expect(200)

        //check for correct data uploaded
        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))

})

//Delete test cases
test("Should delete profile for authorized user", async() =>{
   const responce =  await request(app)
                        .delete("/users/me")
                        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                        .send()
                        .expect(200)
    const user = await User.findById(responce.body._id)
    expect(user).toBeNull()
})

test("Should not delete profile for unauthorized user", async() =>{
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)
})

test("Should update a valid user field" , async() =>{
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            age: 30
        })
        .expect(200)
})
test("Should not update invalid user filed", async () =>{
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Hell"
        }).expect(400)
})