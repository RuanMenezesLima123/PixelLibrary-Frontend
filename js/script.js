// ========= PESQUISA E FILTROS =========
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form-busca');
  if (!form) return;

  // Manipula cliques em categorias
  document.querySelectorAll('.categoria-filtro').forEach(categoria => {
    categoria.addEventListener('click', () => {
      const filtro = categoria.textContent.trim();
      localStorage.setItem('ultimaBusca', filtro);
      localStorage.setItem('tipoBusca', 'categoria'); // Adiciona tipo de busca
      window.location.href = 'jogos.html';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.querySelector('#campo-busca').value.trim();
    if (!query) return;

    try {
      localStorage.setItem('ultimaBusca', query);
      localStorage.setItem('tipoBusca', 'texto'); // Adiciona tipo de busca
      window.location.href = 'jogos.html';
    } catch (err) {
      console.error('Erro ao buscar jogo:', err);
    }
  });
});

// ========= RECOMENDAÇÕES =========
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.recomendacoes');
  if (!container) return;

  try {
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/jogos/recomendacoes');
    const data = await res.json();

    container.innerHTML = '';

    data.forEach(jogo => {
      const img = jogo.cover?.url?.replace('t_thumb', 't_cover_big');
      const card = `
        <article class="card-jogo">
          <img src="${img}" alt="${jogo.name}" title="${jogo.name}">
          <div class="jogo-info">
            <h3>${jogo.name}</h3>
            ${jogo.rating ? `<span class="rating">⭐ ${Math.round(jogo.rating)}/100</span>` : ''}
          </div>
        </article>
      `;
      container.innerHTML += card;
    });
  } catch (err) {
    console.error('Erro ao buscar recomendações:', err);
    container.innerHTML = '<p>Problemas ao carregar recomendações. Tente novamente mais tarde.</p>';
  }
});

// ========= NOVIDADES =========
async function carregarNovidades() {
  try {
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/novidades');
    const jogos = await res.json();

    const container = document.querySelector('#novidades .grid-jogos');
    if (!container) return;
    
    container.innerHTML = '';

    jogos.forEach(jogo => {
      const img = jogo.cover?.url.replace('t_thumb', 't_cover_big');
      const nome = jogo.name;
      const dataLancamento = jogo.first_release_date ? 
        new Date(jogo.first_release_date * 1000).toLocaleDateString() : 'Em breve';

      const card = `
        <article class="card-jogo">
          <img src="${img}" alt="${nome}" title="${nome}">
          <div class="jogo-info">
            <h3>${nome}</h3>
            <span class="data-lancamento">${dataLancamento}</span>
          </div>
        </article>
      `;
      container.innerHTML += card;
    });
  } catch (err) {
    console.error('Erro ao buscar novidades:', err);
    const container = document.querySelector('#novidades .grid-jogos');
    if (container) {
      container.innerHTML = '<p>Problemas ao carregar novidades. Tente novamente mais tarde.</p>';
    }
  }
}

// ========= CLIQUE NOS JOGOS ========= (unificado)
document.addEventListener('click', (e) => {
  const img = e.target.closest('.card-jogo img');
  if (!img) return;

  const nomeJogo = img.getAttribute('title');
  if (!nomeJogo) return;

  localStorage.setItem('ultimaBusca', nomeJogo);
  localStorage.setItem('tipoBusca', 'jogo');
  window.location.href = 'jogos.html';
});

// ========= CONSOLE PROBLEMS =========
document.addEventListener('DOMContentLoaded', async () => {
  const consoleProblemsSection = document.querySelector('#console-problems');
  if (!consoleProblemsSection) return;

  try {
    const response = await fetch('https://pixellibrary-backend-production.up.railway.app/api/jogos/recomendacoes');
    const data = await response.json();
    
    // Filtra jogos com problemas conhecidos (exemplo)
    const problematicGames = data.filter(jogo => jogo.rating < 70).slice(0, 4);
    
    consoleProblemsSection.querySelector('.grid-jogos').innerHTML = problematicGames.map(jogo => {
      const img = jogo.cover?.url?.replace('t_thumb', 't_cover_big');
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
    consoleProblemsSection.innerHTML = '<p>Não foi possível carregar informações de problemas no console.</p>';
  }
});

// Inicializa as funções
document.addEventListener('DOMContentLoaded', () => {
  carregarNovidades();
});
