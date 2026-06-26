import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
dotenv.config();

async function ejecutarRobot() {
    console.log("Iniciando automatización...");
    const browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();

    try {
        await page.goto('https://iris.rayenaps.cl/', { waitUntil: 'networkidle2' });

        // 1. LOGIN
        console.log("Escribiendo credenciales...");
        // Usamos delay para que el formulario "sienta" que alguien escribe
        await page.type('input[name="txtUserName"]', process.env.RAYEN_USER, { delay: 100 });
        await page.type('input[name="txtPassword"]', process.env.RAYEN_PASS, { delay: 100 });
        
        // Clic en Conectar
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // 2. SELECCIÓN DE CENTRO (El paso extra que mencionaste)
        console.log("Seleccionando centro...");
        // Clic en el Select (el que aparece en tu captura como mui-component-select-licenseIdSelected)
        await page.click('#mui-component-select-licenseIdSelected');
        await page.waitForSelector('li[role="option"]');
        
        // Clic en la primera opción de la lista desplegable
        await page.click('li[role="option"]');

        // 3. CONFIRMAR
        console.log("Confirmando acceso...");
        // Buscamos el botón "Confirmar" por su texto
        const [btnConfirmar] = await page.$x("//button[contains(., 'CONFIRMAR')]");
        if (btnConfirmar) {
            await btnConfirmar.click();
        }

        console.log("Acceso completado exitosamente.");
        
    } catch (error) {
        console.error("Error en el paso:", error);
    }
}
ejecutarRobot();