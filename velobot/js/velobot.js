async function carregarBaseDeRespostas() {
  const dataset = await fetch("js/dataset.json");
  return await dataset.json();
}

function analisarMensagem(mensagem, base) {
  const palavras = mensagem.toLowerCase().split(" ");
  for (const item of base) {
    const acertos = item.keywords.filter(p => palavras.includes(p));
    if (acertos.length >= 1) {
      return item.resposta;
    }
  }
  return "Desculpe, ainda estou aprendendo. Se precisar de ajuda, fale com o suporte: https://veloify.com/suporte";
}

function salvarHistorico(mensagem, resposta) {
  const historico = JSON.parse(localStorage.getItem("chatVeloBot")) || [];
  historico.push({ mensagem, resposta });
  localStorage.setItem("chatVeloBot", JSON.stringify(historico));
}

function carregarHistorico() {
  const historico = JSON.parse(localStorage.getItem("chatVeloBot")) || [];
  historico.forEach(item => {
    mostrarMensagem(item.mensagem, "user");
    mostrarMensagem(item.resposta, "velobot")
  });
}



// funções para barra de rolagem automatica
function mostrarMensagem(texto, classe) {
  const chat = document.querySelector(".velobot-chat");
  const msg = document.createElement("p");
  msg.className = classe;
  chat.appendChild(msg);

  if (classe === "velobot") {
    
    const textoComQuebras = texto.replace(/\n/g, '<br>');

    let index = 0;

    msg.innerHTML = '';

    const intervalo = setInterval(() => {
      msg.textContent += texto.charAt(index);
      index++;

      if (index === texto.length) {
        msg.innerHTML = textoComQuebras;
        clearInterval(intervalo);
      }
    }, 15);
  } else {
    msg.textContent = texto;
  }

}

async function processarMensagem(mensagem) {
  mostrarMensagem(mensagem, "user");

  // Adiciona o "Digitando..." com um marcador único
  const chat = document.querySelector(".velobot-chat");

  const digitando = document.createElement("p");
  digitando.className = "velobot digitando";
  digitando.textContent = "Digitando...";
  chat.appendChild(digitando);

  const base = await carregarBaseDeRespostas();

  setTimeout(() => {
    // Remove apenas o último "digitando..."
    const digitandoEl = document.querySelector(".velobot-chat .digitando");
    if (digitandoEl) digitandoEl.remove();

    const resposta = analisarMensagem(mensagem, base);
    mostrarMensagem(resposta, "velobot");
    salvarHistorico(mensagem, resposta);
  }, 1000);
}

// limpar chat
async function processarMensagem(mensagem) {
  const chat = document.querySelector(".velobot-chat");

  if (mensagem.toLowerCase() === "clear") {
    // Mensagem de animação antes de limpar
    const aviso = document.createElement("p");
    aviso.className = "velobot animacao";
    aviso.textContent = "🧹 Aguarde enquanto o VeloBot limpa o chat...";
    chat.appendChild(aviso);

    // Aguarda 1 segundos antes de limpar
    setTimeout(() => {
      chat.innerHTML = ""; // limpa a interface
      localStorage.removeItem("chatVeloBot"); // limpa o histórico
      mostrarMensagem("Chat limpo com sucesso! 🧹", "velobot");
    }, 1000);

    return;
  }

  mostrarMensagem(mensagem, "user");

  const digitando = document.createElement("p");
  digitando.className = "velobot digitando";
  digitando.textContent = "Digitando...";
  chat.appendChild(digitando);

  const base = await carregarBaseDeRespostas();

  setTimeout(() => {
    const digitandoEl = document.querySelector(".velobot-chat .digitando");
    if (digitandoEl) digitandoEl.remove();

    const resposta = analisarMensagem(mensagem, base);
    mostrarMensagem(resposta, "velobot");
    salvarHistorico(mensagem, resposta);
  }, 1000);
}


// Evento de envio
const btn = document.querySelector("button");
btn.addEventListener("click", (e) => {
  e.preventDefault();
  const input = document.querySelector(".userinput");
  const mensagem = input.value.trim();
  if (!mensagem) return;
  input.value = "";
  processarMensagem(mensagem);
});

// Carrega o histórico ao abrir
carregarHistorico();
