import React, { useState } from 'react';
import { useOCR } from '../OCRContext'; // Importar o hook

const OCRPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { addDocument } = useOCR(); // Usar o contexto

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setStatusMessage(''); // Limpa a mensagem ao selecionar um novo arquivo
    }
  };

  const handleProcessOCR = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo primeiro.');
      return;
    }

    setLoading(true);
    setStatusMessage('Processando OCR...');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:3001/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao processar o OCR.');
      }

      const data = await response.json();
      
      // Adiciona o documento ao nosso armazenamento global
      addDocument({
        title: selectedFile.name,
        content: data.text,
      });

      setStatusMessage(`Sucesso! O documento "${selectedFile.name}" foi processado e salvo.`);
      setSelectedFile(null); // Limpa a seleção de arquivo

    } catch (error: any) {
      console.error('Erro ao enviar arquivo para OCR:', error);
      setStatusMessage(`Erro: ${error.message || 'Não foi possível processar o arquivo.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-slate-50">
      <h1 className="text-4xl font-extrabold text-slate-800 mb-8">OCR de Documentos</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl flex flex-col items-center space-y-6">
        <p className="text-lg text-slate-600 text-center mb-4">
          Envie um arquivo PDF ou imagem para extrair o texto. O resultado será salvo na barra lateral.
        </p>

        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-sky-50 file:text-sky-700
            hover:file:bg-sky-100"
        />

        {selectedFile && (
          <p className="text-sm text-slate-700 mt-2">
            Arquivo selecionado: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}

        <button
          onClick={handleProcessOCR}
          disabled={!selectedFile || loading}
          className={`py-3 px-6 rounded-full text-lg font-bold text-white transition-colors duration-200
            ${!selectedFile || loading ? 'bg-sky-300 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}
          `}
        >
          {loading ? 'Processando...' : 'Processar OCR'}
        </button>

        {statusMessage && (
          <div className="w-full mt-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
            <p className="text-center font-medium text-slate-700">{statusMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRPage;
