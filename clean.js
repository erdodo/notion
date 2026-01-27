const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src');

/**
 * Dosya içeriğindeki yorum satırlarını siler
 * @param {string} content
 */
function removeComments(content) {
  // 1. Regex: Çok satırlı (/* */) ve tek satırlı (//) yorumları bulur
  // Not: URL içerisindeki // yapılarını bozmamaya çalışır
  return content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
}

/**
 * Klasördeki dosyaları tarar
 * @param {string} dirPath
 */
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      processDirectory(fullPath);
    } else if (stats.isFile()) {
      const ext = path.extname(fullPath);
      // Sadece belirli dosya uzantılarında işlem yap (İsteğe bağlı)
      if (['.js', '.ts', '.jsx', '.tsx', '.css', '.scss'].includes(ext)) {
        console.log(`İşleniyor: ${fullPath}`);
        const content = fs.readFileSync(fullPath, 'utf8');
        const cleanedContent = removeComments(content);
        fs.writeFileSync(fullPath, cleanedContent, 'utf8');
      }
    }
  });
}

// Scripti başlat
if (fs.existsSync(targetDir)) {
  processDirectory(targetDir);
  console.log('--- Temizleme işlemi başarıyla tamamlandı. ---');
} else {
  console.error('Hata: ./src klasörü bulunamadı!');
}
