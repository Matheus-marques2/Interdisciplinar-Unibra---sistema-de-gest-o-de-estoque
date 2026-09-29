document.getElementById('formLogin').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const elementoErro = document.getElementById('mensagemErro');

  elementoErro.classList.add('d-none');

  try {
    await api.post('/usuarios/login', { email, senha });
    window.location.href = 'Dashboard.html';
  } catch (erro) {
    elementoErro.textContent = erro.message;
    elementoErro.classList.remove('d-none');
  }
});
