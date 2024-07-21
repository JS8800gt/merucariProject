const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function getProductInfo(url) {
    try {
        const browser = await puppeteer.launch({ headless: false });
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
        console.error(`Error fetching product info for ${url}:`, error); // Improved logging
        return { url, error: '상품 정보를 가져오는 중 오류가 발생했습니다.' }; // Improved error message
    }
}


module.exports = { getProductInfo };
