// Cliente HTTP simples para conversar com a API (backend/src). Todas as páginas
// carregam esse script antes dos scripts específicos de cada tela.
//
// Como o frontend é servido pelo próprio Express (express.static), as páginas são
// acessadas em http://localhost:3000/pages/Algo.html — por isso o fetch pode usar
// caminho relativo '/api/...' (mesma origem do backend).

const API_BASE = '/api';

async function apiRequest(caminho, { method = 'GET', body } = {}) {
  const options = {
    method,
    credentials: 'include', // envia o cookie de sessão (express-session) em toda chamada
    headers: {},
  };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${caminho}`, options);

  if (response.status === 204) return null;

  let dados = null;
  const textoResposta = await response.text();
  if (textoResposta) {
    try {
      dados = JSON.parse(textoResposta);
    } catch (_) {
      // resposta não era JSON — deixa dados como null
    }
  }

  if (!response.ok) {
    const mensagem = (dados && dados.erro) || `Erro ${response.status} ao acessar ${caminho}`;
    throw new Error(mensagem);
  }

  return dados;
}

const api = {
  get: (caminho) => apiRequest(caminho),
  post: (caminho, body) => apiRequest(caminho, { method: 'POST', body }),
  put: (caminho, body) => apiRequest(caminho, { method: 'PUT', body }),
  delete: (caminho) => apiRequest(caminho, { method: 'DELETE' }),
};
