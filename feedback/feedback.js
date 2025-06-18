function fecharIframe() {
  if (window.parent !== window) {
    window.parent.postMessage("fecharFeedback", "*");
  };
};

// função para fechar o feedback
const closeFeed = document.getElementById("closeFeedback");
closeFeed.addEventListener("click", () => {

  fecharIframe();
});

function messageSucess() {
  if (window.parent !== window) {
    window.parent.postMessage("exibirSucsess", "*");
  }
}

// função para enviar o form
const form = document.getElementById('formFeed');
const successMessage = document.getElementById('feedback-success');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = new FormData(form);

    const response = await fetch("https://formspree.io/f/manjeeod", {
        method: "POST",
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
      fecharIframe();
      messageSucess();


    } else {
      alert('Ops! Algo deu errado. 😢 Tente novamente mais tarde.');
    }
});