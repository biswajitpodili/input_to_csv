import { useState } from 'react';

const emptyParam = { name: '', unit: '', normalRange: '' };

export default function TestForm({ onTestAdded }) {
  const [testName, setTestName] = useState('');
  const [price, setPrice] = useState('');
  const [parameters, setParameters] = useState([{ ...emptyParam }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const addParameter = () => {
    setParameters([...parameters, { ...emptyParam }]);
  };

  const removeParameter = (index) => {
    if (parameters.length <= 1) return;
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index, field, value) => {
    const updated = parameters.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setParameters(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payload = {
      name: testName.trim(),
      price: parseFloat(price),
      parameters: parameters.map((p) => ({
        name: p.name.trim(),
        unit: p.unit.trim(),
        normalRange: p.normalRange.trim(),
      })),
    };

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Test added successfully!' });
        setTestName('');
        setPrice('');
        setParameters([{ ...emptyParam }]);
        onTestAdded?.();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add test' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Test</h2>
      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Test Name</label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g. Complete Blood Count"
            required
          />
        </div>

        <div className="form-group">
          <label>Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 50"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="parameters-section">
          <div className="parameters-header">
            <h3>Parameters</h3>
            <button type="button" className="btn-icon btn-add" onClick={addParameter} title="Add parameter">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                <line x1="10" y1="5" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {parameters.map((param, index) => (
            <div key={index} className="parameter-row">
              <span className="param-number">{index + 1}</span>
              <input
                type="text"
                value={param.name}
                onChange={(e) => updateParameter(index, 'name', e.target.value)}
                placeholder="Parameter name"
                required
              />
              <input
                type="text"
                value={param.unit}
                onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                placeholder="Unit (e.g. g/dL)"
                required
              />
              <input
                type="text"
                value={param.normalRange}
                onChange={(e) => updateParameter(index, 'normalRange', e.target.value)}
                placeholder="Range (e.g. 13.8-17.2)"
                required
              />
              <button
                type="button"
                className="btn-icon btn-remove"
                onClick={() => removeParameter(index)}
                disabled={parameters.length <= 1}
                title="Remove parameter"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                  <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </form>
    </div>
  );
}
