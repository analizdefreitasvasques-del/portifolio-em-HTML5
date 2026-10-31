document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  iniciarMenu();
  iniciarImagens();
  iniciarDestaqueNavegacao();
  iniciarFormulario();
  atualizarAno();
});

function iniciarMenu() {
  const botao = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu-principal');
  if (!botao || !menu) return;

  const rotulo = botao.querySelector('.sr-only');

  function definirMenu(aberto) {
    menu.classList.toggle('is-open', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    if (rotulo) rotulo.textContent = aberto ? 'Fechar menu' : 'Abrir menu';
  }

  botao.addEventListener('click', () => {
    definirMenu(botao.getAttribute('aria-expanded') !== 'true');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => definirMenu(false));
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      definirMenu(false);
      botao.focus();
    }
  });

  window.matchMedia('(min-width: 860px)').addEventListener('change', (e) => {
    if (e.matches) definirMenu(false);
  });
}

function iniciarImagens() {
  document.querySelectorAll('.ph > img').forEach((img) => {
    const caixa = img.parentElement;
    const marcarAusente = () => caixa.classList.add('is-missing');

    img.addEventListener('error', marcarAusente);

    if (img.complete && img.naturalWidth === 0) marcarAusente();
  });
}

function iniciarDestaqueNavegacao() {
  const links = Array.from(document.querySelectorAll('[data-spy] a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const alvos = links
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        links.forEach((link) => {
          const ativo = link.getAttribute('href') === '#' + entrada.target.id;
          link.classList.toggle('is-active', ativo);
          if (ativo) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    },
    
    { rootMargin: '-35% 0px -60% 0px' }
  );

  alvos.forEach((alvo) => observador.observe(alvo));
}

function iniciarFormulario() {
  const form = document.getElementById('form-contato');
  if (!form) return;

  const status = document.getElementById('form-status');
  const campos = Array.from(form.querySelectorAll('input, textarea'));

  
  const mensagens = {
    nome: {
      valueMissing: 'Informe seu nome.',
      tooShort: 'O nome precisa ter pelo menos 2 caracteres.',
    },
    email: {
      valueMissing: 'Informe seu e-mail.',
      typeMismatch: 'Digite um e-mail válido, como nome@dominio.com',
      patternMismatch: 'Digite um e-mail válido, como nome@dominio.com.',
    },
    mensagem: {
      valueMissing: 'Escreva sua mensagem.',
      tooShort: 'A mensagem precisa ter pelo menos 10 caracteres.',
    },
  };

  function textoDoErro(campo) {
    if (campo.validity.valid) return '';
    const lista = mensagens[campo.name] || {};
    const tipo = Object.keys(lista).find((chave) => campo.validity[chave]);
    return tipo ? lista[tipo] : campo.validationMessage;
  }

  function mostrarErro(campo, texto) {
    const erro = document.getElementById(campo.id + '-erro');
    campo.closest('.field').classList.toggle('has-error', Boolean(texto));
    campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
    if (erro) {
      erro.textContent = texto;
      erro.hidden = !texto;
    }
  }

  function validarCampo(campo) {
    const texto = textoDoErro(campo);
    mostrarErro(campo, texto);
    return !texto;
  }

  function mostrarStatus(texto, tipo) {
    status.textContent = texto;
    status.dataset.tipo = tipo;
    status.hidden = false;
  }

  campos.forEach((campo) => {
    // Ao sair do campo: remove espaços extras e valida
    campo.addEventListener('blur', () => {
      campo.value = campo.value.trim();
      validarCampo(campo);
    });
    // Enquanto digita: só reavalia se o campo já estava com erro
    campo.addEventListener('input', () => {
      if (campo.closest('.field').classList.contains('has-error')) validarCampo(campo);
    });
  });

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    campos.forEach((campo) => { campo.value = campo.value.trim(); });

    const invalidos = campos.filter((campo) => !validarCampo(campo));
    if (invalidos.length) {
      mostrarStatus('Revise os campos destacados antes de enviar.', 'erro');
      invalidos[0].focus();
      return;
    }

    const destino = form.dataset.destino;
    const assunto = 'Contato pelo portfólio — ' + form.nome.value;
    const corpo = [
      'Nome: ' + form.nome.value,
      'E-mail: ' + form.email.value,
      '',
      form.mensagem.value,
    ].join('\r\n');

    const link =
      'mailto:' + encodeURIComponent(destino) +
      '?subject=' + encodeURIComponent(assunto) +
      '&body=' + encodeURIComponent(corpo);

    mostrarStatus(
      'Tudo certo! Abrimos seu aplicativo de e-mail com a mensagem pronta. ' +
      'Confirme o envio por lá.',
      'sucesso'
    );

    form.reset();
    campos.forEach((campo) => mostrarErro(campo, ''));
    window.location.href = link;
  });
}

function atualizarAno() {
  document.querySelectorAll('[data-ano]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}
