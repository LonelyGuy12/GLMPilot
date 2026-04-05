import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import IDEShell from './components/layout/IDEShell';

import EnvironmentSelector from './components/ide/EnvironmentSelector';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ide" element={<EnvironmentSelector />} />
        <Route path="/ide/:env" element={<IDEShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
