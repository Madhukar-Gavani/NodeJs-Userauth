const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const User = require("../../src/models/user")
const Task = require("../../src/models/task")

const userOneId = mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: "TestCase",
    email: "testone12@email.com",
    password: "TestCase@12",
    tokens:[{
        token:jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
} 

const userTwoId = mongoose.Types.ObjectId()

const userTwo = {
    _id: userTwoId,
    name: "TestCase2",
    email: "testone122@email.com",
    password: "TestCase@122",
    tokens:[{
        token:jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
} 

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description:"first task in test",
    completed: false,
    owner: userOne._id
}


const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description:"second task in test",
    completed: true,
    owner: userOne._id
}


const taskThird = {
    _id: new mongoose.Types.ObjectId(),
    description:"Third task in test",
    completed: true,
    owner: userTwo._id
}
const setUpDataBase = async() =>{
    await User.deleteMany()
    await Task.deleteMany()
    //add only userOne for futher test cases
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThird).save()
}

module.exports = {
    userOneId,
    userOne,
    setUpDataBase,
    userTwo,
    taskOne
}