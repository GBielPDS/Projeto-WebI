// Função para obter usuários do Local Storage
function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios') || '{}');
}

// Função para salvar usuários no Local Storage
function setUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function toggleForm(form) {
    document.getElementById('login-form').style.display = form === 'login' ? 'block' : 'none';
    document.getElementById('cadastro-form').style.display = form === 'cadastro' ? 'block' : 'none';
    document.getElementById('login-msg').textContent = '';
    document.getElementById('cadastro-msg').textContent = '';
}

function cadastro() {
    const usuario = document.getElementById('cadastro-usuario').value.trim();
    const senha = document.getElementById('cadastro-senha').value.trim();
    let usuarios = getUsuarios();
    if (!usuario || !senha) {
        document.getElementById('cadastro-msg').textContent = 'Preencha todos os campos!';
        document.getElementById('cadastro-msg').className = 'error';
        return;
    }
    if (usuarios[usuario]) {
        document.getElementById('cadastro-msg').textContent = 'Usuário já existe!';
        document.getElementById('cadastro-msg').className = 'error';
        return;
    }
    usuarios[usuario] = senha;
    setUsuarios(usuarios);
    document.getElementById('cadastro-msg').textContent = 'Cadastro realizado com sucesso!';
    document.getElementById('cadastro-msg').className = 'msg';
    setTimeout(() => {
        toggleForm('login');
    }, 1200);
}

function login() {
    const usuario = document.getElementById('login-usuario').value.trim();
    const senha = document.getElementById('login-senha').value.trim();
    let usuarios = getUsuarios();
    if (!usuario || !senha) {
        document.getElementById('login-msg').textContent = 'Preencha todos os campos!';
        document.getElementById('login-msg').className = 'msg erro';
        return;
    }
    if (usuarios[usuario] === senha) {
        document.getElementById('login-msg').textContent = 'Login realizado com sucesso!';
        document.getElementById('login-msg').className = 'msg';
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1000); // Redireciona após 1 segundo
    } else {
        document.getElementById('login-msg').textContent = 'Usuário ou senha incorretos.';
        document.getElementById('login-msg').className = 'msg erro';
    }
}