const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.getElementById("fileName");
const compressBtn = document.getElementById("compressBtn");
const progressBar = document.querySelector(".progress");
const progressText = document.querySelector(".porcentagem");
const newNameInput = document.getElementById("newName");
const downloadBtn = document.getElementById("downloadBtn");
const nivelSelect = document.getElementById("nivelCompactacao");
const load = document.querySelector(".load");
const formFeed = document.getElementById("formFeed");


let zipBlob = null;

// Mostrar nomes dos arquivos selecionados
fileInput.addEventListener("change", () => {

    const files = Array.from(fileInput.files);

    fileNameDisplay.textContent = files.length > 0
        ? files.map(f => f.name).join(", ")
        : "Nenhum arquivo selecionado.";

    const nomesFormatados = files.map(file => {
        const nome = file.name;
        if (nome.length > 15) {
            const ext = nome.split('.').pop();
            return `${nome.substring(0, 10)}...${ext}`;
        }
        return nome;
    });

    fileNameDisplay.textContent = nomesFormatados.join(', ');
});

// Obter o nível de compressão conforme escolha do usuário
function getCompressionLevel(level) {

    switch (level) {
        case "low":
            return 1;
        case "normal":
            return 6;
        case "high":
            return 9;
        default:
            return 6;
    }
};

// Compactar arquivos
compressBtn.addEventListener("click", () => {

    const zip = new JSZip();
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        alert("Selecione pelo menos um arquivo.");
        return;
    }

    // Ativando barra de carregamneto
    load.style.display = "flex";

    // Reset do progresso
    progressText.textContent = '';
    progressBar.style.width = '0%';
    downloadBtn.disabled = true;

    let completed = 0;
    const totalFiles = files.length;

    files.forEach((file) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            zip.file(file.name, e.target.result);
            completed++;

            if (completed === totalFiles) {
                progressText.textContent = 'Compactando...';

                const nivel = nivelSelect.value;
                const level = getCompressionLevel(nivel);

                zip.generateAsync({
                    type: "blob",
                    compression: "DEFLATE",
                    compressionOptions: { level }
                }, function updateCallback(metadata) {
                    const percent = Math.floor(metadata.percent);
                    progressBar.style.width = percent + "%";
                    progressText.textContent = percent + "%";
                })
                .then((blob) => {
                    zipBlob = blob;
                    progressText.textContent = 'Concluído!';
                    progressBar.style.width = '100%';
                    downloadBtn.disabled = false;
                })
                .catch((error) => {
                    console.error('Erro na compressão:', error);
                    progressText.textContent = 'Erro na compressão!';
                });
            }
        };

        reader.onerror = function () {
            progressText.textContent = `Erro ao ler ${file.name}`;
            console.error('Erro ao ler arquivo:', file.name);
        };

        reader.readAsArrayBuffer(file);
    });
});

// Download
downloadBtn.addEventListener('click', () => {

    // Desativa a barra de carregamento suavimente
    setTimeout(() => {
        load.style.opacity = "0";

        setTimeout(() => {
            load.style.display = "none";
        }, 500);

    },1000);

    setTimeout(() =>{
        formFeed.style.transition = "all 1s ease";
        formFeed.style.display = "initial"
    },900);

    if (!zipBlob) {
        alert('Compacte os arquivos primeiro!');
        return;
    }

    let newName = 'meu_arquivo.zip';
    if (newNameInput && newNameInput.value) {
        newName = newNameInput.value.trim() || 'meu_arquivo.zip';
    }

    const fileName = newName.endsWith('.zip') ? newName : `${newName}.zip`;

    try {
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

    } catch (error) {
        console.error('Erro no download:', error);
        alert('Erro ao baixar: ' + error.message);
    }
});

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
    
    // Oculta a mensagem de sucesso após 8 segundos
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 8000);

    if (response.ok) {
        form.style.display = 'none';
        successMessage.style.display = 'block';

    } else {
        alert('Ops! Algo deu errado. 😢 Tente novamente mais tarde.');
    }
});

