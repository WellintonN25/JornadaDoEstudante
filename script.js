// --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---

// Usuários aceitos (Simulando um banco de dados de usuários/senhas)
const ACCEPTED_USERS = [
    { username: "mestre", password: "123", name: "Estudante Mestre" },
    { username: "aprendiz", password: "456", name: "Aprendiz Curioso" },
    { username: "Wellinton", password: "0000", name: "Wellinton" },
    { username: "Yasmin", password: "123", name: "Yasmin" },
];

// Estado do jogador
let playerState = {
    username: '',
    name: '',
    level: 1,
    xp: 0,
    tasks: [], // { name: string, xp: number }
};

// Fórmula para XP necessário para subir de nível (mais limpa)
const XP_BASE = 100;
const XP_LEVEL_MULTIPLIER = 2; // XP_Necessário = XP_BASE * (Nível) * 2

function getXpNeeded(level) {
    // Nível 1 -> 100 * 1 = 100 XP
    // Nível 2 -> 100 * 2 = 200 XP (Total acumulado: 300)
    // Nível 3 -> 100 * 3 = 300 XP (Total acumulado: 600)
    return XP_BASE * level * XP_LEVEL_MULTIPLIER;
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
            alert(`🎉 PARABÉNS, ${playerState.name}! Você subiu para o Nível ${playerState.level}!`);
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

    // Calcula a porcentagem para a barra (usa o XP para o Nível ATUAL)
    const previousLevelXp = playerState.level > 1 ? getXpNeeded(playerState.level - 1) : 0;
    const currentLevelXpNeeded = xpNeeded;

    // A barra sempre representa o progresso do NÍVEL ATUAL
    const xpPercentage = (playerState.xp / currentLevelXpNeeded) * 100;

    xpBarFill.style.width = `${Math.min(xpPercentage, 100).toFixed(2)}%`;
    xpCurrentProgress.textContent = playerState.xp;
    
    saveState();
}

/**
 * Renderiza a lista de tarefas no DOM.
 */
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Limpa a lista existente

    if (playerState.tasks.length === 0) {
        taskList.innerHTML = '<li style="text-align: center; color: #777; font-style: italic;">Sua lista de missões está vazia. Adicione uma nova jornada!</li>';
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
    
    // Limita o número de tarefas para evitar sobrecarga (UX)
    if (playerState.tasks.length >= 10) {
        alert("Você atingiu o limite de 10 Missões Ativas. Conclua algumas!");
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
            
            // Feedback mais detalhado
            document.getElementById('welcome-message').textContent = `+${task.xp} XP! ${playerState.name}!`;
            setTimeout(() => {
                 document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${playerState.name}!`;
            }, 1500);

        } else {
            // Apenas remove
        }

        renderTasks();
    }
}

// --- 4. FUNÇÕES DE PERSISTÊNCIA E LOGIN ---

/**
 * Salva o estado atual do jogador no Local Storage do navegador.
 */
function saveState() {
    if (playerState.username) {
        // Usa o username para chavear o Local Storage
        localStorage.setItem(`rpg_study_state_${playerState.username}`, JSON.stringify(playerState));
    }
}

/**
 * Carrega o estado do jogador salvo ou inicia um novo.
 * @param {string} username - O nome de usuário logado.
 */
function loadState(username) {
    const savedState = localStorage.getItem(`rpg_study_state_${username}`);

    // Busca os dados de nome na lista de usuários aceitos
    const user = ACCEPTED_USERS.find(u => u.username === username);

    if (savedState) {
        // Carrega o estado existente
        playerState = JSON.parse(savedState);
    } else {
        // Inicia um novo estado
        playerState = {
            username: username,
            name: user.name,
            level: 1,
            xp: 0,
            tasks: [],
        };
    }

    // Garante que o nome e username estejam corretos
    playerState.username = username;
    playerState.name = user.name;

    // Atualiza o cabeçalho e as interfaces
    document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${playerState.name}!`;
    updateStatus(); // Garante que o XP/Nível inicial estejam corretos
    renderTasks();
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

    // 2. Verifica as credenciais
    const userFound = ACCEPTED_USERS.find(user => 
        user.username.toLowerCase() === username && user.password === password
    );

    if (userFound) {
        // Login bem-sucedido
        messageElement.textContent = "";

        // Transição da tela
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');

        // Carrega os dados do jogador
        loadState(username);

        // Salva o username na sessão
        sessionStorage.setItem('current_username', username);

    } else {
        // Credenciais inválidas
        messageElement.textContent = `Credenciais inválidas. Tente 'mestre/123' ou 'aprendiz/456'.`;
    }
}

/**
 * Gerencia o processo de logout.
 */
function handleLogout() {
    // Limpa o estado da sessão
    sessionStorage.removeItem('current_username');

    // Reseta o estado do jogador em memória
    playerState = { username: '', name: '', level: 1, xp: 0, tasks: [] };

    // Transição da tela
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');

    // Limpa inputs
    document.getElementById('username-input').value = '';
    document.getElementById('password-input').value = '';
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

    // Permitir login com 'Enter'
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Adicionar Tarefa
    document.getElementById('add-task-button').addEventListener('click', addTask);
    
    // Adicionar tarefa com 'Enter'
     document.getElementById('new-task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });


    // Gerenciar Tarefas (Usa delegação de eventos na lista)
    document.getElementById('task-list').addEventListener('click', (event) => {
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);

        if (target.classList.contains('complete-btn')) {
            handleTaskAction(index, true); // Concluir tarefa (com XP)
        } else if (target.classList.contains('remove-btn')) {
            // Pergunta de confirmação para remover sem XP
            if(confirm(`Tem certeza que deseja remover a missão "${playerState.tasks[index].name}" sem ganhar XP?`)) {
                 handleTaskAction(index, false); // Remover tarefa (sem XP)
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
        // Se houver um username na sessão, carrega o estado e pula o login
        const userFound = ACCEPTED_USERS.find(user => user.username.toLowerCase() === currentUsername);
        if (userFound) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-screen').classList.remove('hidden');
            loadState(currentUsername);
        } else {
            // Se o usuário não existir, força o logout (limpeza)
            sessionStorage.removeItem('current_username');
        }
    }
}

// Inicia a aplicação
init();
