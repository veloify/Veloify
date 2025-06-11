const iconBot = document.getElementById("iconBot");

iconBot.addEventListener("click", () => {
  // Envia mensagem para a página pai (index)
  window.parent.postMessage("abrir-velobot", "*");

});
