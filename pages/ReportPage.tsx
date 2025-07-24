import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import pptxgen from "pptxgenjs";

// --- DEFINIÇÃO DO TEMPLATE ---
const slideTemplates = [
  // Slide 1: Capa (Valores iniciais para calibração)
  {
    "version": "5.3.0", "objects": [
      { "type": "textbox", "left": 50, "top": 150, "width": 1000, "fontSize": 75, "fontFamily": "Crimson Pro", "fontWeight": 600, "fill": "#152D47", "text": "Relatório de Due Diligence", "textAlign": "left" },
      { "type": "textbox", "left": 490, "top": 335, "width": 400, "fontSize": 32, "fontFamily": "Arial", "fontWeight": "bold", "fill": "#6E6E6E", "text": "[NOME DA PESSOA]", "textAlign": "center" },
      { "type": "rect", "left": 75, "top": 500, "height": 2, "width": 1000, "fill": "#6E6E6E" },
      { "type": "textbox", "left": 75, "top": 520, "width": 1000, "fontSize": 22, "fontFamily": "Arial", "fill": "#6E6E6E", "textAlign": "justify", "text": "Análise consolidada de informações cadastrais, patrimoniais e do histórico processual para identificação de riscos, inconsistências e subsídios para a estratégia jurídica." }
    ], "background": "#FFFFFF"
  },
  { "version": "5.3.0", "objects": [ { "type": "textbox", "text": "Slide 2" } ], "background": "#F0F0F0" },
  { "version": "5.3.0", "objects": [ { "type": "textbox", "text": "Slide 3" } ], "background": "#F0F0F0" },
];

// --- COMPONENTE DA FERRAMENTA DE CALIBRAÇÃO ---
const CalibrationTool = ({ activeObjectProps, onPropChange }: { activeObjectProps: any, onPropChange: (prop: string, value: string) => void }) => {
  if (Object.keys(activeObjectProps).length === 0) return null;

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mt-4">
      <h3 className="text-lg font-bold mb-2">Ferramenta de Calibração</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><label>Left (x):</label><input type="number" value={activeObjectProps.left} onChange={e => onPropChange('left', e.target.value)} className="w-full bg-gray-700 p-1 rounded" /></div>
        <div><label>Top (y):</label><input type="number" value={activeObjectProps.top} onChange={e => onPropChange('top', e.target.value)} className="w-full bg-gray-700 p-1 rounded" /></div>
        <div><label>Width:</label><input type="number" value={activeObjectProps.width} onChange={e => onPropChange('width', e.target.value)} className="w-full bg-gray-700 p-1 rounded" /></div>
        <div><label>Height:</label><input type="number" value={activeObjectProps.height} onChange={e => onPropChange('height', e.target.value)} className="w-full bg-gray-700 p-1 rounded" /></div>
        {activeObjectProps.fontSize && <div><label>Font Size:</label><input type="number" value={activeObjectProps.fontSize} onChange={e => onPropChange('fontSize', e.target.value)} className="w-full bg-gray-700 p-1 rounded" /></div>}
      </div>
    </div>
  );
};

const ReportPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const [slides, setSlides] = useState<any[]>(() => JSON.parse(JSON.stringify(slideTemplates)));
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [activeObjectProps, setActiveObjectProps] = useState<any>({});

  const updateActiveObjectProps = (obj: fabric.Object | null) => {
    if (obj) {
      const props: any = {
        left: obj.left?.toFixed(0) || 0,
        top: obj.top?.toFixed(0) || 0,
        width: obj.getScaledWidth().toFixed(0),
        height: obj.getScaledHeight().toFixed(0),
      };
      if ((obj as fabric.Textbox).fontSize) {
        props.fontSize = (obj as fabric.Textbox).fontSize?.toFixed(0) || 0;
      }
      setActiveObjectProps(props);
    } else {
      setActiveObjectProps({});
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, { width: 1152, height: 648, allowTouchScrolling: true });
    fabricCanvasRef.current = canvas;

    const onObjectSelected = (e: fabric.IEvent) => updateActiveObjectProps(e.target || null);
    const onObjectModified = (e: fabric.IEvent) => updateActiveObjectProps(e.target || null);

    canvas.on('selection:created', onObjectSelected);
    canvas.on('selection:updated', onObjectSelected);
    canvas.on('selection:cleared', () => updateActiveObjectProps(null));
    canvas.on('object:modified', onObjectModified);

    return () => { canvas.dispose(); };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.loadFromJSON(slides[activeSlide], () => {
        canvas.renderAll();
        updateActiveObjectProps(null);
      });
    }
  }, [activeSlide]);

  const handlePropChange = (prop: string, value: string) => {
    const canvas = fabricCanvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        obj.set(prop as any, numericValue);
        if (prop === 'width') obj.scaleX = numericValue / obj.width!;
        if (prop === 'height') obj.scaleY = numericValue / obj.height!;
        canvas?.requestRenderAll();
        updateActiveObjectProps(obj);
      }
    }
  };

  const changeSlide = (newSlideIndex: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || newSlideIndex < 0 || newSlideIndex >= slides.length) return;
    const currentJson = canvas.toDatalessJSON();
    const updatedSlides = [...slides];
    updatedSlides[activeSlide] = currentJson;
    setSlides(updatedSlides);
    setActiveSlide(newSlideIndex);
  };

  const exportReport = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const finalSlides = [...slides];
    finalSlides[activeSlide] = canvas.toDatalessJSON();

    const pptx = new pptxgen();
    pptx.defineLayout({ name: 'LAYOUT_CUSTOM_16X9', width: 16, height: 9 });
    pptx.layout = 'LAYOUT_CUSTOM_16X9';

    // Fator de conversão de Pixel para Polegada, baseado no tamanho do slide
    const PIXELS_PER_INCH = 1152 / 16; // 72 DPI, mas baseado na largura do canvas

    for (const slideData of finalSlides) {
      const slide = pptx.addSlide();
      if (slideData.background) {
        slide.background = { color: slideData.background.replace('#', '') };
      }
      
      const tempCanvas = new fabric.Canvas(null); // Canvas temporário para obter objetos reais
      await new Promise<void>(resolve => tempCanvas.loadFromJSON(slideData, () => resolve()));
      const objects = tempCanvas.getObjects();

      objects.forEach((obj: fabric.Object) => {
        const commonOptions = {
          x: obj.left! / PIXELS_PER_INCH,
          y: obj.top! / PIXELS_PER_INCH,
          w: obj.getScaledWidth() / PIXELS_PER_INCH,
          h: obj.getScaledHeight() / PIXELS_PER_INCH,
        };

        if (obj.type === 'textbox') {
          const textbox = obj as fabric.Textbox;
          slide.addText(textbox.text!, {
            ...commonOptions,
            fontSize: (textbox.fontSize || 12) * (72 / 96), // Conversão correta de Pixel para Ponto
            fontFace: textbox.fontFamily,
            color: (textbox.fill || '000000').toString().replace('#', ''),
            bold: textbox.fontWeight === 'bold' || textbox.fontWeight === 600,
            italic: textbox.fontStyle === 'italic',
            underline: textbox.underline,
            align: textbox.textAlign?.toLowerCase() as any || 'left',
          });
        } else if (obj.type === 'rect') {
          slide.addShape(pptx.shapes.RECTANGLE, {
            ...commonOptions,
            fill: { color: (obj.fill || '000000').toString().replace('#', '') },
            line: { width: 0 },
          });
        }
      });
      tempCanvas.dispose();
    }
    
    pptx.writeFile({ fileName: "Relatorio_Final.pptx" });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">Editor de Relatório</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsCalibrating(!isCalibrating)} className={`px-4 py-2 rounded-lg ${isCalibrating ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
            Modo de Calibração
          </button>
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
      
      {isCalibrating && <CalibrationTool activeObjectProps={activeObjectProps} onPropChange={handlePropChange} />}

      <p className="text-center text-gray-500 mt-4">
          {isCalibrating ? "Use o painel para ajustar o objeto selecionado ou arraste/redimensione com o mouse." : "Clique nos textos para editar."}
      </p>
    </div>
  );
};

export default ReportPage;