const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    if (!fs.existsSync('assets/screenshots')) {
        fs.mkdirSync('assets/screenshots');
    }
    try {
        const browser = await puppeteer.launch({
            channel: 'chrome', // Use local chrome
            headless: 'new'
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
        console.log('Navigating to app...');
        await page.goto('http://localhost:8000/app/index.html', { waitUntil: 'networkidle0', timeout: 60000 });
        
        // wait an extra 10 seconds for flutter canvas to settle and load everything
        await new Promise(r => setTimeout(r, 10000));
        
        console.log('Taking Today Flow screenshot...');
        await page.screenshot({ path: 'assets/screenshots/today-flow-ui.png' });
        
        console.log('Clicking Moments Camera...');
        await page.mouse.click(140, 780);
        await new Promise(r => setTimeout(r, 4000));
        await page.screenshot({ path: 'assets/screenshots/moments-camera-ui.png' });
        
        console.log('Clicking Moods...');
        await page.mouse.click(234, 780);
        await new Promise(r => setTimeout(r, 4000));
        await page.screenshot({ path: 'assets/screenshots/mood-checkin-ui.png' });
        
        console.log('Clicking Calendar...');
        await page.mouse.click(328, 780);
        await new Promise(r => setTimeout(r, 4000));
        await page.screenshot({ path: 'assets/screenshots/smart-calendar-ui.png' });
        
        await browser.close();
        console.log('Done!');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
