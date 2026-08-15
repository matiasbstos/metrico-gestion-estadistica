/**
 * FASE 1: El Fotógrafo Autónomo (Pipeline de Snapshots DevLog Real)
 * Script de automatización headless acoplado al flujo de despliegue de MÉTRICO.
 * Navega automáticamente a la aplicación y toma capturas de pantalla de alta resolución (1920x1080).
 */

const fs = require('fs');
const path = require('path');

async function runDevLogPhotographer() {
  console.log('📸 [Fotógrafo Autónomo Zero-Click] Iniciando pipeline de capturas de pantalla de alta resolución...');

  const targetUrl = process.env.TARGET_URL || 'https://metrico-dashboard-2026.web.app';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const publicDir = path.join(__dirname, '..', 'public', 'devlog_snapshots');
  const distDir = path.join(__dirname, '..', 'dist', 'devlog_snapshots');

  [publicDir, distDir].forEach(d => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });

  const publicOutputFile = path.join(publicDir, `snapshot_${timestamp}.png`);
  const publicMainFile = path.join(publicDir, `snapshot_real.png`);
  const distOutputFile = path.join(distDir, `snapshot_${timestamp}.png`);

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
      console.log(`🌐 Navegando a ${targetUrl} con motor Headless...`);
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 35000 });

      // Esperar 4 segundos a que los componentes y gráficos de Recharts se rendericen
      await new Promise(resolve => setTimeout(resolve, 4000));

      await page.screenshot({ path: publicOutputFile, fullPage: false });
      fs.copyFileSync(publicOutputFile, publicMainFile);
      fs.copyFileSync(publicOutputFile, distOutputFile);
      
      await browser.close();
      console.log(`✅ Captura de pantalla REAL capturada exitosamente: ${publicMainFile}`);
    } else {
      console.log(`ℹ️ [Simulador de Capturas] Entorno Node ejecutado.`);
    }
  } catch (error) {
    console.error('⚠️ Error en pipeline del fotógrafo autónomo:', error.message);
  }
}

runDevLogPhotographer();
