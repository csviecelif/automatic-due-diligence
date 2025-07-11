import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import WebEditorView from './pages/WebEditorView'; // Renamed from App.tsx
import { Case, ViewId, SidebarStats } from './types';
import { MOCK_CASES, NAVIGATION_ITEMS } from './constants';

const Shell: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  // Efeito para carregar os dados na inicialização
  useEffect(() => {
    window.electronAPI.loadData().then(loadedCases => {
      if (loadedCases && loadedCases.length > 0) {
        setCases(loadedCases);
        // Define o primeiro caso como ativo se nenhum estiver
        if (!activeCaseId) {
          setActiveCaseId(loadedCases[0].id);
        }
      } else {
        // Se não houver dados salvos, carrega os dados mock
        setCases(MOCK_CASES);
        if (MOCK_CASES.length > 0) {
          setActiveCaseId(MOCK_CASES[0].id);
        }
      }
      setIsDataLoaded(true);
    }).catch(error => {
      console.error("Erro ao carregar dados via Electron API:", error);
      // Fallback para mocks em caso de erro
      setCases(MOCK_CASES);
      if (MOCK_CASES.length > 0) {
        setActiveCaseId(MOCK_CASES[0].id);
      }
      setIsDataLoaded(true);
    });
  }, []); // O array vazio garante que isso rode apenas uma vez

  // Efeito para salvar os dados sempre que 'cases' mudar
  useEffect(() => {
    // Só salva depois que os dados iniciais foram carregados para não sobrescrever
    // o arquivo com um estado inicial vazio antes do carregamento.
    if (isDataLoaded) {
      window.electronAPI.saveData(cases);
    }
  }, [cases, isDataLoaded]);


  const handleNavigation = (viewId: ViewId) => {
    setCurrentView(viewId);
  };

  const handleOpenCaseInEditor = useCallback((caseId: string) => {
    setActiveCaseId(caseId);
    setCurrentView('web-editor');
  }, []); // Os setters do useState são estáveis e não precisam ser listados.

  const handleCreateNewCase = useCallback(() => {
    setCases(prevCases => {
      const newCaseId = `case-${Date.now()}`;
      const newCase: Case = {
        id: newCaseId,
        title: `Novo Caso ${prevCases.length + 1}`,
        status: 'Pendente',
        creationDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
        nodes: [],
        edges: [],
        description: 'Preencha os detalhes deste novo caso.',
      };
      
      setActiveCaseId(newCaseId);
      setCurrentView('web-editor');
      alert(`Novo caso "${newCase.title}" criado e aberto no editor.`);
      
      return [newCase, ...prevCases];
    });
  }, []); // Usando a forma funcional do setCases para evitar a dependência 'cases'.

  const handleUpdateCase = useCallback((updatedCase: Case) => {
    setCases(prevCases => 
      prevCases.map(c => c.id === updatedCase.id ? updatedCase : c)
    );
  }, []); // A forma funcional do setCases garante que temos sempre o estado mais recente.

  const handleDeleteCase = useCallback((caseId: string) => {
    // Adiciona uma confirmação antes de deletar
    const confirmation = window.confirm("Você tem certeza que deseja deletar este caso? Esta ação não pode ser desfeita.");
    if (confirmation) {
      setCases(prevCases => prevCases.filter(c => c.id !== caseId));
      // Se o caso deletado era o ativo, limpa o activeCaseId
      setActiveCaseId(prevActiveId => prevActiveId === caseId ? null : prevActiveId);
    }
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
            onDeleteCase={handleDeleteCase}
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