async function carregarDashboard() {
  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  try {
    const dados = await api.get('/estoque/dashboard');

    document.getElementById('vendasHoje').textContent = formatarMoeda(dados.vendas_hoje);
    document.getElementById('itensEstoque').textContent = dados.itens_em_estoque;
    document.getElementById('valorEstoque').textContent = formatarMoeda(dados.valor_estoque);

    renderizarEstoqueBaixo(dados.estoque_baixo);
    renderizarVendasRecentes(dados.vendas_recentes);
  } catch (erro) {
    mostrarErro(elementoErro, erro.message);
  }
}

function renderizarEstoqueBaixo(lista) {
  const corpo = document.getElementById('corpoEstoqueBaixo');

  if (!lista || lista.length === 0) {
    corpo.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhum produto com estoque baixo</td></tr>';
    return;
  }

  corpo.innerHTML = lista
    .map(
      (produto) => `
        <tr>
          <td>${escapeHtml(produto.nome)}</td>
          <td>${produto.estoque}</td>
          <td>${produto.estoque_minimo}</td>
        </tr>
      `
    )
    .join('');
}

function renderizarVendasRecentes(lista) {
  const corpo = document.getElementById('corpoVendasRecentes');

  if (!lista || lista.length === 0) {
    corpo.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma venda registrada ainda</td></tr>';
    return;
  }

  corpo.innerHTML = lista
    .map(
      (venda) => `
        <tr>
          <td>#${venda.id}</td>
          <td>${formatarData(venda.criado_em)}</td>
          <td>${venda.total_itens}</td>
          <td>${formatarMoeda(venda.total)}</td>
        </tr>
      `
    )
    .join('');
}

(async () => {
  const usuario = await protegerPagina();
  if (usuario) await carregarDashboard();
})();
