// Funções utilitárias compartilhadas por todas as páginas.

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(valorData) {
  if (!valorData) return '-';
  const data = new Date(valorData);
  if (Number.isNaN(data.getTime())) return valorData;
  return data.toLocaleString('pt-BR');
}

// Evita que dados vindos da API sejam injetados como HTML (proteção básica contra XSS
// ao montar tabelas com innerHTML/insertAdjacentHTML).
function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto === null || texto === undefined ? '' : String(texto);
  return div.innerHTML;
}

function mostrarErro(elemento, mensagem) {
  if (!elemento) return;
  elemento.textContent = mensagem;
  elemento.classList.remove('d-none');
}

function esconderErro(elemento) {
  if (!elemento) return;
  elemento.classList.add('d-none');
  elemento.textContent = '';
}
