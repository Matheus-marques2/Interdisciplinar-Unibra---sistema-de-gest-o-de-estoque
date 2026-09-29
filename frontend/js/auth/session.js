// Inclua este script (depois de api.js) em toda página que exige login.
// Ele confere se existe sessão ativa e, se não houver, manda pra tela de login.

async function protegerPagina() {
  try {
    const usuario = await api.get('/usuarios/me');
    const elementoNome = document.getElementById('usuarioLogado');
    if (elementoNome) {
      elementoNome.textContent = `${usuario.nome} (${usuario.cargo})`;
    }
    return usuario;
  } catch (erro) {
    window.location.href = 'Login.html';
    return null;
  }
}

async function sair() {
  try {
    await api.post('/usuarios/logout');
  } catch (erro) {
    // mesmo se a chamada falhar, força a saída no front
  }
  window.location.href = 'Login.html';
}
