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
        return res.status(400).json({ error: 'URL 배열을 제공해 주세요.' });
    }

    console.log('Received URLs:', urls);

    try {
        const results = await Promise.all(urls.map(url => getProductInfo(url)));
        console.log('Product Info Results:', results);

        const missingInfo = results.some(result => result.error && result.error.includes('실패'));
        if (missingInfo) {
            throw new Error('상품 정보 가져오기 실패');
        }

        const totalPrice = results.reduce((total, result) => {
            const price = parseInt(result.price.replace(',', ''), 10) || 0;
            return total + price;
        }, 0);

        res.json({ products: results, totalPrice });
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).json({ error: '상품 정보가 없습니다.' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
