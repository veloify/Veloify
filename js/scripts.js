// função de movimentação do menu:
function toggleMenu(){
  const menu = document.getElementById('menu');
  menu.classList.toggle('active')
}


// logica para alterar e salvar o tema:
// função para trocar o tema
function trocarTema() {
  const checkbox = document.getElementById('tema-toggle');
  const nome = document.getElementById('lightDark');
  const body = document.body;

  if (checkbox.checked) {
    body.classList.add('dark');
    nome.textContent = 'Escuro';
    localStorage.setItem('tema', 'dark');
  } else {
    body.classList.remove('dark');
    nome.textContent = 'Claro';
    localStorage.setItem('tema', 'light');
  }
};
  
  // função para salvar o tema localmente
window.addEventListener('DOMContentLoaded', () => {
  const temaSalvo = localStorage.getItem('tema');
  const checkbox = document.getElementById('tema-toggle');
  const nome = document.getElementById('lightDark');

  if (temaSalvo === 'dark') {
    document.body.classList.add('dark');
    checkbox.checked = true;
    nome.textContent = 'Escuro';
  } else {
    document.body.classList.remove('dark');
    checkbox.checked = false;
    nome.textContent = 'Claro';
  }
});


// função para fechar o feedback
const closeFeed = document.getElementById("closeFeedback");
closeFeed.addEventListener("click", () => {
  const formFeed = document.getElementById("formFeed");

  formFeed.style.display = "none"

});