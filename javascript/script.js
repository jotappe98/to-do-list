//Selecao de Elementos
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterBtn = document.querySelector("#filter-select");



let oldInputValue;

//Funcoes


//Funcao para criar uma nova tarefa
const saveTodo = (text,done = 0,save = 1) => {

    const todo = document.createElement("div")
    todo.classList.add("todo")

    const todoTitle = document.createElement("h3")
    todoTitle.innerText = text
    todo.appendChild(todoTitle)
    
    const doneBtn = document.createElement("button")
    doneBtn.classList.add("finish-todo")
    doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>'
    todo.appendChild(doneBtn)

    const editBtn = document.createElement("button")
    editBtn.classList.add("edit-todo")
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>'
    todo.appendChild(editBtn)

    const removeBtn = document.createElement("button")
    removeBtn.classList.add("remove-todo")
    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>'
    todo.appendChild(removeBtn)

    //Dados da LS
    if(done){
        todo.classList.add("done");
    }

    if(save){
        saveTodoLocalStorage({
            text,
            done
        });
    }

    todoList.appendChild(todo);

    todoInput.value = "";
    todoInput.focus();
    toggleEmptyState();
}

//Funcao para alternar entre os formularios de edicao e criacao de tarefas
const toggleForms = () => {
    editForm.classList.toggle("hide");
    todoForm.classList.toggle("hide");
    todoList.classList.toggle("hide");
}



//Funcao para atualizar uma tarefa

const updateTodo = (text) => {
    const todos = document.querySelectorAll(".todo");
    todos.forEach((todo) => {
        let todoTitle = todo.querySelector("h3");

        if(todoTitle.innerText === oldInputValue){
            todoTitle.innerText = text;
        }
    });
}


//Funcao para exibir mensagem de "Nenhuma tarefa encontrada" quando a pesquisa nao retornar resultados

const toggleNoResultsMessage = (hasResults) => {
    const message = document.querySelector("#no-results");

    if (!hasResults) {
        message.style.display = "block";
    } else {
        message.style.display = "none";
    }
};


//Funcao para pesquisar tarefas especificas

const getSearchTodo = (search) => {
    const todos = document.querySelectorAll(".todo");

    let hasResults = false;

    todos.forEach((todo) => {
        let todoTitle = todo.querySelector("h3").innerText.toLowerCase();

        const normalizedSearch = search.toLowerCase();  

        if (todoTitle.includes(normalizedSearch)) {
            todo.style.display = "flex";
            hasResults = true;
        } else {
            todo.style.display = "none";
        }
    });

    toggleNoResultsMessage(hasResults);

};

//Funcao para filtrar tarefas por status (todas, pendentes ou concluídas)

const filterTodos = (filterValue) => {
    const todos = document.querySelectorAll(".todo");

    switch(filterValue) {
        case "all":
            todos.forEach((todo) => todo.style.display = "flex")
            break;

        case "done":
            todos.forEach((todo) => 
            todo.classList.contains("done")
            ? (todo.style.display = "flex") 
            : (todo.style.display = "none")
            );
            break;

        case "todo":
            todos.forEach((todo) => 
            !todo.classList.contains("done")
            ? (todo.style.display = "flex") 
            : (todo.style.display = "none")
            );
            break;
        default:
            break;
    };
};

//Funcao para UX dinamico

const toggleEmptyState = () => {
    const todos = document.querySelectorAll(".todo");
    const visibleTodos = Array.from(todos).filter(todo => todo.style.display !== "none");
    const emptyState = document.querySelector("#empty-state");

    
    if (!editForm.classList.contains("hide")) {
        emptyState.style.display = "none";
        return;
    }

    emptyState.style.display = "block";

    const filterValue = filterBtn.value;

    
    if (visibleTodos.length === 0) {
        switch(filterValue) {
            case "all":
                emptyState.innerText = "O que vamos fazer hoje?";
                break;
            case "done":
                emptyState.innerText = "Você ainda não concluiu nenhuma tarefa";
                break;
            case "todo":
                emptyState.innerText = "Sem tarefas pendentes";
                break;
        }

        emptyState.classList.remove("has-tasks");
    } else {
        emptyState.innerText = "Suas tarefas:";
        emptyState.classList.add("has-tasks");
    }
};


//Eventos


//Evento para controlar tarefas
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const inputValue = todoInput.value
     if(inputValue){
        saveTodo(inputValue);
     }
});

document.addEventListener("click", (e) =>{
    const targetEl = e.target;
    const parentEl = targetEl.closest("div");
    let todoTitle;

    //Recuperacao do titulo da tarefa
    if(parentEl && parentEl.querySelector("h3")){
        todoTitle = parentEl.querySelector("h3").innerText;
    }

    //Conclusão de tarefa
    if(targetEl.classList.contains("finish-todo")){
        parentEl.classList.toggle("done");
        updateLocalStorage();
    }

    //Edição de tarefa
    if(targetEl.classList.contains("edit-todo")){
        toggleForms();
        editInput.value = todoTitle;
        oldInputValue = todoTitle;
        toggleEmptyState(); 
    }

    //Remoção de tarefa
    if(targetEl.classList.contains("remove-todo")){
        parentEl.remove();
        updateLocalStorage();
        toggleEmptyState();
        removeTodoLocalStorage(todoTitle);
    }
});

//Evento para cancelar a edição de uma tarefa
cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleForms();
    toggleEmptyState();
});

//Evento para salvar a edição de uma tarefa
editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const editInputValue = editInput.value;

    if(editInputValue ){
        updateTodo(editInputValue);
        updateLocalStorage();
    };

    toggleForms();
    toggleEmptyState();
})



//Evento para pesquisar tarefas especificas
searchInput.addEventListener("keyup", (e) => {
    const search = e.target.value;
    getSearchTodo(search);
});


//Evento para limpar pesquisa no campo de busca

eraseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("keyup"));
});


//Evento para filtrar tarefas por status (todas, pendentes ou concluídas)

filterBtn.addEventListener("change", (e) => {
    const filterValue = e.target.value;
    filterTodos(filterValue);
    toggleEmptyState();
});


//local storage


const getTodosLocalStorage = () => {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];

    return todos;
};

//salvar todo o estado no localStorage
const saveTodoLocalStorage = (todo) => {

    const todos = getTodosLocalStorage(); 

    todos.push(todo);

    localStorage.setItem("todos", JSON.stringify(todos));

};

//atualizar todo o estado no localStorage
const updateLocalStorage = () => {
    const todos = [];

    document.querySelectorAll(".todo").forEach((todo) => {
        const text = todo.querySelector("h3").innerText;
        const done = todo.classList.contains("done");

        todos.push({ text, done });
    });

    localStorage.setItem("todos", JSON.stringify(todos));
};

//mostrar todos do localStorage na tela
document.addEventListener("DOMContentLoaded", () => {
    const todos = getTodosLocalStorage();

    todos.forEach((todo) => {
        saveTodo(todo.text, todo.done, 0);
    });

    toggleEmptyState();
});


//remover tarefa do localStorage
const removeTodoLocalStorage = (text) => {
    const todos = getTodosLocalStorage();

    const filteredTodos = todos.filter((todo) => todo.text !== text);

    localStorage.setItem("todos", JSON.stringify(filteredTodos));
};


// dark mode

//selecao elementos
const themeToggle = document.getElementById("theme-toggle");
const icon = document.querySelector(".toggle-ball i");

//conectar com o botao
themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    //mudar icone
    if (document.body.classList.contains("dark")) {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    } else {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    };
});


// carregar tema salvo no localStorage
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.checked = true;
        //salvar icone
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }
});







