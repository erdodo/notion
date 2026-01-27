const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('./src');
const testFiles = new Set();
const allFiles = [];

// Helper to find all files recursively
function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const dirPath = path.join(dir, f);
    const stat = fs.statSync(dirPath);
    if (stat.isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  }
}

// 1. Identify all existing test files first
walkDir(rootDir, (filePath) => {
  if (filePath.match(/\.(test|spec)\.(ts|tsx)$/)) {
    // Store base name to find matching source files
    // e.g., "button.test.tsx" -> "button"
    const baseName = path
      .basename(filePath)
      .replace(/\.(test|spec)\.(ts|tsx)$/, '');
    testFiles.add(baseName);
  }
});

// 2. Analysis Logic
function analyzeContent(content, filePath, relativePath) {
  const lines = content.split('\n').length;
  const hasAny =
    (content.match(/: any/g) || []).length +
    (content.match(/as any/g) || []).length;
  const matchHooks = content.match(/use[A-Z]\w+/g) || [];
  const uniqueHooks = new Set(matchHooks);
  const useStateCount = (content.match(/useState/g) || []).length;
  const useEffectCount = (content.match(/useEffect/g) || []).length;
  const importCount = (content.match(/^import /gm) || []).length;

  // Detect TODOs or Mocks
  const hasTodo = content.includes('TODO:') || content.includes('FIXME:');
  const isMock = content.includes('Mock') || relativePath.includes('__mocks__');

  // --- Determine Purpose & Test Needs ---
  let purpose = '';
  let unitGenericNeeded = 'Gerekli';
  let e2eNeeded = 'Gerekli Değil';

  if (relativePath.includes('app/api')) {
    purpose = 'API Route';
    unitGenericNeeded = 'Integration/Unit (Logic)';
    e2eNeeded = 'Gerekli Değil (API)';
  } else if (relativePath.includes('app/(main)/_actions')) {
    purpose = 'Server Action (Backend)';
    unitGenericNeeded = 'Kesinlikle Gerekli';
    e2eNeeded = 'Kısmen (Flow)';
  } else if (relativePath.includes('store')) {
    purpose = 'Global State (Store)';
    unitGenericNeeded = 'Kesinlikle Gerekli';
    e2eNeeded = 'Gerekli Değil';
  } else if (relativePath.includes('hooks')) {
    purpose = 'Custom Hook';
    unitGenericNeeded = 'Kesinlikle Gerekli';
    e2eNeeded = 'Gerekli Değil';
  } else if (relativePath.includes('lib')) {
    purpose = 'Utility/Helper';
    unitGenericNeeded = 'Kesinlikle Gerekli';
    e2eNeeded = 'Gerekli Değil';
  } else if (relativePath.includes('components/ui')) {
    purpose = 'UI Component (Primitive)';
    unitGenericNeeded = 'Önerilir (Visual)';
    e2eNeeded = 'Gerekli Değil';
  } else if (relativePath.includes('page.tsx')) {
    purpose = 'Page Entry';
    unitGenericNeeded = 'Gerekli Değil (Wiring)';
    e2eNeeded = 'Kesinlikle Gerekli';
  } else if (relativePath.includes('layout.tsx')) {
    purpose = 'Layout';
    unitGenericNeeded = 'Gerekli Değil';
    e2eNeeded = 'Gerekli Olabilir';
  } else {
    purpose = 'Component / Logic';
    unitGenericNeeded = 'Gerekli';
    e2eNeeded = 'Kısmen';
  }

  // --- Check Tests ---
  const fileNameNoExt = path.basename(filePath, path.extname(filePath));
  const hasTest = testFiles.has(fileNameNoExt);
  const unitStatus = hasTest
    ? '✅ Mevcut'
    : unitGenericNeeded.includes('Gerekli Değil')
      ? '⚪️ Gerekmez'
      : '❌ Eksik';

  // --- SOLID & Complexity Analysis ---
  let solidStatus = '✅ Uygun';
  let solidReasons = [];

  if (lines > 400) {
    solidStatus = '⚠️ Refactor';
    solidReasons.push(`Çok Büyük (${lines} satır)`);
  } else if (lines > 200) {
    // 200-400 arası: Hooks veya importlar çoksa riskli, değilse kabul edilebilir.
    if (uniqueHooks.size > 5 || importCount > 15) {
      solidStatus = '⚠️ İncele';
      solidReasons.push(`Karmaşık (${lines} satır, ${importCount} import)`);
    } else {
      solidStatus = '✅ Uygun (Uzun)';
    }
  }

  if (useEffectCount > 3) {
    solidReasons.push('Side-Effect Yoğunluğu');
    if (!solidStatus.includes('Refactor')) solidStatus = '⚠️ İncele';
  }

  // --- Defect Risk Calculation ---
  // Score based logic
  let riskScore = 0;
  let riskReasons = [];

  if (lines > 500) {
    riskScore += 3;
    riskReasons.push('Lines > 500');
  } else if (lines > 300) {
    riskScore += 1;
  }

  if (hasAny > 0) {
    riskScore += 2;
    riskReasons.push(`'any' type (${hasAny} adet)`);
  }
  if (useEffectCount > 4) {
    riskScore += 1;
    riskReasons.push('Complex Effects');
  }
  if (
    unitStatus.includes(' Eksik') &&
    unitGenericNeeded.includes('Kesinlikle')
  ) {
    riskScore += 2;
    riskReasons.push('No Code Coverage');
  }
  if (importCount > 20) {
    riskScore += 1;
    riskReasons.push('High Coupling');
  }

  let defectRisk = '🟢 Düşük';
  if (riskScore >= 4) defectRisk = '🔴 KRİTİK';
  else if (riskScore >= 2) defectRisk = '🟠 Yüksek';

  // Add specific nuance for "Code Complete"
  let codeStatus = '✅ Tamamlandı';
  if (hasTodo) codeStatus = '🚧 WIP (TODO)';
  if (isMock) codeStatus = '🧪 Mock Dosyası';

  const riskOutput =
    riskReasons.length > 0
      ? `${defectRisk} (${riskReasons.join(', ')})`
      : defectRisk;
  const solidOutput =
    solidReasons.length > 0
      ? `${solidStatus}: ${solidReasons.join(', ')}`
      : solidStatus;

  return {
    path: relativePath,
    purpose,
    unitTest: `${unitStatus} (${unitGenericNeeded})`,
    e2e: e2eNeeded,
    codeComplete: codeStatus,
    solid: solidOutput,
    defect: riskOutput,
    lines,
  };
}

// 3. Process Source Files
walkDir(rootDir, (filePath) => {
  // Exclude tests, defs, and unrelated files
  if (!filePath.match(/\.(ts|tsx)$/)) return;
  if (filePath.match(/\.(test|spec)\.(ts|tsx)$/)) return;
  if (filePath.includes('.d.ts')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);

  allFiles.push(analyzeContent(content, filePath, relativePath));
});

// Sort by Defect Risk Score (Critical First) then Lines
// Critical has '🔴', High '🟠', Low '🟢'
const riskOrder = { '🔴': 3, '🟠': 2, '🟢': 1 };
allFiles.sort((a, b) => {
  const riskA = riskOrder[a.defect.substring(0, 2).trim()] || 0;
  const riskB = riskOrder[b.defect.substring(0, 2).trim()] || 0;
  if (riskB !== riskA) return riskB - riskA;
  return b.lines - a.lines;
});

// 4. Generate Markdown Table
let md = `# Detaylı Proje Kod Analizi Raporu

**Oluşturulma Tarihi:** ${new Date().toLocaleString()}
**Toplam İncelenen Dosya:** ${allFiles.length}

Bu rapor dosya karmaşıklığı, test gereksinimleri ve best-practice ihlallerine göre derinlemesine analiz edilerek oluşturulmuştur.

| Dosya Yolu | Amaç | Unit Test Durumu | E2E Gerekli mi? | Kod Durumu | SOLID & Complexity | Defect Riski & Nedenleri |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

allFiles.forEach((f) => {
  md += `| \`${f.path}\` | ${f.purpose} | ${f.unitTest} | ${f.e2e} | ${f.codeComplete} | ${f.solid} | ${f.defect} |\n`;
});

console.log(md);
