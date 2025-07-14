import React, { useState, useRef } from 'react';
import { CloseIcon, SaveIcon, DEFAULT_PHOTO_URL } from '../../constants';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, photoDataUrl: string, role?: string, cpf?: string) => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [cpf, setCpf] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>(DEFAULT_PHOTO_URL);
  const photoFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), photoDataUrl, role.trim(), cpf.trim());
      // Reset state
      setName('');
      setRole('');
      setCpf('');
      setPhotoDataUrl(DEFAULT_PHOTO_URL);
      if (photoFileRef.current) photoFileRef.current.value = "";
      onClose();
    }
  };

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoDataUrl(DEFAULT_PHOTO_URL);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Adicionar Nova Pessoa</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="personName" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input type="text" id="personName" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Nome da pessoa" required />
          </div>
          <div>
            <label htmlFor="personCpf" className="block text-sm font-medium text-slate-700 mb-1">CPF (Opcional)</label>
            <input type="text" id="personCpf" value={cpf} onChange={(e) => setCpf(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="000.000.000-00" />
          </div>
          <div>
            <label htmlFor="personRole" className="block text-sm font-medium text-slate-700 mb-1">Função/Papel (Opcional)</label>
            <input type="text" id="personRole" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Ex: CEO, Testemunha" />
          </div>
          <div>
            <label htmlFor="personPhoto" className="block text-sm font-medium text-slate-700 mb-1">Foto (Opcional)</label>
            <div className="flex items-center space-x-2">
              <img src={photoDataUrl} alt="Preview" className="h-12 w-12 rounded-full object-cover border-2 border-slate-300"/>
              <input type="file" id="personPhoto" ref={photoFileRef} onChange={handlePhotoFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" accept="image/*" />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!name.trim()} className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-800 shadow-sm transition-colors flex items-center disabled:bg-slate-400 disabled:cursor-not-allowed">
            <SaveIcon className="h-5 w-5 mr-2" />
            Salvar Pessoa
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPersonModal;
