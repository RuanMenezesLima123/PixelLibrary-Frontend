document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const loginButton = document.querySelector('.login-button');
  const links = document.querySelectorAll('.support-links a');

  let isLogin = true; // começa com login

  // Trocar entre login e registro
  links[1].addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;

    document.querySelector('#welcome h1').textContent = isLogin ? 'Seja Bem-Vindo' : 'Crie sua Conta';
    document.querySelector('#welcome h5').textContent = isLogin ? 'Efetue seu login' : 'Preencha os dados abaixo';
    loginButton.textContent = isLogin ? 'Entrar' : 'Registrar';
    links[1].textContent = isLogin ? 'Criar conta' : 'Já tenho uma conta';
  });

  // Enviar formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      alert('Preencha todos os campos!');
      return;
    }

    const rota = isLogin ? 'login' : 'register';
    try {
      const res = await fetch(`https://pixellibrary-backend-production.up.railway.app/api/auth/${rota}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || 'Ocorreu um erro.');
        return;
      }

      alert(data.msg);

      if (isLogin) {
        // Salvar o ID do usuário (opcional)
        if (isLogin) {
  localStorage.setItem('userId', data.user.id);
  localStorage.setItem('email', data.user.email);
  window.location.href = 'inicial.html';
}      } else {
        isLogin = true;
        loginButton.textContent = 'Entrar';
        links[1].textContent = 'Criar conta';
        document.querySelector('#welcome h1').textContent = 'Seja Bem-Vindo';
        document.querySelector('#welcome h5').textContent = 'Efetue seu login';
      }

    } catch (err) {
      console.error('Erro:', err);
      alert('Erro na requisição.');
    }
  });
});
