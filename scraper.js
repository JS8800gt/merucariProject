const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function getProductInfo(url) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(url, { waitUntil: 'networkidle2' });

        const data = await page.content();
        const $ = cheerio.load(data);

        const nameDiv = $('div[data-testid="name"] h1');
        const productName = nameDiv.text().trim() || 'Product name not found';

        const priceDiv = $('div[data-testid="price"]');
        const price = priceDiv.find('span').last().text().trim().replace(',', '') || 'Price not found';

        await browser.close();
        return { url, name: productName, price };
    } catch (error) {
        return { url, error: '잘못된 URL입니다.' };
    }
}

module.exports = { getProductInfo };
