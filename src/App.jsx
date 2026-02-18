import { useState } from 'react';
import TestForm from './components/TestForm';
import TestViewer from './components/TestViewer';
import './App.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTestAdded = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧪 Lab Test Manager</h1>
        <p>Add medical tests with parameters and store them as CSV</p>
      </header>
      <main>
        <TestForm onTestAdded={handleTestAdded} />
        <TestViewer refreshKey={refreshKey} />
      </main>
    </div>
  );
}

export default App;
