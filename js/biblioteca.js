  document.addEventListener('DOMContentLoaded', async () => {
    const email = localStorage.getItem('email');
    if (!email) {
      alert('Você precisa estar logado.');
      return;
    }

    try {
      const res = await fetch('/api/favoritos?email=' + encodeURIComponent(email));
      const jogos = await res.json();

      const gameGrid = document.querySelector('.game-grid');
      gameGrid.innerHTML = ''; // Limpa os placeholders

      jogos.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'game-card';

        const img = document.createElement('img');
        img.src = jogo.jogo.capa;
        img.alt = `Capa do jogo ${jogo.jogo.nome}`;
        img.className = 'game-cover';
        img.style.cursor = 'pointer';

        const info = document.createElement('div');
        info.className = 'game-info';

        const h3 = document.createElement('h3');
        h3.textContent = jogo.jogo.nome;

        // Evento: clicar na capa redireciona
        img.addEventListener('click', () => {
          localStorage.setItem('ultimaBusca', jogo.jogo.nome);
          window.location.href = 'jogos.html';
        });

        info.appendChild(h3);
        card.appendChild(img);
        card.appendChild(info);
        gameGrid.appendChild(card);
      });

    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
    }
  });