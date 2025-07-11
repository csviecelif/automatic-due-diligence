import React from 'react';
import { Case } from '../types';
import SummaryCard from '../components/dashboard/SummaryCard';
import CaseCard from '../components/dashboard/CaseCard';
import { AddIcon, CaseIcon, PeopleIcon, RelationshipIcon } from '../constants'; // Using from constants for now

interface DashboardPageProps {
  cases: Case[];
  onOpenCase: (caseId: string) => void;
  onNewCase: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ cases, onOpenCase, onNewCase }) => {
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === 'Ativo').length;
  const totalPeople = cases.reduce((sum, c) => sum + c.nodes.length, 0);
  const totalRelationships = cases.reduce((sum, c) => sum + c.edges.length, 0);
  
  const recentCases = cases.slice(0, 3); // Show 3 most recent, assuming MOCK_CASES is somewhat sorted or new cases are prepended.

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel de Casos</h1>
          <p className="text-sm text-slate-600">Gerencie suas investigações e análises forenses.</p>
        </div>
        <button
          onClick={onNewCase}
          className="mt-4 sm:mt-0 flex items-center bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150"
        >
          <AddIcon className="h-5 w-5 mr-2" />
          Novo Caso
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <SummaryCard title="Total de Casos" value={totalCases} icon={<CaseIcon className="h-6 w-6 text-sky-500" />} />
        <SummaryCard title="Casos Ativos" value={activeCases} icon={<CaseIcon className="h-6 w-6 text-green-500" />} />
        <SummaryCard title="Pessoas Cadastradas" value={totalPeople} icon={<PeopleIcon className="h-6 w-6 text-purple-500" />} />
        <SummaryCard title="Relacionamentos" value={totalRelationships} icon={<RelationshipIcon className="h-6 w-6 text-amber-500" />} />
      </div>

      {/* Recent Cases */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-700">Casos Recentes</h2>
          {cases.length > 0 && (
            <span className="text-sm text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
              {cases.length} caso{cases.length === 1 ? '' : 's'} no total
            </span>
          )}
        </div>
        {recentCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recentCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseData={caseItem} onOpenWeb={() => onOpenCase(caseItem.id)} onViewDetails={() => alert(`Detalhes do caso: ${caseItem.title}`)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <CaseIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum caso encontrado.</p>
            <p className="text-sm text-slate-400 mt-1">Crie um novo caso para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
