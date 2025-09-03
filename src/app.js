
import {
    getImages,
    getProducts,
    filterProducts
} from './services/index.js';

import express from 'express';
import cors from 'cors';

const PORT = 8000

const app = express()



app.use(cors())
app.use(express.json())

app.get('/modest-products', async (req, res) => {
    try {
        const b = Date.now();
        let { images, products } = await getProducts();
        const a = Date.now();

        // Это для теста
        // products = [products[0]];
        // images = ["images.asos-media.com/products/bardot-corsage-ruffle-mini-dress-in-chocolate/209257191-1-chocolate", "https://images.asos-media.com/products/miss-selfridge-tailored-collar-mini-dress-in-mixed-plaid/208582092-1-mixedcheck"];

        console.log('Получения товаров', products?.length);


        const b1 = Date.now();
        const base64 = await getImages(images);
        const datas = [];

        base64.forEach(base64 => datas.push({
            data: {
                image: {
                    base64
                }
            }
        }))

        const a1 = Date.now();
        console.log('Скачивания изображения и форматирования на base64', datas?.length);


        const before = Date.now();
        const aiResult = await filterProducts(datas);
        const after = Date.now();
        console.log('Фильтрация ии', after - before);


        const filteredProductsData = [];

        for (let i = 0; i < products.length; i++) {
            const data = aiResult?.outputs[i]?.data;
            const concepts = data?.concepts;


            if (data && concepts) {
                const modest = concepts.find(c => c.name === "modestdresses");

                if (modest && modest.value > 0.9) {
                    filteredProductsData.push(products[i]);
                }
            }
        }

        res.status(200).json({ products: filteredProductsData });
        return;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})


app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`)
});
