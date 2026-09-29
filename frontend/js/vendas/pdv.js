let produtosCache = [];
let carrinho = []; // [{ produto_id, nome, preco, quantidade, estoqueDisponivel }]

async function carregarProdutos() {
  const grade = document.getElementById('grade');
  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  try {
    produtosCache = await api.get('/produtos');
    renderizarGrade(produtosCache);
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
    grade.innerHTML = '<p class="text-danger">Erro ao carregar produtos.</p>';
  }
}

function renderizarGrade(lista) {
  const grade = document.getElementById('grade');

  if (!lista || lista.length === 0) {
    grade.innerHTML = '<p class="text-muted">Nenhum produto encontrado.</p>';
    return;
  }

  grade.innerHTML = lista
    .map(
      (produto) => `
        <div class="col-md-4">
          <button type="button"
                  class="btn btn-outline-success w-100 h-100 text-start p-2"
                  ${produto.estoque <= 0 ? 'disabled' : ''}
                  onclick="adicionarAoCarrinho(${produto.id})">
            <strong>${escapeHtml(produto.nome)}</strong><br>
            ${formatarMoeda(produto.preco)}<br>
            <small class="text-muted">Estoque: ${produto.estoque}</small>
          </button>
        </div>
      `
    )
    .join('');
}

function adicionarAoCarrinho(produtoId) {
  const produto = produtosCache.find((p) => p.id === produtoId);
  if (!produto) return;

  if (produto.estoque <= 0) {
    alert(`"${produto.nome}" está sem estoque.`);
    return;
  }

  const itemExistente = carrinho.find((item) => item.produto_id === produtoId);

  if (itemExistente) {
    if (itemExistente.quantidade + 1 > produto.estoque) {
      alert(`Estoque insuficiente de "${produto.nome}" (disponível: ${produto.estoque}).`);
      return;
    }
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      produto_id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: 1,
      estoqueDisponivel: produto.estoque,
    });
  }

  renderizarCarrinho();
}

function alterarQuantidade(produtoId, delta) {
  const item = carrinho.find((i) => i.produto_id === produtoId);
  if (!item) return;

  const novaQuantidade = item.quantidade + delta;

  if (novaQuantidade <= 0) {
    carrinho = carrinho.filter((i) => i.produto_id !== produtoId);
  } else if (novaQuantidade > item.estoqueDisponivel) {
    alert(`Estoque insuficiente (disponível: ${item.estoqueDisponivel}).`);
    return;
  } else {
    item.quantidade = novaQuantidade;
  }

  renderizarCarrinho();
}

function removerDoCarrinho(produtoId) {
  carrinho = carrinho.filter((i) => i.produto_id !== produtoId);
  renderizarCarrinho();
}

function renderizarCarrinho() {
  const lista = document.getElementById('listaCarrinho');
  const vazio = document.getElementById('carrinhoVazio');
  const resumo = document.getElementById('resumoCarrinho');

  if (carrinho.length === 0) {
    lista.innerHTML = '';
    vazio.classList.remove('d-none');
    resumo.classList.add('d-none');
    return;
  }

  vazio.classList.add('d-none');
  resumo.classList.remove('d-none');

  lista.innerHTML = carrinho
    .map((item) => {
      const subtotal = item.preco * item.quantidade;
      return `
        <li class="list-group-item">
          <div class="d-flex justify-content-between">
            <strong>${escapeHtml(item.nome)}</strong>
            <button class="btn btn-sm btn-link text-danger p-0" onclick="removerDoCarrinho(${item.produto_id})">remover</button>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" onclick="alterarQuantidade(${item.produto_id}, -1)">-</button>
              <span class="btn btn-outline-secondary disabled">${item.quantidade}</span>
              <button class="btn btn-outline-secondary" onclick="alterarQuantidade(${item.produto_id}, 1)">+</button>
            </div>
            <span>${formatarMoeda(subtotal)}</span>
          </div>
        </li>
      `;
    })
    .join('');

  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  document.getElementById('totalCarrinho').textContent = formatarMoeda(total);
}

function limparCarrinho() {
  carrinho = [];
  renderizarCarrinho();
}

async function finalizarVenda() {
  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  if (carrinho.length === 0) return;

  const dados = {
    forma_pagamento: document.getElementById('formaPagamento').value,
    itens: carrinho.map((item) => ({
      produto_id: item.produto_id,
      quantidade: item.quantidade,
    })),
  };

  try {
    const venda = await api.post('/vendas', dados);
    alert(`Venda #${venda.id} finalizada! Total: ${formatarMoeda(venda.total)}`);
    limparCarrinho();
    await carregarProdutos(); // recarrega estoque atualizado
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
  }
}

document.getElementById('formBarcode').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const campo = document.getElementById('campoCodigoBarras');
  const codigo = campo.value.trim();
  if (!codigo) return;

  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  try {
    const produto = await api.get(`/produtos/codigo/${encodeURIComponent(codigo)}`);
    // garante que o cache tem o produto (caso não esteja na lista carregada)
    if (!produtosCache.some((p) => p.id === produto.id)) produtosCache.push(produto);
    adicionarAoCarrinho(produto.id);
  } catch (erro) {
    mostrarErro(elementoErro, `Código "${codigo}" não encontrado.`);
  } finally {
    campo.value = '';
    campo.focus();
  }
});

document.getElementById('campoBusca').addEventListener('input', (evento) => {
  const termo = evento.target.value.trim().toLowerCase();
  if (!termo) {
    renderizarGrade(produtosCache);
    return;
  }
  const filtrados = produtosCache.filter(
    (p) => p.nome.toLowerCase().includes(termo) || p.codigo_barras.toLowerCase().includes(termo)
  );
  renderizarGrade(filtrados);
});

document.getElementById('botaoFinalizar').addEventListener('click', finalizarVenda);
document.getElementById('botaoLimparCarrinho').addEventListener('click', limparCarrinho);

(async () => {
  const usuario = await protegerPagina();
  if (usuario) await carregarProdutos();
})();
