import './style.css'

const input = document.querySelector("#todoInput")
// document.querySelector(selector)是JS里用来获取页面元素的方法
// 可以在括号里放入CSS选择器(比如.class，#id, div等)，它就会返回第一个匹配的元素
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
// localStorage是浏览器提供的一种web存储机制，用于在user设备上保存少量数据
// 当调用localStorage.setItem("todos", JSON.stringify(todos))的时候，数据时尚被存储在本地硬盘上
// setItem(key, value)，这里是把待办事件列表转换成字符串，然后保存在todos对应的值里面

function loadTodos() {
    // 该函数预期返回一个数组
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
    listEl.innerHTML = ""; //清空页面里的列表容器

    if (todos.length === 0) {
        listEl.innerHTML = `<li class="empty">No tasks yet.</li>`;
        updateCount();
        return;
    }

    for (const todo of todos) {
        const li = document.createElement("li");
        // 大的列表用ul标签表示，列表里的每个元素用li标签表示
        // document对象代表当前网页，它的createElement方法可以创建一个由标签名指定的HTML元素
        // 这个新建立的元素还不在文档里，它存在于内存里，后续通过appendChild方法插入到DOM树里
        li.className = "item" + (todo.done ? " done" : ""); //根据完成状态添加类名

        const checkbox = document.createElement("input");//创建一个input元素节点
        checkbox.type = "checkbox";//将该input的类型设为复选框，使其呈现为一个小方框，user可以勾选或取消勾选
        checkbox.checked = todo.done;//根据当前待办事项对象 todo 的 done 属性（布尔值）设置复选框的初始选中状态。

        checkbox.addEventListener("change", () => {
            // 为复选框绑定change事件，也就是复选框勾上还是不勾上的状态一旦改变，就更新todo的状态
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
        if (todo.done) continue; //跳过已经完成的

        const key = todo.dueDate || "No DDL";

        if (!groups[key]) {
            groups[key] = []; //初始化数组
        }

        groups[key].push(todo);//push是数组的一个方法，用于向数组的末尾添加一个或多个元素
        // 如果之前当前日期已经出现过了，那就直接push了当前正在遍历的这个todo
        // 如果之前当前日期没有出现过，那就先创建一个数组再push当前todo
    }

    return groups;//字典里的每个元素是一个数组
}

function renderTodosByDate() {
    listEl.innerHTML = "";

    const groups = groupPendingTodosByDate();
    const keys = Object.keys(groups);//获取所有分组键，这里就是所有日期

    if (keys.length === 0) {
        listEl.innerHTML = `<li class="empty">No pending tasks.</li>`;
        updateCount();
        return;
    }

    keys.sort((a, b) => {
        // 对分组键进行排序，将NO DDL放在最后，其余按字符串排序
        // keys.sort(compareFunction)
        // 比较函数必须返回一个数值，用来指示 a 和 b 的相对顺序：返回负数（通常为 -1）：a 应该排在 b 前面
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