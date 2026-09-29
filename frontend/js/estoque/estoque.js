let produtosCache = [];

async function carregarFornecedoresNoSelect() {
  const select = document.getElementById('fornecedor_id');
  try {
    const fornecedores = await api.get('/fornecedores');
    for (const fornecedor of fornecedores) {
      const option = document.createElement('option');
      option.value = fornecedor.id;
      option.textContent = fornecedor.nome;
      select.appendChild(option);
    }
  } catch (erro) {
    console.error('Não foi possível carregar fornecedores:', erro.message);
  }
}

async function carregarProdutos() {
  const corpo = document.getElementById('corpoProdutos');
  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  try {
    produtosCache = await api.get('/produtos');
    renderizarProdutos(produtosCache);
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
    corpo.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Erro ao carregar produtos</td></tr>';
  }
}

function renderizarProdutos(lista) {
  const corpo = document.getElementById('corpoProdutos');

  if (!lista || lista.length === 0) {
    corpo.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nenhum produto cadastrado</td></tr>';
    return;
  }

  corpo.innerHTML = lista
    .map((produto) => {
      const estoqueBaixo = produto.estoque <= produto.estoque_minimo;
      const badgeEstoque = estoqueBaixo
        ? `<span class="badge bg-danger">${produto.estoque}</span>`
        : `<span class="badge bg-success">${produto.estoque}</span>`;

      return `
        <tr>
          <td>${escapeHtml(produto.codigo_barras)}</td>
          <td>${escapeHtml(produto.nome)}${produto.marca ? ` <small class="text-muted">(${escapeHtml(produto.marca)})</small>` : ''}</td>
          <td>${escapeHtml(produto.fornecedor_nome) || '-'}</td>
          <td>${escapeHtml(produto.categoria) || '-'}</td>
          <td>${formatarMoeda(produto.preco)}</td>
          <td>${badgeEstoque}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editarProduto(${produto.id})">Editar</button>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirProduto(${produto.id})">Excluir</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function editarProduto(id) {
  const produto = produtosCache.find((p) => p.id === id);
  if (!produto) return;

  document.getElementById('produtoId').value = produto.id;
  document.getElementById('codigo_barras').value = produto.codigo_barras;
  document.getElementById('nome').value = produto.nome;
  document.getElementById('marca').value = produto.marca || '';
  document.getElementById('categoria').value = produto.categoria || '';
  document.getElementById('fornecedor_id').value = produto.fornecedor_id || '';
  document.getElementById('preco').value = produto.preco;
  document.getElementById('estoque').value = produto.estoque;
  document.getElementById('estoque_minimo').value = produto.estoque_minimo;
  document.getElementById('validade').value = produto.validade || '';

  document.getElementById('tituloFormulario').textContent = `Editando: ${produto.nome}`;
  document.getElementById('botaoSalvar').textContent = 'Salvar alterações';
  document.getElementById('botaoCancelar').classList.remove('d-none');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
  document.getElementById('formProduto').reset();
  document.getElementById('produtoId').value = '';
  document.getElementById('tituloFormulario').textContent = 'Adicionar Produto';
  document.getElementById('botaoSalvar').textContent = 'Cadastrar';
  document.getElementById('botaoCancelar').classList.add('d-none');
}

async function excluirProduto(id) {
  const produto = produtosCache.find((p) => p.id === id);
  if (!confirm(`Excluir o produto "${produto ? produto.nome : id}"?`)) return;

  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  try {
    await api.delete(`/produtos/${id}`);
    await carregarProdutos();
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
  }
}

document.getElementById('formProduto').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const elementoErro = document.getElementById('mensagemErro');
  const elementoSucesso = document.getElementById('mensagemSucesso');
  esconderErro(elementoErro);
  elementoSucesso.classList.add('d-none');

  const id = document.getElementById('produtoId').value;
  const dados = {
    codigo_barras: document.getElementById('codigo_barras').value.trim(),
    nome: document.getElementById('nome').value.trim(),
    marca: document.getElementById('marca').value.trim() || null,
    categoria: document.getElementById('categoria').value.trim() || null,
    fornecedor_id: document.getElementById('fornecedor_id').value || null,
    preco: Number(document.getElementById('preco').value),
    estoque: Number(document.getElementById('estoque').value),
    estoque_minimo: Number(document.getElementById('estoque_minimo').value),
    validade: document.getElementById('validade').value || null,
  };

  try {
    if (id) {
      await api.put(`/produtos/${id}`, dados);
      elementoSucesso.textContent = 'Produto atualizado com sucesso.';
    } else {
      await api.post('/produtos', dados);
      elementoSucesso.textContent = 'Produto cadastrado com sucesso.';
    }
    elementoSucesso.classList.remove('d-none');
    limparFormulario();
    await carregarProdutos();
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
  }
});

document.getElementById('botaoCancelar').addEventListener('click', limparFormulario);

document.getElementById('campoBusca').addEventListener('input', (evento) => {
  const termo = evento.target.value.trim().toLowerCase();
  if (!termo) {
    renderizarProdutos(produtosCache);
    return;
  }
  const filtrados = produtosCache.filter(
    (p) =>
      p.nome.toLowerCase().includes(termo) ||
      (p.marca && p.marca.toLowerCase().includes(termo)) ||
      p.codigo_barras.toLowerCase().includes(termo)
  );
  renderizarProdutos(filtrados);
});

(async () => {
  const usuario = await protegerPagina();
  if (usuario) {
    await carregarFornecedoresNoSelect();
    await carregarProdutos();
  }
})();
