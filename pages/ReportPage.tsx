import React, { useRef, useEffect, useState } from 'react';


// --- COMPONENTE DA FERRAMENTA DE CALIBRAÇÃO ---


const ReportPage: React.FC = () => {
  const [nomePessoa, setNomePessoa] = useState('');
  const [cpfPessoa, setCpfPessoa] = useState('');
  const [enderecoPessoa, setEnderecoPessoa] = useState('');
  const [bensMoveis, setBensMoveis] = useState('');
  const [bensImoveis, setBensImoveis] = useState('');
  const [vinculoEmpresarial, setVinculoEmpresarial] = useState('');

  const exportReport = async () => {
    try {
      const dataToSend = {
        nome_pessoa: nomePessoa,
        cpf: cpfPessoa,
        endereco: enderecoPessoa,
        bens_moveis: bensMoveis,
        bens_imoveis: bensImoveis,
        vinculo_empresarial: vinculoEmpresarial,
      };

      console.log("DEBUG: Sending data to backend:", dataToSend);

      const response = await fetch('http://localhost:3001/generate-report-pptx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Relatorio_Personalizado.pptx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert('Relatório PPTX gerado com sucesso!');
      } else {
        const errorText = await response.text();
        alert(`Erro ao gerar relatório: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro na requisição de exportação:', error);
      alert('Ocorreu um erro ao tentar gerar o relatório.');
    }
  };
  

  

  

      return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">Gerador de Relatório PPTX</h1>
        <button onClick={exportReport} className="px-6 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600">
          Exportar .pptx
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="nomePessoa" className="text-gray-700 font-medium mb-1">Nome da Pessoa:</label>
          <input
            type="text"
            id="nomePessoa"
            value={nomePessoa}
            onChange={(e) => setNomePessoa(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ex: Deverson Biliski"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="cpfPessoa" className="text-gray-700 font-medium mb-1">CPF:</label>
          <input
            type="text"
            id="cpfPessoa"
            value={cpfPessoa}
            onChange={(e) => setCpfPessoa(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ex: 123.456.789-00"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="enderecoPessoa" className="text-gray-700 font-medium mb-1">Endereço:</label>
          <input
            type="text"
            id="enderecoPessoa"
            value={enderecoPessoa}
            onChange={(e) => setEnderecoPessoa(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ex: Rua Exemplo, 123, Cidade - UF"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="bensMoveis" className="text-gray-700 font-medium mb-1">Bens Móveis:</label>
          <textarea
            id="bensMoveis"
            value={bensMoveis}
            onChange={(e) => setBensMoveis(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 h-24"
            placeholder="Liste os bens móveis..."
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="bensImoveis" className="text-gray-700 font-medium mb-1">Bens Imóveis:</label>
          <textarea
            id="bensImoveis"
            value={bensImoveis}
            onChange={(e) => setBensImoveis(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 h-24"
            placeholder="Liste os bens imóveis..."
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="vinculoEmpresarial" className="text-gray-700 font-medium mb-1">Vínculo Empresarial / Empregatício:</label>
          <textarea
            id="vinculoEmpresarial"
            value={vinculoEmpresarial}
            onChange={(e) => setVinculoEmpresarial(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 h-24"
            placeholder="Descreva os vínculos empresariais/empregatícios..."
          />
        </div>
      </div>
    </div>
  );
};

export default ReportPage;