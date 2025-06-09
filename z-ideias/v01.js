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

// Compactar arquivos
compressBtn.addEventListener("click", () => {
    const zip = new JSZip();
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        alert("Selecione pelo menos um arquivo.");
        return;
    }
    
    let completed = 0;

    files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = function (e) {
        zip.file(file.name, e.target.result);
        completed++;

        const percent = Math.floor((completed / files.length) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;

        if (completed === files.length) {
            const nivel = nivelSelect.value;
            const level = getCompressionLevel(nivel);

            zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level }
            }).then((blob) => {
            zipBlob = blob;
            alert("Compactação finalizada. Agora você pode renomear e baixar o arquivo ZIP.");
            downloadBtn.disabled = false;
            });
        }};
        reader.readAsArrayBuffer(file);
    });
});

downloadBtn.addEventListener('click', () => {
    if (!zipBlob) return;

    const newName = document.getElementById('newName').value.trim() || 'meu_arquivo.zip';
    const fileName = newName.endsWith('.zip') ? newName : `${newName}.zip`;

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});