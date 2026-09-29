let fornecedoresCache = [];

async function carregarFornecedores() {
  const corpo = document.getElementById('corpoFornecedores');
  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  try {
    fornecedoresCache = await api.get('/fornecedores');
    renderizarFornecedores(fornecedoresCache);
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
    corpo.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erro ao carregar fornecedores</td></tr>';
  }
}

function renderizarFornecedores(lista) {
  const corpo = document.getElementById('corpoFornecedores');

  if (!lista || lista.length === 0) {
    corpo.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum fornecedor cadastrado</td></tr>';
    return;
  }

  corpo.innerHTML = lista
    .map((fornecedor) => {
      const localizacao = [fornecedor.cidade, fornecedor.estado].filter(Boolean).join(' - ') || '-';
      const contato = [fornecedor.telefone, fornecedor.email].filter(Boolean).join(' / ') || '-';

      return `
        <tr>
          <td>${escapeHtml(fornecedor.cnpj)}</td>
          <td>
            ${escapeHtml(fornecedor.nome)}
            ${fornecedor.descricao ? `<br><small class="text-muted">${escapeHtml(fornecedor.descricao)}</small>` : ''}
          </td>
          <td>${escapeHtml(contato)}</td>
          <td>${escapeHtml(localizacao)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editarFornecedor(${fornecedor.id})">Editar</button>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirFornecedor(${fornecedor.id})">Excluir</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function editarFornecedor(id) {
  const fornecedor = fornecedoresCache.find((f) => f.id === id);
  if (!fornecedor) return;

  document.getElementById('fornecedorId').value = fornecedor.id;
  document.getElementById('nome').value = fornecedor.nome;
  document.getElementById('cnpj').value = fornecedor.cnpj;
  document.getElementById('telefone').value = fornecedor.telefone || '';
  document.getElementById('email').value = fornecedor.email || '';
  document.getElementById('cidade').value = fornecedor.cidade || '';
  document.getElementById('estado').value = fornecedor.estado || '';
  document.getElementById('descricao').value = fornecedor.descricao || '';

  document.getElementById('tituloFormulario').textContent = `Editando: ${fornecedor.nome}`;
  document.getElementById('botaoSalvar').textContent = 'Salvar alterações';
  document.getElementById('botaoCancelar').classList.remove('d-none');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
  document.getElementById('formFornecedor').reset();
  document.getElementById('fornecedorId').value = '';
  document.getElementById('tituloFormulario').textContent = 'Adicionar Fornecedor';
  document.getElementById('botaoSalvar').textContent = 'Cadastrar';
  document.getElementById('botaoCancelar').classList.add('d-none');
}

async function excluirFornecedor(id) {
  const fornecedor = fornecedoresCache.find((f) => f.id === id);
  if (!confirm(`Excluir o fornecedor "${fornecedor ? fornecedor.nome : id}"?`)) return;

  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  try {
    await api.delete(`/fornecedores/${id}`);
    await carregarFornecedores();
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
  }
}

document.getElementById('formFornecedor').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const elementoErro = document.getElementById('mensagemErro');
  const elementoSucesso = document.getElementById('mensagemSucesso');
  esconderErro(elementoErro);
  elementoSucesso.classList.add('d-none');

  const id = document.getElementById('fornecedorId').value;
  const dados = {
    nome: document.getElementById('nome').value.trim(),
    cnpj: document.getElementById('cnpj').value.trim(),
    telefone: document.getElementById('telefone').value.trim() || null,
    email: document.getElementById('email').value.trim() || null,
    cidade: document.getElementById('cidade').value.trim() || null,
    estado: document.getElementById('estado').value.trim().toUpperCase() || null,
    descricao: document.getElementById('descricao').value.trim() || null,
  };

  try {
    if (id) {
      await api.put(`/fornecedores/${id}`, dados);
      elementoSucesso.textContent = 'Fornecedor atualizado com sucesso.';
    } else {
      await api.post('/fornecedores', dados);
      elementoSucesso.textContent = 'Fornecedor cadastrado com sucesso.';
    }
    elementoSucesso.classList.remove('d-none');
    limparFormulario();
    await carregarFornecedores();
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
  }
});

document.getElementById('botaoCancelar').addEventListener('click', limparFormulario);

document.getElementById('campoBusca').addEventListener('input', (evento) => {
  const termo = evento.target.value.trim().toLowerCase();
  if (!termo) {
    renderizarFornecedores(fornecedoresCache);
    return;
  }
  const filtrados = fornecedoresCache.filter(
    (f) => f.nome.toLowerCase().includes(termo) || f.cnpj.includes(termo)
  );
  renderizarFornecedores(filtrados);
});

(async () => {
  const usuario = await protegerPagina();
  if (usuario) await carregarFornecedores();
})();
