
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { OCRDocument } from './types';

interface OCRContextType {
  documents: OCRDocument[];
  selectedDocument: OCRDocument | null;
  addDocument: (doc: Omit<OCRDocument, 'id'>) => void;
  selectDocument: (doc: OCRDocument | null) => void;
  deleteDocument: (id: string) => void; // Adicionado
}

const OCRContext = createContext<OCRContextType | undefined>(undefined);

export const OCRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<OCRDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<OCRDocument | null>(null);

  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem('ocrDocuments');
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (error) {
      console.error("Failed to load documents from localStorage", error);
      setDocuments([]);
    }
  }, []);

  const addDocument = (doc: Omit<OCRDocument, 'id'>) => {
    setDocuments(prevDocs => {
      const newDoc = { ...doc, id: new Date().toISOString() };
      const updatedDocs = [newDoc, ...prevDocs];
      try {
        localStorage.setItem('ocrDocuments', JSON.stringify(updatedDocs));
      } catch (error) {
        console.error("Failed to save documents to localStorage", error);
      }
      return updatedDocs;
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments(prevDocs => {
      const updatedDocs = prevDocs.filter(doc => doc.id !== id);
      try {
        localStorage.setItem('ocrDocuments', JSON.stringify(updatedDocs));
      } catch (error) {
        console.error("Failed to save updated documents to localStorage", error);
      }
      // Se o documento deletado era o selecionado, limpa a seleção
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      return updatedDocs;
    });
  };

  const selectDocument = (doc: OCRDocument | null) => {
    setSelectedDocument(doc);
  };

  return (
    <OCRContext.Provider value={{ documents, selectedDocument, addDocument, selectDocument, deleteDocument }}>
      {children}
    </OCRContext.Provider>
  );
};

export const useOCR = (): OCRContextType => {
  const context = useContext(OCRContext);
  if (!context) {
    throw new Error('useOCR must be used within an OCRProvider');
  }
  return context;
};
