const ROTULOS_ACAO = {
  criar: 'Criou',
  atualizar: 'Atualizou',
  remover: 'Removeu',
  login: 'Login',
  login_falhou: 'Login falhou',
  logout: 'Logout',
};

async function carregarLogs() {
  const corpo = document.getElementById('corpoLogs');
  const elementoErro = document.getElementById('mensagemErro');
  esconderErro(elementoErro);

  const entidade = document.getElementById('filtroEntidade').value;

  try {
    const query = entidade ? `?entidade=${encodeURIComponent(entidade)}` : '';
    const logs = await api.get(`/auditoria${query}`);
    renderizarLogs(logs);
  } catch (erro) {
    if (erro.message.includes('403') || erro.message.toLowerCase().includes('permissão')) {
      document.getElementById('avisoNegado').classList.remove('d-none');
      corpo.innerHTML = '';
      return;
    }
    mostrarErro(elementoErro, erro.message);
    corpo.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Erro ao carregar logs</td></tr>';
  }
}

function renderizarLogs(logs) {
  const corpo = document.getElementById('corpoLogs');

  if (!logs || logs.length === 0) {
    corpo.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum registro encontrado</td></tr>';
    return;
  }

  corpo.innerHTML = logs
    .map(
      (log) => `
        <tr>
          <td>${formatarData(log.criado_em)}</td>
          <td>${escapeHtml(log.usuario_nome) || '-'}</td>
          <td>${escapeHtml(ROTULOS_ACAO[log.acao] || log.acao)}</td>
          <td>${escapeHtml(log.entidade)}${log.entidade_id ? ` #${log.entidade_id}` : ''}</td>
          <td>${escapeHtml(log.detalhes) || '-'}</td>
          <td><small class="text-muted">${escapeHtml(log.ip) || '-'}</small></td>
        </tr>
      `
    )
    .join('');
}

document.getElementById('filtroEntidade').addEventListener('change', carregarLogs);
document.getElementById('botaoAtualizar').addEventListener('click', carregarLogs);

(async () => {
  const usuario = await protegerPagina();
  if (!usuario) return;

  if (usuario.cargo !== 'admin') {
    document.getElementById('avisoNegado').classList.remove('d-none');
    document.getElementById('corpoLogs').innerHTML = '';
    return;
  }

  await carregarLogs();
})();
