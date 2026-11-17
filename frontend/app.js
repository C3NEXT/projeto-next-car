const API_BASE_URL = "http://localhost:3606";
const API_USUARIO = `${API_BASE_URL}/usuarios`;
const API_VEICULO = `${API_BASE_URL}/veiculos`;
const API_VENDA = `${API_BASE_URL}/vendas`;

async function getApiError(response) {
    try {
        const body = await response.json();
        return body.message || body.error || response.statusText;
    } catch {
        return response.statusText || `HTTP ${response.status}`;
    }
}


const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeIcon.innerText = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = 'light';

    if (currentTheme === 'light') {
        newTheme = 'dark';
        themeIcon.innerText = 'light_mode';
    } else {
        themeIcon.innerText = 'dark_mode';
    }

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

const togglePasswordBtn = document.getElementById('toggle-password-btn');
const passwordInput = document.getElementById('usuario-senha');
const passwordIcon = document.getElementById('password-icon');

togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.innerText = 'visibility_off';
    } else {
        passwordInput.type = 'password';
        passwordIcon.innerText = 'visibility';
    }
});

document.getElementById('global-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;

    const rows = activeSection.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const rowText = row.innerText.toLowerCase();
        if (rowText.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

function clearSearchInput() {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.value = '';
    }
}

document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

        button.classList.add('active');
        const target = button.getAttribute('data-target');
        document.getElementById(target).classList.add('active');

        clearSearchInput();

        if (target === 'veiculos-sect') loadVeiculos();
        if (target === 'usuarios-sect') loadUsuarios();
        if (target === 'vendas-sect') loadVendas();
    });
});

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    if(id === 'veiculoModal') document.getElementById('veiculo-form').reset();
    if(id === 'usuarioModal') {
        document.getElementById('usuario-form').reset();
        passwordInput.type = 'password';
        passwordIcon.innerText = 'visibility';
    }
    if(id === 'vendaModal') document.getElementById('venda-form').reset();
}

async function loadVeiculos() {
    try {
        const res = await fetch(API_VEICULO);
        if (!res.ok) throw new Error(await getApiError(res));
        const veiculos = await res.json();
        const tbody = document.getElementById('veiculos-table-body');
        tbody.innerHTML = '';

        veiculos.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td>${v.id}</td>
                    <td><strong>${v.marca}</strong></td>
                    <td>${v.modelo}</td>
                    <td>${v.ano}</td>
                    <td>R$ ${v.preco.toFixed(2)}</td>
                    <td>${v.tipo}</td>
                    <td><span class="status-tag">${v.status}</span></td>
                    <td>${v.tipoPreco}</td>
                    <td>
                        <button class="btn btn-edit" onclick="editVeiculo(${v.id}, '${v.marca}', '${v.modelo}', ${v.ano}, ${v.preco}, '${v.tipo}', '${v.status}', '${v.tipoPreco}')">Editar</button>
                        <button class="btn btn-delete" onclick="deleteVeiculo(${v.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar veículos:", err);
        alert(`Não foi possível carregar os veículos. ${err.message}`);
    }
}

document.getElementById('veiculo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('veiculo-id').value;
    const veiculoData = {
        marca: document.getElementById('veiculo-marca').value,
        modelo: document.getElementById('veiculo-modelo').value,
        ano: parseInt(document.getElementById('veiculo-ano').value),
        preco: parseFloat(document.getElementById('veiculo-preco').value),
        tipo: document.getElementById('veiculo-tipo').value,
        status: document.getElementById('veiculo-status').value,
        tipoPreco: document.getElementById('veiculo-tipoPreco').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_VEICULO}/${id}` : API_VEICULO;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculoData)
        });
        if (!response.ok) throw new Error(await getApiError(response));

        closeModal('veiculoModal');
        await loadVeiculos();
    } catch (err) {
        console.error('Erro ao salvar veículo:', err);
        alert(`Não foi possível salvar o veículo. ${err.message}`);
    }
});

function editVeiculo(id, marca, modelo, ano, preco, tipo, status, tipoPreco) {
    document.getElementById('veiculo-id').value = id;
    document.getElementById('veiculo-marca').value = marca;
    document.getElementById('veiculo-modelo').value = modelo;
    document.getElementById('veiculo-ano').value = ano;
    document.getElementById('veiculo-preco').value = preco;
    document.getElementById('veiculo-tipo').value = tipo;
    document.getElementById('veiculo-status').value = status;
    document.getElementById('veiculo-tipoPreco').value = tipoPreco;

    document.getElementById('veiculo-modal-title').innerText = "Editar Veículo";
    openModal('veiculoModal');
}

async function deleteVeiculo(id) {
    if (confirm("Tem certeza que deseja deletar este veículo?")) {
        await fetch(`${API_VEICULO}/${id}`, { method: 'DELETE' });
        loadVeiculos();
    }
}

async function loadUsuarios() {
    try {
        const res = await fetch(API_USUARIO);
        if (!res.ok) throw new Error(await getApiError(res));
        const usuarios = await res.json();
        const tbody = document.getElementById('usuarios-table-body');
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td><strong>${u.nome}</strong></td>
                    <td>${u.login}</td>
                    <td>
                        <button class="btn btn-edit" onclick="editUsuario(${u.id}, '${u.nome}', '${u.login}')">Editar</button>
                        <button class="btn btn-delete" onclick="deleteUsuario(${u.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        alert(`Não foi possível carregar os usuários. ${err.message}`);
    }
}

document.getElementById('usuario-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('usuario-id').value;
    const usuarioData = {
        nome: document.getElementById('usuario-nome').value,
        login: document.getElementById('usuario-login').value,
        senha: document.getElementById('usuario-senha').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_USUARIO}/${id}` : API_USUARIO;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioData)
        });
        if (!response.ok) throw new Error(await getApiError(response));

        closeModal('usuarioModal');
        await loadUsuarios();
    } catch (err) {
        console.error('Erro ao salvar usuário:', err);
        alert(`Não foi possível salvar o usuário. ${err.message}`);
    }
});

function editUsuario(id, nome, login) {
    document.getElementById('usuario-id').value = id;
    document.getElementById('usuario-nome').value = nome;
    document.getElementById('usuario-login').value = login;
    document.getElementById('usuario-senha').placeholder = "Digite a nova senha";

    document.getElementById('usuario-modal-title').innerText = "Editar Usuário";
    openModal('usuarioModal');
}

async function deleteUsuario(id) {
    if (confirm("Deseja deletar este usuário?")) {
        await fetch(`${API_USUARIO}/${id}`, { method: 'DELETE' });
        loadUsuarios();
    }
}

async function loadVendas() {
    try {
        const res = await fetch(API_VENDA);
        if (!res.ok) throw new Error(await getApiError(res));
        const vendas = await res.json();
        const tbody = document.getElementById('vendas-table-body');
        tbody.innerHTML = '';

        vendas.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td>${v.id}</td>
                    <td>${v.data}</td>
                    <td>${v.veiculoDescricao} (ID: ${v.veiculoId})</td>
                    <td>${v.usuarioNome} (ID: ${v.usuarioId})</td>
                    <td><strong>R$ ${v.valorFinal.toFixed(2)}</strong></td>
                    <td>
                        <button class="btn btn-delete" onclick="cancelarVenda(${v.id})">Cancelar Venda</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar vendas:", err);
        alert(`Não foi possível carregar as vendas. ${err.message}`);
    }
}

async function openVendaModal() {
    try {
        const [resVeiculos, resUsuarios] = await Promise.all([
            fetch(API_VEICULO),
            fetch(API_USUARIO)
        ]);

        const veiculos = await resVeiculos.json();
        const usuarios = await resUsuarios.json();

        const veiculoSelect = document.getElementById('venda-veiculo');
        const usuarioSelect = document.getElementById('venda-usuario');

        veiculoSelect.innerHTML = veiculos
            .filter(v => v.status.toLowerCase() === 'disponivel')
            .map(v => `<option value="${v.id}">${v.marca} ${v.modelo} - R$ ${v.preco}</option>`)
            .join('');

        usuarioSelect.innerHTML = usuarios
            .map(u => `<option value="${u.id}">${u.nome}</option>`)
            .join('');

        if(veiculoSelect.innerHTML === '') {
            alert("Não há veículos disponíveis para venda no momento!");
            return;
        }

        openModal('vendaModal');
    } catch (err) {
        console.error("Erro ao preparar dados da venda:", err);
    }
}

document.getElementById('venda-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const vendaData = {
        data: document.getElementById('venda-data').value,
        veiculoId: parseInt(document.getElementById('venda-veiculo').value),
        usuarioId: parseInt(document.getElementById('venda-usuario').value),
        valorFinal: 1.0 
    };

    try {
        const response = await fetch(API_VENDA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vendaData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert("Erro ao salvar venda: " + (errorData.message || response.statusText));
            return;
        }

        closeModal('vendaModal');
        loadVendas();
    } catch (err) {
        console.error("Erro na requisição de venda:", err);
    }
});

async function cancelarVenda(id) {
    if (confirm("Deseja realmente cancelar este registro de venda?")) {
        await fetch(`${API_VENDA}/${id}`, { method: 'DELETE' });
        loadVendas();
    }
}

window.onload = () => {
    loadVeiculos();
};
