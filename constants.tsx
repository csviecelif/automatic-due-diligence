import React from 'react';
import { WebEditorTheme, Case, PersonData, NavItem, RelationshipTypeDefinition, RelationshipStrength } from './types';
import { Node, Edge, MarkerType } from 'reactflow';
import {
  HomeIcon as HeroHomeIcon,
  ShareIcon as HeroShareIcon,
  UsersIcon as HeroUsersIcon,
  BriefcaseIcon as HeroBriefcaseIcon,
  PlusIcon as HeroPlusIcon,
  EyeIcon as HeroEyeIcon,
  FolderIcon as HeroFolderIcon,
  UserCircleIcon as HeroUserCircleIcon,
  AdjustmentsHorizontalIcon as HeroAdjustmentsHorizontalIcon,
  CalendarDaysIcon as HeroCalendarDaysIcon,
  UserGroupIcon as HeroUserGroupIcon,
  LinkIcon as HeroLinkIcon,
  XMarkIcon as HeroXMarkIcon,
  InformationCircleIcon as HeroInformationCircleIcon,
  ArrowDownTrayIcon as HeroArrowDownTrayIcon, // For export
  PhotoIcon as HeroPhotoIcon, // For image upload
} from './icons'; 

export const DEFAULT_PHOTO_URL = 'https://ui-avatars.com/api/?name=N+A&background=random&size=80&font-size=0.33&bold=true&color=fff';

export const RELATIONSHIP_TYPE_DEFINITIONS: RelationshipTypeDefinition[] = [
  { id: 'familiar', name: 'Familiar', color: '#EF4444' }, // red-500
  { id: 'conjugal', name: 'Conjugal', color: '#EC4899' }, // pink-500
  { id: 'societario', name: 'Societário', color: '#3B82F6' }, // blue-500
  { id: 'financeiro', name: 'Financeiro', color: '#22C55E' }, // green-500
  { id: 'profissional', name: 'Profissional', color: '#8B5CF6' }, // violet-500
  { id: 'politico', name: 'Político', color: '#F97316' }, // orange-500
  { id: 'juridico', name: 'Jurídico', color: '#4B5563' }, // gray-600
  { id: 'criminal', name: 'Criminal', color: '#DC2626' }, // red-600 (darker red)
];

export const RELATIONSHIP_STRENGTHS: RelationshipStrength[] = ['Forte', 'Médio', 'Fraco'];

export const WEB_EDITOR_THEMES: WebEditorTheme[] = [
  { 
    name: 'Professional Light', 
    bgClass: 'bg-slate-100', // Main editor canvas background
    nodeBgClass: 'bg-white', 
    nodeBorderClass: 'border-blue-500', 
    textClass: 'text-slate-800', 
    sidebarBgClass: 'bg-white', // Sidebar background
    sidebarSectionBgClass: 'bg-slate-50', // Background for sections within sidebar
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white', 
    inputClass: 'bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-900',
    inputLabelClass: 'text-slate-700',
    accentColor: '#3b82f6', // blue-500
  },
  { 
    name: 'Forensic Dark', 
    bgClass: 'bg-slate-800', 
    nodeBgClass: 'bg-slate-700', 
    nodeBorderClass: 'border-teal-400', 
    textClass: 'text-slate-100', 
    sidebarBgClass: 'bg-slate-900',
    sidebarSectionBgClass: 'bg-slate-800', // Sections in dark theme
    buttonClass: 'bg-teal-500 hover:bg-teal-600 text-white', 
    inputClass: 'bg-slate-700 border-slate-600 text-white focus:border-teal-400 focus:ring-teal-400',
    inputLabelClass: 'text-slate-300',
    accentColor: '#2dd4bf', // teal-400
  },
];


const createSampleNodes = (caseIdPrefix: string): Node<PersonData>[] => [
  {
    id: `${caseIdPrefix}-1`, type: 'custom', position: { x: 250, y: 50 },
    data: { name: 'Carlos Silva', photoUrl: `https://picsum.photos/seed/${caseIdPrefix}CS/80/80`, role: 'Principal Alvo', cpf: '111.222.333-44' },
  },
  {
    id: `${caseIdPrefix}-2`, type: 'custom', position: { x: 100, y: 200 },
    data: { name: 'Ana Pereira', photoUrl: `https://picsum.photos/seed/${caseIdPrefix}AP/80/80`, role: 'Sócia', cpf: '222.333.444-55' },
  },
  {
    id: `${caseIdPrefix}-3`, type: 'custom', position: { x: 400, y: 200 },
    data: { name: 'João Santos', photoUrl: `https://picsum.photos/seed/${caseIdPrefix}JS/80/80`, role: 'Consultor Externo' },
  },
];

const createSampleEdges = (caseIdPrefix: string): Edge[] => [
  { id: `e-${caseIdPrefix}-1-2`, source: `${caseIdPrefix}-1`, target: `${caseIdPrefix}-2`, label: 'Societário', data: { type: 'societario', strength: 'Forte' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: `e-${caseIdPrefix}-1-3`, source: `${caseIdPrefix}-1`, target: `${caseIdPrefix}-3`, label: 'Profissional', data: { type: 'profissional', strength: 'Médio' }, markerEnd: { type: MarkerType.ArrowClosed } },
];


export const MOCK_CASES: Case[] = [
  {
    id: 'case-001',
    title: 'Investigação Grupo Empresarial ABC',
    subtitle: 'Análise de estrutura societária e relacionamentos entre executivos.',
    status: 'Ativo',
    client: 'Ministério Público',
    leadInvestigator: 'Dr. Silva',
    creationDate: '2025-06-25T10:00:00Z',
    lastModifiedDate: '2025-06-28T14:30:00Z',
    description: 'Investigação sobre possíveis irregularidades fiscais e societárias no Grupo ABC. Foco nos principais diretores e suas conexões.',
    tags: ['Fraude Fiscal', 'Societário', 'Due Diligence'],
    nodes: createSampleNodes('case001'),
    edges: createSampleEdges('case001'),
  },
  {
    id: 'case-002',
    title: 'Due Diligence Fusão XYZ',
    subtitle: 'Mapeamento de stakeholders e análise de conflitos de interesse.',
    status: 'Ativo',
    client: 'Consultoria Jurídica Alfa',
    leadInvestigator: 'Dra. Santos',
    creationDate: '2025-05-10T09:00:00Z',
    lastModifiedDate: '2025-06-20T11:00:00Z',
    description: 'Análise prévia à fusão das empresas X, Y e Z, com foco em identificar potenciais conflitos de interesse e riscos reputacionais dos envolvidos.',
    tags: ['Fusões e Aquisições', 'Compliance', 'Risco Reputacional'],
    nodes: [
      ...createSampleNodes('case002'),
      { id: 'case002-4', type: 'custom', position: {x: 250, y: 350}, data: {name: 'Empresa X Rep.', photoUrl: `https://picsum.photos/seed/case002EX/80/80`, role: 'Representante Legal', cpf: '333.444.555-66'} }
    ],
    edges: createSampleEdges('case002'),
  },
  {
    id: 'case-003',
    title: 'Análise de Concorrência Setor Tech',
    subtitle: 'Identificação de principais players e suas interconexões no mercado de tecnologia.',
    status: 'Concluído',
    client: 'Fundo de Investimento Beta',
    leadInvestigator: 'Sr. Oliveira',
    creationDate: '2025-03-01T11:00:00Z',
    lastModifiedDate: '2025-04-15T16:00:00Z',
    description: 'Estudo de mercado para identificar os principais influenciadores, investidores e relações estratégicas no setor de tecnologia.',
    tags: ['Inteligência de Mercado', 'Tecnologia', 'Investimento'],
    nodes: createSampleNodes('case003'),
    edges: createSampleEdges('case003'),
  },
   {
    id: 'case-004',
    title: 'Caso Teste Simples',
    subtitle: 'Um caso com dados mínimos para testes.',
    status: 'Pendente',
    creationDate: '2025-06-29T12:00:00Z',
    lastModifiedDate: '2025-06-29T12:00:00Z',
    nodes: [ { id: 'case004-1', type: 'custom', position: { x: 50, y: 50 }, data: { name: 'Pessoa Única', photoUrl: DEFAULT_PHOTO_URL, role: 'Indivíduo', cpf: '000.000.000-00' } } ],
    edges: [],
  }
];

export const NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Painel de Casos', href: '#', icon: HeroBriefcaseIcon, viewId: 'dashboard' },
  { name: 'Editor de Teia', href: '#', icon: HeroShareIcon, viewId: 'web-editor' },
  // { name: 'Pessoas', href: '#', icon: HeroUsersIcon, viewId: 'people-registry' }, // Removed
  // { name: 'Configurações', href: '#', icon: HeroAdjustmentsHorizontalIcon, viewId: 'case-settings', disabled: true },
];

// Icons for UI elements
export const DeleteIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.077m7.236 0a48.067 48.067 0 0 1-7.236 0" />
  </svg>
);

export const AddIcon: React.FC<{className?: string}> = HeroPlusIcon;
export const OpenWebIcon: React.FC<{className?: string}> = HeroShareIcon;
export const ViewDetailsIcon: React.FC<{className?: string}> = HeroEyeIcon;
export const CaseIcon: React.FC<{className?: string}> = HeroFolderIcon;
export const UserIcon: React.FC<{className?: string}> = HeroUserCircleIcon;
export const CalendarIcon: React.FC<{className?: string}> = HeroCalendarDaysIcon;
export const PeopleIcon: React.FC<{className?: string}> = HeroUserGroupIcon;
export const RelationshipIcon: React.FC<{className?: string}> = HeroLinkIcon;
export const InformationIcon: React.FC<{className?: string}> = HeroInformationCircleIcon;
export const CloseIcon: React.FC<{className?: string}> = HeroXMarkIcon;
export const PhotoUploadIcon: React.FC<{className?: string}> = HeroPhotoIcon;
export const ExportIcon: React.FC<{className?: string}> = HeroArrowDownTrayIcon;

export const SaveIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


export const UpdateIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);