/**
 * FASE 1: El Fotógrafo Autónomo (Pipeline de Snapshots DevLog Real)
 * Script de automatización headless acoplado al flujo de despliegue de MÉTRICO.
 * Navega automáticamente a la aplicación y toma capturas de pantalla de alta resolución (1920x1080).
 */

const fs = require('fs');
const path = require('path');

async function runDevLogPhotographer() {
  console.log('📸 [Fotógrafo Autónomo Zero-Click] Iniciando pipeline de capturas de pantalla de alta resolución...');

  const baseUrl = process.env.TARGET_URL || 'http://localhost:5173';
  const rawTag = process.argv[2] || process.env.VERSION_TAG || 'v6.3.26';
  const cleanTag = rawTag.replace(/[^a-zA-Z0-9_]/g, '_');
  
  // URL contextual según la versión/feature
  let targetUrl = `${baseUrl}/?snapshot_mode=true`;
  if (rawTag.includes('v6.3.26')) {
    targetUrl = `${baseUrl}/?snapshot_mode=true&modal=correo`;
  }
  
  const publicDir = path.join(__dirname, '..', 'public', 'devlog_snapshots');
  const distDir = path.join(__dirname, '..', 'dist', 'devlog_snapshots');

  [publicDir, distDir].forEach(d => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });

  const versionedFileName = `snapshot_${cleanTag}.png`;
  const publicOutputFile = path.join(publicDir, versionedFileName);
  const publicMainFile = path.join(publicDir, `snapshot_real.png`);
  const distOutputFile = path.join(distDir, versionedFileName);
  const distMainFile = path.join(distDir, `snapshot_real.png`);

  try {
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch (e) {
      try {
        puppeteer = require('playwright');
      } catch (err) {}
    }

    if (puppeteer) {
      console.log(`🌐 Navegando a ${targetUrl} con motor Headless (Tag: ${rawTag})...`);
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1.5 });
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Si aparece el modal de Verificación de Identidad de Sesión, hacer click en Confirmar e Ingresar
      try {
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent && b.textContent.includes('Confirmar e Ingresar'));
          if (btn) btn.click();
        });
      } catch (err) {}

      // Esperar a que se carguen los datos y se estabilicen las animaciones
      await new Promise(resolve => setTimeout(resolve, 5000));

      await page.screenshot({ path: publicOutputFile, fullPage: false });
      fs.copyFileSync(publicOutputFile, publicMainFile);
      if (fs.existsSync(distDir)) {
        fs.copyFileSync(publicOutputFile, distOutputFile);
        fs.copyFileSync(publicOutputFile, distMainFile);
      }
      
      await browser.close();
      console.log(`✅ Captura de pantalla REAL generada exitosamente:`);
      console.log(`   - Archivo de versión: ${publicOutputFile}`);
      console.log(`   - Archivo principal: ${publicMainFile}`);
      return `/devlog_snapshots/${versionedFileName}`;
    } else {
      console.log(`ℹ️ [Simulador de Capturas] Entorno Node ejecutado.`);
    }
  } catch (error) {
    console.error('⚠️ Error en pipeline del fotógrafo autónomo:', error.message);
  }
}

runDevLogPhotographer();
