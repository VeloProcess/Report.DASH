import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OperatorForm from './pages/OperatorForm';
import IndicatorsForm from './pages/IndicatorsForm';
import FeedbackView from './pages/FeedbackView';
import LogsPanel from './pages/LogsPanel';
import Navigation from './components/Navigation';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/operator/new" element={<OperatorForm />} />
          <Route path="/indicators/:operatorId" element={<IndicatorsForm />} />
          <Route path="/feedback/:operatorId" element={<FeedbackView />} />
          <Route path="/logs" element={<LogsPanel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

