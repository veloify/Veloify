
const input = document.getElementById('inputPdf');
const convertBtn = document.getElementById('convertPdf');
const downloadBtn = document.getElementById('downloadPdf');
const fileNameDisplay = document.getElementById('fileName');
const load = document.querySelector(".load");
const progressBar = document.querySelector('.progress');
const percentageText = document.querySelectorAll('.porcentagem');
const newNameInput = document.getElementById('newName');

let pdfBytesGlobal = null;

function updateProgress(percent) {
    percentageText.forEach(el => el.textContent = `${percent}%`);
    progressBar.style.width = `${percent}%`;
}

async function createPdfFromFiles(files) {
    updateProgress(10);
    const pdfDoc = await PDFLib.PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch('../assets/fonte/Roboto-Medium.ttf').then(res => res.arrayBuffer());
    const font = await pdfDoc.embedFont(fontBytes);

    let hasContent = false;

    for (let file of files) {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        updateProgress(30);

    function sanitizeText(text) {
        return text;
    }


    // Se for arquivo de texto
    if (fileType.startsWith('text') || fileName.endsWith('.txt')) {
        const textContent = await file.text();
        const cleanText = sanitizeText(textContent);

        const lineHeight = 14;
        const marginX = 50;
        const marginY = 50;

        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        // Função simples para quebrar o texto em linhas baseadas no maxWidth
        function splitTextIntoLines(text, maxWidth, font, size) {
            const paragraphs = text.split('\n');
            let lines = [];

            for (let para of paragraphs) {
                const words = para.split(' ');
                let currentLine = '';

                for (let word of words) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const textWidth = font.widthOfTextAtSize(testLine, size);

                if (textWidth > maxWidth) {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
                }
                if (currentLine) lines.push(currentLine);

                // Adiciona uma linha em branco após cada parágrafo
                lines.push('');
            }

            return lines;
        }

        const fontSize = 12;
        const maxWidth = width - 2 * marginX;
        const lines = splitTextIntoLines(cleanText, maxWidth, font, fontSize);

        let y = height - marginY;

        for (const line of lines) {
          if (y < marginY + lineHeight) {
            page = pdfDoc.addPage();
            y = height - marginY;
          }
          page.drawText(line, {
            x: marginX,
            y: y,
            size: fontSize,
            font: font,
            color: PDFLib.rgb(0, 0, 0),
          });
          y -= lineHeight;
        }

        hasContent = true;
    }


    // Se for imagem
    else if (fileType.startsWith('image')) {
        const arrayBuffer = await file.arrayBuffer();
        let image;

        if (fileType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
            image = await pdfDoc.embedJpg(arrayBuffer);

        } else if (fileType === 'image/png' || fileName.endsWith('.png')) {
            image = await pdfDoc.embedPng(arrayBuffer);

        } else {
            console.warn(`Formato de imagem não suportado: ${file.name}`);
            continue;
        }
        const pageWidth = 595;
        const pageHeight = 842;

        const imgDims = image.scale(1);

        const x = (pageWidth - imgDims.width) / 2;
        const y = (pageHeight - imgDims.height) / 1.1;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
            page.drawImage(image, {
            x: x,
            y: y,
            width: imgDims.width,
            height: imgDims.height,
        });


        hasContent = true;
    }
        // Se for tipo inválido
        else {
            console.warn(`Tipo de arquivo ignorado: ${file.name}`);
        }
    }

    if (!hasContent) {
        throw new Error("Nenhum conteúdo válido para converter.");
    }

    updateProgress(80);
    const pdfBytes = await pdfDoc.save();
    updateProgress(100);
    return pdfBytes;

}


let selectedFiles = [];

input.addEventListener('change', () => {

    convertBtn.style.display = "initial"
    selectedFiles = [...input.files];
    const names = selectedFiles.map(f => f.name).join(', ');
    fileNameDisplay.textContent = names || 'Nenhum arquivo selecionado.';
    updateProgress(0);
});

convertBtn.addEventListener('click', async () => {

    downloadBtn.style.display = "initial"

    //barra d eprogresso
    if (selectedFiles.length === 0) {
        alert('Selecione ao menos um arquivo!');
        return;
    }

    load.style.display = "flex";
    updateProgress(0);
    percentageText.forEach(p => p.textContent = "Convertendo...");
    downloadBtn.disabled = true;

    try {
        pdfBytesGlobal = await createPdfFromFiles(selectedFiles);

        updateProgress(100);
        percentageText.forEach(p => p.textContent = "Concluído!");
        downloadBtn.disabled = false;
    } catch (error) {
        console.error("Erro na conversão:", error);
        percentageText.forEach(p => p.textContent = "Erro na conversão!");
        downloadBtn.disabled = true;
    }
});

downloadBtn.addEventListener('click', () => {

    load.style.display = "none";
    if (!pdfBytesGlobal) {
        alert('Nenhum PDF gerado ainda!');
        return;
    }

    setTimeout(() => {
        feedbackIframe.style.display = "grid";
    }, 500);

const blob = new Blob([pdfBytesGlobal], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const marca = "_veloify"
    const newName = newNameInput.value.trim();
    const docVeloify = (newName ? newName + marca : 'documento_veloify') + '.pdf';
    a.href = url;
    a.download = (docVeloify);
    a.click();
    URL.revokeObjectURL(url);
});

window.addEventListener("message", (event) => {
  if (event.data === "exibirSucsess") {
    const exibirMessage = document.getElementById("feedback-success");
    if (exibirMessage) {
      exibirMessage.classList.remove("none");

      setTimeout(() => {
        const exibirMessage = document.getElementById("feedback-success");
        

        setTimeout(()=> {
            exibirMessage.classList.add("none")
        }, 400)
        
    }, 5000);


    } else {
      console.warn("Elemento #feedback-success não encontrado!");
    }
  }
});