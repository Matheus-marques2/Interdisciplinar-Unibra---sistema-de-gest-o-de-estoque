document.getElementById('formCadastro').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const cargo = document.getElementById('cargo').value;

  const elementoErro = document.getElementById('mensagemErro');
  const elementoSucesso = document.getElementById('mensagemSucesso');
  elementoErro.classList.add('d-none');
  elementoSucesso.classList.add('d-none');

  try {
    await api.post('/usuarios/registrar', { nome, email, senha, cargo });
    elementoSucesso.textContent = 'Conta criada com sucesso! Redirecionando para o login...';
    elementoSucesso.classList.remove('d-none');
    setTimeout(() => {
      window.location.href = 'Login.html';
    }, 1500);
  } catch (erro) {
    elementoErro.textContent = erro.message;
    elementoErro.classList.remove('d-none');
  }
});
