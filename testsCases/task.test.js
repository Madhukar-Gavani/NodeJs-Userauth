const request = require("supertest")
const app = require("../src/app")
const Task = require("../src/models/task")
const {userOneId, userOne, setUpDataBase, userTwo, taskOne} = require("../testsCases/fixtures/db")
//run in series after task.test.js is created

beforeEach(setUpDataBase)

test("Should create task for user", async ()=>{
const responce = await request(app)
                    .post("/tasks")
                    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                    .send({
                        description:"Do more test case",
                        completed: false
                    })
                    .expect(201)
 const task = await Task.findById(responce.body._id)
 expect(task).not.toBeNull()
 expect(task.completed).toBe(false)
})

test("Should read first user task", async () =>{
    const responce = await request(app)
                        .get("/tasks")
                        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                        .expect(200)

        expect(responce.body.length).toBe(2)
})


test("Should not delete first user task by second user", async () =>{
    const responce = await request(app)
                        .delete(`/tasks/${taskOne._id}`)
                        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                        .send()
                        .expect(404)
          
        // expect(responce.body.length).toBe(2)
})