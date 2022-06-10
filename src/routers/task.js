const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")

const router = new express.Router()

//Tasks create
router.post("/tasks", auth, async(req, res) =>{
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

//find all
//GET /tasks?completed=true
//GET /tasks?limit=10&skip=20 //this means skip first 20 elements and show 10 after that
//or limit to show upto 10 documents (this is call pagination)
//GET /tasks?sortBy=createdAt:desc OR /tasks?sortBy=completed:desc
router.get("/tasks", auth, async(req, res) =>{
    const match = {}
    const sort = {}
    if(req.query.completed) {
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === "desc"? -1: 1
    }

    try {
        // const tasks = await Task.find({owner:req.user._id})
        await req.user.populate({
            path: "tasks",
            match: match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get("/tasks/:id",auth, async(req, res) =>{
    const id = req.params.id

    try {
        // const task = await Task.findById(id)
        const task = await Task.findOne({_id: id, owner: req.user._id})
        if(!task){
            return res.status(404).send("task not found")
        }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch("/tasks/:id", auth, async (req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description","completed"]
    const isValidUpdate = updates.every((update) =>{
        return allowedUpdates.includes(update)
    })
    if(!isValidUpdate){
        return res.status(400).send("Error: Not a valid update")
    }
    try {
            const task = await Task.findOne({_id:req.params.id, owner:req.user._id})

            // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new:true, isValidUpdate: true})
        if(!task){
            return res.status(404).send("No task with that id")
        }
        updates.forEach((update) =>{
            task[update] = req.body[update]
        })
        await task.save()

        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/tasks/:id",auth, async(req, res) =>{
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send("Error: No task where found")
        }
        res.send(task)
    }catch(error){
        res.status(500).send("Error: " + error)
    }
})

module.exports = router