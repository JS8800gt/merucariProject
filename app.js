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

    console.log("여기까지 옴 1");
    try {
        // 병렬 처리로 속도 개선
        const results = await Promise.all(urls.map(url => getProductInfo(url)));
        console.log("여기까지 옴 2");
        const totalPrice = results.reduce((total, result) => {
            const price = parseInt(result.price.replace(',', ''), 10) || 0;
            return total + price;
        }, 0);
        console.log("여기까지 옴 3");
        res.json({ products: results, totalPrice });
    } catch (error) {
        console.log("여기까지 옴 4");
        console.error('Error fetching product data:', error);
        res.status(500).json({ error: '상품 정보가 없습니다.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
