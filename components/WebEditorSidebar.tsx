import React, { useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { PersonData, RelationshipData, WebEditorTheme, RelationshipTypeDefinition, RelationshipStrength } from '../types';
import { RELATIONSHIP_TYPE_DEFINITIONS, RELATIONSHIP_STRENGTHS, AddIcon, DeleteIcon, UpdateIcon, DEFAULT_PHOTO_URL, PhotoUploadIcon } from '../constants';

interface WebEditorSidebarProps {
  nodes: Node<PersonData>[];
  selectedNode: Node<PersonData> | null;
  selectedEdge: Edge<RelationshipData> | null;
  onAddPerson: (name: string, photoDataUrl: string, role?: string, cpf?: string) => void;
  onUpdatePerson: (id: string, name: string, photoDataUrl: string, role?: string, cpf?: string) => void;
  onDeletePerson: (id: string) => void;
  onAddRelationship: (sourceId: string, targetId: string, typeId: string, strength?: RelationshipStrength) => void;
  onUpdateRelationship: (id: string, typeId: string, strength?: RelationshipStrength) => void;
  onDeleteRelationship: (id: string) => void;
  activeTheme: WebEditorTheme;
  onChangeTheme: (theme: WebEditorTheme) => void;
  themes: WebEditorTheme[];
  isExporting: boolean;
}

const WebEditorSidebar: React.FC<WebEditorSidebarProps> = ({
  nodes, selectedNode, selectedEdge,
  onAddPerson, onUpdatePerson, onDeletePerson,
  onAddRelationship, onUpdateRelationship, onDeleteRelationship,
  activeTheme, onChangeTheme, themes, isExporting,
}) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhotoDataUrl, setNewPersonPhotoDataUrl] = useState<string>(DEFAULT_PHOTO_URL); 
  const [newPersonRole, setNewPersonRole] = useState('');
  const [newPersonCpf, setNewPersonCpf] = useState('');
  const newPersonPhotoFileRef = useRef<HTMLInputElement>(null);

  const [sourceNodeId, setSourceNodeId] = useState('');
  const [targetNodeId, setTargetNodeId] = useState('');
  const [relationshipTypeId, setRelationshipTypeId] = useState(RELATIONSHIP_TYPE_DEFINITIONS[0].id);
  const [customRelationshipType, setCustomRelationshipType] = useState('');
  const [relationshipStrength, setRelationshipStrength] = useState<RelationshipStrength | undefined>(RELATIONSHIP_STRENGTHS[1]);

  const [editPersonName, setEditPersonName] = useState('');
  const [editPersonPhotoDataUrl, setEditPersonPhotoDataUrl] = useState<string>(DEFAULT_PHOTO_URL);
  const [editPersonRole, setEditPersonRole] = useState('');
  const [editPersonCpf, setEditPersonCpf] = useState('');
  const editPersonPhotoFileRef = useRef<HTMLInputElement>(null);

  const [editRelationshipTypeId, setEditRelationshipTypeId] = useState(RELATIONSHIP_TYPE_DEFINITIONS[0].id);
  const [editCustomRelationshipType, setEditCustomRelationshipType] = useState('');
  const [editRelationshipStrength, setEditRelationshipStrength] = useState<RelationshipStrength | undefined>(RELATIONSHIP_STRENGTHS[1]);

  useEffect(() => {
    if (selectedNode) {
      setEditPersonName(selectedNode.data.name);
      setEditPersonPhotoDataUrl(selectedNode.data.photoUrl || DEFAULT_PHOTO_URL);
      setEditPersonRole(selectedNode.data.role || '');
      setEditPersonCpf(selectedNode.data.cpf || '');
    } else {
      setEditPersonName(''); setEditPersonPhotoDataUrl(DEFAULT_PHOTO_URL); setEditPersonRole(''); setEditPersonCpf('');
      if(editPersonPhotoFileRef.current) editPersonPhotoFileRef.current.value = "";
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedEdge) {
      const currentType = selectedEdge.data?.type || RELATIONSHIP_TYPE_DEFINITIONS[0].id;
      const isPredefined = RELATIONSHIP_TYPE_DEFINITIONS.some(def => def.id === currentType);
      
      if (isPredefined) {
        setEditRelationshipTypeId(currentType);
        setEditCustomRelationshipType('');
      } else {
        setEditRelationshipTypeId('custom');
        setEditCustomRelationshipType(currentType);
      }
      
      setEditRelationshipStrength(selectedEdge.data?.strength || RELATIONSHIP_STRENGTHS[1]);
    } else {
      setEditRelationshipTypeId(RELATIONSHIP_TYPE_DEFINITIONS[0].id);
      setEditCustomRelationshipType('');
      setEditRelationshipStrength(RELATIONSHIP_STRENGTHS[1]);
    }
  }, [selectedEdge]);

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>, setPhotoDataUrl: React.Dispatch<React.SetStateAction<string>>) => {
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

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim(), newPersonPhotoDataUrl, newPersonRole.trim(), newPersonCpf.trim());
      setNewPersonName(''); 
      setNewPersonPhotoDataUrl(DEFAULT_PHOTO_URL); 
      setNewPersonRole(''); 
      setNewPersonCpf('');
      if (newPersonPhotoFileRef.current) newPersonPhotoFileRef.current.value = "";
    }
  };

  const handleUpdatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNode && editPersonName.trim()) {
      onUpdatePerson(selectedNode.id, editPersonName.trim(), editPersonPhotoDataUrl, editPersonRole.trim(), editPersonCpf.trim());
    }
  };

  const handleDeletePerson = () => {
    if (selectedNode) onDeletePerson(selectedNode.id);
  };
  
  const handleAddRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceNodeId && targetNodeId && sourceNodeId !== targetNodeId) {
      const finalRelationshipType = relationshipTypeId === 'custom' ? customRelationshipType.trim() : relationshipTypeId;
      if (!finalRelationshipType) {
        alert("Por favor, defina um tipo de relacionamento personalizado.");
        return;
      }
      onAddRelationship(sourceNodeId, targetNodeId, finalRelationshipType, relationshipStrength);
      setRelationshipTypeId(RELATIONSHIP_TYPE_DEFINITIONS[0].id);
      setCustomRelationshipType('');
    } else if (sourceNodeId === targetNodeId && sourceNodeId !== '') {
        alert("Não é possível conectar uma pessoa a ela mesma.");
    } else {
        alert("Selecione duas pessoas diferentes para conectar.");
    }
  };

  const handleUpdateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEdge) {
      const finalRelationshipType = editRelationshipTypeId === 'custom' ? editCustomRelationshipType.trim() : editRelationshipTypeId;
      if (!finalRelationshipType) {
        alert("Por favor, defina um tipo de relacionamento personalizado.");
        return;
      }
      onUpdateRelationship(selectedEdge.id, finalRelationshipType, editRelationshipStrength);
    }
  };

  const handleDeleteRelationship = () => {
    if (selectedEdge) onDeleteRelationship(selectedEdge.id);
  };

  const commonInputClass = `w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 ${activeTheme.inputClass} text-sm read-only:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed`;
  const commonButtonClass = `w-full flex items-center justify-center px-4 py-2 rounded-md font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeTheme.buttonClass} ${activeTheme.inputClass.includes('text-white') ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-slate-700'} text-sm disabled:opacity-50 disabled:cursor-not-allowed`;
  const commonLabelClass = `block text-xs font-medium mb-1 ${activeTheme.inputLabelClass}`;
  const commonSelectClass = `${commonInputClass} appearance-none`;

  const renderSection = (title: string, children: React.ReactNode) => (
    <div className={`mb-4 p-4 rounded-lg shadow ${activeTheme.sidebarSectionBgClass}`}>
      <h3 className={`text-sm font-semibold mb-3 ${activeTheme.textClass}`}>{title}</h3>
      {children}
    </div>
  );

  const getRelationshipName = (type: string | undefined) => {
    if (!type) return '';
    return RELATIONSHIP_TYPE_DEFINITIONS.find(rtd => rtd.id === type)?.name || type;
  };

  return (
    <div className={`w-80 h-full p-3 overflow-y-auto ${activeTheme.sidebarBgClass} ${activeTheme.textClass} border-r ${activeTheme.inputClass.includes('text-white') ? 'border-slate-700' : 'border-slate-300'} print:hidden`}>
      <h2 className="text-lg font-bold mb-4">Editor da Teia</h2>

      {renderSection("Tema do Editor", (
        <fieldset disabled={isExporting}>
          <label htmlFor="themeSelector" className={commonLabelClass}>Selecionar Tema</label>
          <select id="themeSelector" value={activeTheme.name}
            onChange={(e) => {
              const theme = themes.find(t => t.name === e.target.value);
              if (theme) onChangeTheme(theme);
            }} className={commonSelectClass}
          >
            {themes.map(theme => <option key={theme.name} value={theme.name}>{theme.name}</option>)}
          </select>
        </fieldset>
      ))}
      
      {renderSection("Adicionar Pessoa", (
        <form onSubmit={handleAddPerson}>
         <fieldset disabled={isExporting} className="space-y-2.5">
          <div>
            <label htmlFor="newPersonName" className={commonLabelClass}>Nome Completo</label>
            <input type="text" id="newPersonName" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} className={commonInputClass} placeholder="Nome da pessoa" required />
          </div>
          <div>
            <label htmlFor="newPersonCpf" className={commonLabelClass}>CPF (Opcional)</label>
            <input type="text" id="newPersonCpf" value={newPersonCpf} onChange={(e) => setNewPersonCpf(e.target.value)} className={commonInputClass} placeholder="000.000.000-00" />
          </div>
          <div>
            <label htmlFor="newPersonRole" className={commonLabelClass}>Função/Papel (Opcional)</label>
            <input type="text" id="newPersonRole" value={newPersonRole} onChange={(e) => setNewPersonRole(e.target.value)} className={commonInputClass} placeholder="Ex: CEO, Testemunha" />
          </div>
          <div>
            <label htmlFor="newPersonPhotoFile" className={commonLabelClass}>Foto (Opcional)</label>
            <div className="flex items-center space-x-2">
                <img src={newPersonPhotoDataUrl} alt="Preview" className="h-10 w-10 rounded-full object-cover border border-slate-300"/>
                <input 
                    type="file" 
                    id="newPersonPhotoFile" 
                    ref={newPersonPhotoFileRef}
                    onChange={(e) => handlePhotoFileChange(e, setNewPersonPhotoDataUrl)} 
                    className={`${commonInputClass} !p-1.5`} 
                    accept="image/*" 
                />
            </div>
          </div>
          <button type="submit" className={commonButtonClass} disabled={isExporting}>
            <AddIcon className="mr-1.5 h-4 w-4" /> Adicionar Pessoa
          </button>
          </fieldset>
        </form>
      ))}

      {nodes.length >= 2 && renderSection("Adicionar Relacionamento", (
        <form onSubmit={handleAddRelationship}>
          <fieldset disabled={isExporting} className="space-y-2.5">
          <div>
            <label htmlFor="sourceNode" className={commonLabelClass}>De</label>
            <select id="sourceNode" value={sourceNodeId} onChange={(e) => setSourceNodeId(e.target.value)} className={commonSelectClass} required>
              <option value="">Selecionar origem</option>
              {nodes.map(node => <option key={node.id} value={node.id}>{node.data.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="targetNode" className={commonLabelClass}>Para</label>
            <select id="targetNode" value={targetNodeId} onChange={(e) => setTargetNodeId(e.target.value)} className={commonSelectClass} required>
              <option value="">Selecionar destino</option>
              {nodes.map(node => <option key={node.id} value={node.id}>{node.data.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="relationshipType" className={commonLabelClass}>Tipo de Relacionamento</label>
            <select id="relationshipType" value={relationshipTypeId} onChange={(e) => setRelationshipTypeId(e.target.value)} className={commonSelectClass}>
              {RELATIONSHIP_TYPE_DEFINITIONS.map(typeDef => <option key={typeDef.id} value={typeDef.id}>{typeDef.name}</option>)}
              <option value="custom">Outro...</option>
            </select>
          </div>
          {relationshipTypeId === 'custom' && (
            <div>
              <label htmlFor="customRelationshipType" className={commonLabelClass}>Relacionamento Personalizado</label>
              <input type="text" id="customRelationshipType" value={customRelationshipType} onChange={(e) => setCustomRelationshipType(e.target.value)} className={commonInputClass} placeholder="Ex: Primo, Sócio, Inimigo" required />
            </div>
          )}
          <div>
            <label htmlFor="relationshipStrength" className={commonLabelClass}>Força do Relacionamento</label>
            <select id="relationshipStrength" value={relationshipStrength} onChange={(e) => setRelationshipStrength(e.target.value as RelationshipStrength)} className={commonSelectClass}>
              {RELATIONSHIP_STRENGTHS.map(strength => <option key={strength} value={strength}>{strength}</option>)}
            </select>
          </div>
          <button type="submit" className={commonButtonClass} disabled={isExporting}>
            <AddIcon className="mr-1.5 h-4 w-4" /> Adicionar Relacionamento
          </button>
          </fieldset>
        </form>
      ))}

      {selectedNode && renderSection("Editar Pessoa Selecionada", (
        <form onSubmit={handleUpdatePerson}>
          <fieldset disabled={isExporting} className="space-y-2.5">
          <p className="text-xs">Editando: <span className="font-semibold">{selectedNode.data.name}</span></p>
          <div>
            <label htmlFor="editPersonName" className={commonLabelClass}>Nome</label>
            <input type="text" id="editPersonName" value={editPersonName} onChange={(e) => setEditPersonName(e.target.value)} className={commonInputClass} required />
          </div>
          <div>
            <label htmlFor="editPersonCpf" className={commonLabelClass}>CPF</label>
            <input type="text" id="editPersonCpf" value={editPersonCpf} onChange={(e) => setEditPersonCpf(e.target.value)} className={commonInputClass} />
          </div>
           <div>
            <label htmlFor="editPersonRole" className={commonLabelClass}>Função/Papel</label>
            <input type="text" id="editPersonRole" value={editPersonRole} onChange={(e) => setEditPersonRole(e.target.value)} className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="editPersonPhotoFile" className={commonLabelClass}>Foto</label>
             <div className="flex items-center space-x-2">
                <img src={editPersonPhotoDataUrl} alt="Preview" className="h-10 w-10 rounded-full object-cover border border-slate-300"/>
                <input 
                    type="file" 
                    id="editPersonPhotoFile"
                    ref={editPersonPhotoFileRef}
                    onChange={(e) => handlePhotoFileChange(e, setEditPersonPhotoDataUrl)} 
                    className={`${commonInputClass} !p-1.5`} 
                    accept="image/*"
                />
            </div>
          </div>
          <div className="flex space-x-2 pt-1">
            <button type="submit" className={`${commonButtonClass} flex-1`} disabled={isExporting}>
              <UpdateIcon className="mr-1.5 h-4 w-4" /> Atualizar
            </button>
            <button type="button" onClick={handleDeletePerson} className={`${commonButtonClass} flex-1 !bg-red-600 hover:!bg-red-700`} disabled={isExporting}>
              <DeleteIcon className="mr-1.5 h-4 w-4" /> Deletar
            </button>
          </div>
          </fieldset>
        </form>
      ))}

      {selectedEdge && renderSection("Editar Relacionamento Selecionado", (
         <form onSubmit={handleUpdateRelationship}>
          <fieldset disabled={isExporting} className="space-y-2.5">
          <p className="text-xs">Editando: <span className="font-semibold">{getRelationshipName(selectedEdge.data?.type)}</span></p>
          <div>
            <label htmlFor="editRelationshipType" className={commonLabelClass}>Tipo</label>
            <select id="editRelationshipType" value={editRelationshipTypeId} onChange={(e) => setEditRelationshipTypeId(e.target.value)} className={commonSelectClass}>
              {RELATIONSHIP_TYPE_DEFINITIONS.map(typeDef => <option key={typeDef.id} value={typeDef.id}>{typeDef.name}</option>)}
              <option value="custom">Outro...</option>
            </select>
          </div>
          {editRelationshipTypeId === 'custom' && (
            <div>
              <label htmlFor="editCustomRelationshipType" className={commonLabelClass}>Relacionamento Personalizado</label>
              <input type="text" id="editCustomRelationshipType" value={editCustomRelationshipType} onChange={(e) => setEditCustomRelationshipType(e.target.value)} className={commonInputClass} placeholder="Ex: Primo, Sócio, Inimigo" required />
            </div>
          )}
          <div>
            <label htmlFor="editRelationshipStrength" className={commonLabelClass}>Força</label>
            <select id="editRelationshipStrength" value={editRelationshipStrength} onChange={(e) => setEditRelationshipStrength(e.target.value as RelationshipStrength)} className={commonSelectClass}>
              {RELATIONSHIP_STRENGTHS.map(strength => <option key={strength} value={strength}>{strength}</option>)}
            </select>
          </div>
          <div className="flex space-x-2 pt-1">
            <button type="submit" className={`${commonButtonClass} flex-1`} disabled={isExporting}>
              <UpdateIcon className="mr-1.5 h-4 w-4" /> Atualizar
            </button>
            <button type="button" onClick={handleDeleteRelationship} className={`${commonButtonClass} flex-1 !bg-red-600 hover:!bg-red-700`} disabled={isExporting}>
             <DeleteIcon className="mr-1.5 h-4 w-4" /> Deletar
            </button>
          </div>
          </fieldset>
        </form>
      ))}

      {!selectedNode && !selectedEdge && (
        <div className={`mt-4 p-3 rounded-lg ${activeTheme.sidebarSectionBgClass} text-center`}>
          <p className={`${activeTheme.inputLabelClass} text-xs`}>Selecione uma pessoa ou relacionamento na teia para editar ou ver detalhes.</p>
        </div>
      )}
    </div>
  );
};

export default WebEditorSidebar;