import { useState, useEffect } from 'react';

const emptyParam = { name: '', unit: '', normalRange: '' };

export default function TestForm({ onTestAdded, editingTest, onCancelEdit }) {
  const [testName, setTestName] = useState('');
  const [price, setPrice] = useState('');
  const [parameters, setParameters] = useState([{ ...emptyParam }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // When editingTest changes, populate the form
  useEffect(() => {
    if (editingTest) {
      const { data } = editingTest;
      setTestName(data.name || '');
      setPrice(data.price != null ? String(data.price) : '');
      setParameters(
        data.parameters && data.parameters.length > 0
          ? data.parameters.map((p) => ({
              name: p.name || '',
              unit: p.unit || '',
              normalRange: p.normalRange || '',
            }))
          : [{ ...emptyParam }]
      );
      setMessage(null);
    }
  }, [editingTest]);

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

  const resetForm = () => {
    setTestName('');
    setPrice('');
    setParameters([{ ...emptyParam }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payload = {
      name: testName.trim() || '',
      price: price ? parseFloat(price) : 0,
      parameters: parameters.map((p) => ({
        name: p.name.trim() || '',
        unit: p.unit.trim() || '',
        normalRange: p.normalRange.trim() || '',
      })),
    };

    try {
      const prev = JSON.parse(localStorage.getItem('tests') || '[]');

      if (editingTest != null && editingTest.index != null) {
        // Update existing test
        prev[editingTest.index] = payload;
        localStorage.setItem('tests', JSON.stringify(prev));
        setMessage({ type: 'success', text: 'Test updated successfully!' });
      } else {
        // Add new test
        localStorage.setItem('tests', JSON.stringify([...prev, payload]));
        setMessage({ type: 'success', text: 'Test added successfully!' });
      }

      resetForm();
      onTestAdded?.();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save test' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setMessage(null);
    onCancelEdit?.();
  };

  const isEditing = editingTest != null;

  return (
    <div className="form-container">
      <h2>{isEditing ? '✏️ Edit Test' : 'Add New Test'}</h2>
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
              />
              <input
                type="text"
                value={param.normalRange}
                onChange={(e) => updateParameter(index, 'normalRange', e.target.value)}
                placeholder="Range (e.g. 13.8-17.2)"
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

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Update Test' : 'Submit Test'}
          </button>
          {isEditing && (
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
