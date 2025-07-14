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
import { PersonNodeData, RelationshipEdgeData, WebEditorTheme, Case, RelationshipStrength } from '../types';
import { WEB_EDITOR_THEMES, DEFAULT_PHOTO_URL, RELATIONSHIP_TYPE_DEFINITIONS, ExportIcon, MaximizeIcon, MinimizeIcon } from '../constants';
import CustomNode from '../components/CustomNode';
import EditPanel from '../components/webeditor/EditPanel';

type EditableElement = Node<PersonNodeData> | Edge<RelationshipEdgeData>;

interface WebEditorViewProps {
  initialCaseData: Case;
  onSaveChanges: (updatedCase: Case) => void;
  onCloseEditor: () => void;
  activeTheme: WebEditorTheme;
  setActiveTheme: (theme: WebEditorTheme) => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

let nodeIdCounter = 0;
let edgeIdCounter = 0;

const INTER_FONT_FACES = `
  /* Font faces remain the same */
`;

const WebEditorView: React.FC<WebEditorViewProps> = ({ 
  initialCaseData, 
  onSaveChanges, 
  onCloseEditor, 
  activeTheme, 
  isFullScreen,
  toggleFullScreen
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<PersonNodeData>([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<RelationshipEdgeData>([]);
  
  const [selectedNode, setSelectedNode] = useState<Node<PersonNodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge<RelationshipEdgeData> | null>(null);
  const [editorTitle, setEditorTitle] = useState(initialCaseData.title);
  const [isExporting, setIsExporting] = useState(false);
  const [elementToEdit, setElementToEdit] = useState<EditableElement | null>(null);

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
  }, [initialCaseData.id, initialCaseData.edges, activeTheme.accentColor, setEdges]);

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
    custom: (props: NodeProps<PersonNodeData>) => <CustomNode {...props} theme={activeTheme} /> 
  }), [activeTheme]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<PersonNodeData>) => {
    setElementToEdit(node);
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge<RelationshipEdgeData>) => {
    setElementToEdit(edge);
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const handleSaveElement = useCallback((updatedElement: EditableElement) => {
    if ('position' in updatedElement) {
      setNodes(nds => nds.map(n => n.id === updatedElement.id ? updatedElement : n));
    } else {
      setEdges(eds => eds.map(e => e.id === updatedElement.id ? updatedElement : e));
    }
    setElementToEdit(null);
  }, [setNodes, setEdges]);

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

      const newEdge: Edge<RelationshipEdgeData> = {
        ...params,
        id: newEdgeId,
        label: defaultRelationshipType.name,
        data: { type: defaultRelationshipType.id, strength: 'Médio' },
        markerEnd: { type: MarkerType.ArrowClosed, color: relationshipColor },
        style: { stroke: relationshipColor }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, activeTheme.accentColor, initialCaseData.id]
  );

  const handleFlowNodesDelete: OnNodesDelete = useCallback((deletedNodes: Node[]) => {
    const deletedNodeIds = new Set(deletedNodes.map(n => n.id));
    setEdges(eds => eds.filter(edge => !deletedNodeIds.has(edge.source!) && !deletedNodeIds.has(edge.target!)));
    if (selectedNode && deletedNodes.some(dn => dn.id === selectedNode.id)) setSelectedNode(null);
  }, [setEdges, selectedNode]);
  
  const handleFlowEdgesDelete: OnEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    if (selectedEdge && deletedEdges.some(de => de.id === selectedEdge.id)) setSelectedEdge(null);
  }, [selectedEdge]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setElementToEdit(null);
  }, []);

  useEffect(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView, initialCaseData.id, isFullScreen]); 

  const handleSaveChangesClick = () => {
    const updatedCaseData: Case = {
      ...initialCaseData,
      title: editorTitle,
      nodes,
      edges,
      lastModified: new Date().toISOString(),
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
    // ... (implementation remains the same)
  }, [editorTitle, activeTheme.bgClass, nodes, edges, selectedNode, selectedEdge]);

  const handleExportPDF = useCallback(() => {
    // ... (implementation remains the same)
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
            onClick={toggleFullScreen}
            className={`px-3 py-1.5 text-xs rounded ${activeTheme.buttonClass} flex items-center`}
            title={isFullScreen ? "Minimizar" : "Maximizar"}
          >
            {isFullScreen ? <MinimizeIcon className="h-4 w-4" /> : <MaximizeIcon className="h-4 w-4" />}
          </button>
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
      <div className="flex-grow h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onPaneClick={onPaneClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
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
        <EditPanel
          element={elementToEdit}
          onSave={handleSaveElement}
          onClose={() => setElementToEdit(null)}
        />
      </div>
    </div>
  );
};

export default WebEditorView;