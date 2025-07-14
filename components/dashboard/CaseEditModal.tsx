import React, { useState, useEffect } from 'react';
import { Case } from '../../types';
import { CloseIcon, SaveIcon } from '../../constants';

interface CaseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Case) => void;
  caseData: Case | null;
  isCreating: boolean;
}

const CaseEditModal: React.FC<CaseEditModalProps> = ({ isOpen, onClose, onSave, caseData, isCreating }) => {
  const [formData, setFormData] = useState<Case | null>(null);
  const [errors, setErrors] = useState<{ title?: string; client?: string }>({});

  useEffect(() => {
    setFormData(caseData);
    // Reset errors when modal opens with new data
    setErrors({});
  }, [caseData, isOpen]);

  if (!isOpen || !formData) {
    return null;
  }

  const validate = () => {
    const newErrors: { title?: string; client?: string } = {};
    if (!formData.title.trim()) {
      newErrors.title = 'O título do caso é obrigatório.';
    }
    if (isCreating && !formData.client?.trim()) {
      newErrors.client = 'O nome do cliente é obrigatório.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      const updatedData = { ...prev, [name]: value };
      // Basic real-time validation feedback
      if (name === 'title' && value.trim()) {
        setErrors(prevErrors => ({ ...prevErrors, title: undefined }));
      }
      if (name === 'client' && value.trim()) {
        setErrors(prevErrors => ({ ...prevErrors, client: undefined }));
      }
      return updatedData;
    });
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const isSaveDisabled = isCreating && (!formData.title.trim() || !formData.client?.trim());

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl mx-4 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{isCreating ? 'Criar Novo Caso' : 'Editar Detalhes do Caso'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Título do Caso</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 ${errors.title ? 'border-red-500' : 'border-slate-300'}`} />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (Opcional)</label>
              <input type="text" name="subtitle" id="subtitle" value={formData.subtitle || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <input type="text" name="client" id="client" value={formData.client || ''} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 ${errors.client ? 'border-red-500' : 'border-slate-300'}`} />
              {errors.client && <p className="text-xs text-red-600 mt-1">{errors.client}</p>}
            </div>
            <div>
              <label htmlFor="leadInvestigator" className="block text-sm font-medium text-slate-700 mb-1">Investigador Principal (Opcional)</label>
              <input type="text" name="leadInvestigator" id="leadInvestigator" value={formData.leadInvestigator || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Descrição (Opcional)</label>
            <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"></textarea>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors"
          >
            Descartar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-md shadow-sm transition-colors flex items-center disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            <SaveIcon className="h-5 w-5 mr-2" />
            {isCreating ? 'Criar e Abrir Teia' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseEditModal;
