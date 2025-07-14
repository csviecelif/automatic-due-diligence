import React, { useState } from 'react';
import { Node } from 'reactflow';
import { PersonNodeData, RelationshipStrength } from '../../types';
import { CloseIcon, SaveIcon, RELATIONSHIP_TYPE_DEFINITIONS, RELATIONSHIP_STRENGTHS } from '../../constants';

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sourceId: string, targetId: string, type: string, strength?: RelationshipStrength) => void;
  nodes: Node<PersonNodeData>[];
}

const AddRelationshipModal: React.FC<AddRelationshipModalProps> = ({ isOpen, onClose, onSave, nodes }) => {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [type, setType] = useState(RELATIONSHIP_TYPE_DEFINITIONS[0].id);
  const [customType, setCustomType] = useState('');
  const [strength, setStrength] = useState<RelationshipStrength>('Médio');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const finalType = type === 'custom' ? customType.trim() : type;
    if (sourceId && targetId && sourceId !== targetId && finalType) {
      onSave(sourceId, targetId, finalType, strength);
      onClose();
    } else if (sourceId === targetId && sourceId !== '') {
      alert("Não é possível conectar uma pessoa a ela mesma.");
    } else {
      alert("Selecione duas pessoas diferentes e um tipo de relacionamento.");
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
          <h2 className="text-2xl font-bold text-slate-800">Adicionar Relacionamento</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="sourceNode" className="block text-sm font-medium text-slate-700 mb-1">De</label>
            <select id="sourceNode" value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" required>
              <option value="">Selecionar origem</option>
              {nodes.map(node => <option key={node.id} value={node.id}>{node.data.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="targetNode" className="block text-sm font-medium text-slate-700 mb-1">Para</label>
            <select id="targetNode" value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" required>
              <option value="">Selecionar destino</option>
              {nodes.map(node => <option key={node.id} value={node.id}>{node.data.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="relationshipType" className="block text-sm font-medium text-slate-700 mb-1">Tipo de Relacionamento</label>
            <select id="relationshipType" value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500">
              {RELATIONSHIP_TYPE_DEFINITIONS.map(typeDef => <option key={typeDef.id} value={typeDef.id}>{typeDef.name}</option>)}
              <option value="custom">Outro...</option>
            </select>
          </div>
          {type === 'custom' && (
            <div>
              <label htmlFor="customRelationshipType" className="block text-sm font-medium text-slate-700 mb-1">Relacionamento Personalizado</label>
              <input type="text" id="customRelationshipType" value={customType} onChange={(e) => setCustomType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Ex: Primo, Sócio, Inimigo" required />
            </div>
          )}
          <div>
            <label htmlFor="relationshipStrength" className="block text-sm font-medium text-slate-700 mb-1">Força do Relacionamento</label>
            <select id="relationshipStrength" value={strength} onChange={(e) => setStrength(e.target.value as RelationshipStrength)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500">
              {RELATIONSHIP_STRENGTHS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!sourceId || !targetId || sourceId === targetId} className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-800 shadow-sm transition-colors flex items-center disabled:bg-slate-400 disabled:cursor-not-allowed">
            <SaveIcon className="h-5 w-5 mr-2" />
            Salvar Relacionamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRelationshipModal;
