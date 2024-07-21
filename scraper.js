const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function getProductInfo(url) {
    try {
        console.log(`Fetching product info for URL: ${url}`);
        const browser = await puppeteer.launch({ headless: false }); // GUI 활성화
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded' });
        console.log('Page loaded');

        const data = await page.content();
        const $ = cheerio.load(data);

        const nameDiv = $('div[data-testid="name"] h1');
        const productName = nameDiv.text().trim() || '상품 이름을 찾을 수 없습니다';
        console.log(`Product Name: ${productName}`);

        const priceDiv = $('div[data-testid="price"]');
        const price = priceDiv.find('span').last().text().trim().replace(',', '') || '가격을 찾을 수 없습니다';
        console.log(`Product Price: ${price}`);

        await browser.close();
        return { url, name: productName, price };
    } catch (error) {
        console.error(`Error getting product info for ${url}:`, error);
        return { url, error: '상품 정보 가져오기 실패' };
    }
}


module.exports = { getProductInfo };
