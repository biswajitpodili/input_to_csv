import { useEffect, useState } from 'react';

export default function TestViewer({ refreshKey }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      setTests(data);
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [refreshKey]);

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      const res = await fetch(`/api/tests/${index}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchTests();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleDownload = () => {
    // Build a clean CSV with one row per parameter
    let csv = 'Test Name,Price,Parameter,Unit,Normal Range\n';
    for (const test of tests) {
      for (const p of test.parameters) {
        csv += [
          `"${test.name}"`,
          test.price,
          `"${p.name}"`,
          `"${p.unit}"`,
          `"${p.normalRange}"`
        ].join(',') + '\n';
      }
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tests.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="viewer-container"><p className="loading">Loading tests...</p></div>;

  return (
    <div className="viewer-container">
      <div className="viewer-header-row">
        <h2>Saved Tests <span className="badge">{tests.length}</span></h2>
        {tests.length > 0 && (
          <button className="btn-download" onClick={handleDownload} title="Download CSV">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v10M9 12l-3.5-3.5M9 12l3.5-3.5M3 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download CSV
          </button>
        )}
      </div>

      {tests.length === 0 ? (
        <p className="empty-state">No tests added yet. Use the form above to add one.</p>
      ) : (
        <div className="tests-grid">
          {tests.map((test, index) => (
            <div key={index} className={`test-card ${expandedIndex === index ? 'expanded' : ''}`}>
              <div className="test-card-header" onClick={() => toggleExpand(index)}>
                <div className="test-info">
                  <h3>{test.name}</h3>
                  <span className="test-price">₹{test.price}</span>
                </div>
                <div className="test-card-actions">
                  <span className="param-count">{test.parameters.length} params</span>
                  <button
                    className="btn-icon btn-delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                    title="Delete test"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 5h12M7 5V3h4v2M5 5v10h8V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span className={`expand-arrow ${expandedIndex === index ? 'rotated' : ''}`}>▾</span>
                </div>
              </div>

              {expandedIndex === index && (
                <div className="test-card-body">
                  <table className="params-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Parameter</th>
                        <th>Unit</th>
                        <th>Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.parameters.map((param, pIdx) => (
                        <tr key={pIdx}>
                          <td>{pIdx + 1}</td>
                          <td>{param.name}</td>
                          <td><code>{param.unit}</code></td>
                          <td><span className="range-badge">{param.normalRange}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
