import React from 'react';
import { Case } from '../../types';
import { OpenWebIcon, ViewDetailsIcon, UserIcon, CalendarIcon } from '../../constants';

interface CaseCardProps {
  caseData: Case;
  onOpenWeb: (caseId: string) => void;
  onViewDetails: (caseId: string) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData, onOpenWeb, onViewDetails }) => {
  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-700 border-green-300';
      case 'Concluído': return 'bg-sky-100 text-sky-700 border-sky-300';
      case 'Pendente': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Arquivado': return 'bg-slate-100 text-slate-600 border-slate-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full border border-slate-200 hover:border-sky-400 transition-colors duration-200">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-800 leading-tight flex-1 mr-2" title={caseData.title}>
            {caseData.title}
          </h3>
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(caseData.status)}`}>
            {caseData.status}
          </span>
        </div>
        
        {caseData.subtitle && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2" title={caseData.subtitle}>
            {caseData.subtitle}
          </p>
        )}
        
        <div className="space-y-1.5 text-xs text-slate-500 mb-4">
          {caseData.client && (
            <div className="flex items-center">
              <UserIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
              Cliente: <span className="text-slate-700 ml-1 truncate">{caseData.client}</span>
            </div>
          )}
          {caseData.leadInvestigator && (
            <div className="flex items-center">
              <UserIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
              Investigador: <span className="text-slate-700 ml-1 truncate">{caseData.leadInvestigator}</span>
            </div>
          )}
          <div className="flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
            Criado em: <span className="text-slate-700 ml-1">{formatDate(caseData.creationDate)}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center space-x-2">
        <button
          onClick={() => onOpenWeb(caseData.id)}
          className="flex-1 flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium py-2 px-3 rounded-md shadow-sm transition-colors duration-150"
          aria-label={`Abrir teia do caso ${caseData.title}`}
        >
          <OpenWebIcon className="h-4 w-4 mr-1.5" />
          Abrir Teia
        </button>
        <button
          onClick={() => onViewDetails(caseData.id)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors duration-150"
          aria-label={`Ver detalhes do caso ${caseData.title}`}
        >
          <ViewDetailsIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CaseCard;
