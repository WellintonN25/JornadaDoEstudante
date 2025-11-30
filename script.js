// --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---

// Usuários aceitos (Simulando um banco de dados de usuários/senhas)
const ACCEPTED_USERS = [
    { username: "mestre", password: "123", name: "Estudante Mestre" },
    { username: "aprendiz", password: "456", name: "Aprendiz Curioso" },
    { username: "wellinton", password: "0000", name: "Wellinton" },
    { username: "yasmin", password: "123", name: "Yasmin" },
];

// Modelo de estado do jogador (Usado para inicialização e migração)
const BASE_PLAYER_STATE = {
    level: 1,
    xp: 0,
    tasks: [],
    completedTasks: [], // Garantir que essa chave sempre exista
};

// Estado do jogador (dados em memória)
let playerState = { ...BASE_PLAYER_STATE };
playerState.username = '';
playerState.name = '';


// Fórmula para XP necessário para subir de nível (Crescimento Exponencial)
const XP_BASE = 100;
const XP_LEVEL_POWER = 1.5; 

function getXpNeeded(level) {
    return Math.floor(XP_BASE * (level ** XP_LEVEL_POWER));
}

// --- 2. FUNÇÕES DE RENDERIZAÇÃO E ATUALIZAÇÃO ---

/**
 * Calcula e atualiza a barra de XP e o nível.
 */
function updateStatus() {
    let currentLevel = playerState.level;
    let xpNeeded = getXpNeeded(currentLevel);

    // Lógica para subir de nível (Level Up)
    let leveledUp = false;
    while (playerState.xp >= xpNeeded) {
        playerState.xp -= xpNeeded; 
        playerState.level++;      
        currentLevel = playerState.level;
        xpNeeded = getXpNeeded(currentLevel); 
        leveledUp = true;
    }

    if (leveledUp) {
        setTimeout(() => {
            alert(`⭐ PARABÉNS, ${playerState.name}! Você subiu para o Nível ${playerState.level}!`);
        }, 100);
    }

    // Atualiza o DOM
    document.getElementById('player-level').textContent = playerState.level;
    document.getElementById('player-xp').textContent = playerState.xp;
    document.getElementById('xp-needed').textContent = xpNeeded;
    
    const xpPercentage = (playerState.xp / xpNeeded) * 100;
    const xpBarFill = document.getElementById('xp-bar-fill');
    
    xpBarFill.style.width = `${Math.min(xpPercentage, 100).toFixed(2)}%`;
    document.getElementById('xp-current-progress').textContent = playerState.xp;

    saveState(); // Garante que o status seja salvo após LEVEL UP ou XP change
}

/**
 * Renderiza a lista de tarefas ativas no DOM.
 */
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; 

    if (playerState.tasks.length === 0) {
        taskList.innerHTML = '<li class="empty-list">Sua lista de missões está vazia. Adicione uma nova jornada!</li>';
        return;
    }

    playerState.tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="task-info">
                <span>${task.name}</span>
                <span class="task-xp">+${task.xp} XP</span>
            </div>
            <div class="task-actions">
                <button class="complete-btn primary-btn" data-index="${index}">Concluir</button>
                <button class="remove-btn danger-btn" data-index="${index}">Remover</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

/**
 * Renderiza a lista de tarefas concluídas no DOM.
 */
function renderCompletedTasks() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (playerState.completedTasks.length === 0) {
        historyList.innerHTML = '<li class="empty-list">Nenhuma missão concluída ainda. Comece a estudar!</li>';
        return;
    }

    // Mostra as 5 tarefas mais recentes, por isso usamos slice(-5) e reverse()
    const recentTasks = playerState.completedTasks.slice(-5).reverse();

    recentTasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('completed-task-item');
        li.innerHTML = `
            <div class="task-info">
                <span>✅ ${task.name}</span>
            </div>
            <div class="task-details">
                <span class="task-xp">+${task.xp} XP</span>
                <span class="task-date">${task.date}</span>
            </div>
        `;
        historyList.appendChild(li);
    });
}

// --- 3. FUNÇÕES DE MANIPULAÇÃO DE DADOS (Tarefas, XP) ---

/**
 * Adiciona uma nova tarefa à lista do jogador.
 */
function addTask() {
    const input = document.getElementById('new-task-input');
    const xpSelect = document.getElementById('task-xp-value');

    const taskName = input.value.trim();
    const taskXp = parseInt(xpSelect.value, 10);

    if (taskName === "") {
        alert("Por favor, insira o nome da Missão.");
        return;
    }

    if (playerState.tasks.length >= 10) {
        alert("Você atingiu o limite de 10 Missões Ativas. Conclua algumas!");
        return;
    }

    playerState.tasks.push({ name: taskName, xp: taskXp });
    input.value = '';

    renderTasks();
    saveState(); // Salva após adicionar nova tarefa
}

/**
 * Remove uma tarefa pelo índice e concede XP se for conclusão.
 */
function handleTaskAction(index, isCompletion) {
    if (index >= 0 && index < playerState.tasks.length) {
        const task = playerState.tasks[index];

        playerState.tasks.splice(index, 1);

        if (isCompletion) {
            playerState.xp += task.xp; 
            
            playerState.completedTasks.push({
                name: task.name,
                xp: task.xp,
                date: new Date().toLocaleDateString('pt-BR')
            });

            // Feedback dinâmico no cabeçalho
            document.getElementById('welcome-message').textContent = `+${task.xp} XP! Missão Concluída!`;
            setTimeout(() => {
                 document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${playerState.name}!`;
            }, 1500);
            
            updateStatus(); // Chama updateStatus, que também chama saveState
            renderCompletedTasks(); 

        } else {
            // Se apenas remover, precisamos salvar o estado da lista de tasks
            saveState();
        }

        renderTasks();
    }
}

// --- 4. FUNÇÕES DE PERSISTÊNCIA E LOGIN (CORRIGIDO) ---

/**
 * Salva o estado atual do jogador no Local Storage do navegador.
 */
function saveState() {
    if (playerState.username) {
        localStorage.setItem(`rpg_study_state_${playerState.username}`, JSON.stringify(playerState));
    }
}

/**
 * Carrega o estado do jogador salvo ou inicia um novo.
 * @param {string} username - O nome de usuário logado.
 */
function loadState(username) {
    const user = ACCEPTED_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    // CORREÇÃO CRÍTICA: Buscar o estado salvo
    const savedStateJSON = localStorage.getItem(`rpg_study_state_${username}`);
    
    let loadedState = null;

    if (savedStateJSON) {
        try {
            loadedState = JSON.parse(savedStateJSON);
        } catch (e) {
            console.error("Erro ao carregar estado salvo. Iniciando novo estado.", e);
            // Se o JSON estiver corrompido, carregamos nulo.
        }
    }
    
    // Inicialização do estado base
    const initialState = { 
        ...BASE_PLAYER_STATE, 
        username: username,
        name: user.name,
    };

    if (loadedState) {
        // CORREÇÃO CRÍTICA: Mesclar o estado salvo com o estado base 
        // Isso garante que novas propriedades (como completedTasks) existam,
        // mesmo que o estado salvo seja antigo.
        playerState = {
            ...initialState,
            ...loadedState,
            // Sobrescreve nome e username caso os dados do ACCEPTED_USERS tenham mudado
            username: username, 
            name: user.name,
        };
    } else {
        // Inicia novo estado
        playerState = initialState;
    }
    
    // Atualiza a interface
    document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${playerState.name}!`;
    updateStatus(); 
    renderTasks();
    renderCompletedTasks(); 
}

/**
 * Gerencia o processo de login.
 */
function handleLogin() {
    // ... (restante da função handleLogin permanece inalterado) ...
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const messageElement = document.getElementById('login-message');

    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!username || !password) {
        messageElement.textContent = "Por favor, preencha o Nome de Usuário e a Senha.";
        return;
    }

    const userFound = ACCEPTED_USERS.find(user => 
        user.username.toLowerCase() === username && user.password === password
    );

    if (userFound) {
        messageElement.textContent = "";

        document.getElementById('login-screen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-screen').classList.remove('hidden');
            document.getElementById('login-screen').classList.remove('fade-out');
        }, 500);

        loadState(username);
        sessionStorage.setItem('current_username', username);

    } else {
        messageElement.textContent = `Credenciais inválidas. Dica: 'mestre/123' ou 'yasmin/123'.`;
    }
}


/**
 * Gerencia o processo de logout.
 */
function handleLogout() {
    // ... (restante da função handleLogout permanece inalterado) ...
    sessionStorage.removeItem('current_username');

    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');

    document.getElementById('username-input').value = '';
    document.getElementById('password-input').value = '';
    document.getElementById('login-message').textContent = "";
}

// --- 5. EVENT LISTENERS E INICIALIZAÇÃO ---

/**
 * Adiciona todos os listeners de eventos.
 */
function setupEventListeners() {
    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    document.getElementById('add-task-button').addEventListener('click', addTask);
    document.getElementById('new-task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Delegação de eventos para tarefas
    document.getElementById('task-list').addEventListener('click', (event) => {
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);

        if (target.classList.contains('complete-btn')) {
            handleTaskAction(index, true); 
        } else if (target.classList.contains('remove-btn')) {
            // Verifica se o índice é válido antes de tentar acessar a tarefa
            if (index >= 0 && index < playerState.tasks.length) {
                if(confirm(`Tem certeza que deseja remover a missão "${playerState.tasks[index].name}" sem ganhar XP?`)) {
                    handleTaskAction(index, false);
                }
            }
        }
    });
}

/**
 * Verifica se há um usuário logado na sessão ao carregar a página.
 */
function init() {
    setupEventListeners();

    const currentUsername = sessionStorage.getItem('current_username');

    if (currentUsername) {
        const userFound = ACCEPTED_USERS.find(user => user.username.toLowerCase() === currentUsername);
        if (userFound) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-screen').classList.remove('hidden');
            loadState(currentUsername);
        } else {
            sessionStorage.removeItem('current_username');
        }
    }
}

// Inicia a aplicação
init();
