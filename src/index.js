import 'dotenv/config'

import {
    getImages,
    getProducts,
    filterProducts
} from './services/index.js';

import express from 'express';
import cors from 'cors';

import { errorHandler } from './middlewares/error-handler.js'

const app = express()
.use(cors())

app.get('/modest-products', async (_, res, next) => {
    try {
        const b = Date.now();
        const { images, products } = await getProducts();
        const a = Date.now();
        console.log('Получения товаров', a - b);
    
        
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
        console.log('Скачивания изображения и форматирования на base64', a1 - b1);
    
        const befor = Date.now();
        const aiResult = await filterProducts(datas);
        const after = Date.now();
        console.log('Фильтрация ии', after - befor);
    
        const filteredProductsData = [];
       
        for(let i = 0; i < products.length; i++) {
            const data = aiResult?.outputs[i]?.data;
            const concepts = data?.concepts;
            
    
            if(data && concepts) {
                const modest = concepts.find(c => c.name === "modestdresses");
    
                if (modest && modest.value > 0.9) {
                    filteredProductsData.push(products[i]);
                }
            }
        }
    
        res.status(200).json({ products: filteredProductsData });
        return;
    } catch (err) {
        next(err)
    }
})

app.use((_, req) => req.status(404).json('Custom 404 Message'))
app.use(errorHandler)

app.listen(8000, () => {
    console.log('Сервер запущен на порту 8000')
});