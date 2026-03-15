import './style.css'

const input = document.querySelector("#todoInput")
const dueDateInput = document.querySelector('#dueDateInput')
const addBtn = document.querySelector("#addBtn")
const listEl = document.querySelector("#todoList")
const countText = document.querySelector("#countText")
const clearCompletedBtn = document.querySelector("#clearCompletedBtn")
const allViewBtn = document.querySelector("#allViewBtn")
const dateViewBtn = document.querySelector("#dateViewBtn")

let todos = loadTodos();
let currentView = "all";

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos))
}

function loadTodos() {
    try {
        const raw = localStorage.getItem("todos");
        // localStorage是浏览器提供的一种本地存储机制，数据以键值对形式存储，都是字符串
        return raw ? JSON.parse(raw) : [];
    } catch {
        return []
    }
}

function updateCount() {
    const total = todos.length; //数组有length属性
    const done = todos.filter((t) => t.done).length; //filter是数组的方法，用于筛选数组元素
    // filter的语法是，数组.filter(回调函数)
    // 箭头函数(t) => t.done详解
    // 传统写法：
    // todos.filter(function(t) {return t.done;});
    // 箭头函数写法与上述等同，(t)代表参数
    countText.textContent = `${total} items, ${done} done`;
}

function formatDate(dateStr) {
    if (!dateStr) return "NO DDL";
    return dateStr;
}

function getDateLabel(dateStr) {
    if (!dateStr) return "NO DDL";
    return dateStr;
}

function renderAllTodos() {
    listEl.innerHTML = "";

    if (todos.length === 0) {
        listEl.innerHTML = `<li class="empty">No tasks yet.</li>`;
        updateCount();
        return;
    }

    for (const todo of todos) {
        const li = document.createElement("li");
        li.className = "item" + (todo.done ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.done;

        checkbox.addEventListener("change", () => {
            todo.done = checkbox.checked;
            saveTodos();
            render();
        });

        const main = document.createElement("div");
        main.className = "item-main";

        const span = document.createElement("span");
        span.className = "title";
        span.textContent = todo.title;

        const meta = document.createElement("span");
        meta.className = "item-meta";
        meta.textContent = `DDL: ${formatDate(todo.dueDate)}`;

        main.appendChild(span);
        main.appendChild(meta);

        const delBtn = document.createElement("button");
        delBtn.className = "del";
        delBtn.textContent = "delete";
        delBtn.addEventListener("click", () => {
            todos = todos.filter((t) => t.id !== todo.id);
            saveTodos();
            render();
        });

        li.appendChild(checkbox);
        li.appendChild(main);
        li.appendChild(delBtn);

        listEl.appendChild(li);
    }

    updateCount();
}


function groupPendingTodosByDate() {
    const groups = {};

    for (const todo of todos) {
        if (todo.done) continue;

        const key = todo.dueDate || "No DDL";

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(todo);
    }

    return groups;
}

function renderTodosByDate() {
    listEl.innerHTML = "";

    const groups = groupPendingTodosByDate();
    const keys = Object.keys(groups);

    if (keys.length === 0) {
        listEl.innerHTML = `<li class="empty">No pending tasks.</li>`;
        updateCount();
        return;
    }

    keys.sort((a, b) => {
        if (a === "No DDL") return 1;
        if (b === "No DDL") return -1;
        return a.localeCompare(b);
    });

    for (const key of keys) {
        const titleLi = document.createElement("li");
        titleLi.className = "group-title";
        titleLi.textContent = getDateLabel(key);
        listEl.appendChild(titleLi);

        for (const todo of groups[key]) {
            const li = document.createElement("li");
            li.className = "item";

            const main = document.createElement("div");
            main.className = "item-main";

            const span = document.createElement("span");
            span.className = "title";
            span.textContent = todo.title;

            const meta = document.createElement("span");
            meta.className = "item-meta";
            meta.textContent = `DDL: ${formatDate(todo.dueDate)}`;

            main.appendChild(span);
            main.appendChild(meta);

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = todo.done;

            checkbox.addEventListener("change", () => {
                todo.done = checkbox.checked;
                saveTodos();
                render();
            });

            const delBtn = document.createElement("button");
            delBtn.className = "del";
            delBtn.textContent = "delete";
            delBtn.addEventListener("click", () => {
                todos = todos.filter((t) => t.id !== todo.id);
                saveTodos();
                render();
            });

            li.appendChild(checkbox);
            li.appendChild(main);
            li.appendChild(delBtn);

            listEl.appendChild(li);
        }
    }

    updateCount();
}


function render() {
    if (currentView === "all") {
        renderAllTodos();
    } else {
        renderTodosByDate();
    }
}

function addTodo() {
    const title = input.value.trim();
    const dueDate = dueDateInput.value;

    if (title === "") return ;

    todos.unshift({
        // unshift用于在数组开头添加新元素
        id:Date.now(),
        title,
        done:false,
        dueDate: dueDate || "",
    });

    input.value = "";
    dueDateInput.value = "";
    saveTodos();
    render();
}

//下面开始类似于main函数的逻辑
//点击添加
addBtn.addEventListener("click", addTodo);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo();
});

//清除已经完成的
clearCompletedBtn.addEventListener("click", () => {

    todos = todos.filter((t) => !t.done);
    saveTodos();
    render();
});

allViewBtn.addEventListener("click", () => {
    currentView = "all";
    render();
});

dateViewBtn.addEventListener("click", () => {
    currentView = "date";
    render();
});
//首次渲染
render();