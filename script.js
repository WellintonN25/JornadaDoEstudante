// --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---

// Usuários aceitos (simulando um banco de dados)
const ACCEPTED_USERS = [
    { email: "user@estudo.com", name: "Estudante Mestre" },
    { email: "guest@rpg.com", name: "Aprendiz Curioso" },
];

// Estado do jogador (dados persistentes em memória)
let playerState = {
    email: '',
    name: '',
    level: 1,
    xp: 0,
    tasks: [], // { name: string, xp: number }
};

// Fórmula para XP necessário para subir de nível (aumento constante)
const XP_BASE = 100;
const XP_LEVEL_MULTIPLIER = 1.5; // XP_Necessário = XP_BASE * (Nível ^ Multiplicador)

function getXpNeeded(level) {
    // Para manter a barra sempre aumentando, aumentamos o XP necessário por nível.
    // Nível 1 -> 100 XP
    // Nível 2 -> 100 * (2^1.5) ≈ 282 XP
    // Nível 3 -> 100 * (3^1.5) ≈ 519 XP
    return Math.floor(XP_BASE * (level ** XP_LEVEL_MULTIPLIER));
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
        alert(`🎉 PARABÉNS! Você subiu para o Nível ${playerState.level}!`);
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
    xpBarFill.style.width = `${xpPercentage.toFixed(2)}%`;
    xpCurrentProgress.textContent = playerState.xp;
    
    // Salva o estado após cada atualização
    saveState();
}

/**
 * Renderiza a lista de tarefas no DOM.
 */
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Limpa a lista existente

    if (playerState.tasks.length === 0) {
        taskList.innerHTML = '<li style="text-align: center; color: #777;">Você não tem tarefas ativas. Adicione uma!</li>';
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
                <button class="complete-btn" data-index="${index}">Concluir</button>
                <button class="remove-btn" data-index="${index}">Remover</button>
            </div>
        `;
        taskList.appendChild(li);
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
        alert("Por favor, insira o nome da tarefa.");
        return;
    }

    playerState.tasks.push({ name: taskName, xp: taskXp });
    input.value = ''; // Limpa o input
    
    renderTasks();
    saveState();
}

/**
 * Remove uma tarefa pelo índice e concede XP se for conclusão.
 * @param {number} index - O índice da tarefa na array.
 * @param {boolean} isCompletion - Se a tarefa foi concluída (true) ou apenas removida (false).
 */
function handleTaskAction(index, isCompletion) {
    if (index >= 0 && index < playerState.tasks.length) {
        const task = playerState.tasks[index];
        
        // Remove a tarefa da array
        playerState.tasks.splice(index, 1);
        
        if (isCompletion) {
            playerState.xp += task.xp; // Adiciona XP
            updateStatus(); // Atualiza XP e nível
            alert(`✅ Tarefa "${task.name}" concluída! Você ganhou ${task.xp} XP!`);
        } else {
            alert(`❌ Tarefa "${task.name}" removida sem XP.`);
        }
        
        renderTasks();
        saveState();
    }
}

// --- 4. FUNÇÕES DE PERSISTÊNCIA E LOGIN ---

/**
 * Salva o estado atual do jogador no Local Storage do navegador.
 */
function saveState() {
    if (playerState.email) {
        localStorage.setItem(`rpg_study_state_${playerState.email}`, JSON.stringify(playerState));
    }
}

/**
 * Carrega o estado do jogador salvo ou inicia um novo.
 * @param {string} email - O email do usuário logado.
 */
function loadState(email) {
    const savedState = localStorage.getItem(`rpg_study_state_${email}`);
    
    // Busca os dados de nome na lista de usuários aceitos
    const user = ACCEPTED_USERS.find(u => u.email === email);
    
    if (savedState) {
        // Carrega o estado existente
        playerState = JSON.parse(savedState);
    } else {
        // Inicia um novo estado
        playerState = {
            email: email,
            name: user.name,
            level: 1,
            xp: 0,
            tasks: [],
        };
    }
    
    // Garante que o nome e email estejam corretos, mesmo se o estado for antigo
    playerState.email = email;
    playerState.name = user.name;
    
    // Atualiza o cabeçalho e as interfaces
    document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${playerState.name}!`;
    updateStatus();
    renderTasks();
}

/**
 * Gerencia o processo de login.
 */
function handleLogin() {
    const emailInput = document.getElementById('email-input');
    const messageElement = document.getElementById('login-message');
    const email = emailInput.value.trim().toLowerCase();

    // 1. Validação simples de formato de e-mail (basta ter @)
    if (!email || !email.includes('@')) {
        messageElement.textContent = "Por favor, insira um e-mail válido.";
        return;
    }
    
    // 2. Verifica se o e-mail está na lista de usuários aceitos
    const userFound = ACCEPTED_USERS.find(user => user.email === email);

    if (userFound) {
        // Login bem-sucedido
        messageElement.textContent = "";
        
        // Esconde o login e mostra a tela principal
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');

        // Carrega os dados do jogador
        loadState(email);
        
        // Salva o email na sessão para manter o estado (simples)
        sessionStorage.setItem('current_user_email', email);

    } else {
        // E-mail não encontrado
        messageElement.textContent = `Usuário não cadastrado. E-mails válidos: ${ACCEPTED_USERS.map(u => u.email).join(', ')}.`;
    }
}

/**
 * Gerencia o processo de logout.
 */
function handleLogout() {
    // Limpa o estado da sessão
    sessionStorage.removeItem('current_user_email');
    
    // Reseta o estado do jogador em memória (não afeta o Local Storage)
    playerState = { email: '', name: '', level: 1, xp: 0, tasks: [] };
    
    // Esconde a tela principal e mostra o login
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    
    // Limpa o input do login
    document.getElementById('email-input').value = '';
    document.getElementById('login-message').textContent = "";
}

// --- 5. EVENT LISTENERS E INICIALIZAÇÃO ---

/**
 * Adiciona todos os listeners de eventos.
 */
function setupEventListeners() {
    // Login/Logout
    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // Adicionar Tarefa
    document.getElementById('add-task-button').addEventListener('click', addTask);
    
    // Gerenciar Tarefas (Usa delegação de eventos na lista)
    document.getElementById('task-list').addEventListener('click', (event) => {
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);
        
        if (target.classList.contains('complete-btn')) {
            handleTaskAction(index, true); // Concluir tarefa (com XP)
        } else if (target.classList.contains('remove-btn')) {
            handleTaskAction(index, false); // Remover tarefa (sem XP)
        }
    });
}

/**
 * Verifica se há um usuário logado na sessão ao carregar a página.
 */
function init() {
    setupEventListeners();
    
    const currentUserEmail = sessionStorage.getItem('current_user_email');
    
    if (currentUserEmail) {
        // Se houver um e-mail na sessão, carrega o estado e pula o login
        const userFound = ACCEPTED_USERS.find(user => user.email === currentUserEmail);
        if (userFound) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-screen').classList.remove('hidden');
            loadState(currentUserEmail);
        } else {
            // Se o e-mail não estiver mais na lista (remoção), força o logout
            sessionStorage.removeItem('current_user_email');
        }
    }
    // Se não houver e-mail, a tela de login já é exibida por padrão no HTML/CSS
}

// Inicia a aplicação
init();
