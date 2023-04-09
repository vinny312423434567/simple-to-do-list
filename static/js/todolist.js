const socket = io();

//add textfield 
//hide and show add task forms 
const animateTime = 300; 
let isTaskFormShowing = false; 

const taskForm = document.getElementById("task-form"); 

function showForm() { 
    // if add task form is not currently showing, show task form 
    if (isTaskFormShowing == false) { 
        taskForm.style.display = "inline"; 
        taskForm.animate ([{opacity: "0%"}, {opacity: "100%"}], animateTime); 

        isTaskFormShowing = true; 
    }
} 
        
function hideForm() { 
    // if add task form is showing, then hide task 
    if (isTaskFormShowing == true) { 
        taskForm.animate ([{opacity: "100%"}, {opacity: "0%"}], animateTime);
        setTimeout(() => {
            taskForm.style.display = "none";
        }, animateTime);

        isTaskFormShowing = false; 
    } 
} 

socket.on("sendTasks", (tasks) => {
    // adds all tasks to a div as long as it is not duplicate data
    try {
        // remove all tasks that were previously displayed
        document.getElementById('tasks').remove();
    }
    // regenerates tasks
    finally {
        // makes a div for all the tasks
        let taskList = document.createElement('div');
        taskList.setAttribute("class", "tasks");
        taskList.setAttribute("id", "tasks");
        document.body.appendChild(taskList);

        for (let i = 0; i < tasks.todolist.length; i++) {
            // sets div to container
            let container = document.getElementById("tasks");
    
            // adds a new div for the task
            let task = document.createElement('div');
            task.setAttribute("class", "task");
            container.appendChild(task);
    
            // create delete button
            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            deleteButton.setAttribute("class", "task_delete_button");
            deleteButton.setAttribute("onclick", "deleteTask(" + i + ");")
            task.appendChild(deleteButton);
            
            // adds task
            let taskContent = document.createElement('p');
            taskContent.textContent = tasks.todolist[i].task;
            taskContent.setAttribute("class", "task_content");
            task.appendChild(taskContent);
        
            // adds due date
            if (tasks.todolist[i].due_date != "") {
                let dueDate = document.createElement('p');
                dueDate.textContent = "Due: " + tasks.todolist[i].due_date;
                dueDate.setAttribute("class", "task_due_date");
                task.appendChild(dueDate);
            }
        }
    }
});

// when user tries to delete a task
function deleteTask(id) {
    socket.emit("deleteTask", id);
};

// reloads page when ready
socket.on("taskCompleted", () => {
    console.log("reload");
    window.location.reload();
})