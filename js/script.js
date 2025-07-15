// ========= PESQUISA E FILTROS =========
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form-busca');
  const campoBusca = document.querySelector('#campo-busca');
  const categorias = document.querySelectorAll('.categoria-filtro');

  // Manipula cliques em categorias
  if (categorias) {
    categorias.forEach(categoria => {
      categoria.addEventListener('click', () => {
        const filtro = categoria.textContent.trim();
        localStorage.setItem('ultimaBusca', filtro);
        localStorage.setItem('tipoBusca', 'categoria');
        window.location.href = 'jogos.html';
      });
    });
  }

  // Manipula busca por texto
  if (form && campoBusca) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = campoBusca.value.trim();
      if (!query) return;

      localStorage.setItem('ultimaBusca', query);
      localStorage.setItem('tipoBusca', 'texto');
      window.location.href = 'jogos.html';
    });
  }

  // Carrega as seções
  carregarRecomendacoes();
  carregarNovidades();
  carregarProblemasConsole();
});

// ========= RECOMENDAÇÕES =========
async function carregarRecomendacoes() {
  const container = document.querySelector('.recomendacoes');
  if (!container) return;

  try {
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/jogos/recomendacoes');
    const data = await res.json();

    container.innerHTML = data.map(jogo => {
      const img = jogo.cover?.url?.replace('t_thumb', 't_cover_big') || 'placeholder.jpg';
      return `
        <article class="card-jogo">
          <img src="${img}" alt="${jogo.name}" title="${jogo.name}">
          <div class="jogo-info">
            <h3>${jogo.name}</h3>
            ${jogo.rating ? `<span class="rating">⭐ ${Math.round(jogo.rating)}/100</span>` : ''}
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('Erro ao buscar recomendações:', err);
    container.innerHTML = '<p class="erro">Problemas ao carregar recomendações. Tente novamente mais tarde.</p>';
  }
}

// ========= NOVIDADES =========
async function carregarNovidades() {
  const container = document.querySelector('#novidades .grid-jogos');
  if (!container) return;

  try {
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/novidades');
    const jogos = await res.json();

    container.innerHTML = jogos.map(jogo => {
      const img = jogo.cover?.url?.replace('t_thumb', 't_cover_big') || 'placeholder.jpg';
      const dataLancamento = jogo.first_release_date ? 
        new Date(jogo.first_release_date * 1000).toLocaleDateString() : 'Em breve';

      return `
        <article class="card-jogo">
          <img src="${img}" alt="${jogo.name}" title="${jogo.name}">
          <div class="jogo-info">
            <h3>${jogo.name}</h3>
            <span class="data-lancamento">Lançamento: ${dataLancamento}</span>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('Erro ao buscar novidades:', err);
    container.innerHTML = '<p class="erro">Problemas ao carregar novidades. Tente novamente mais tarde.</p>';
  }
}

// ========= CONSOLE PROBLEMS =========
async function carregarProblemasConsole() {
  const container = document.querySelector('#console-problems .grid-jogos');
  if (!container) return;

  try {
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/jogos/recomendacoes');
    const data = await res.json();
    
    const problematicGames = data.filter(jogo => jogo.rating < 70).slice(0, 4);
    
    container.innerHTML = problematicGames.map(jogo => {
      const img = jogo.cover?.url?.replace('t_thumb', 't_cover_big') || 'placeholder.jpg';
      return `
        <article class="card-jogo">
          <img src="${img}" alt="${jogo.name}" title="${jogo.name}">
          <div class="jogo-info">
            <h3>${jogo.name}</h3>
            <span class="warning">⚠️ Problemas reportados</span>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('Erro ao carregar jogos problemáticos:', err);
    container.innerHTML = '<p class="erro">Não foi possível carregar informações de problemas no console.</p>';
  }
}

// ========= CLIQUE NOS JOGOS (UNIFICADO) =========
document.addEventListener('click', (e) => {
  const img = e.target.closest('.card-jogo img');
  if (!img) return;

  const nomeJogo = img.getAttribute('title');
  if (!nomeJogo) return;

  localStorage.setItem('ultimaBusca', nomeJogo);
  localStorage.setItem('tipoBusca', 'jogo');
  window.location.href = 'jogos.html';
});
