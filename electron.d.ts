
// src/electron.d.ts
import { Case } from './types'; // Importa o tipo Case

export interface IElectronAPI {
  saveData: (data: Case[]) => void;
  loadData: () => Promise<Case[] | null>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
