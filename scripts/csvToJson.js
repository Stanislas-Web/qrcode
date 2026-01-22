import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le fichier CSV
const csvFilePath = path.join(__dirname, '../src/data/tableau1.csv');
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

// Parser le CSV
const records = parse(csvContent, {
  delimiter: ';',
  skip_empty_lines: false,
  relax_column_count: true
});

// Trouver la ligne des en-têtes (ligne 10 dans le fichier)
const headerRow = records[9];

// Nettoyer les en-têtes
const headers = headerRow.map((h, idx) => {
  if (idx === 0) return 'numero';
  return h ? h.trim() : `col_${idx}`;
});

console.log('En-têtes:', headers);

// Convertir en JSON
const jsonData = [];
for (let i = 10; i < records.length; i++) {
  const row = records[i];
  
  // Vérifier si la ligne a un code d'identification (colonne index 6)
  const codeId = row[6] ? row[6].trim() : '';
  
  if (codeId && codeId !== '' && !codeId.startsWith('TA') === false) {
    const obj = {
      id: codeId
    };
    
    headers.forEach((header, index) => {
      const value = row[index] ? row[index].trim() : '';
      obj[header] = value;
    });
    
    jsonData.push(obj);
  }
}

// Écrire le fichier JSON
const jsonFilePath = path.join(__dirname, '../public/data.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`✅ Conversion terminée : ${jsonData.length} lignes converties`);
console.log(`📁 Fichier créé : ${jsonFilePath}`);
