import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import WebEditorView from './pages/WebEditorView'; // Renamed from App.tsx
import { Case, ViewId, SidebarStats } from './types';
import { MOCK_CASES, NAVIGATION_ITEMS } from './constants';

const Shell: React.FC = () => {
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(
    MOCK_CASES.length > 0 ? MOCK_CASES[0].id : null // Default to first case for editor if switching directly
  );

  const handleNavigation = (viewId: ViewId) => {
    setCurrentView(viewId);
  };

  const handleOpenCaseInEditor = useCallback((caseId: string) => {
    setActiveCaseId(caseId);
    setCurrentView('web-editor');
  }, []);

  const handleCreateNewCase = useCallback(() => {
    // Basic new case creation logic
    const newCaseId = `case-${Date.now()}`;
    const newCase: Case = {
      id: newCaseId,
      title: `Novo Caso ${cases.length + 1}`,
      status: 'Pendente',
      creationDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      nodes: [],
      edges: [],
      description: 'Preencha os detalhes deste novo caso.',
    };
    setCases(prevCases => [newCase, ...prevCases]); // Add to top
    setActiveCaseId(newCaseId);
    setCurrentView('web-editor'); // Open new case in editor
    alert(`Novo caso "${newCase.title}" criado e aberto no editor.`);
  }, [cases]);
  
  const handleUpdateCase = useCallback((updatedCase: Case) => {
    setCases(prevCases => 
      prevCases.map(c => c.id === updatedCase.id ? updatedCase : c)
    );
    // Optionally, provide feedback to the user
    // console.log(`Case "${updatedCase.title}" updated.`);
  }, []);

  const activeCase = useMemo(() => {
    if (!activeCaseId) return cases.length > 0 ? cases[0] : null; // Fallback to first case if no active ID
    return cases.find(c => c.id === activeCaseId) || (cases.length > 0 ? cases[0] : null);
  }, [cases, activeCaseId]);

  const sidebarStats: SidebarStats = useMemo(() => {
    const activeCasesList = cases.filter(c => c.status === 'Ativo');
    const totalPeopleInActive = activeCasesList.reduce((sum, currentCase) => sum + currentCase.nodes.length, 0);
    const totalRelationshipsInActive = activeCasesList.reduce((sum, currentCase) => sum + currentCase.edges.length, 0);
    // The stats should reflect all cases, not just active ones for total people/relationships based on screenshot
    const totalPeople = cases.reduce((sum, currentCase) => sum + currentCase.nodes.length, 0);
    const totalRelationships = cases.reduce((sum, currentCase) => sum + currentCase.edges.length, 0);

    return { 
        activeCases: activeCasesList.length, 
        totalPeople, 
        totalRelationships 
    };
  }, [cases]);


  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardPage
            cases={cases}
            onOpenCase={handleOpenCaseInEditor}
            onNewCase={handleCreateNewCase}
          />
        );
      case 'web-editor':
        if (!activeCase) {
          return <div className="p-8 text-center text-gray-600">Por favor, selecione um caso no painel para editar ou crie um novo.</div>;
        }
        return (
          <ReactFlowProvider>
            <WebEditorView
              key={activeCase.id} // Ensure re-mount when case changes
              initialCaseData={activeCase}
              onSaveChanges={handleUpdateCase}
              onCloseEditor={() => setCurrentView('dashboard')}
            />
          </ReactFlowProvider>
        );
      // case 'people-registry': // Removed
      //   return <div className="p-8">Visualização de Pessoas (Em Desenvolvimento)</div>;
      default:
        return <div className="p-8">Visualização não encontrada.</div>;
    }
  };

  return (
    <MainLayout
      navItems={NAVIGATION_ITEMS}
      currentViewId={currentView}
      onNavigate={handleNavigation}
      stats={sidebarStats}
      userName="Investigador"
      userRole="Sistema Forense"
    >
      {renderCurrentView()}
    </MainLayout>
  );
};

export default Shell;