import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;
const CSV_PATH = path.join(__dirname, 'public', 'data', 'tests.csv');

app.use(express.json());

// Ensure CSV file exists with header
function ensureCsvHeader() {
  const dir = path.dirname(CSV_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(CSV_PATH) || fs.readFileSync(CSV_PATH, 'utf-8').trim() === '') {
    fs.writeFileSync(CSV_PATH, 'name,price,parameters\n', 'utf-8');
  }
}

// Escape a field for CSV (handle commas, quotes, newlines)
function escapeCsvField(value) {
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Parse CSV back to objects
function parseCsv(content) {
  const lines = content.trim().split('\n');
  if (lines.length <= 1) return [];

  const results = [];
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV fields (handle quoted fields)
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (inQuotes) {
        if (ch === '"' && line[j + 1] === '"') {
          current += '"';
          j++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          fields.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    fields.push(current);

    if (fields.length >= 3) {
      try {
        results.push({
          name: fields[0],
          price: parseFloat(fields[1]),
          parameters: JSON.parse(fields[2])
        });
      } catch {
        // skip malformed rows
      }
    }
  }
  return results;
}

// GET all tests
app.get('/api/tests', (req, res) => {
  ensureCsvHeader();
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const tests = parseCsv(content);
  res.json(tests);
});

// POST a new test
app.post('/api/tests', (req, res) => {
  ensureCsvHeader();
  const { name, price, parameters } = req.body;

  if (!name || price == null || !Array.isArray(parameters)) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const row = [
    escapeCsvField(name),
    escapeCsvField(price),
    escapeCsvField(JSON.stringify(parameters))
  ].join(',');

  fs.appendFileSync(CSV_PATH, row + '\n', 'utf-8');
  res.json({ success: true, test: { name, price, parameters } });
});

// DELETE a test by index
app.delete('/api/tests/:index', (req, res) => {
  ensureCsvHeader();
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const tests = parseCsv(content);
  const index = parseInt(req.params.index);

  if (index < 0 || index >= tests.length) {
    return res.status(404).json({ error: 'Test not found' });
  }

  tests.splice(index, 1);

  // Rewrite CSV
  let csv = 'name,price,parameters\n';
  for (const t of tests) {
    csv += [
      escapeCsvField(t.name),
      escapeCsvField(t.price),
      escapeCsvField(JSON.stringify(t.parameters))
    ].join(',') + '\n';
  }
  fs.writeFileSync(CSV_PATH, csv, 'utf-8');
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
