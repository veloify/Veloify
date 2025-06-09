const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.getElementById("fileName");
const compressBtn = document.getElementById("compressBtn");
const progressBar = document.querySelector(".progress");
const progressText = document.querySelector(".porcentagem");
const newNameInput = document.getElementById("newName");
const downloadBtn = document.getElementById("downloadBtn");
const nivelSelect = document.getElementById("nivelCompactacao");

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
}

// Função para atualizar progresso
function updateProgress(loaded, total, fileIndex, totalFiles) {
    // Progresso individual do arquivo atual
    const fileProgress = (loaded / total) * 100;
    
    // Progresso geral considerando todos os arquivos
    const overallProgress = ((fileIndex * 100) + fileProgress) / totalFiles;
    
    const percent = Math.floor(overallProgress);
    progressText.textContent = `${percent}%`;
}

// Compactar arquivos
compressBtn.addEventListener("click", () => {
    const zip = new JSZip();
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        alert("Selecione pelo menos um arquivo.");
        return;
    }
    
    // Reset do progresso
    progressText.textContent = '';
    
    let completed = 0;
    const totalFiles = files.length;

    files.forEach((file, index) => {
        const reader = new FileReader();
        
        // ✅ Evento de progresso em tempo real
        reader.onprogress = function(e) {
            if (e.lengthComputable) {
                updateProgress(e.loaded, e.total, completed, totalFiles);
            }
        };
        
        reader.onload = function(e) {
            zip.file(file.name, e.target.result);
            completed++;
            
            // Progresso quando arquivo é completamente lido
            updateProgress(1, 1, completed, totalFiles);

            if (completed === totalFiles) {
                // Mostrar progresso da compressão
                progressText.textContent = 'Compactando...';
                
                const nivel = nivelSelect.value;
                const level = getCompressionLevel(nivel);

                zip.generateAsync({
                    type: "blob",
                    compression: "DEFLATE",
                    compressionOptions: { level }
                }, function updateCallback(metadata) {
                    progressText.textContent = `Compactando...`;
                }).then((blob) => {
                    zipBlob = blob;
                    progressText.textContent = 'Concluído!';
                    
                    downloadBtn.disabled = false;
                }).catch((error) => {
                    console.error('Erro na compressão:', error);
                    progressText.textContent = 'Erro na compressão!';
                });
            }
        };
        
        // ✅ Tratamento de erro
        reader.onerror = function() {
            progressText.textContent = `Erro ao ler ${file.name}`;
            console.error('Erro ao ler arquivo:', file.name);
        };
        
        reader.readAsArrayBuffer(file);
    });
});

// Download com verificação melhorada
downloadBtn.addEventListener('click', () => {
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