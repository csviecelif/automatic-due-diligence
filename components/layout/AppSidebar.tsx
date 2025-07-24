import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, DocumentMagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useOCR } from '../../OCRContext';

const AppSidebar: React.FC = () => {
  const { documents, selectDocument, deleteDocument } = useOCR();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Impede que o modal seja aberto ao clicar na lixeira
    if (window.confirm('Tem certeza de que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
      deleteDocument(id);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-slate-800 text-slate-100">
      {/* Logo/App Name */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM10.7408 15.2038L15.9185 10.0261L14.7825 8.89013L10.7408 12.9318L9.21749 11.4085L8.08152 12.5445L10.7408 15.2038Z"/></svg>
            <h1 className="text-xl font-semibold">ForenseNet</h1>
        </div>
      </div>
      <p className="px-4 py-2 text-xs text-slate-400 text-center">Due Diligence Profissional</p>

      {/* Navigation */}
      <nav className="flex-grow px-2 py-4 space-y-1">
        <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Navegação</h3>
        <Link
          to="/"
          className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out bg-sky-500 text-white"
          aria-current="page"
        >
          <DocumentTextIcon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          OCR de Documentos
        </Link>
        <Link
          to="/reports"
          className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <DocumentTextIcon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Emissão de Relatórios
        </Link>
      </nav>

      {/* Lista de Documentos OCR */}
      <div className="flex-grow px-2 py-4 space-y-1 border-t border-slate-700">
        <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Documentos Extraídos</h3>
        <div className="max-h-60 overflow-y-auto">
          {documents.length > 0 ? (
            documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between rounded-md hover:bg-slate-700 group">
                <button
                  onClick={() => selectDocument(doc)}
                  className="flex-grow flex items-center px-3 py-2.5 text-sm text-left font-medium transition-colors duration-150 ease-in-out text-slate-300 group-hover:text-white"
                >
                  <DocumentMagnifyingGlassIcon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{doc.title}</span>
                </button>
                <button
                  onClick={(e) => handleDelete(e, doc.id)}
                  className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Excluir documento"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-500">Nenhum documento processado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
