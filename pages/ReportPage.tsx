import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import pptxgen from "pptxgenjs";

// --- DEFINIÇÃO DO TEMPLATE DE ALTA FIDELIDADE ---

// Fatores de conversão baseados no tamanho do slide (40.64cm) e do canvas (1152px)
const cmToPx = (cm: number) => (cm / 40.64) * 1152;
const ptToPx = (pt: number) => pt * (96 / 72); // Conversão de pontos (fonte) para pixels

const slideTemplates = [
  // Slide 1: Capa (Alta Fidelidade com Conversão Precisa)
  {
    "version": "5.3.0", "objects": [
      // Título Principal
      { "type": "textbox", "left": cmToPx(0), "top": cmToPx(5), "width": cmToPx(40.5), "height": cmToPx(3), "fontSize": ptToPx(60), "fontFamily": "Crimson Pro", "fontWeight": 600, "fill": "#152D47", "text": "Relatório de Due Diligence", "textAlign": "center" },
      // Nome da Pessoa (Placeholder)
      { "type": "textbox", "left": cmToPx(13.1), "top": cmToPx(8.65), "width": cmToPx(14.55), "height": cmToPx(1.35), "fontSize": ptToPx(28), "fontFamily": "Arial", "fontWeight": "bold", "fill": "#6E6E6E", "text": "[NOME DA PESSOA]", "textAlign": "center" },
      // Linha Horizontal
      { "type": "rect", "left": cmToPx(2), "top": cmToPx(13.5), "height": 2, "width": cmToPx(37), "fill": "#6E6E6E", "selectable": false, "hoverCursor": "default" },
      // Texto Descritivo
      { "type": "textbox", "left": cmToPx(2.5), "top": cmToPx(14), "width": cmToPx(36.5), "height": cmToPx(1.82), "fontSize": ptToPx(20), "fontFamily": "Arial", "fill": "#6E6E6E", "textAlign": "justify", "text": "Análise consolidada de informações cadastrais, patrimoniais e do histórico processual para identificação de riscos, inconsistências e subsídios para a estratégia jurídica." }
    ], "background": "#FFFFFF"
  },
  // Slides 2 a 6 mantêm o design anterior por enquanto
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 40, "width": 700, "fontSize": 32, "fontWeight": "bold", "fill": "#0A2D4D", "text": "ÍNDICE" },
      { "type": "rect", "left": 50, "top": 85, "height": 3, "width": 700, "fill": "#0077B6", "selectable": false, "hoverCursor": "default" },
      ...["OBJETO DA INVESTIGAÇÃO", "FONTES DE PESQUISA", "INFORMAÇÕES CADASTRAIS", "SÓCIOS E PARTICIPAÇÕES", "PROCESSOS JUDICIAIS E EXTRAJUDICIAIS", "MÍDIA E REPUTAÇÃO", "CONCLUSÃO"].map((item, index) => (
        { "type": "textbox", "left": 70, "top": 120 + (index * 40), "width": 650, "fontSize": 18, "fill": "#333333", "text": `${index + 1}. ${item}` }
      ))
    ], "background": "#F8F9FA"
  },
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 40, "width": 700, "fontSize": 28, "fontWeight": "bold", "fill": "#0A2D4D", "text": "1. OBJETO DA INVESTIGAÇÃO" },
      { "type": "rect", "left": 50, "top": 85, "height": 3, "width": 700, "fill": "#0077B6", "selectable": false, "hoverCursor": "default" },
      { "type": "textbox", "left": 50, "top": 130, "width": 700, "fontSize": 16, "textAlign": "justify", "fill": "#333333", "text": "O presente relatório tem por objeto a realização de Due Diligence sobre a sociedade [NOME DA SOCIEDADE], com o objetivo de identificar e analisar informações relevantes para a tomada de decisão, abrangendo aspectos societários, fiscais, judiciais e reputacionais." }
    ], "background": "#F8F9FA"
  },
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 40, "width": 700, "fontSize": 28, "fontWeight": "bold", "fill": "#0A2D4D", "text": "2. FONTES DE PESQUISA" },
      { "type": "rect", "left": 50, "top": 85, "height": 3, "width": 700, "fill": "#0077B6", "selectable": false, "hoverCursor": "default" },
      ...["Receita Federal do Brasil (RFB)", "Sintegra (ICMS)", "Juntas Comerciais", "Tribunais de Justiça (Estaduais e Federais)", "Diários Oficiais (DOU, DOE)", "Bureaus de crédito e risco", "Mídia nacional e internacional"].flatMap((item, index) => ([
        { "type": "rect", "height": 8, "width": 8, "fill": "#0A2D4D", "left": 50, "top": 135 + (index * 35), "selectable": false, "hoverCursor": "default" },
        { "type": "textbox", "left": 75, "top": 130 + (index * 35), "width": 650, "fontSize": 16, "fill": "#333333", "text": item }
      ]))
    ], "background": "#F8F9FA"
  },
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 40, "width": 700, "fontSize": 28, "fontWeight": "bold", "fill": "#0A2D4D", "text": "3. INFORMAÇÕES CADASTRAIS" },
      { "type": "rect", "left": 50, "top": 85, "height": 3, "width": 700, "fill": "#0077B6", "selectable": false, "hoverCursor": "default" },
      ...[
        { label: "RAZÃO SOCIAL", value: "[VALOR]" }, { label: "NOME FANTASIA", value: "[VALOR]" }, { label: "CNPJ", value: "[VALOR]" }, { label: "DATA DE ABERTURA", value: "[VALOR]" },
        { label: "ENDEREÇO", value: "[VALOR]" }, { label: "CAPITAL SOCIAL", value: "[VALOR]" }, { label: "ATIVIDADE PRINCIPAL (CNAE)", value: "[VALOR]" }, { label: "SITUAÇÃO CADASTRAL", value: "[VALOR]" },
      ].flatMap((item, index) => ([
        { "type": "textbox", "left": 50, "top": 130 + (index * 35), "width": 300, "fontSize": 15, "fontWeight": "bold", "fill": "#333333", "text": item.label },
        { "type": "textbox", "left": 370, "top": 130 + (index * 35), "width": 400, "fontSize": 15, "fill": "#333333", "text": item.value }
      ]))
    ], "background": "#F8F9FA"
  },
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 40, "width": 700, "fontSize": 28, "fontWeight": "bold", "fill": "#0A2D4D", "text": "7. CONCLUSÃO" },
      { "type": "rect", "left": 50, "top": 85, "height": 3, "width": 700, "fill": "#0077B6", "selectable": false, "hoverCursor": "default" },
      { "type": "textbox", "left": 50, "top": 130, "width": 700, "fontSize": 16, "textAlign": "justify", "fill": "#333333", "text": "A partir da análise das informações coletadas, conclui-se que [APRESENTAR A CONCLUSÃO DA ANÁLISE]. Recomenda-se [APRESENTAR RECOMENDAÇÕES]." }
    ], "background": "#F8F9FA"
  }
];

const ReportPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const [slides, setSlides] = useState<any[]>(() => JSON.parse(JSON.stringify(slideTemplates)));
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1152, // Proporção 16:9 (baseado em 40.64cm)
      height: 648, // Proporção 16:9 (baseado em 22.86cm)
      allowTouchScrolling: true,
    });
    fabricCanvasRef.current = canvas;
    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.loadFromJSON(slides[activeSlide], () => {
        requestAnimationFrame(() => {
            canvas.renderAll();
        });
      });
    }
  }, [activeSlide, slides]);

  const changeSlide = (newSlideIndex: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || newSlideIndex < 0 || newSlideIndex >= slides.length) return;
    const currentJson = canvas.toDatalessJSON();
    const updatedSlides = [...slides];
    updatedSlides[activeSlide] = currentJson;
    setSlides(updatedSlides);
    setActiveSlide(newSlideIndex);
  };

  const exportReport = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const finalSlides = [...slides];
    finalSlides[activeSlide] = canvas.toDatalessJSON();
    const pptx = new pptxgen();
    
    // Definindo o tamanho do slide no pptx para corresponder ao original
    pptx.layout = { name: 'LAYOUT_WIDE', width: 16, height: 9 };

    finalSlides.forEach(slideData => {
      const slide = pptx.addSlide();
      if (slideData.background) {
        slide.background = { color: slideData.background.replace('#', '') };
      }

      slideData.objects.forEach((obj: any) => {
        // Conversão de pixels do canvas para polegadas do pptx
        const inch = (px: number, total: number) => (px / total) * (total === 1152 ? 16 : 9);

        const commonOptions = {
          x: inch(obj.left, 1152),
          y: inch(obj.top, 648),
          w: inch(obj.width * (obj.scaleX || 1), 1152),
          h: inch(obj.height * (obj.scaleY || 1), 648),
        };

        if (obj.type === 'textbox') {
          slide.addText(obj.text, {
            ...commonOptions,
            fontSize: obj.fontSize, // Usando o tamanho em pt diretamente
            fontFace: obj.fontFamily,
            color: (obj.fill || '000000').replace('#', ''),
            bold: obj.fontWeight === 'bold' || obj.fontWeight === 600,
            italic: obj.fontStyle === 'italic',
            underline: obj.underline,
            align: obj.textAlign?.toLowerCase() as any || 'left',
          });
        } else if (obj.type === 'rect' || obj.type === 'circle') {
          slide.addShape(obj.type === 'rect' ? pptx.shapes.RECTANGLE : pptx.shapes.OVAL, {
            ...commonOptions,
            fill: { color: (obj.fill || '000000').replace('#', '') },
            line: { color: (obj.fill || '000000').replace('#', ''), width: 0 },
          });
        }
      });
    });
    pptx.writeFile({ fileName: "Relatorio_Final.pptx" });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">Editor de Relatório Interativo</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button onClick={() => changeSlide(activeSlide - 1)} disabled={activeSlide === 0} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Anterior</button>
            <span className="font-semibold">{`Slide ${activeSlide + 1} de ${slides.length}`}</span>
            <button onClick={() => changeSlide(activeSlide + 1)} disabled={activeSlide === slides.length - 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Próximo</button>
          </div>
          <button onClick={exportReport} className="px-6 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600">
            Exportar .pptx
          </button>
        </div>
      </div>
      <div className="w-full flex justify-center bg-gray-200 p-4 shadow-inner">
        <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />
      </div>
       <p className="text-center text-gray-500 mt-4">
          Clique nos textos para editar. Arraste para mover. Use as alças para redimensionar.
        </p>
    </div>
  );
};

export default ReportPage;
