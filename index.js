const input = document.querySelector(".input");
const save = document.querySelector(".save");
const edit = document.querySelector(".edit");
const tasks = document.querySelector(".tasks");
const emtyList = document.querySelector(".emty-list");
const deleteBtn = document.querySelector(".delete-btn");
const safeBtn = document.querySelector(".safe-btn");
const cleanBtn = document.querySelector(".clean-btn");
const form = document.querySelector('.form');

input.addEventListener("focus", function appearButton() {
  save.classList.remove("none");
});

let tasksData = [];

if (localStorage.getItem("tasksData")) {
  tasksData = JSON.parse(localStorage.getItem("tasksData"));
}

tasksData.forEach(function (task) {
  const cssClass = task.done ? "safe-btn done-task" : "safe-btn";

  const taskHTML = `<li id="${task.id}" class="task" data-action="edit">
                            <span class="task-text">${task.text}</span>
                            <button class="${cssClass}" data-action="done">Safe</button>
                            <button class="delete-btn" data-action="delete">Delete</button>
                         </li>`;

  tasks.insertAdjacentHTML("afterbegin", taskHTML);
});

checkEmptyList();

form.addEventListener('submit', function (event) {
  event.preventDefault();
});

save.addEventListener("click", addTask);

function addTask() {
  const taskText = input.value;

  const newTask = {
    id: Date.now(),
    text: taskText,
    done: false,
    toEdit: false,
    toDrag: false,
  };

  const cssClass = newTask.done ? "safe-btn done-task" : "safe-btn";

  const taskHTML = `<li id="${newTask.id}" class="task draggable" draggable="true" data-action="edit">
                            <span class="task-text">${newTask.text}</span>
                            <button class="${cssClass}" data-action="done">Safe</button>
                            <button class="delete-btn" data-action="delete">Delete</button>
                         </li>`;

  if (input.value !== "") {
    tasks.insertAdjacentHTML("afterbegin", taskHTML);
    tasksData.push(newTask);
    saveToLocalStorage();
  }

  input.value = "";
  input.focus();

  checkEmptyList();
}

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

tasks.addEventListener("click", deleteTask);

function deleteTask(event) {
  if (event.target.dataset.action === "delete") {
    const parentNode = event.target.closest(".task");

    const id = Number(parentNode.id);
    const index = tasksData.findIndex(function (task) {
      return task.id === id;
    });

    tasksData.splice(index, 1);

    saveToLocalStorage();

    parentNode.remove();
  }

  checkEmptyList();
}

tasks.addEventListener("click", doneTask);

function doneTask(event) {
  if (event.target.dataset.action === "done") {
    const parentNode = event.target.closest(".task");

    const id = Number(parentNode.id);

    const taskData = tasksData.find(function (taskData) {
      return taskData.id === id;
    });

    taskData.done = !taskData.done;

    saveToLocalStorage();

    const doneTask = parentNode.querySelector(".safe-btn");
    doneTask.classList.toggle("done-task");
  }
}

tasks.addEventListener("click", editTaskCall);

function editTaskCall(event) {
  if (event.target.dataset.action === "edit") {
    edit.classList.remove("none");
    const parentNode = event.target.closest(".task");
    taskText = parentNode.querySelector(".task-text");
    input.value = taskText.textContent;
    input.focus();
    const clickedElement = event.target;
    const id = Number(clickedElement.id);

    const index = tasksData.findIndex(function (task) {
      return task.id === id;
    });

    tasksData[index].toEdit = true;
  }
}

edit.addEventListener("click", editTask);

function editTask() {
  edit.classList.add("none");

  const index = tasksData.findIndex(function (task) {
    return task.toEdit === true;
  });

  tasksData[index].text = input.value;

  const changedTask = document.getElementById(tasksData[index].id);
  const spanElement = changedTask.querySelector(".task-text");

  spanElement.textContent = tasksData[index].text;
  tasksData[index].toEdit = false;

  input.value = "";
  input.focus();
  saveToLocalStorage();
}

cleanBtn.addEventListener("click", deleteItems);

function deleteItems() {
  const taskElements = tasks.querySelectorAll(".task");

  taskElements.forEach((taskElement) => {
    taskElement.remove();
  });
  tasksData.splice(0);
  checkEmptyList();
  saveToLocalStorage();
}

function checkEmptyList() {
  if (tasksData.length === 0) {
    emtyList.style.display = "block";
    cleanBtn.style.display = "none";
  } else {
    emtyList.style.display = "none";
    cleanBtn.style.display = "block";
  }
}

function saveToLocalStorage() {
  localStorage.setItem("tasksData", JSON.stringify(tasksData));
}

// druggable

function saveTasksOrder() {
  const taskOrder = [...tasks.querySelectorAll('.draggable')].map(task => task.id);
  localStorage.setItem('taskOrder', JSON.stringify(taskOrder));
}


function loadTasksOrder() {
  const taskOrder = JSON.parse(localStorage.getItem('taskOrder'));
  if (taskOrder) {
    taskOrder.forEach(taskId => {
      const task = document.getElementById(taskId);
      if (task) {
        tasks.appendChild(task);
        task.setAttribute('draggable', 'true');
        task.classList.add('draggable');
      }
    });
  }
}

loadTasksOrder();

tasks.addEventListener('dragstart', function (e) {
  const draggable = e.target.closest('.draggable');
  if (!draggable) return;
  draggable.classList.add('dragging');
});

tasks.addEventListener('dragend', function (e) {
  const draggable = e.target.closest('.draggable');
  if (!draggable) return;
  draggable.classList.remove('dragging');
  saveTasksOrder();
});

tasks.addEventListener('dragover', function (e) {
  e.preventDefault();
  const draggable = document.querySelector('.dragging');
  if (!draggable) return;
  const afterElement = getDragAfterElement(tasks, e.clientY);
  if (afterElement == null) {
    tasks.appendChild(draggable);
  } else {
    tasks.insertBefore(draggable, afterElement);
  }
  saveTasksOrder();
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
