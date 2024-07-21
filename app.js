const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function getProductInfo(url) {
    try {
        const browser = await puppeteer.launch({ headless: true }); // 브라우저 UI 확인
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
        console.error(`Error getting product info for ${url}:`, error);
        return { url, error: '상품 정보 가져오기 실패' };
    }
}

const express = require('express');
const bodyParser = require('body-parser');
const { getProductInfo } = require('./scraper');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/fetch-product-info', async (req, res) => {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'Please provide an array of URLs.' });
    }

    try {
        const results = await Promise.all(urls.map(url => getProductInfo(url)));

        const totalPrice = results.reduce((total, result) => {
            const price = parseInt(result.price.replace(',', ''), 10) || 0;
            return total + price;
        }, 0);

        res.json({ products: results, totalPrice });
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).json({ error: '상품 정보 가져오기 실패' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
