import 'dotenv/config'

import {
    getImages,
    getProducts,
    filterProducts
} from './services/index.js';

import { Hono } from 'hono';
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server';
import { errorHandler } from './middlewares/error-handler.js'

const app = new Hono()
.use(cors())
.use(logger())

app.get('/modest-products', async (c) => {
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

    return c.json({ products: filteredProductsData });
})

app
.notFound(c => c.text('Custom 404 Message', 404))
.onError(errorHandler)

serve({
    fetch: app.fetch,
    port: 8000,
})