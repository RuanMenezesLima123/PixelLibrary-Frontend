// ========= CONFIGURAÇÃO =========
const API_BASE_URL = 'https://pixellibrary-backend-production.up.railway.app/api';
const PLACEHOLDER_IMAGE = 'assets/placeholder.jpg';

// ========= PESQUISA E FILTROS =========
document.addEventListener('DOMContentLoaded', () => {
  console.log('Iniciando carregamento de seções...');
  console.log('Conectando à API:', API_BASE_URL);

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos

  try {
    const response = await fetch(`${API_BASE_URL}${rota}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorData}`);
    }
    
    const data = await response.json();
    
    if (!data || (typeof data !== 'object')) {
      throw new Error('Resposta inválida: não é um objeto');
    }
    
    if (!Array.isArray(data) && Array.isArray(data.results)) {
      return data.results;
    }
    
    if (!Array.isArray(data)) {
      throw new Error('Formato de dados inesperado');
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Erro detalhado ao carregar ${rota}:`, error);
    return null;
  }
}

function exibirErro(seletor, mensagem) {
  const container = document.querySelector(seletor);
  if (container) {
    container.innerHTML = `
      <div class="erro-container">
        <p>${mensagem}</p>
        <button class="reload-btn">Tentar novamente</button>
      </div>
    `;
    container.querySelector('.reload-btn').addEventListener('click', carregarSecoes);
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

  try {
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
  } catch (error) {
    console.error('Erro ao carregar novidades:', error);
    exibirErro('#novidades .grid-jogos', 'Erro ao carregar novidades. Servidor pode estar offline.');
  }
}

// ========= RECOMENDAÇÕES =========
async function carregarRecomendacoes() {
  const container = document.querySelector('.recomendacoes');
  if (!container) return;

  try {
    const dados = await carregarDados('/jogos/recomendacoes');
    
    if (!dados) {
      exibirErro('.recomendacoes', 'Problemas ao carregar recomendações. Tente novamente mais tarde.');
      return;
    }

    if (!Array.isArray(dados)) {
      throw new Error('Dados de recomendações não são um array');
    }

    container.innerHTML = dados.map(criarCardJogo).join('');
  } catch (error) {
    console.error('Erro ao carregar recomendações:', error);
    exibirErro('.recomendacoes', 'Erro ao carregar recomendações. Servidor pode estar offline.');
  }
}

// ========= PROBLEMAS CONSOLE =========
async function carregarProblemasConsole() {
  const container = document.querySelector('#console-problems .grid-jogos');
  if (!container) return;

  try {
    const dados = await carregarDados('/jogos/problemas');
    
    if (!dados) {
      // Fallback: use recomendações se o endpoint principal falhar
      const fallbackData = await carregarDados('/jogos/recomendacoes');
      const jogosProblema = Array.isArray(fallbackData) ? 
        fallbackData.slice(0, 4).map(jogo => ({ ...jogo, rating: 65 })) : [];
      
      container.innerHTML = jogosProblema.map(jogo => `
        ${criarCardJogo(jogo)}
        <span class="warning">⚠️ Problemas reportados</span>
      `).join('');
      return;
    }

    container.innerHTML = dados.map(jogo => `
      ${criarCardJogo(jogo)}
      <span class="warning">⚠️ ${jogo.problema || 'Problemas reportados'}</span>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar problemas:', error);
    exibirErro('#console-problems .grid-jogos', 'Não foi possível verificar problemas no console.');
  }
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
