const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDescription = document.querySelector("#empty-description");
const searchInput = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll(".filter-button");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeLabel = document.querySelector("#theme-label");
const summaryRing = document.querySelector(".summary-ring");
const completionPercent = document.querySelector("#completion-percent");
const completedCount = document.querySelector("#completed-count");
const completedFilterCount = document.querySelector("#completed-filter-count");
const pendingCount = document.querySelector("#pending-count");
const totalCount = document.querySelector("#total-count");
const allCount = document.querySelector("#all-count");

let activeFilter = "all";
let searchTerm = "";

const loadTasks = () => {
  try {
    return JSON.parse(localStorage.getItem("taskflow-tasks")) ?? [];
  } catch (error) {
    return [];
  }
};

let tasks = loadTasks();

const saveTasks = () => {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
};

const createTaskId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatTaskTime = (timestamp) => {
  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

const getVisibleTasks = () => {
  return tasks.filter((task) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "pending" && !task.completed) ||
      (activeFilter === "completed" && task.completed);
    const matchesSearch = task.title.toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });
};

const updateEmptyState = (visibleTasks) => {
  emptyState.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyTitle.textContent = "Tu lista está lista para comenzar";
    emptyDescription.textContent = "Agrega tu primera tarea y observa cómo toma forma tu día.";
    return;
  }

  if (visibleTasks.length === 0) {
    emptyTitle.textContent = "No encontramos tareas";
    emptyDescription.textContent = "Prueba con otro filtro o cambia las palabras de búsqueda.";
  }
};

const updateStats = () => {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const degrees = percentage * 3.6;

  completedCount.textContent = completed;
  totalCount.textContent = total;
  allCount.textContent = total;
  pendingCount.textContent = pending;
  completedFilterCount.textContent = completed;
  completionPercent.textContent = `${percentage}%`;
  summaryRing.style.background = `conic-gradient(var(--primary) 0deg ${degrees}deg, var(--primary-soft) ${degrees}deg 360deg)`;
};

const createTaskElement = (task) => {
  const listItem = document.createElement("li");
  listItem.className = `task-item${task.completed ? " is-completed" : ""}`;
  listItem.dataset.id = task.id;

  const completeButton = document.createElement("button");
  completeButton.className = "complete-toggle";
  completeButton.type = "button";
  completeButton.dataset.action = "toggle";
  completeButton.setAttribute(
    "aria-label",
    task.completed ? `Marcar ${task.title} como pendiente` : `Completar ${task.title}`,
  );
  completeButton.textContent = task.completed ? "✓" : "";

  const taskCopy = document.createElement("div");
  taskCopy.className = "task-copy";

  const taskTitle = document.createElement("span");
  taskTitle.className = "task-title";
  taskTitle.textContent = task.title;

  const taskTime = document.createElement("small");
  taskTime.className = "task-time";
  taskTime.textContent = task.completed
    ? "Completada · " + formatTaskTime(task.updatedAt ?? task.createdAt)
    : "Agregada · " + formatTaskTime(task.createdAt);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `Eliminar ${task.title}`);
  deleteButton.textContent = "×";

  taskCopy.append(taskTitle, taskTime);
  listItem.append(completeButton, taskCopy, deleteButton);

  return listItem;
};

const renderTasks = () => {
  const visibleTasks = getVisibleTasks();
  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  updateEmptyState(visibleTasks);
  updateStats();
};

const setActiveFilter = (selectedFilter) => {
  activeFilter = selectedFilter;
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
  renderTasks();
};

const setTheme = (isDark) => {
  document.body.classList.toggle("dark", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeLabel.textContent = isDark ? "Modo claro" : "Modo oscuro";
  localStorage.setItem("taskflow-theme", isDark ? "dark" : "light");
};

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }

  tasks = [
    {
      id: createTaskId(),
      title,
      completed: false,
      createdAt: Date.now(),
    },
    ...tasks,
  ];

  saveTasks();
  taskInput.value = "";
  activeFilter = "all";
  searchTerm = "";
  searchInput.value = "";
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });
  renderTasks();
  taskInput.focus();
});

taskList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) return;

  const taskItem = actionButton.closest(".task-item");
  const taskId = taskItem?.dataset.id;
  if (!taskId) return;

  if (actionButton.dataset.action === "toggle") {
    tasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, completed: !task.completed, updatedAt: Date.now() }
        : task,
    );
  }

  if (actionButton.dataset.action === "delete") {
    tasks = tasks.filter((task) => task.id !== taskId);
  }

  saveTasks();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveFilter(button.dataset.filter));
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderTasks();
});

themeToggle.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark"));
});

const savedTheme = localStorage.getItem("taskflow-theme");
setTheme(savedTheme === "dark");
renderTasks();
