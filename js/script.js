// ========= PESQUISA =========
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form-busca');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.querySelector('#campo-busca').value.trim();
    if (!query) return;

    try {
      // Armazena o termo de busca
      localStorage.setItem('ultimaBusca', query);
      // Redireciona para a página do jogo
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
        </article>
      `;
      container.innerHTML += card;
    });
  } catch (err) {
    console.error('Erro ao buscar recomendações:', err);
  }
});

// ========= CLIQUE NAS RECOMENDAÇÕES =========
document.addEventListener('click', (e) => {
  const img = e.target.closest('.recomendacoes .card-jogo img');
  if (!img) return;

  const nomeJogo = img.getAttribute('title');
  if (!nomeJogo) return;

  localStorage.setItem('ultimaBusca', nomeJogo);
  window.location.href = 'jogos.html';
});

async function carregarNovidades() {
  try {
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/novidades');
    const jogos = await res.json();

    const container = document.querySelector('#novidades .grid-jogos');
    container.innerHTML = '';

    jogos.forEach(jogo => {
      const img = jogo.cover?.url.replace('t_thumb', 't_cover_big');
      const nome = jogo.name;

      const card = `
        <article class="card-jogo">
          <img src="${img}" alt="${nome}" title="${nome}">
        </article>
      `;
      container.innerHTML += card;
    });
  } catch (err) {
    console.error('Erro ao buscar novidades:', err);
  }
}

carregarNovidades();

// ========= CLIQUE NAS RECOMENDAÇÕES =========
document.addEventListener('click', (e) => {
  const img = e.target.closest('#novidades .card-jogo img');
  if (!img) return;

  const nomeJogo = img.getAttribute('title');
  if (!nomeJogo) return;

  localStorage.setItem('ultimaBusca', nomeJogo);
  window.location.href = 'jogos.html';
});
