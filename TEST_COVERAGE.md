# Lib Klasörü Test Suite

Bu proje lib klasöründeki tüm fonksiyonlar için kapsamlı test yazılmıştır.

## Test Dosyaları

### 1. **utils.test.ts** (11 tests)
`cn()` fonksiyonu için testler:
- CSS sınıflarını birleştirme
- Tailwind çatışmaları çözme
- Koşullu sınıflar
- Düz değerleri filtreleme

**Sonuç:** ✅ 11/11 test geçti

### 2. **notion-colors.test.ts** (11 tests)
Notion renk sistemi için testler:
- NOTION_COLORS veri yapısı validasyonu
- `getOptionColors()` fonksiyonu
- Tüm renklerin doğru yapıya sahip olması
- Geçersiz renk değerleri için varsayılan dönüş

**Sonuç:** ✅ 11/11 test geçti

### 3. **block-utils.test.ts** (30 tests)
Blok işlemleri ve dönüşümleri için testler:
- Blok rengi yönetimi (açık/koyu tema)
- `getAvailableConversions()` - Blok türü dönüşümleri
- `convertBlockType()` - Blok türü değiştirme
- `duplicateBlock()` - Blok kopyalama
- `getBlockColorStyle()` - Blok rengi stilleri
- `formatBlockTypeName()` - Blok türü adı formatı

**Sonuç:** ✅ 30/30 test geçti

### 4. **embed-utils.test.ts** (30 tests)
Embed ve video URL işlemleri için testler:
- YouTube, Vimeo, Figma, CodePen vb. URL desenleri
- `getEmbedUrl()` - URL'leri embed formatına dönüştürme
- `isEmbeddable()` - Embed edilebilir olup olmadığını kontrol
- `isVideoUrl()` - Video servisi kontrolü

Desteklenen platformlar:
- ✅ YouTube
- ✅ Vimeo
- ✅ Figma
- ✅ CodePen
- ✅ CodeSandbox
- ✅ Loom
- ✅ Spotify

**Sonuç:** ✅ 30/30 test geçti

### 5. **export-utils.test.ts** (42 tests)
Dışa aktarma işlevleri için testler:
- **Markdown export:**
  - Paragraf, başlık, liste, kod blok
  - Metin formatları (bold, italic, strike, code)
  - Görseller, linkler
  - Tablolar, alıntılar

- **HTML export:**
  - Geçerli HTML belge oluşturma
  - CSS şekillendirmesi
  - XSS koruması (HTML escaping)

- **CSV export:**
  - Çeşitli veri türlerini CSV formatında biçimlendirme
  - TEXT, NUMBER, CHECKBOX, DATE, SELECT, MULTI_SELECT
  - RELATION, ROLLUP, FORMULA tiplerini işleme

**Sonuç:** ✅ 42/42 test geçti

### 6. **import-utils.test.ts** (36 tests)
İçe aktarma işlevleri için testler:
- **Markdown'dan Block'a dönüşüm:**
  - Başlıklar (H1, H2, H3)
  - Listeler (bullet, checkbox)
  - Kod blokları
  - Alıntılar ve callouts
  - Görseller
  - Yatay çizgiler

- **CSV'den Database'e dönüşüm:**
  - Başlık ve satır ayrıştırma
  - Tırnak işaretli değerler
  - Boş değerler
  - Sütun sayısı uyuşmazlığı

**Sonuç:** ✅ 36/36 test geçti

### 7. **formula-engine.test.ts** (50 tests)
Formula değerlendirmesi için testler:
- **Aritmetik:** +, -, *, /
- **Karşılaştırma:** >, <, ==
- **String işlevleri:** concat, upper, lower, length, slice, contains, replace
- **Math işlevleri:** roundTo, toNumber, min, max
- **Tarih işlevleri:** now, today, year, month, day, dateAdd, dateBetween
- **Mantık işlevleri:** if, empty, not
- **Validasyon:** `validateFormula()`
- **Kullanılabilir işlevler:** `availableFunctions` listesi

**Sonuç:** ✅ 50/50 test geçti

## Test İstatistikleri

```
Toplam Test Dosyası: 7
Toplam Test: 210
Geçen Testler: 210 ✅
Başarısız Testler: 0
Başarı Oranı: 100%
Toplam Süre: ~1.5 saniye
```

## Tüm Fonksiyonlar Test Edildi

✅ **utils.ts** - `cn()`
✅ **notion-colors.ts** - `getOptionColors()`, NOTION_COLORS sabitler
✅ **block-utils.ts** - `getAvailableConversions()`, `convertBlockType()`, `duplicateBlock()`, `getBlockColorStyle()`, `formatBlockTypeName()`
✅ **embed-utils.ts** - `getEmbedUrl()`, `isEmbeddable()`, `isVideoUrl()`
✅ **export-utils.ts** - `blocksToMarkdown()`, `blocksToHTML()`, `formatCellValueForCSV()`
✅ **import-utils.ts** - `parseMarkdownToBlocks()`, `parseCSVToDatabase()`
✅ **formula-engine.ts** - `evaluateFormula()`, `validateFormula()`, `availableFunctions`

## Test Çalıştırma

```bash
# Tüm lib testlerini çalıştır
npm run test -- src/lib/__tests__

# İzleme modunda çalıştır
npm run test -- src/lib/__tests__ --watch

# Kapsamlı rapor ile çalıştır
npm run test -- src/lib/__tests__ --reporter=verbose
```

## Test Kapsamı

Her fonksiyon için şunlar test edilmiştir:
- ✅ Temel kullanım senaryoları
- ✅ Geçerli girdiler
- ✅ Geçersiz/kenar durumlar
- ✅ Hata yönetimi
- ✅ Tip güvenliği
- ✅ Veri dönüşümlerinin doğrulluğu
