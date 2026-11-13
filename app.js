// FATEC ID — lógica principal da aplicação
// O atributo defer no HTML garante que os elementos estejam disponíveis
// quando este arquivo for executado.

const taskForm = document.querySelector("#taskForm");
const taskName = document.querySelector("#taskName");
const taskPriority = document.querySelector("#taskPriority");
const taskList = document.querySelector("#taskList");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const taskCount = document.querySelector("#taskCount");
const progressPercent = document.querySelector("#progressPercent");
const progressFill = document.querySelector("#progressFill");
const progressText = document.querySelector("#progressText");
const themeButton = document.querySelector("#themeButton");
const saveStatus = document.querySelector("#saveStatus");
const clearCompletedButton = document.querySelector("#clearCompleted");

let tasks = carregarTarefas();

// Retorna as tarefas salvas no navegador. localStorage armazena strings;
// JSON.parse converte a string JSON novamente em array/objetos.
function carregarTarefas() {
  const dadosSalvos = localStorage.getItem("fatecid-tasks");
  if (dadosSalvos === null) return [];
  try {
    return JSON.parse(dadosSalvos);
  } catch (error) {
    console.error("Não foi possível ler as tarefas salvas.", error);
    return [];
  }
}

// Salva o estado atual da aplicação no navegador.
function salvarTarefas() {
  localStorage.setItem("fatecid-tasks", JSON.stringify(tasks));
  saveStatus.textContent = "Salvo neste navegador";
}

// Atualiza a lista e os indicadores da tela.
function renderizarTarefas() {
  const termo = searchInput.value.trim().toLowerCase();
  const filtro = statusFilter.value;

  // Limpa os elementos anteriores para montar a lista atual.
  taskList.textContent = "";

  const tarefasFiltradas = tasks.filter((task) => {
    const correspondeAoTexto = task.title.toLowerCase().includes(termo);
    const correspondeAoStatus =
      filtro === "todas" ||
      (filtro === "concluida" && task.completed === true) ||
      (filtro === "pendente" && task.completed === false);

    return correspondeAoTexto && correspondeAoStatus;
  });

  if (tarefasFiltradas.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.className = "empty-state";
    mensagem.textContent = tasks.length === 0
      ? "Nenhuma tarefa por enquanto. Adicione sua primeira tarefa!"
      : "Nenhuma tarefa corresponde à busca ou ao filtro.";
    taskList.appendChild(mensagem);
  }

  tarefasFiltradas.forEach((task) => {
    const item = document.createElement("div");
    item.className = task.completed ? "task-item completed" : "task-item";
    item.setAttribute("data-task-id", task.id);

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = task.completed ? "complete-button is-complete" : "complete-button";
    completeButton.textContent = task.completed ? "Concluída ✓" : "Concluir";
    completeButton.setAttribute("data-action", "toggle");
    completeButton.setAttribute("aria-label", task.completed ? "Reabrir tarefa" : "Concluir tarefa");

    const title = document.createElement("span");
    title.className = "task-title";
    // textContent exibe o texto digitado sem interpretar HTML.
    title.textContent = task.title;

    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = task.priority === "alta" ? "Alta" :
      task.priority === "baixa" ? "Baixa" : "Normal";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Excluir";
    deleteButton.setAttribute("data-action", "delete");
    deleteButton.setAttribute("aria-label", `Excluir tarefa: ${task.title}`);

    item.appendChild(completeButton);
    item.appendChild(title);
    item.appendChild(priority);
    item.appendChild(deleteButton);
    taskList.appendChild(item);
  });

  atualizarResumo();
}

// Atualiza os números e a barra de progresso.
const atualizarResumo = () => {
  const total = tasks.length;
  const concluidas = tasks.filter((task) => task.completed === true).length;
  const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  taskCount.textContent = `${total} ${total === 1 ? "tarefa" : "tarefas"}`;
  progressPercent.textContent = `${percentual}%`;
  progressFill.style.width = `${percentual}%`;
  progressText.textContent = `${concluidas} de ${total} tarefas concluídas`;
};

// Evento submit: evita o envio tradicional e processa a tarefa no front-end.
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const titulo = taskName.value.trim();
  const prioridade = taskPriority.value;

  // Validação defensiva: não aceita texto vazio ou composto por espaços.
  if (titulo === "") {
    taskName.focus();
    return;
  }

  const novaTarefa = {
    id: Date.now().toString(),
    title: titulo,
    priority: prioridade,
    completed: false
  };

  tasks = [...tasks, novaTarefa];
  salvarTarefas();
  renderizarTarefas();
  taskForm.reset();
  taskName.focus();
});

// Delegação de eventos: um listener na lista atende aos botões e checkboxes
// de todas as tarefas, inclusive os elementos criados depois do carregamento.
taskList.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (actionElement === null) return;

  const item = actionElement.closest("[data-task-id]");
  if (item === null) return;

  const taskId = item.getAttribute("data-task-id");
  const action = actionElement.getAttribute("data-action");

  if (action === "delete") {
    tasks = tasks.filter((task) => task.id !== taskId);
  }

  if (action === "toggle") {
    tasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
  }

  salvarTarefas();
  renderizarTarefas();
});

// Eventos input e change atualizam a visualização sem recarregar a página.
searchInput.addEventListener("input", renderizarTarefas);
statusFilter.addEventListener("change", renderizarTarefas);

// Remove todas as tarefas concluídas.
clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => task.completed === false);
  salvarTarefas();
  renderizarTarefas();
});

// Preferência de tema também fica salva no localStorage.
function aplicarTema(tema) {
  document.body.classList.toggle("dark-theme", tema === "escuro");
  themeButton.textContent = tema === "escuro" ? "☀" : "☾";
  themeButton.setAttribute("aria-label",
    tema === "escuro" ? "Ativar tema claro" : "Ativar tema escuro");
}

const temaSalvo = localStorage.getItem("fatecid-theme") || "claro";
aplicarTema(temaSalvo);

themeButton.addEventListener("click", () => {
  const temaAtual = document.body.classList.contains("dark-theme") ? "escuro" : "claro";
  const novoTema = temaAtual === "escuro" ? "claro" : "escuro";
  localStorage.setItem("fatecid-theme", novoTema);
  aplicarTema(novoTema);
});

// Navegação entre as seis abas de apresentação.
const presenterTabs = document.querySelectorAll(".presenter-tab");
const presenterPanels = document.querySelectorAll(".presenter-panel");

presenterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selected = tab.getAttribute("data-tab");

    presenterTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    presenterPanels.forEach((panel) => {
      const isActive = panel.id === `panel-${selected}`;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });
  });
});

// Botões de copiar os blocos de código exibidos nas abas.
document.querySelectorAll(".copy-code").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".code-card").querySelector("code").textContent;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "Copiado!";
    } catch (error) {
      button.textContent = "Selecione o código";
    }
    setTimeout(() => { button.textContent = "Copiar código"; }, 1600);
  });
});

// Primeira renderização da aplicação.
renderizarTarefas();
