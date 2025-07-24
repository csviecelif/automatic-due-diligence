import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import OCRPage from './pages/OCRPage';
import ReportPage from './pages/ReportPage'; // Importa a nova página
import { OCRProvider, useOCR } from './OCRContext';
import OCRResultModal from './components/OCRResultModal';

// Componente para renderizar o modal, para manter o App limpo
const AppModal = () => {
  const { selectedDocument, selectDocument } = useOCR();
  return <OCRResultModal document={selectedDocument} onClose={() => selectDocument(null)} />;
}

const App: React.FC = () => {
  return (
    <OCRProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<OCRPage />} />
            <Route path="/reports" element={<ReportPage />} /> {/* Adiciona a nova rota */}
          </Routes>
        </MainLayout>
        <AppModal />
      </Router>
    </OCRProvider>
  );
};

export default App;
