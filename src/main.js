import './style.css'

const input = document.querySelector("#todoInput")
const addBtn = document.querySelector("#addBtn")
const listEl = document.querySelector("#todoList")
const countText = document.querySelector("#countText")
const clearCompletedBtn = document.querySelector("#clearCompletedBtn")

let todos = loadTodos();

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


// 在静态HTML里，我们只能写出固定的结构，比如一个空的列表容器，而动态数据（来自js数组todos）需要在程序运行时根据数据动态生成对应的HTML元素
function render() {
// render函数执行时，它会：1.清空列表，2.循环遍历todos数组，为每个待办事项创建DOM元素
// 3. 为这些元素添加事件监视器， 4. 将元素添加到DOM中， 5.更新计数
    listEl.innerHTML = ""; //每次渲染前清空列表容器

    for (const todo of todos) {
        const li = document.createElement("li")  //DOM元素创建，相当于<li></li>，但是不添加到页面
        li.className = "item" + (todo.done ? " done" : "");
        //如果todo.done为true，添加done类：<li class="item done"></li>
        //如果todo.done为false，只有"item"类：<li class="item"></li>
        //这样CSS可以通过.item.done选择器设置已经完成事项的样式

        const checkbox = document.createElement("input"); //创建复选框input元素
        checkbox.type = "checkbox"; //设置复选框类型为checkbox
        checkbox.checked = todo.done; //根据todo.done设置复选框是否被选中

        checkbox.addEventListener("change",()=>{
            // 这个函数不会立即执行，它被注册为事件监视器，只有当复选框状态改变时才会执行
            todo.done = checkbox.checked;
            saveTodos();
            render(); //在事件回调中调用，不是在render内部直接调用
        });

        const span = document.createElement("span"); //创建显示todo标题的span元素
        span.className = "title"; //设置span的类名为title
        span.textContent = todo.title; //设置span的文本内容为todo的标题

        const delBtn = document.createElement("button"); //创建删除按钮
        delBtn.className = "del"
        delBtn.textContent = "delete";
        delBtn.addEventListener("click", ()=> {
            todos = todos.filter((t) => t.id !== todo.id);
            saveTodos();
            render();
        });
        
        //将复选框，标题，删除按钮添加到li元素中
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        //组装成类似于这样的格式：
        //<li class="item done">
        //  <input type="checkbox" checked>
        //  <span class="title"> 学习前端</span>
        //  <button class="del">删除</button>
        //</li>

        listEl.appendChild(li);

    }

    updateCount();

}

// 时间点1：页面加载
// 调用render()，创建DOM元素，绑定事件监视器（函数被注册，但未调用，render()结束)
// 时间点2：用户点击复选框
// 浏览器触发change事件，调用之前注册的事件监听器函数，在这个函数内部：修改todo.done，保存到localStorage，调用render()
// 时间点3：第二次render()执行
// 清空列表，重新创建DOM元素，绑定新的事件监视器，render()结束

function addTodo() {
    const title = input.value.trim();
    if (title === "") return ;

    todos.unshift({
        // unshift用于在数组开头添加新元素
        id:Date.now(),
        title,
        done:false,
    });

    input.value = "";
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

//首次渲染
render();