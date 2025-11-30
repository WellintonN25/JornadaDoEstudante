// --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---

// Usuários aceitos (Simulando um banco de dados de usuários/senhas)
const ACCEPTED_USERS = [
    { username: "mestre", password: "123", name: "Estudante Mestre" },
    { username: "aprendiz", password: "456", name: "Aprendiz Curioso" },
    { username: "wellinton", password: "0000", name: "Wellinton" },
    { username: "yasmin", password: "123", name: "Yasmin" },
];

// Estado do jogador (AGORA INCLUI completedTasks)
let playerState = {
    username: '',
    name: '',
    level: 1,
    xp: 0,
    tasks: [], // { name: string, xp: number }
    completedTasks: [], // { name: string, xp: number, date: string }
};

// Fórmula para XP necessário para subir de nível (Melhoria sugerida - Crescimento Exponencial)
const XP_BASE = 100;
const XP_LEVEL_POWER = 1.5; 

function getXpNeeded(level) {
    // XP_Necessário = 100 * (Nível ^ 1.5)
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
    while (playerState.xp >= xpNeeded) {
        playerState.xp -= xpNeeded; // Subtrai o XP necessário
        playerState.level++;       // Aumenta o nível
        currentLevel = playerState.level;
        xpNeeded = getXpNeeded(currentLevel); // Recalcula o XP necessário para o próximo nível

        // Alerta de Level Up!
        setTimeout(() => {
            alert(`⭐ PARABÉNS, ${playerState.name}! Você subiu para o Nível ${playerState.level}!`);
        }, 100);
    }

    // Atualiza o DOM
    const levelElement = document.getElementById('player-level');
    const xpCurrentElement = document.getElementById('player-xp');
    const xpBarFill = document.getElementById('xp-bar-fill');
    const xpCurrentProgress = document.getElementById('xp-current-progress');
    const xpNeededElement = document.getElementById('xp-needed');

    levelElement.textContent = playerState.level;
    xpCurrentElement.textContent = playerState.xp;
    xpNeededElement.textContent = xpNeeded;

    // Calcula a porcentagem para a barra
    const xpPercentage = (playerState.xp / xpNeeded) * 100;

    xpBarFill.style.width = `${Math.min(xpPercentage, 100).toFixed(2)}%`;
    xpCurrentProgress.textContent = playerState.xp;

    saveState();
}

/**
 * Renderiza a lista de tarefas ativas no DOM.
 */
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Limpa a lista existente

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

    // Mostra as 5 tarefas mais recentes
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
    saveState();
}

/**
 * Remove uma tarefa pelo índice e concede XP se for conclusão.
 */
function handleTaskAction(index, isCompletion) {
    if (index >= 0 && index < playerState.tasks.length) {
        const task = playerState.tasks[index];

        // Remove a tarefa da array
        playerState.tasks.splice(index, 1);

        if (isCompletion) {
            playerState.xp += task.xp; // Adiciona XP
            
            // Adiciona ao histórico de missões concluídas
            playerState.completedTasks.push({
                name: task.name,
                xp: task.xp,
                date: new Date().toLocaleDateString('pt-BR')
            });

            updateStatus(); // Atualiza XP e nível
            renderCompletedTasks(); // Atualiza o histórico

            // Feedback dinâmico no cabeçalho
            document.getElementById('welcome-message').textContent = `+${task.xp} XP! Missão Concluída!`;
            setTimeout(() => {
                 document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${playerState.name}!`;
            }, 1500);

        } else {
            // Apenas remove
        }

        renderTasks();
        saveState();
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
    
    // CORREÇÃO: Usar a chave de localStorage diretamente
    const savedState = localStorage.getItem(`rpg_study_state_${username}`);
    
    if (savedState) {
        // Carrega o estado existente (garantindo o progresso individual)
        playerState = JSON.parse(savedState);
    } else {
        // Inicia um novo estado se não houver progresso salvo
        playerState = {
            username: username,
            name: user.name,
            level: 1,
            xp: 0,
            tasks: [],
            completedTasks: [],
        };
    }

    // Garante que o nome e username estejam corretos, caso o objeto salvo seja antigo
    playerState.username = username;
    playerState.name = user.name;

    // Atualiza a interface
    document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${playerState.name}!`;
    updateStatus(); 
    renderTasks();
    renderCompletedTasks(); // Renderiza o histórico ao carregar
}

/**
 * Gerencia o processo de login.
 */
function handleLogin() {
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

        // Efeito de transição de login
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
    sessionStorage.removeItem('current_username');

    // Transição da tela
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
            if(confirm(`Tem certeza que deseja remover a missão "${playerState.tasks[index].name}" sem ganhar XP?`)) {
                 handleTaskAction(index, false);
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
