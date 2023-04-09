// Imports libraries and boiler plate code
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const server = http.createServer(app);
const port = 3000;
const io = require('socket.io')(server);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// Stores to do list
const taskFile = "database/tasks.json";

// Reads Json file for to do list
let tasks = JSON.parse(fs.readFileSync(taskFile));

// sets up static pages 
app.set('view engine', 'ejs');
app.use('/static/css', express.static('static/css'));
app.use('/static/js', express.static('static/js'));

// Connects to HTML
app.get("/", (req, res) => {
    res.render('pages/todolist');
});

// just declares the deleted task as a global variable, needed to bypass form resubmission 
let deletedTask;

// Checks for post request (stored in req) and adds to file
app.post("/", (req, res) => {
    let isDuplicateTask = false;

    // checks for form resubmit (dumb chrome)
    for (let i = 0; i < tasks.todolist.length; i++) {
        if (req.body.task == tasks.todolist[i].task && req.body.due_date == tasks.todolist[i].due_date) { 
            isDuplicateTask = true;
        }
    }

    try {
        // doesnt rewrite old deleted task (again, form resubmit)
        if (req.body.task == deletedTask.task) {
            isDuplicateTask = true;
        }
    }
    // if the list is empty, .task does not exist, not an error
    catch {
        console.log("empty list");
    }

    // if not duplicate
    if (isDuplicateTask == false) {
        try {
            //finds length of task list and adds id property to new task
            req.body.id = tasks.todolist.length;
    
            // adds to todolist array
            tasks.todolist.push(req.body);
    
            // rewrites tasks.json file
            fs.writeFileSync(taskFile, JSON.stringify(tasks, null, 2));
        } catch (err) {
            console.log(err);   
        }
    }

    res.render('pages/todolist');
});

io.on('connection', (socket) => {
    // sends task list
    socket.emit("sendTasks", tasks);

    // listens for deleted task, then deletes it
    // id represents the id of the deleted task
    socket.on("deleteTask", (id) => {
        // pushes the deleted task to spot one
        deletedTask = tasks.todolist[id]; // global variable
        let newList = [];
        newList.push(deletedTask);

        // adds the other tasks to list
        for (let i = 0; i < tasks.todolist.length; i++) {
            if (tasks.todolist[i].id != id) {
                newList.push(tasks.todolist[i]);
            }
        }

        // removes first element and updates tasks
        newList.shift();
        tasks.todolist = newList;

        // updates id
        for (let i = 0; i < tasks.todolist.length; i++) {
            tasks.todolist[i].id = i;
        }

        // rewrites file
        fs.writeFileSync(taskFile, JSON.stringify(tasks, null, 2));

        socket.emit("taskCompleted");
    })
});

server.listen(port, () => {
    console.log(`server is running on http://127.0.0.1:${port}/`);
});