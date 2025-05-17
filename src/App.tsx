import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormView from './pages/FormView';
import Analytics from './pages/Analytics';
import TemplateLibrary from './pages/TemplateLibrary';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="builder/:formId?" element={<FormBuilder />} />
          <Route path="analytics/:formId" element={<Analytics />} />
          <Route path="templates" element={<TemplateLibrary />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/form/:formId" element={<FormView />} />
      </Routes>
    </Router>
  );
}

export default App;