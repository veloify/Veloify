// Função para fechar o VeloBot
const closeVeloBot = document.getElementById("velobotClose");
closeVeloBot.addEventListener("click", () => {
    const veloBot = document.getElementById("velobot");

    veloBot.classList.add("fade-out");

    setTimeout(() => {
        veloBot.classList.remove("fade-out");
    }, 1000);   
});