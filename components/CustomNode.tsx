import React, { useState, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PersonData, WebEditorTheme } from '../types';
import { DEFAULT_PHOTO_URL } from '../constants';

interface CustomNodeProps extends NodeProps<PersonData> {
  theme: WebEditorTheme;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, selected, theme }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const photoSrc = data.photoUrl && !imageError ? data.photoUrl : DEFAULT_PHOTO_URL;

  return (
    <div 
      className={`
        p-2.5 rounded-lg shadow-md w-52 transition-all duration-150 ease-in-out
        ${theme.nodeBgClass} 
        ${selected ? `ring-2 ${theme.nodeBorderClass.replace('border-', 'ring-')}` : theme.nodeBorderClass} border
        ${theme.textClass}
      `}
      style={{
        borderColor: selected ? theme.accentColor : undefined, // Keep existing border logic
        boxShadow: selected ? `0 0 0 2px ${theme.accentColor}` : undefined // Keep existing shadow logic
      }}
    >
      <Handle type="target" position={Position.Top} className={`!bg-gray-500 ${theme.nodeBorderClass}`} style={{ background: theme.accentColor }} />
      <div className="flex items-center space-x-2.5">
        <img 
          src={photoSrc} 
          alt={data.name || 'Person'} 
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border"
          style={{ borderColor: theme.nodeBorderClass !== 'border-transparent' ? theme.accentColor : 'transparent' }}
          onError={handleImageError}
          aria-hidden="true"
        />
        <div className="truncate flex-grow min-w-0"> {/* Added min-w-0 for better truncation */}
          <p className="text-sm font-semibold truncate" title={data.name}>{data.name || "Sem Nome"}</p>
          {data.cpf && <p className="text-xs opacity-80 truncate" title={data.cpf}>{data.cpf}</p>}
          {data.role && <p className="text-xs opacity-60 truncate" title={data.role}>{data.role}</p>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className={`!bg-gray-500 ${theme.nodeBorderClass}`} style={{ background: theme.accentColor }}/>
    </div>
  );
};

export default memo(CustomNode);