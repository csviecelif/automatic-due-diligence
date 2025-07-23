import React from 'react';
import MainLayout from './components/layout/MainLayout';
import OCRPage from './pages/OCRPage';

const Shell: React.FC = () => {
  return (
    <MainLayout>
      <OCRPage />
    </MainLayout>
  );
};

export default Shell;
