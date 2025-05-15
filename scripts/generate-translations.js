const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { translate } = require('microsoft-translate-api');

const sourceFile = path.join(__dirname, '../locales/en.json');
const defaultTargetFile = (lang) => path.join(__dirname, `../locales/${lang}.json`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function translateAll(sourceStrings, targetLang, keysToTranslate) {
  const translatedStrings = {};

  for (const key of keysToTranslate) {
    const text = sourceStrings[key];
    try {
      const result = await translate(text, null, targetLang);
      translatedStrings[key] = result[0].translations[0].text;
      console.log(`✅ ${key}: "${text}" → "${translatedStrings[key]}"`);
    } catch (err) {
      console.error(`❌ Failed to translate "${text}": ${err.message}`);
      translatedStrings[key] = text; // fallback
    }
  }

  return translatedStrings;
}

async function run() {
  try {
    const sourceStrings = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));

    const lang = await ask('🌍 Enter target language code (e.g., hi, es, fr): ');
    const allKeys = Object.keys(sourceStrings);

    const mode = await ask(`🔍 Translate (a)ll keys or (s)pecific keys? [a/s]: `);

    let keysToTranslate;
    if (mode.toLowerCase() === 's') {
      const inputKeys = await ask(`✍️ Enter keys to translate, comma-separated (e.g., title,description): `);
      const requestedKeys = inputKeys.split(',').map(k => k.trim());
      keysToTranslate = requestedKeys.filter(k => allKeys.includes(k));
      const notFound = requestedKeys.filter(k => !allKeys.includes(k));
      if (notFound.length) console.warn(`⚠️ Keys not found: ${notFound.join(', ')}`);
    } else {
      keysToTranslate = allKeys;
    }

    const translated = await translateAll(sourceStrings, lang, keysToTranslate);
    const targetFile = defaultTargetFile(lang);

    const confirm = await ask(`💾 Write translations to ${targetFile}? (y/n): `);
    if (confirm.toLowerCase() === 'y') {
      fs.writeFileSync(targetFile, JSON.stringify(translated, null, 2));
      console.log(`\n🎉 Translated file written to ${targetFile}`);
    } else {
      console.log('❌ Write cancelled.');
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    rl.close();
  }
}

run();
