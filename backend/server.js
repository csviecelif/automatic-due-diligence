const express = require('express');
const tesseract = require('node-tesseract-ocr');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const app = express();
const port = 3001;

// Configuração do CORS para permitir requisições do frontend
app.use(cors());

// Configuração do Multer para upload de arquivos
const upload = multer({ dest: 'uploads/' });

// Configuração do Tesseract
const config = {
  lang: 'eng+por', // Idiomas: inglês e português
  oem: 1, // OCR Engine Mode: 1 = LSTM Only
  psm: 3, // Page Segmentation Mode: 3 = Fully automatic page segmentation, but no OSD (Orientation and Script Detection)
};

// Rota para o OCR
app.post('/ocr', upload.single('image'), async (req, res) => {
  console.log('Requisição /ocr recebida.');
  if (!req.file) {
    console.log('Nenhum arquivo enviado.');
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const filePath = req.file.path;
  const originalname = req.file.originalname;
  const mimetype = req.file.mimetype;
  console.log(`Arquivo recebido: ${originalname}, Tipo: ${mimetype}, Caminho: ${filePath}`);

  let ocrText = '';
  let tempDir = '';

  try {
    if (mimetype === 'application/pdf') {
      console.log('Detectado arquivo PDF. Iniciando conversão para imagens.');
      // Criar um diretório temporário para as imagens do PDF
      tempDir = path.join(__dirname, 'temp_pdf_images', Date.now().toString());
      fs.mkdirSync(tempDir, { recursive: true });
      console.log(`Diretório temporário para imagens do PDF: ${tempDir}`);

      const absoluteFilePath = path.resolve(filePath);
      const outputPrefix = path.join(tempDir, 'page');
      // Envolve os caminhos com aspas para lidar com espaços
      const command = `pdftoppm -png "${absoluteFilePath}" "${outputPrefix}"`;
      console.log(`Executando comando: ${command}`);
      const { stdout, stderr } = await execPromise(command);
      console.log(`pdftoppm stdout: ${stdout}`);
      if (stderr) console.error(`pdftoppm stderr: ${stderr}`);
      console.log('Conversão de PDF para PNG concluída.');

      const files = fs.readdirSync(tempDir);
      console.log(`Arquivos encontrados no diretório temporário: ${files.length}`);
      let pageTexts = [];

      for (const file of files.sort()) { // Garante a ordem correta das páginas
        if (file.endsWith('.png')) {
          const imagePath = path.join(tempDir, file);
          console.log(`Processando imagem: ${imagePath}`);
          const text = await tesseract.recognize(imagePath, config);
          pageTexts.push(text);
          console.log(`OCR concluído para ${file}`);
        }
      }
      ocrText = pageTexts.join('\n\n---\n\n'); // Juntar o texto de todas as páginas

    } else if (mimetype.startsWith('image/')) {
      console.log('Detectado arquivo de imagem. Processando diretamente.');
      // Processar imagem diretamente
      ocrText = await tesseract.recognize(filePath, config);
      console.log('OCR concluído para a imagem.');
    } else {
      console.log(`Formato de arquivo não suportado: ${mimetype}`);
      return res.status(400).json({ error: 'Formato de arquivo não suportado. Por favor, envie PDF ou imagem.' });
    }

    res.json({ text: ocrText });
  } catch (error) {
    console.error('Erro no OCR (detalhes):', error);
    res.status(500).json({ error: 'Erro ao processar o OCR.' });
  } finally {
    console.log('Iniciando limpeza de arquivos temporários.');
    // Remover o arquivo temporário original
    fs.unlink(filePath, (err) => {
      if (err) console.error('Erro ao remover o arquivo original:', err);
      else console.log(`Arquivo original removido: ${filePath}`);
    });
    // Remover o diretório temporário de imagens do PDF, se existir
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rm(tempDir, { recursive: true, force: true }, (err) => {
        if (err) console.error('Erro ao remover o diretório temporário de imagens:', err);
        else console.log(`Diretório temporário de imagens removido: ${tempDir}`);
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
