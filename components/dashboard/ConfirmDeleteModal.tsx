import React from 'react';
import { CloseIcon, DeleteIcon } from '../../constants';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  caseTitle: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, caseTitle }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Confirmar Exclusão</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          Você tem certeza que deseja deletar o caso: <strong className="text-slate-800">{caseTitle}</strong>?
          <br />
          <span className="font-semibold text-red-600">Esta ação não pode ser desfeita.</span>
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm transition-colors flex items-center"
          >
            <DeleteIcon className="h-5 w-5 mr-2" />
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
