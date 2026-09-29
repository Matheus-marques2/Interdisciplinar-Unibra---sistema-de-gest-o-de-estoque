let produtosCache = [];

async function carregarProdutos() {
  const grade = document.getElementById('grade');
  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  try {
    produtosCache = await api.get('/produtos');
    montarFiltroCategorias(produtosCache);
    renderizarGrade(produtosCache);
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
    grade.innerHTML = '<p class="text-danger">Erro ao carregar produtos.</p>';
  }
}

function montarFiltroCategorias(lista) {
  const select = document.getElementById('filtroCategoria');
  const categorias = [...new Set(lista.map((p) => p.categoria).filter(Boolean))].sort();

  select.innerHTML = '<option value="">Todas as categorias</option>';
  for (const categoria of categorias) {
    const option = document.createElement('option');
    option.value = categoria;
    option.textContent = categoria;
    select.appendChild(option);
  }
}

function renderizarGrade(lista) {
  const grade = document.getElementById('grade');

  if (!lista || lista.length === 0) {
    grade.innerHTML = '<p class="text-muted">Nenhum produto encontrado.</p>';
    return;
  }

  grade.innerHTML = lista
    .map((produto) => {
      const estoqueBaixo = produto.estoque <= produto.estoque_minimo;
      const badgeClasse = estoqueBaixo ? 'bg-danger' : 'bg-success';

      return `
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${escapeHtml(produto.nome)}</h5>
              <h6 class="card-subtitle mb-2 text-muted">${escapeHtml(produto.marca) || 'Sem marca'}</h6>
              <p class="card-text mb-1">${formatarMoeda(produto.preco)}</p>
              <p class="card-text mb-1">
                <span class="badge ${badgeClasse}">Estoque: ${produto.estoque}</span>
              </p>
              <p class="card-text"><small class="text-muted">${escapeHtml(produto.categoria) || 'Sem categoria'}</small></p>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function aplicarFiltros() {
  const termo = document.getElementById('campoBusca').value.trim().toLowerCase();
  const categoria = document.getElementById('filtroCategoria').value;

  const filtrados = produtosCache.filter((produto) => {
    const bateBusca =
      !termo ||
      produto.nome.toLowerCase().includes(termo) ||
      (produto.marca && produto.marca.toLowerCase().includes(termo)) ||
      produto.codigo_barras.toLowerCase().includes(termo);

    const bateCategoria = !categoria || produto.categoria === categoria;

    return bateBusca && bateCategoria;
  });

  renderizarGrade(filtrados);
}

document.getElementById('campoBusca').addEventListener('input', aplicarFiltros);
document.getElementById('filtroCategoria').addEventListener('change', aplicarFiltros);

(async () => {
  const usuario = await protegerPagina();
  if (usuario) await carregarProdutos();
})();
