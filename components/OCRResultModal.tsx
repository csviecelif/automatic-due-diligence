
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { OCRDocument } from '../types';
import { useOCR } from '../OCRContext';

interface OCRResultModalProps {
  document: OCRDocument | null;
  onClose: () => void;
}

const OCRResultModal: React.FC<OCRResultModalProps> = ({ document, onClose }) => {
  const { deleteDocument } = useOCR();

  if (!document) return null;

  const handleDelete = () => {
    if (window.confirm('Tem certeza de que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
      deleteDocument(document.id);
      onClose(); // Fecha o modal após a exclusão
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 truncate pr-4" title={document.title}>
            {document.title}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-slate-700 text-sm leading-relaxed">
            {document.content}
          </pre>
        </div>
        <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
            <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
            >
                Excluir
            </button>
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default OCRResultModal;
