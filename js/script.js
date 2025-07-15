// ========= CONFIGURAÇÃO =========
const API_BASE_URL = 'https://pixellibrary-backend-production.up.railway.app/api';
const PLACEHOLDER_IMAGE = 'assets/placeholder.jpg';

// ========= PESQUISA E FILTROS =========
document.addEventListener('DOMContentLoaded', () => {
  // Configura busca
  const form = document.querySelector('#form-busca');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.querySelector('#campo-busca').value.trim();
      if (query) {
        localStorage.setItem('ultimaBusca', query);
        localStorage.setItem('tipoBusca', 'texto');
        window.location.href = 'jogos.html';
      }
    });
  }

  // Configura filtros
  document.querySelectorAll('.categoria-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem('ultimaBusca', btn.textContent.trim());
      localStorage.setItem('tipoBusca', 'categoria');
      window.location.href = 'jogos.html';
    });
  });

  // Carrega as seções
  carregarSecoes();
});

// ========= CARREGAMENTO DAS SEÇÕES =========
async function carregarSecoes() {
  await Promise.allSettled([
    carregarNovidades(),
    carregarRecomendacoes(),
    carregarProblemasConsole()
  ]);
}

// ========= FUNÇÕES DE CARREGAMENTO =========
async function carregarDados(rota) {
  try {
    const response = await fetch(`${API_BASE_URL}${rota}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Dados não são um array');
    
    return data;
  } catch (error) {
    console.error(`Erro ao carregar ${rota}:`, error);
    return null;
  }
}

function exibirErro(seletor, mensagem) {
  const container = document.querySelector(seletor);
  if (container) {
    container.innerHTML = `<p class="erro">${mensagem}</p>`;
  }
}

function criarCardJogo(jogo) {
  const img = jogo.cover?.url?.replace('t_thumb', 't_cover_big') || PLACEHOLDER_IMAGE;
  return `
    <article class="card-jogo">
      <img src="${img}" alt="${jogo.name || 'Jogo'}" title="${jogo.name || 'Jogo'}">
      <div class="jogo-info">
        <h3>${jogo.name || 'Nome não disponível'}</h3>
        ${jogo.rating ? `<span class="rating">⭐ ${Math.round(jogo.rating)}/100</span>` : ''}
      </div>
    </article>
  `;
}

// ========= NOVIDADES =========
async function carregarNovidades() {
  const container = document.querySelector('#novidades .grid-jogos');
  if (!container) return;

  const dados = await carregarDados('/novidades');
  
  if (!dados) {
    exibirErro('#novidades .grid-jogos', 'Problemas ao carregar novidades. Tente novamente mais tarde.');
    return;
  }

  container.innerHTML = dados.map(jogo => {
    const dataLancamento = jogo.first_release_date ? 
      new Date(jogo.first_release_date * 1000).toLocaleDateString() : 'Em breve';
      
    return `
      ${criarCardJogo(jogo)}
      <span class="data-lancamento">${dataLancamento}</span>
    `;
  }).join('');
}

// ========= RECOMENDAÇÕES =========
async function carregarRecomendacoes() {
  const container = document.querySelector('.recomendacoes');
  if (!container) return;

  const dados = await carregarDados('/jogos/recomendacoes');
  
  if (!dados) {
    exibirErro('.recomendacoes', 'Problemas ao carregar recomendações. Tente novamente mais tarde.');
    return;
  }

  container.innerHTML = dados.map(criarCardJogo).join('');
}

// ========= PROBLEMAS CONSOLE =========
async function carregarProblemasConsole() {
  const container = document.querySelector('#console-problems .grid-jogos');
  if (!container) return;

  const dados = await carregarDados('/jogos/recomendacoes');
  
  if (!dados) {
    exibirErro('#console-problems .grid-jogos', 'Não foi possível verificar problemas no console.');
    return;
  }

  // Simulação de jogos com problemas (apenas para demonstração)
  const jogosProblema = Array.isArray(dados) ? 
    dados.slice(0, 4).map(jogo => ({ ...jogo, rating: 65 })) : [];
  
  container.innerHTML = jogosProblema.map(jogo => `
    ${criarCardJogo(jogo)}
    <span class="warning">⚠️ Problemas reportados</span>
  `).join('');
}

// ========= CLIQUE NOS JOGOS =========
document.addEventListener('click', (e) => {
  const img = e.target.closest('.card-jogo img');
  if (!img) return;

  const nomeJogo = img.getAttribute('title');
  if (nomeJogo) {
    localStorage.setItem('ultimaBusca', nomeJogo);
    localStorage.setItem('tipoBusca', 'jogo');
    window.location.href = 'jogos.html';
  }
});
