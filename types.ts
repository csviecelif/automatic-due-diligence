import { Node, Edge } from 'reactflow';

// Core data for a person in the relationship web
export interface PersonData {
  name: string;
  photoUrl: string; // Will store image data URL or external URL
  role?: string; // e.g., 'CEO', 'Suspect'
  cpf?: string; // New: CPF for the person
  // other details can be added here
}

// Data for a relationship edge
export interface RelationshipData {
  type: string; // Corresponds to the id in RelationshipTypeDefinition
  strength?: RelationshipStrength; // New: Strength of the relationship
  // other details like notes can be added
}

// Definition for a type of relationship, including its visual representation
export interface RelationshipTypeDefinition {
  id: string; // e.g., 'familiar', 'societario'
  name: string; // e.g., 'Familiar', 'Societário'
  color: string; // Hex color for the edge and legend
  icon?: React.FC<React.SVGProps<SVGSVGElement>>; // Optional icon
}

// Defines the strength of a relationship
export type RelationshipStrength = 'Forte' | 'Médio' | 'Fraco';

// Theme for the Web Editor (React Flow canvas)
export interface WebEditorTheme {
  name: string;
  bgClass: string;
  nodeBgClass: string;
  nodeBorderClass: string;
  textClass: string; // Text color within nodes/editor UI elements
  sidebarBgClass: string; // For the Web Editor's own sidebar
  sidebarSectionBgClass: string; // For sections within the sidebar
  buttonClass: string;
  inputClass: string;
  inputLabelClass: string;
  accentColor: string; // For minimap, controls, edge highlights
}

// Status options for a case
export type CaseStatus = 'Ativo' | 'Concluído' | 'Pendente' | 'Arquivado';

// Represents a file or document attached to a case (example)
export interface CaseFile {
  id: string;
  name: string;
  type: string; // e.g., 'pdf', 'image', 'document'
  url: string; // or path
  addedDate: string;
}

// Main Case structure
export interface Case {
  id: string;
  title: string;
  subtitle?: string; // Short description or objective
  status: CaseStatus;
  description?: string; // More detailed notes
  client?: string;
  leadInvestigator?: string;
  creationDate: string; // ISO date string
  lastModifiedDate: string; // ISO date string
  tags?: string[];
  // Data for the relationship web specific to this case
  nodes: Node<PersonData>[];
  edges: Edge<RelationshipData>[];
  files?: CaseFile[]; // Optional list of attached files
}

// For navigation items
export interface NavItem {
  name: string;
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  viewId: ViewId;
  disabled?: boolean;
}

export type ViewId = 'dashboard' | 'web-editor' | 'case-settings'; // Removed 'people-registry'

// Statistics for the sidebar
export interface SidebarStats {
  activeCases: number;
  totalPeople: number;
  totalRelationships: number;
}