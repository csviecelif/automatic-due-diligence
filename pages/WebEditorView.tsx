
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  MarkerType,
  useReactFlow,
  NodeChange,
  EdgeChange,
  OnNodesDelete,
  OnEdgesDelete,
  NodeProps,
  EdgeMarker,
} from 'reactflow';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { PersonData, RelationshipData, WebEditorTheme, Case, RelationshipStrength } from '../types';
import { WEB_EDITOR_THEMES, DEFAULT_PHOTO_URL, RELATIONSHIP_TYPE_DEFINITIONS, ExportIcon } from '../constants';
import CustomNode from '../components/CustomNode';
import WebEditorSidebar from '../components/WebEditorSidebar';

interface WebEditorViewProps {
  initialCaseData: Case;
  onSaveChanges: (updatedCase: Case) => void;
  onCloseEditor: () => void; // To go back to dashboard
}

let nodeIdCounter = 0; 
let edgeIdCounter = 0; 

// Font face declarations for 'Inter' font from index.html
const INTER_FONT_FACES = `
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
`;


const WebEditorView: React.FC<WebEditorViewProps> = ({ initialCaseData, onSaveChanges, onCloseEditor }) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<PersonData>([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<RelationshipData>([]);
  
  const [activeTheme, setActiveTheme] = useState<WebEditorTheme>(WEB_EDITOR_THEMES[0]);
  const [selectedNode, setSelectedNode] = useState<Node<PersonData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge<RelationshipData> | null>(null);
  const [editorTitle, setEditorTitle] = useState(initialCaseData.title);
  const [isExporting, setIsExporting] = useState(false);

  const { project, fitView } = useReactFlow(); 
  const reactFlowWrapper = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setEditorTitle(initialCaseData.title);
    setNodes(initialCaseData.nodes);
  }, [initialCaseData.id, initialCaseData.title, initialCaseData.nodes, setNodes]);


  useEffect(() => {
    const processedEdges = initialCaseData.edges.map(edge => {
      const typeDef = RELATIONSHIP_TYPE_DEFINITIONS.find(def => def.id === edge.data?.type);
      const color = typeDef ? typeDef.color : activeTheme.accentColor;
      const label = typeDef ? typeDef.name : (edge.data?.type || 'Relacionamento');
      
      const currentMarker = typeof edge.markerEnd === 'object' && edge.markerEnd !== null ? edge.markerEnd : { type: MarkerType.ArrowClosed };

      return {
        ...edge,
        label: edge.label || label,
        data: edge.data,
        style: { ...edge.style, stroke: color },
        markerEnd: { ...currentMarker, color: color, type: currentMarker.type || MarkerType.ArrowClosed } as EdgeMarker,
      };
    });
    setEdges(processedEdges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCaseData.id, initialCaseData.edges, activeTheme.accentColor]); 


  useEffect(() => {
    nodeIdCounter = initialCaseData.nodes.reduce((maxId, node) => {
        const numId = parseInt(node.id.split('-').pop() || '0');
        return Math.max(maxId, numId);
    }, 0);
    edgeIdCounter = initialCaseData.edges.reduce((maxId, edge) => {
        const numId = parseInt(edge.id.split('-').pop() || '0');
        return Math.max(maxId, numId);
    }, 0);
  }, [initialCaseData.nodes, initialCaseData.edges]);


  const nodeTypes = useMemo(() => ({ 
    custom: (props: NodeProps<PersonData>) => <CustomNode {...props} theme={activeTheme} /> 
  }), [activeTheme]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
      changes.forEach(change => {
        if (change.type === 'select') {
          if (change.selected) {
            setNodes(currentNodes => {
              const node = currentNodes.find(n => n.id === change.id);
              if (node) setSelectedNode(node);
              return currentNodes;
            });
            setSelectedEdge(null);
          } else {
            setSelectedNode(prevSelectedNode => (prevSelectedNode?.id === change.id ? null : prevSelectedNode));
          }
        }
      });
    },
    [onNodesChangeInternal, setNodes] 
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
      changes.forEach(change => {
        if (change.type === 'select') {
          if (change.selected) {
            setEdges(currentEdges => {
              const edge = currentEdges.find(e => e.id === change.id);
              if (edge) setSelectedEdge(edge);
              return currentEdges;
            });
            setSelectedNode(null);
          } else {
            setSelectedEdge(prevSelectedEdge => (prevSelectedEdge?.id === change.id ? null : prevSelectedEdge));
          }
        }
      });
    },
    [onEdgesChangeInternal, setEdges] 
  );
  
  const onConnect = useCallback(
    (params: Connection) => {
      edgeIdCounter += 1;
      const newEdgeId = `edge-${initialCaseData.id}-${edgeIdCounter}`;
      const defaultRelationshipType = RELATIONSHIP_TYPE_DEFINITIONS[0] || { id: 'default', name: 'Relacionamento', color: activeTheme.accentColor };
      const relationshipColor = defaultRelationshipType.color;

      const newEdge: Edge<RelationshipData> = {
        ...params,
        id: newEdgeId,
        label: defaultRelationshipType.name,
        data: { type: defaultRelationshipType.id, strength: 'Médio' }, // Default strength
        markerEnd: { type: MarkerType.ArrowClosed, color: relationshipColor },
        style: { stroke: relationshipColor }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, activeTheme.accentColor, initialCaseData.id]
  );

  const handleAddPerson = useCallback((name: string, photoUrl: string, role?: string, cpf?: string) => {
    nodeIdCounter += 1;
    const newNodeId = `person-${initialCaseData.id}-${nodeIdCounter}`;
    
    let position = { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 }; 
    if (reactFlowWrapper.current) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const flowPosition = project({
            x: bounds.width / 2 - 50, 
            y: bounds.height / 3,   
        });
        if (isFinite(flowPosition.x) && isFinite(flowPosition.y)) {
            position = flowPosition;
        }
    }

    const newNode: Node<PersonData> = {
      id: newNodeId, type: 'custom', position,
      data: { name, photoUrl: photoUrl || DEFAULT_PHOTO_URL, role, cpf },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, project, initialCaseData.id]);

  const handleUpdatePerson = useCallback((id: string, name: string, photoUrl: string, role?:string, cpf?: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, name, photoUrl: photoUrl || DEFAULT_PHOTO_URL, role, cpf } } : node
      )
    );
    if (selectedNode?.id === id) {
      setSelectedNode(prev => prev ? {...prev, data: {...prev.data, name, photoUrl: photoUrl || DEFAULT_PHOTO_URL, role, cpf}} : null);
    }
  }, [setNodes, selectedNode]);

  const handleDeletePersonFromSidebar = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    if (selectedNode?.id === id) setSelectedNode(null);
  }, [setNodes, setEdges, selectedNode]);

  const handleFlowNodesDelete: OnNodesDelete = useCallback((deletedNodes: Node[]) => {
    const deletedNodeIds = new Set(deletedNodes.map(n => n.id));
    setEdges(eds => eds.filter(edge => !deletedNodeIds.has(edge.source!) && !deletedNodeIds.has(edge.target!)));
    if (selectedNode && deletedNodes.some(dn => dn.id === selectedNode.id)) setSelectedNode(null);
  }, [setEdges, selectedNode]);

  const handleAddRelationship = useCallback((sourceId: string, targetId: string, typeId: string, strength?: RelationshipStrength) => {
    edgeIdCounter += 1;
    const newEdgeId = `edge-${initialCaseData.id}-${edgeIdCounter}`;
    const typeDef = RELATIONSHIP_TYPE_DEFINITIONS.find(def => def.id === typeId);
    const relationshipColor = typeDef ? typeDef.color : activeTheme.accentColor;
    const relationshipName = typeDef ? typeDef.name : typeId;

    const newEdge: Edge<RelationshipData> = {
      id: newEdgeId, source: sourceId, target: targetId, 
      label: relationshipName, 
      data: { type: typeId, strength },
      markerEnd: { type: MarkerType.ArrowClosed, color: relationshipColor },
      style: { stroke: relationshipColor }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges, activeTheme.accentColor, initialCaseData.id]);

  const handleUpdateRelationship = useCallback((id: string, typeId: string, strength?: RelationshipStrength) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          const typeDef = RELATIONSHIP_TYPE_DEFINITIONS.find(def => def.id === typeId);
          const relationshipColor = typeDef ? typeDef.color : activeTheme.accentColor;
          const relationshipName = typeDef ? typeDef.name : typeId;
          const baseMarker: Partial<EdgeMarker> = (typeof edge.markerEnd === 'object' && edge.markerEnd !== null) ? edge.markerEnd : { type: MarkerType.ArrowClosed };
          
          return { 
            ...edge, 
            label: relationshipName, 
            data: { ...(edge.data as RelationshipData), type: typeId, strength }, 
            style: { ...edge.style, stroke: relationshipColor}, 
            markerEnd: { ...baseMarker, color: relationshipColor, type: baseMarker.type || MarkerType.ArrowClosed } as EdgeMarker
          };
        }
        return edge;
      })
    );
     if (selectedEdge?.id === id) {
      setSelectedEdge(prev => {
        if (!prev) return null;
        const typeDef = RELATIONSHIP_TYPE_DEFINITIONS.find(def => def.id === typeId);
        const relationshipName = typeDef ? typeDef.name : typeId;
        return {...prev, label: relationshipName, data: { ...(prev.data as RelationshipData), type: typeId, strength}};
      });
    }
  }, [setEdges, selectedEdge, activeTheme.accentColor]);

  const handleDeleteRelationshipFromSidebar = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
    if (selectedEdge?.id === id) setSelectedEdge(null);
  }, [setEdges, selectedEdge]);
  
  const handleFlowEdgesDelete: OnEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    if (selectedEdge && deletedEdges.some(de => de.id === selectedEdge.id)) setSelectedEdge(null);
  }, [selectedEdge]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  useEffect(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView, initialCaseData.id]); 

  const handleSaveChangesClick = () => {
    const updatedCaseData: Case = {
      ...initialCaseData,
      title: editorTitle,
      nodes,
      edges,
      lastModifiedDate: new Date().toISOString(),
      // Se o caso era 'Pendente', muda para 'Ativo' na primeira vez que for salvo.
      status: initialCaseData.status === 'Pendente' ? 'Ativo' : initialCaseData.status,
    };
    onSaveChanges(updatedCaseData);
    alert(`Alterações salvas para o caso: ${editorTitle}`);
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportPNG = useCallback(() => {
    const paneToExport = reactFlowWrapper.current?.querySelector('.react-flow__viewport') as HTMLDivElement | null;
    if (!paneToExport) {
      alert("Erro ao encontrar a área da teia para exportar. Tente novamente.");
      console.error("React Flow pane (.react-flow__viewport) not found for export.");
      return;
    }
    setIsExporting(true);
    const originalSelectedNodeId = selectedNode?.id;
    const originalSelectedEdgeId = selectedEdge?.id;
    setSelectedNode(null);
    setSelectedEdge(null);

    setTimeout(() => {
        toPng(paneToExport, { 
            cacheBust: true, 
            pixelRatio: 2, 
            backgroundColor: activeTheme.bgClass.startsWith('bg-slate-800') ? '#1e293b' : '#f1f5f9',
            fontEmbedCSS: INTER_FONT_FACES,
         })
        .then((dataUrl) => {
          downloadImage(dataUrl, `${editorTitle.replace(/\s+/g, '_')}_teia.png`);
        })
        .catch((err) => {
          console.error('Erro ao exportar para PNG:', err);
          alert('Falha ao exportar para PNG. Verifique o console para detalhes.');
        })
        .finally(() => {
          setIsExporting(false);
          if (originalSelectedNodeId) {
            const nodeToReselect = nodes.find(n => n.id === originalSelectedNodeId);
            if (nodeToReselect) setSelectedNode(nodeToReselect);
          }
          if (originalSelectedEdgeId) {
            const edgeToReselect = edges.find(e => e.id === originalSelectedEdgeId);
            if (edgeToReselect) setSelectedEdge(edgeToReselect);
          }
        });
    }, 100); 
  }, [editorTitle, activeTheme.bgClass, nodes, edges, selectedNode, selectedEdge]);


  const handleExportPDF = useCallback(() => {
    const paneToExport = reactFlowWrapper.current?.querySelector('.react-flow__viewport') as HTMLDivElement | null;
    if (!paneToExport) {
      alert("Erro ao encontrar a área da teia para exportar. Tente novamente.");
      console.error("React Flow pane (.react-flow__viewport) not found for export.");
      return;
    }
    setIsExporting(true);
    const originalSelectedNodeId = selectedNode?.id;
    const originalSelectedEdgeId = selectedEdge?.id;
    setSelectedNode(null);
    setSelectedEdge(null);
    
    setTimeout(() => {
        toPng(paneToExport, { 
            cacheBust: true, 
            pixelRatio: 2,
            backgroundColor: activeTheme.bgClass.startsWith('bg-slate-800') ? '#1e293b' : '#f1f5f9',
            fontEmbedCSS: INTER_FONT_FACES,
        })
        .then((dataUrl) => {
          const pdf = new jsPDF({
            orientation: 'landscape', 
            unit: 'px', 
            compress: true,
          });
          
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
          const imgWidth = imgProps.width * ratio;
          const imgHeight = imgProps.height * ratio;
          
          const x = (pdfWidth - imgWidth) / 2;
          const y = (pdfHeight - imgHeight) / 2;

          pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
          pdf.save(`${editorTitle.replace(/\s+/g, '_')}_teia.pdf`);
        })
        .catch((err) => {
          console.error('Erro ao exportar para PDF:', err);
          alert('Falha ao exportar para PDF. Verifique o console para detalhes.');
        })
        .finally(() => {
            setIsExporting(false);
            if (originalSelectedNodeId) {
              const nodeToReselect = nodes.find(n => n.id === originalSelectedNodeId);
              if (nodeToReselect) setSelectedNode(nodeToReselect);
            }
            if (originalSelectedEdgeId) {
              const edgeToReselect = edges.find(e => e.id === originalSelectedEdgeId);
              if (edgeToReselect) setSelectedEdge(edgeToReselect);
            }
        });
    }, 100);
  }, [editorTitle, activeTheme.bgClass, nodes, edges, selectedNode, selectedEdge]);


  return (
    <div className={`flex h-full w-full ${activeTheme.bgClass} ${activeTheme.textClass} flex-col`}>
      <div className={`p-3 border-b ${activeTheme.sidebarBgClass} ${activeTheme.inputClass.includes('text-white') ? 'border-slate-700' : 'border-slate-300'} flex justify-between items-center print:hidden`}>
        <input 
          type="text" 
          value={editorTitle} 
          onChange={(e) => setEditorTitle(e.target.value)}
          className={`text-lg font-semibold bg-transparent border-0 focus:ring-0 p-1 ${activeTheme.textClass}`}
          aria-label="Título do Caso"
        />
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleExportPNG}
            disabled={isExporting}
            className={`px-3 py-1.5 text-xs rounded ${activeTheme.buttonClass} flex items-center ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Exportar como imagem PNG"
          >
            <ExportIcon className="h-4 w-4 mr-1.5" /> {isExporting ? 'Exportando...' : 'PNG'}
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`px-3 py-1.5 text-xs rounded ${activeTheme.buttonClass} flex items-center ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Exportar como documento PDF"
          >
           <ExportIcon className="h-4 w-4 mr-1.5" /> {isExporting ? 'Exportando...' : 'PDF'}
          </button>
          <button 
            onClick={handleSaveChangesClick}
            disabled={isExporting}
            className={`px-3 py-1.5 text-xs rounded ${activeTheme.buttonClass} ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Salvar Teia
          </button>
          <button 
            onClick={onCloseEditor}
            disabled={isExporting}
            className={`px-3 py-1.5 text-xs rounded ${activeTheme.buttonClass} bg-opacity-80 hover:bg-opacity-100 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
      <div className="flex flex-grow overflow-hidden">
        <WebEditorSidebar
          nodes={nodes}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onAddPerson={handleAddPerson}
          onUpdatePerson={handleUpdatePerson}
          onDeletePerson={handleDeletePersonFromSidebar}
          onAddRelationship={handleAddRelationship}
          onUpdateRelationship={handleUpdateRelationship}
          onDeleteRelationship={handleDeleteRelationshipFromSidebar}
          activeTheme={activeTheme}
          onChangeTheme={setActiveTheme}
          themes={WEB_EDITOR_THEMES}
          isExporting={isExporting}
        />
        <div className="flex-grow h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onPaneClick={onPaneClick}
            attributionPosition="bottom-left"
            deleteKeyCode={['Backspace', 'Delete']}
            onNodesDelete={handleFlowNodesDelete}
            onEdgesDelete={handleFlowEdgesDelete}
            fitView
            className="print:!overflow-visible"
          >
            <MiniMap 
              nodeColor={(node: Node<PersonData>) => {
                  if (node.type === 'custom') return activeTheme.nodeBgClass.includes('white') || activeTheme.nodeBgClass.includes('slate-100') || activeTheme.nodeBgClass.includes('gray-50') ? '#e2e8f0' : '#475569';
                  return '#ddd';
              }}
              nodeStrokeColor={activeTheme.accentColor}
              maskColor={activeTheme.bgClass.includes('dark') || activeTheme.bgClass.includes('slate-800') ? 'rgba(40,40,40,0.8)' : 'rgba(240,240,240,0.8)'}
              className="rounded-md print:hidden"
              style={{backgroundColor: activeTheme.sidebarBgClass}}
              ariaLabel="Minimapa da teia de relacionamentos"
            />
            <Controls 
              className="print:hidden [&>button]:fill-current [&>button]:text-opacity-80 hover:[&>button]:bg-opacity-20 hover:[&>button]:bg-current"
              style={{
                  backgroundColor: activeTheme.sidebarBgClass,
                  borderColor: activeTheme.accentColor,
                  borderWidth: '1px',
                  borderRadius: '0.375rem', 
              }}
              aria-label="Controles de zoom e visualização"
            />
            <Background color={activeTheme.accentColor} gap={24} size={1.5} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default WebEditorView;
