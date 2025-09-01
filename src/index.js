import 'dotenv/config'

import {
    getImage,
    convertAvifToJpeg,
    getProducts,
    filterProducts
} from './services/index.js';

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { errorHandler } from './middlewares/error-handler.js'

const app = new Hono();

app.get('/modest-products', async (c) => {
    const products = await getProducts();

    const datas = [];

    for (const product of products) {
        const imageBuffer = await getImage(`http://${product.imageUrl}`);
        const convertedBuffer = await convertAvifToJpeg(imageBuffer);

        datas.push({
            data: {
                image: {
                    base64: convertedBuffer.toString('base64')
                }
            }
        })
    }

    const aiResult = await filterProducts(datas);

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
});
app.notFound(c => c.text('Custom 404 Message', 404))
app.onError(errorHandler)

serve({
    fetch: app.fetch,
    port: 8000
})