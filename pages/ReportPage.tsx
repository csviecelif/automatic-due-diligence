import React, { useState } from 'react';
import pptxgen from "pptxgenjs";

// Estrutura de dados completa para todos os slides
interface ReportData {
  title: string;
  subtitle: string;
  clientName: string;
  date: string;
  tocTitle: string;
  tocItems: string[];
  objectivesTitle: string;
  objectivesBody: string;
  sourcesTitle: string;
  sourcesItems: string[];
  infoTitle: string;
  infoData: { label: string; value: string }[];
  conclusionTitle: string;
  conclusionBody: string;
}

const ReportPage: React.FC = () => {
  // Estado inicial com dados de todos os slides
  const [reportData, setReportData] = useState<ReportData>({
    title: "RELATÓRIO DE DUE DILIGENCE",
    subtitle: "SOCIEDADE INVESTIGADA",
    clientName: "[NOME DA SOCIEDADE]",
    date: new Date().toLocaleDateString('pt-BR'),
    tocTitle: "ÍNDICE",
    tocItems: ["OBJETO DA INVESTIGAÇÃO", "FONTES DE PESQUISA", "INFORMAÇÕES CADASTRAIS", "SÓCIOS E PARTICIPAÇÕES", "PROCESSOS JUDICIAIS E EXTRAJUDICIAIS", "MÍDIA E REPUTAÇÃO", "CONCLUSÃO"],
    objectivesTitle: "1. OBJETO DA INVESTIGAÇÃO",
    objectivesBody: "O presente relatório tem por objeto a realização de Due Diligence sobre a sociedade [NOME DA SOCIEDADE], com o objetivo de identificar e analisar informações relevantes para a tomada de decisão.",
    sourcesTitle: "2. FONTES DE PESQUISA",
    sourcesItems: ["Receita Federal do Brasil (RFB)", "Sintegra", "Juntas Comerciais", "Tribunais de Justiça", "Diários Oficiais", "Bureaus de crédito", "Mídia nacional e internacional"],
    infoTitle: "3. INFORMAÇÕES CADASTRAIS",
    infoData: [
        { label: "RAZÃO SOCIAL", value: "[VALOR]" }, { label: "NOME FANTASIA", value: "[VALOR]" }, { label: "CNPJ", value: "[VALOR]" }, { label: "DATA DE ABERTURA", value: "[VALOR]" },
        { label: "ENDEREÇO", value: "[VALOR]" }, { label: "CAPITAL SOCIAL", value: "[VALOR]" }, { label: "ATIVIDADE PRINCIPAL (CNAE)", value: "[VALOR]" }, { label: "SITUAÇÃO CADASTRAL", value: "[VALOR]" },
    ],
    conclusionTitle: "7. CONCLUSÃO",
    conclusionBody: "A partir da análise das informações coletadas, conclui-se que [APRESENTAR A CONCLUSÃO DA ANÁLISE]. Recomenda-se [APRESENTAR RECOMENDAÇÕES].",
  });

  // Handlers para atualizar o estado
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReportData(p => ({ ...p, [name]: value }));
  };

  const handleTocItemChange = (index: number, value: string) => {
    const items = [...reportData.tocItems];
    items[index] = value;
    setReportData(p => ({ ...p, tocItems: items }));
  };

  const handleSourceItemChange = (index: number, value: string) => {
    const items = [...reportData.sourcesItems];
    items[index] = value;
    setReportData(p => ({ ...p, sourcesItems: items }));
  };

  const handleInfoDataChange = (index: number, value: string) => {
    const items = [...reportData.infoData];
    items[index].value = value;
    setReportData(p => ({ ...p, infoData: items }));
  };

  // Função de exportação completa
  const exportReport = () => {
    let pptx = new pptxgen();

    // Slide 1: Capa
    let slide1 = pptx.addSlide();
    slide1.background = { color: "F1F1F1" };
    slide1.addText(reportData.title, { x: 0.5, y: 2.5, w: 9, h: 1, align: 'center', fontSize: 32, bold: true, color: "363636" });
    slide1.addText(reportData.subtitle, { x: 0.5, y: 3.5, w: 9, h: 0.5, align: 'center', fontSize: 20, color: "363636" });
    slide1.addText(reportData.clientName, { x: 0.5, y: 4.0, w: 9, h: 0.5, align: 'center', fontSize: 18, color: "0077B6" });
    slide1.addText(reportData.date, { x: 8, y: 7, w: 1.5, h: 0.25, align: 'right', fontSize: 12, color: "363636" });

    // Slide 2: Índice
    let slide2 = pptx.addSlide();
    slide2.background = { color: "F1F1F1" };
    slide2.addText(reportData.tocTitle, { x: 0.5, y: 0.5, w: 9, h: 0.75, align: 'center', fontSize: 28, bold: true, color: "363636" });
    reportData.tocItems.forEach((item, index) => {
      slide2.addText(`${index + 1}. ${item}`, { x: 1, y: 1.5 + (index * 0.6), w: 8, h: 0.5, fontSize: 18, color: "363636" });
    });

    // Slide 3: Objeto da Investigação
    let slide3 = pptx.addSlide();
    slide3.background = { color: "F1F1F1" };
    slide3.addText(reportData.objectivesTitle, { x: 0.5, y: 0.5, w: 9, h: 0.75, fontSize: 24, bold: true, color: "363636" });
    slide3.addText(reportData.objectivesBody, { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 16, color: "363636", align: 'justify' });

    // Slide 4: Fontes de Pesquisa
    let slide4 = pptx.addSlide();
    slide4.background = { color: "F1F1F1" };
    slide4.addText(reportData.sourcesTitle, { x: 0.5, y: 0.5, w: 9, h: 0.75, fontSize: 24, bold: true, color: "363636" });
    reportData.sourcesItems.forEach((source, index) => {
        slide4.addText(source, { x: 1, y: 1.5 + (index * 0.5), w: 8.5, h: 0.4, fontSize: 16, color: "363636", bullet: true });
    });

    // Slide 5: Informações Cadastrais
    let slide5 = pptx.addSlide();
    slide5.background = { color: "F1F1F1" };
    slide5.addText(reportData.infoTitle, { x: 0.5, y: 0.5, w: 9, h: 0.75, fontSize: 24, bold: true, color: "363636" });
    const tableData = reportData.infoData.map(item => [{ text: item.label, options: { bold: true } }, item.value]);
    slide5.addTable(tableData, { x: 0.5, y: 1.5, w: 9, rowH: 0.4, colW: [3, 6], border: { type: 'solid', pt: 1, color: 'CCCCCC' }, fontSize: 12, valign: 'middle' });

    // Slide 6: Conclusão
    let slide6 = pptx.addSlide();
    slide6.background = { color: "F1F1F1" };
    slide6.addText(reportData.conclusionTitle, { x: 0.5, y: 0.5, w: 9, h: 0.75, fontSize: 24, bold: true, color: "363636" });
    slide6.addText(reportData.conclusionBody, { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 16, color: "363636", align: 'justify' });

    pptx.writeFile({ fileName: "Relatorio_Due_Diligence_Completo.pptx" });
  };

  // Renderização de todos os editores de slide
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">Editor de Relatório</h1>
        <button onClick={exportReport} className="px-6 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors duration-200">
          Exportar .pptx
        </button>
      </div>

      {/* Slide 1: Capa */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Slide 1: Capa</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-600">Título Principal</label><input type="text" name="title" value={reportData.title} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
          <div><label className="block text-sm font-medium text-gray-600">Subtítulo</label><input type="text" name="subtitle" value={reportData.subtitle} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
          <div><label className="block text-sm font-medium text-gray-600">Nome da Sociedade</label><input type="text" name="clientName" value={reportData.clientName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
        </div>
      </div>

      {/* Slide 2: Índice */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Slide 2: Índice</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-600">Título do Índice</label><input type="text" name="tocTitle" value={reportData.tocTitle} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
          <div><label className="block text-sm font-medium text-gray-600">Itens do Índice</label>{reportData.tocItems.map((item, index) => (<input key={index} type="text" value={item} onChange={(e) => handleTocItemChange(index, e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 mb-2" />))}</div>
        </div>
      </div>

      {/* Slide 3: Objeto da Investigação */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Slide 3: Objeto da Investigação</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-600">Título</label><input type="text" name="objectivesTitle" value={reportData.objectivesTitle} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
          <div><label className="block text-sm font-medium text-gray-600">Corpo do Texto</label><textarea name="objectivesBody" value={reportData.objectivesBody} onChange={handleInputChange} rows={5} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
        </div>
      </div>

      {/* Slide 4: Fontes de Pesquisa */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Slide 4: Fontes de Pesquisa</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-600">Título</label><input type="text" name="sourcesTitle" value={reportData.sourcesTitle} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
          <div><label className="block text-sm font-medium text-gray-600">Itens da Lista</label>{reportData.sourcesItems.map((item, index) => (<input key={index} type="text" value={item} onChange={(e) => handleSourceItemChange(index, e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 mb-2" />))}</div>
        </div>
      </div>

      {/* Slide 5: Informações Cadastrais */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Slide 5: Informações Cadastrais</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-600">Título</label><input type="text" name="infoTitle" value={reportData.infoTitle} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
          <div><label className="block text-sm font-medium text-gray-600">Dados Cadastrais</label>{reportData.infoData.map((item, index) => (<div key={index} className="grid grid-cols-3 gap-4 items-center mb-2"><label className="col-span-1 text-sm font-medium text-gray-700">{item.label}</label><input type="text" value={item.value} onChange={(e) => handleInfoDataChange(index, e.target.value)} className="col-span-2 mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>))}</div>
        </div>
      </div>

      {/* Slide 7: Conclusão */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Slide 7: Conclusão</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-600">Título</label><input type="text" name="conclusionTitle" value={reportData.conclusionTitle} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
          <div><label className="block text-sm font-medium text-gray-600">Corpo do Texto</label><textarea name="conclusionBody" value={reportData.conclusionBody} onChange={handleInputChange} rows={5} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;