import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import UploadPage from '../pages/UploadPage';
import ResultsPage from '../pages/ResultsPage';
import PatientView from '../pages/PatientView';
import AdminLogs from '../pages/AdminLogs';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Layout />}
        >
          <Route index element={<Navigate to="/upload" replace />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="results/:caseId" element={<ResultsPage />} />
          <Route path="cases" element={<PatientView />} />
          <Route path="cases/:caseId" element={<PatientView />} />
          <Route path="admin/logs" element={<AdminLogs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
