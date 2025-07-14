import React, { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { PersonNodeData, RelationshipEdgeData } from '../../types';
import { CloseIcon, SaveIcon } from '../../constants';

type EditableElement = Node<PersonNodeData> | Edge<RelationshipEdgeData>;

interface EditPanelProps {
  element: EditableElement | null;
  onSave: (element: EditableElement) => void;
  onClose: () => void;
}

const EditPanel: React.FC<EditPanelProps> = ({ element, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<PersonNodeData & RelationshipEdgeData>>({});

  useEffect(() => {
    if (element) {
      if ('data' in element && element.data) { // It's a Node
        setFormData({
          name: element.data.name || '',
          role: element.data.role || '',
          cpf: element.data.cpf || '',
        });
      } else { // It's an Edge
        setFormData({
          label: element.label || '',
          relationshipType: (element as Edge<RelationshipEdgeData>).data?.relationshipType || '',
        });
      }
    }
  }, [element]);

  if (!element) {
    return null;
  }

  const isNode = 'position' in element;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (isNode) {
      const updatedNode = {
        ...element,
        data: {
          ...element.data,
          name: formData.name || element.data.name,
          role: formData.role,
          cpf: formData.cpf,
        },
      };
      onSave(updatedNode as Node<PersonNodeData>);
    } else {
      const updatedEdge = {
        ...element,
        label: formData.label,
        data: {
          ...element.data,
          relationshipType: formData.relationshipType,
        },
      };
      onSave(updatedEdge as Edge<RelationshipEdgeData>);
    }
    onClose();
  };

  const getPanelPosition = () => {
    if ('position' in element) { // Node
      return { top: element.position.y + (element.height || 0) + 10, left: element.position.x };
    }
    // A more advanced implementation could calculate a point along the edge path.
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  };

  return (
    <div
      style={getPanelPosition()}
      className="absolute bg-white rounded-lg shadow-xl p-4 w-80 z-10 border border-slate-300"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {isNode ? 'Editar Pessoa' : 'Editar Relacionamento'}
        </h3>
        <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {isNode ? (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600">Nome</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-600">Função/Papel</label>
              <input
                type="text"
                name="role"
                id="role"
                value={formData.role || ''}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-slate-600">CPF</label>
              <input
                type="text"
                name="cpf"
                id="cpf"
                value={formData.cpf || ''}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-slate-600">Descrição</label>
              <input
                type="text"
                name="label"
                id="label"
                value={formData.label || ''}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="relationshipType" className="block text-sm font-medium text-slate-600">Tipo de Relacionamento</label>
              <select
                name="relationshipType"
                id="relationshipType"
                value={formData.relationshipType || ''}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">Selecione...</option>
                <option value="Familiar">Familiar</option>
                <option value="Profissional">Profissional</option>
                <option value="Social">Social</option>
                <option value="Comercial">Comercial</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-150"
        >
          <SaveIcon className="h-4 w-4 mr-1.5" />
          Salvar
        </button>
      </div>
    </div>
  );
};

export default EditPanel;
