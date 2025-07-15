document.addEventListener('DOMContentLoaded', async () => {
  const query = localStorage.getItem('ultimaBusca');
  if (!query) {
    console.error('Nenhuma busca encontrada no localStorage');
    return;
  }

  window.jogo = null;
  const btnFavoritar = document.getElementById('btn-favoritar');

  try {
    console.log('Buscando dados do jogo para:', query);
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/jogos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    console.log('Dados recebidos da API:', data);

    if (!data[0]) {
      console.error('Nenhum jogo encontrado');
      return;
    }

    window.jogo = data[0];
    console.log('Jogo carregado:', jogo.name);

    // Atualizar UI
    const capa = jogo.cover?.url?.replace('t_thumb', 't_cover_big') || 'assets/gameLogo/jogo1.jpg';
    document.querySelector('.game-cover-image').src = capa;
    document.querySelector('.titulo').textContent = jogo.name;
    
    const dataLancamento = jogo.first_release_date ? 
      new Date(jogo.first_release_date * 1000).toLocaleDateString('pt-BR') : 'Data desconhecida';
    const empresa = jogo.involved_companies?.[0]?.company?.name || 'Desconhecida';
    document.querySelector('.data-empresa').textContent = `Lançado em ${dataLancamento} por ${empresa}`;
    
    document.querySelector('.genero').textContent = jogo.genres?.[0]?.name || 'Desconhecido';
    document.querySelector('.avaliacao').textContent = `${Math.round(jogo.rating || 0)}%`;
    document.querySelector('.resumo').innerHTML = jogo.summary ? 
      `${jogo.summary}<br><br>Use o navegador para traduzir!` : 'Nenhuma descrição disponível.';

    // Carregar avaliações
    console.log('Carregando avaliações para jogo ID:', jogo.id);
    await carregarAvaliacoes(jogo.id);

  } catch (err) {
    console.error('Erro ao carregar jogo:', err);
    alert('Erro ao carregar dados do jogo. Consulte o console para detalhes.');
  }

  // Configurar botão de favoritar
  btnFavoritar?.addEventListener('click', favoritarJogo);
});

// Função separada para favoritar
async function favoritarJogo() {
  if (!window.jogo) {
    console.error('Jogo não carregado');
    return;
  }

  const email = localStorage.getItem('email');
  if (!email) {
    alert('Você precisa estar logado.');
    return;
  }

  try {
    console.log('Enviando favorito para:', email);
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        jogo: {
          id: jogo.id,
          nome: jogo.name,
          capa: jogo.cover?.url?.replace('t_thumb', 't_cover_big'),
          empresa: jogo.involved_companies?.[0]?.company?.name || 'Desconhecida',
          genero: jogo.genres?.[0]?.name || 'Desconhecido',
          avaliacao: Math.round(jogo.rating || 0),
          descricao: jogo.summary || 'Sem descrição'
        }
      })
    });

    const data = await res.json();
    console.log('Resposta do favorito:', data);

    if (res.status === 409) {
      alert('Você já favoritou este jogo.');
      document.getElementById('btn-favoritar').disabled = true;
      document.getElementById('btn-favoritar').textContent = '✔️ Já favoritado';
      return;
    }

    if (!res.ok) throw new Error(data.msg || 'Erro ao favoritar');

    alert(data.msg || 'Favorito salvo!');
    document.getElementById('btn-favoritar').disabled = true;
    document.getElementById('btn-favoritar').textContent = '✔️ Favorito salvo';

  } catch (err) {
    console.error('Erro ao favoritar:', err);
    alert('Erro ao salvar favorito: ' + err.message);
  }
}

// Função para carregar avaliações (versão robusta)
async function carregarAvaliacoes(jogoId) {
  if (!jogoId) {
    console.error('ID do jogo inválido');
    return;
  }

  const lista = document.getElementById('avaliacoes-lista');
  const grafico = document.getElementById('grafico-distribuicao');
  
  try {
    console.log(`Buscando avaliações para jogo ID: ${jogoId}`);
    const res = await fetch(`https://pixellibrary-backend-production.up.railway.app/api/avaliacoes/${jogoId}`);
    
    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`);
    }

    const avaliacoes = await res.json();
    console.log(`Encontradas ${avaliacoes.length} avaliações`);

    lista.innerHTML = '';
    let somaNotas = 0;
    const dist = [0, 0, 0, 0, 0]; // dist[0] = 1 estrela, dist[4] = 5 estrelas

    avaliacoes.forEach(avaliacao => {
      if (!avaliacao.nota || avaliacao.nota < 1 || avaliacao.nota > 5) {
        console.warn('Avaliação inválida ignorada:', avaliacao);
        return;
      }

      somaNotas += avaliacao.nota;
      dist[avaliacao.nota - 1]++;
      
      const dataFormatada = avaliacao.data ? 
        new Date(avaliacao.data).toLocaleDateString('pt-BR') : 'Data desconhecida';
      
      lista.innerHTML += `
        <div class="avaliacao-item">
          <div class="avaliacao-header">
            <span class="avaliacao-autor">${avaliacao.nome || 'Anônimo'}</span>
            <span class="avaliacao-data">${dataFormatada}</span>
            <span class="avaliacao-estrelas">${'★'.repeat(avaliacao.nota)}${'☆'.repeat(5 - avaliacao.nota)}</span>
          </div>
          <p class="avaliacao-texto">"${avaliacao.texto || 'Sem texto'}"</p>
        </div>
      `;
    });

    if (avaliacoes.length > 0) {
      const media = (somaNotas / avaliacoes.length).toFixed(1);
      grafico.innerHTML = `
        <h3>Avaliação Média: ${media} estrelas (${avaliacoes.length} avaliações)</h3>
        ${dist.map((qtd, i) => {
          const estrelas = i + 1;
          const porcentagem = Math.round((qtd / avaliacoes.length) * 100);
          return `
            <div class="distribuicao-item">
              <span>${estrelas} estrela${estrelas !== 1 ? 's' : ''}:</span>
              <progress value="${qtd}" max="${avaliacoes.length}"></progress>
              <span>${qtd} (${porcentagem}%)</span>
            </div>
          `;
        }).reverse().join('')}
      `;
    } else {
      grafico.innerHTML = '<p>Seja o primeiro a avaliar este jogo!</p>';
    }

  } catch (err) {
    console.error('Erro ao carregar avaliações:', err);
    lista.innerHTML = '<p>Erro ao carregar avaliações. Recarregue a página.</p>';
    grafico.innerHTML = '';
  }
}

// Enviar avaliação (versão robusta)
document.getElementById('btn-enviar-avaliacao')?.addEventListener('click', async () => {
  if (!window.jogo?.id) {
    alert('Jogo não carregado corretamente');
    return;
  }

  const email = localStorage.getItem('email');
  if (!email) {
    alert('Você precisa estar logado para avaliar.');
    return;
  }

  const texto = document.getElementById('avaliacao-texto')?.value.trim();
  if (!texto) {
    alert('Por favor, escreva sua avaliação.');
    return;
  }

  const notaSelect = document.getElementById('avaliacao-nota');
  const nota = notaSelect ? parseInt(notaSelect.value) : 0;
  
  if (isNaN(nota) || nota < 1 || nota > 5) {
    alert('Selecione uma nota válida entre 1 e 5 estrelas.');
    return;
  }

  try {
    console.log('Enviando avaliação:', { jogoId: window.jogo.id, nota, texto });
    const res = await fetch('https://pixellibrary-backend-production.up.railway.app/api/avaliacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jogoId: window.jogo.id,
        jogoNome: window.jogo.name,
        email: email,
        nome: email.split('@')[0] || 'Anônimo',
        nota: nota,
        texto: texto
      })
    });

    const data = await res.json();
    console.log('Resposta da avaliação:', data);

    if (!res.ok) {
      throw new Error(data.msg || 'Erro ao enviar avaliação');
    }

    document.getElementById('avaliacao-texto').value = '';
    await carregarAvaliacoes(window.jogo.id);
    alert('Avaliação enviada com sucesso!');

  } catch (err) {
    console.error('Erro ao enviar avaliação:', err);
    alert('Erro ao enviar avaliação: ' + err.message);
  }
});
