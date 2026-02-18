
import { useEffect, useState } from 'react';

export default function TestViewer({ refreshKey, onEdit }) {
  const [tests, setTests] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('tests') || '[]');
    setTests(data);
  }, [refreshKey]);

  const handleDelete = (index) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    const data = JSON.parse(localStorage.getItem('tests') || '[]');
    data.splice(index, 1);
    localStorage.setItem('tests', JSON.stringify(data));
    setTests([...data]);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleDownload = () => {
    let csv = 'name,amount,parameters\n';
    for (const test of tests) {
      const params = test.parameters.map((p) => ({
        Name: p.name || '',
        unit: p.unit || '',
        range: p.normalRange || '',
      }));
      const paramsJson = JSON.stringify(params).replace(/"/g, '""');
      csv += `"${test.name}",${test.price},"${paramsJson}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tests.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

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
                    className="btn-icon btn-edit"
                    onClick={(e) => { e.stopPropagation(); onEdit?.(index); }}
                    title="Edit test"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M13.5 2.5l2 2-9 9H4.5v-2l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.5 4.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
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
                          <td>{param.name || <span className="empty-field">—</span>}</td>
                          <td><code>{param.unit || <span className="empty-field">—</span>}</code></td>
                          <td><span className="range-badge">{param.normalRange || <span className="empty-field">—</span>}</span></td>
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
