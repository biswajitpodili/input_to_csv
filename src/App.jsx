import { useState } from 'react';
import TestForm from './components/TestForm';
import TestViewer from './components/TestViewer';
import './App.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTest, setEditingTest] = useState(null); // { index, data }

  const handleTestAdded = () => {
    setRefreshKey((k) => k + 1);
    setEditingTest(null);
  };

  const handleEdit = (index) => {
    const tests = JSON.parse(localStorage.getItem('tests') || '[]');
    if (tests[index]) {
      setEditingTest({ index, data: tests[index] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingTest(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tekkzy - Lab Test Manager</h1>
        <p>Add medical tests with parameters and store them as CSV</p>
      </header>
      <main className="main-row">
        <TestForm
          onTestAdded={handleTestAdded}
          editingTest={editingTest}
          onCancelEdit={handleCancelEdit}
        />
        <TestViewer refreshKey={refreshKey} onEdit={handleEdit} />
      </main>
    </div>
  );
}

export default App;
