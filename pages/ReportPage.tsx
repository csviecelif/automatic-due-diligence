import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import pptxgen from "pptxgenjs";

// --- DEFINIÇÃO DO TEMPLATE COMO OBJETOS JSON ---
const slideTemplates = [
  // Slide 1: Capa
  { "version": "5.3.0", "objects": [
      { "type": "rect", "left": 0, "top": 0, "height": 450, "width": 100, "fill": "#003366", "selectable": false, "hoverCursor": "default" },
      { "type": "textbox", "left": 120, "top": 150, "width": 650, "fontSize": 32, "fontWeight": "bold", "textAlign": "left", "text": "RELATÓRIO DE DUE DILIGENCE" },
      { "type": "textbox", "left": 120, "top": 220, "width": 650, "fontSize": 20, "textAlign": "left", "text": "SOCIEDADE INVESTIGADA" },
      { "type": "textbox", "left": 120, "top": 260, "width": 650, "fontSize": 18, "fill": "#0077b6", "textAlign": "left", "text": "[NOME DA SOCIEDADE]" }
    ], "background": "#ffffff"
  },
  // Slide 2: Índice
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 400, "top": 50, "originX": "center", "width": 700, "fontSize": 28, "fontWeight": "bold", "textAlign": "center", "text": "ÍNDICE" },
      ...["OBJETO DA INVESTIGAÇÃO", "FONTES DE PESQUISA", "INFORMAÇÕES CADASTRAIS", "SÓCIOS E PARTICIPAÇÕES", "PROCESSOS JUDICIAIS E EXTRAJUDICIAIS", "MÍDIA E REPUTAÇÃO", "CONCLUSÃO"].map((item, index) => (
        { "type": "textbox", "left": 100, "top": 120 + (index * 40), "width": 600, "fontSize": 18, "text": `${index + 1}. ${item}` }
      ))
    ], "background": "#ffffff"
  },
  // Slide 3: Objeto da Investigação
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 50, "width": 700, "fontSize": 24, "fontWeight": "bold", "text": "1. OBJETO DA INVESTIGAÇÃO" },
      { "type": "textbox", "left": 50, "top": 120, "width": 700, "fontSize": 16, "textAlign": "justify", "text": "O presente relatório tem por objeto a realização de Due Diligence sobre a sociedade [NOME DA SOCIEDADE], com o objetivo de identificar e analisar informações relevantes para a tomada de decisão." }
    ], "background": "#ffffff"
  },
  // Slide 4: Fontes de Pesquisa
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 50, "width": 700, "fontSize": 24, "fontWeight": "bold", "text": "2. FONTES DE PESQUISA" },
      ...["Receita Federal do Brasil (RFB)", "Sintegra", "Juntas Comerciais", "Tribunais de Justiça", "Diários Oficiais", "Bureaus de crédito", "Mídia nacional e internacional"].flatMap((item, index) => ([
        { "type": "circle", "radius": 3, "fill": "#003366", "left": 50, "top": 125 + (index * 35), "selectable": false, "hoverCursor": "default" },
        { "type": "textbox", "left": 70, "top": 120 + (index * 35), "width": 600, "fontSize": 16, "text": item }
      ]))
    ], "background": "#ffffff"
  },
  // Slide 5: Informações Cadastrais
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 50, "width": 700, "fontSize": 24, "fontWeight": "bold", "text": "3. INFORMAÇÕES CADASTRAIS" },
      ...[
        { label: "RAZÃO SOCIAL", value: "[VALOR]" }, { label: "NOME FANTASIA", value: "[VALOR]" }, { label: "CNPJ", value: "[VALOR]" }, { label: "DATA DE ABERTURA", value: "[VALOR]" },
        { label: "ENDEREÇO", value: "[VALOR]" }, { label: "CAPITAL SOCIAL", value: "[VALOR]" }, { label: "ATIVIDADE PRINCIPAL (CNAE)", value: "[VALOR]" }, { label: "SITUAÇÃO CADASTRAL", value: "[VALOR]" },
      ].flatMap((item, index) => ([
        { "type": "textbox", "left": 50, "top": 120 + (index * 35), "width": 300, "fontSize": 14, "fontWeight": "bold", "text": item.label },
        { "type": "textbox", "left": 350, "top": 120 + (index * 35), "width": 400, "fontSize": 14, "text": item.value }
      ]))
    ], "background": "#ffffff"
  },
  // Slide 6: Conclusão
  { "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 50, "width": 700, "fontSize": 24, "fontWeight": "bold", "text": "7. CONCLUSÃO" },
      { "type": "textbox", "left": 50, "top": 120, "width": 700, "fontSize": 16, "textAlign": "justify", "text": "A partir da análise das informações coletadas, conclui-se que [APRESENTAR A CONCLUSÃO DA ANÁLISE]. Recomenda-se [APRESENTAR RECOMENDAÇÕES]." }
    ], "background": "#ffffff"
  }
];

const ReportPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const [slides, setSlides] = useState<any[]>(() => JSON.parse(JSON.stringify(slideTemplates)));
  const [activeSlide, setActiveSlide] = useState(0);

  // Efeito para INICIALIZAR e DESTRUIR o canvas. Roda apenas uma vez.
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 450,
      allowTouchScrolling: true, // Resolve o aviso de performance
    });
    fabricCanvasRef.current = canvas;

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Efeito para CARREGAR DADOS no canvas quando o slide ativo muda.
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.loadFromJSON(slides[activeSlide], () => {
        canvas.renderAll();
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
    const inch = (px: number) => (px || 0) / 96;
    const pt = (px: number) => (px || 0) * 0.75;

    finalSlides.forEach(slideData => {
      const slide = pptx.addSlide();
      if (slideData.background) {
        slide.background = { color: slideData.background.replace('#', '') };
      }

      slideData.objects.forEach((obj: any) => {
        const commonOptions = {
          x: inch(obj.left),
          y: inch(obj.top),
          w: inch(obj.width * (obj.scaleX || 1)),
          h: inch(obj.height * (obj.scaleY || 1)),
        };

        if (obj.type === 'textbox') {
          slide.addText(obj.text, {
            ...commonOptions,
            fontSize: pt(obj.fontSize * (obj.scaleY || 1)),
            color: (obj.fill || '000000').replace('#', ''),
            bold: obj.fontWeight === 'bold',
            italic: obj.fontStyle === 'italic',
            underline: obj.underline,
            align: obj.textAlign?.toLowerCase() as any || 'left',
          });
        } else if (obj.type === 'rect' || obj.type === 'circle') {
          slide.addShape(obj.type === 'rect' ? pptx.shapes.RECTANGLE : pptx.shapes.OVAL, {
            ...commonOptions,
            fill: { color: (obj.fill || '000000').replace('#', '') },
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

      <div className="w-full flex justify-center bg-gray-100 p-4">
        <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />
      </div>
       <p className="text-center text-gray-500 mt-4">
          Clique nos textos para editar. Arraste para mover. Use as alças para redimensionar.
        </p>
    </div>
  );
};

export default ReportPage;
