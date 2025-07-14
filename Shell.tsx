import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import WebEditorView from './pages/WebEditorView';
import ConfirmDeleteModal from './components/dashboard/ConfirmDeleteModal';
import AddPersonModal from './components/webeditor/AddPersonModal';
import AddRelationshipModal from './components/webeditor/AddRelationshipModal';
import { Case, ViewId, SidebarStats, WebEditorTheme, PersonNodeData, RelationshipEdgeData } from './types';
import { MOCK_CASES, NAVIGATION_ITEMS, WEB_EDITOR_THEMES, DEFAULT_PHOTO_URL } from './constants';
import { Node, Edge } from 'reactflow';

const Shell: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [activeTheme, setActiveTheme] = useState<WebEditorTheme>(WEB_EDITOR_THEMES[0]);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isAddRelationshipModalOpen, setIsAddRelationshipModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // ... (useEffect hooks remain the same) ...
  useEffect(() => {
    window.electronAPI.loadData().then(loadedCases => {
      if (loadedCases && loadedCases.length > 0) {
        setCases(loadedCases);
        if (!activeCaseId) {
          setActiveCaseId(loadedCases[0].id);
        }
      } else {
        setCases(MOCK_CASES);
        if (MOCK_CASES.length > 0) {
          setActiveCaseId(MOCK_CASES[0].id);
        }
      }
      setIsDataLoaded(true);
    }).catch(error => {
      console.error("Erro ao carregar dados via Electron API:", error);
      setCases(MOCK_CASES);
      if (MOCK_CASES.length > 0) {
        setActiveCaseId(MOCK_CASES[0].id);
      }
      setIsDataLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      window.electronAPI.saveData(cases);
    }
  }, [cases, isDataLoaded]);

  const handleNavigation = (viewId: ViewId) => {
    setCurrentView(viewId);
    setIsFullScreen(false); // Exit fullscreen when navigating
  };

  const handleOpenCaseInEditor = useCallback((caseId: string) => {
    setActiveCaseId(caseId);
    setCurrentView('web-editor');
  }, []);

  const handleCreateNewCase = useCallback((newCaseData: Omit<Case, 'id' | 'creationDate' | 'lastModified' | 'nodes' | 'edges' | 'status'>) => {
    setCases(prevCases => {
      const newCaseId = `case-${Date.now()}`;
      const now = new Date().toISOString();
      
      const newCase: Case = {
        id: newCaseId,
        title: newCaseData.title || `Novo Caso ${prevCases.length + 1}`,
        subtitle: newCaseData.subtitle,
        description: newCaseData.description,
        client: newCaseData.client,
        leadInvestigator: newCaseData.leadInvestigator,
        status: 'Ativo',
        creationDate: now,
        lastModified: now,
        nodes: [],
        edges: [],
      };
      
      setActiveCaseId(newCaseId);
      setCurrentView('web-editor');
      
      return [newCase, ...prevCases];
    });
  }, []);

  const handleUpdateCase = useCallback((updatedCase: Case) => {
    setCases(prevCases => 
      prevCases.map(c => c.id === updatedCase.id ? updatedCase : c)
    );
  }, []);

  const handleDeleteRequest = useCallback((caseId: string) => {
    const foundCase = cases.find(c => c.id === caseId);
    if (foundCase) {
      setCaseToDelete(foundCase);
    }
  }, [cases]);

  const handleConfirmDelete = useCallback(() => {
    if (!caseToDelete) return;
    
    setCases(prevCases => prevCases.filter(c => c.id !== caseToDelete.id));
    
    if (activeCaseId === caseToDelete.id) {
      setActiveCaseId(null);
      setCurrentView('dashboard');
    }
    
    setCaseToDelete(null);
  }, [caseToDelete, activeCaseId]);

  const handleCancelDelete = () => {
    setCaseToDelete(null);
  };

  const activeCase = useMemo(() => {
    if (!activeCaseId) return cases.length > 0 ? cases[0] : null;
    return cases.find(c => c.id === activeCaseId) || (cases.length > 0 ? cases[0] : null);
  }, [cases, activeCaseId]);

  const handleAddPerson = (name: string, photoUrl: string, role?: string, cpf?: string) => {
    if (!activeCase) return;
    const newNode: Node<PersonNodeData> = {
      id: `person-${activeCase.id}-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { name, photoUrl: photoUrl || DEFAULT_PHOTO_URL, role, cpf },
    };
    const updatedCase = { ...activeCase, nodes: [...activeCase.nodes, newNode] };
    handleUpdateCase(updatedCase);
  };

  const handleAddRelationship = (sourceId: string, targetId: string, type: string, strength?: 'Forte' | 'Médio' | 'Fraco') => {
    if (!activeCase) return;
    const newEdge: Edge<RelationshipEdgeData> = {
      id: `edge-${activeCase.id}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      label: type,
      data: { type, strength },
    };
    const updatedCase = { ...activeCase, edges: [...activeCase.edges, newEdge] };
    handleUpdateCase(updatedCase);
  };

  const sidebarStats: SidebarStats = useMemo(() => {
    const activeCasesList = cases.filter(c => c.status === 'Ativo');
    const totalPeople = cases.reduce((sum, currentCase) => sum + currentCase.nodes.length, 0);
    const totalRelationships = cases.reduce((sum, currentCase) => sum + currentCase.edges.length, 0);

    return { 
        activeCases: activeCasesList.length, 
        totalPeople, 
        totalRelationships 
    };
  }, [cases]);

  const renderWebEditor = () => {
    if (!activeCase) {
      return <div className="p-8 text-center text-gray-600">Por favor, selecione um caso no painel para editar ou crie um novo.</div>;
    }
    return (
      <ReactFlowProvider>
        <WebEditorView
          key={activeCase.id}
          initialCaseData={activeCase}
          onSaveChanges={handleUpdateCase}
          onCloseEditor={() => {
            setCurrentView('dashboard');
            setIsFullScreen(false);
          }}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
          isFullScreen={isFullScreen}
          toggleFullScreen={() => setIsFullScreen(prev => !prev)}
        />
      </ReactFlowProvider>
    );
  };

  if (isFullScreen && currentView === 'web-editor') {
    return renderWebEditor();
  }

  return (
    <>
      <ConfirmDeleteModal
        isOpen={!!caseToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        caseTitle={caseToDelete?.title || ''}
      />
      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => setIsAddPersonModalOpen(false)}
        onSave={handleAddPerson}
      />
      <AddRelationshipModal
        isOpen={isAddRelationshipModalOpen}
        onClose={() => setIsAddRelationshipModalOpen(false)}
        onSave={handleAddRelationship}
        nodes={activeCase?.nodes || []}
      />
      <MainLayout
        navItems={NAVIGATION_ITEMS}
        currentViewId={currentView}
        onNavigate={handleNavigation}
        stats={sidebarStats}
        userName="Investigador"
        userRole="Sistema Forense"
        activeTheme={activeTheme}
        setActiveTheme={setActiveTheme}
        themes={WEB_EDITOR_THEMES}
        onAddPerson={() => setIsAddPersonModalOpen(true)}
        onAddRelationship={() => setIsAddRelationshipModalOpen(true)}
      >
        {currentView === 'dashboard' ? (
          <DashboardPage
            cases={cases}
            onOpenCase={handleOpenCaseInEditor}
            onNewCase={handleCreateNewCase}
            onDeleteCase={handleDeleteRequest}
          />
        ) : (
          renderWebEditor()
        )}
      </MainLayout>
    </>
  );
};

export default Shell;