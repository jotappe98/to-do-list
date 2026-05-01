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
const confirmEditBtn = document.querySelector("#confirm-edit");
const toolbar = document.querySelector("#toolbar");
const emptyState = document.querySelector("#empty-state");
const noResults = document.querySelector("#no-results");
const editingLabel = document.querySelector("#editing-label");



let oldInputValue;
let editingTodoId = null;

//Funcoes


//Funcao para criar uma nova tarefa
const saveTodo = (text,done = 0,save = 1,idParam = null) => {

    const todo = document.createElement("div")
    todo.classList.add("todo")

    const id = idParam ? idParam : Date.now();
    todo.setAttribute("data-id", id);

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
            id,
            text,
            done
        });
    }

    const warning = document.querySelector("#duplicate-warning");
    warning.style.display = "none";

    todoList.appendChild(todo);

    todoInput.value = "";
    todoInput.focus();
    toggleEmptyState();
    applyFilters();
}

//Funcao para alternar entre os formularios de edicao e criacao de tarefas
const toggleForms = () => {
    editForm.classList.toggle("hide");
    todoForm.classList.toggle("hide");
    todoList.classList.toggle("hide");
    toolbar.classList.toggle("hide");
}




//Funcao para filtrar as tarefas
const applyFilters = () => {
    if (!editForm.classList.contains("hide")) return;

    const todos = document.querySelectorAll(".todo");
    const searchValue = searchInput.value.toLowerCase();
    const filterValue = filterBtn.value;

    todos.forEach((todo) => {
        const title = todo.querySelector("h3").innerText.toLowerCase();
        const isDone = todo.classList.contains("done");

        const matchSearch = title.includes(searchValue);

        let matchFilter = true;

        if (filterValue === "done") {
            matchFilter = isDone;
        } else if (filterValue === "todo") {
            matchFilter = !isDone;
        }

        todo.style.display = (matchSearch && matchFilter) ? "flex" : "none";
    });

    toggleEmptyState(); 
};


//Funcao para atualizar uma tarefa

const updateTodo = (text) => {
    const todo = document.querySelector(`[data-id="${editingTodoId}"]`);

    if (todo) {
        const todoTitle = todo.querySelector("h3");
        todoTitle.innerText = text;
    }
}


//Funcao para exibir mensagem de "Nenhuma tarefa encontrada" quando a pesquisa nao retornar resultados

const toggleNoResultsMessage = (hasResults) => {
    const message = document.querySelector("#no-results");

    message.style.display = hasResults ? "none" : "block";
};




//Funcao para UX dinamico

const toggleEmptyState = () => {
    if (!editForm.classList.contains("hide")) return;

    const todos = document.querySelectorAll(".todo");
    const visibleTodos = Array.from(todos).filter(todo => todo.style.display !== "none");
    const searchValue = searchInput.value.trim();
    const filterValue = filterBtn.value;

    emptyState.style.display = "block";

    
    if (searchValue) {
        if (visibleTodos.length === 0) {
            emptyState.innerText = "Nenhuma tarefa encontrada";
            emptyState.classList.remove("has-tasks");
        } else {
            emptyState.innerText = "Suas tarefas:";
            emptyState.classList.add("has-tasks");
        }
        return;
    }

    
    if (visibleTodos.length === 0) {
        switch(filterValue) {
            case "done":
                emptyState.innerText = "Você ainda não concluiu nenhuma tarefa";
                break;
            case "todo":
                emptyState.innerText = "Sem tarefas pendentes";
                break;
            default:
                emptyState.innerText = "O que vamos fazer hoje?";
        }

        emptyState.classList.remove("has-tasks");
        return;
    }

    
    emptyState.innerText = "Suas tarefas:";
    emptyState.classList.add("has-tasks");
};

//Funcao de verificacao de tarefa ja existente

const checkDuplicate = (text) => {
    const todos = document.querySelectorAll(".todo");

    return Array.from(todos).some(todo => {
        const title = todo.querySelector("h3").innerText.trim().toLowerCase();
        return title === text.trim().toLowerCase();
    });
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
    const parentEl = targetEl.closest(".todo");
    let todoTitle;

    //Recuperacao do titulo da tarefa
    if(parentEl && parentEl.querySelector("h3")){
        todoTitle = parentEl.querySelector("h3").innerText;
    }

    //Conclusão de tarefa
    if(targetEl.classList.contains("finish-todo")){
        parentEl.classList.toggle("done");
        updateLocalStorage();
        applyFilters();
    }

    //Edição de tarefa
    if(targetEl.classList.contains("edit-todo")){
    toggleForms();
    editInput.value = todoTitle;
    oldInputValue = todoTitle;
    editingTodoId = parentEl.getAttribute("data-id");

    editingLabel.innerText = `Editando: "${todoTitle}"`;
    editingLabel.classList.remove("hide");

    emptyState.style.display = "none";
    noResults.style.display = "none";
};

    //Remoção de tarefa
    if(targetEl.classList.contains("remove-todo")){
        const id = parentEl.getAttribute("data-id");
        parentEl.remove();
        updateLocalStorage();
        toggleEmptyState();
        removeTodoLocalStorage(id);
        applyFilters();
    }
});

//Evento para cancelar a edição de uma tarefa
cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleForms();
    toggleEmptyState();
    editingLabel.classList.add("hide");
    applyFilters();
    
});

//Evento para salvar a edição de uma tarefa
editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const editInputValue = editInput.value;

    if(editInputValue ){
        updateTodo(editInputValue);
        updateLocalStorage();
    };

    editingTodoId = null;

    toggleForms();
    toggleEmptyState();
    editingLabel.classList.add("hide");
    applyFilters();
})




//Evento para limpar pesquisa no campo de busca

eraseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("keyup"));
});


//Evento para confirmar a edição de uma tarefa
confirmEditBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const editInputValue = editInput.value;

    if (editInputValue) {
        updateTodo(editInputValue);
        updateLocalStorage();
    }

    editingTodoId = null;

    toggleForms();
    toggleEmptyState();
    editingLabel.classList.add("hide");
    applyFilters();
});



//Evento para buscar tarefas
searchInput.addEventListener("keyup", () => {
    applyFilters();
});



//Evento para filtrar as tarefas
filterBtn.addEventListener("change", () => {
    applyFilters();
});


//Evento para tarefa duplicada

todoInput.addEventListener("focus", () => {
    todoInput.dataset.active = "true";
});

todoInput.addEventListener("input", (e) => {
    if (todoInput.dataset.active !== "true") return;

    const value = e.target.value;
    const warning = document.querySelector("#duplicate-warning");

    if (!value.trim()) {
        warning.style.display = "none";
        return;
    }

    const hasDuplicate = checkDuplicate(value);

    warning.style.display = hasDuplicate ? "block" : "none";
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
        const id = todo.getAttribute("data-id");

        todos.push({ id, text, done });
    });

    localStorage.setItem("todos", JSON.stringify(todos));
};

//mostrar todos do localStorage na tela
document.addEventListener("DOMContentLoaded", () => {
    const todos = getTodosLocalStorage();

    todos.forEach((todo) => {
        saveTodo(todo.text, todo.done, 0, todo.id);
    });

    document.querySelector("#duplicate-warning").style.display = "none";

    applyFilters();
});


//remover tarefa do localStorage
const removeTodoLocalStorage = (id) => {
    const todos = getTodosLocalStorage();

    const filteredTodos = todos.filter((todo) => todo.id != id);

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