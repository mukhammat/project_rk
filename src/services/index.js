import { CustomError } from '../errors/custom.error.js'

import { Buffer } from 'buffer';

export const getImages = async (imagesUrls) => {
    if (!imagesUrls || !Array.isArray(imagesUrls) || imagesUrls.length === 0) {
        throw new Error('Нет imagesUrls');
    }

    const buffers = await Promise.all(
        imagesUrls.map(async url => {
            try {
                const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                console.log("Загружаем:", finalUrl);

                const res = await fetch(finalUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate, br, zstd',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'none',
                        'Sec-Fetch-User': '?1',
                        'Priority': 'u=0, i',
                        'Referer': 'https://www.asos.com/' // важно для ASOS
                    }
                });

                if (!res.ok) throw new Error(`HTTP error ${res.status}`);

                const arrayBuffer = await res.arrayBuffer();
                return Buffer.from(arrayBuffer).toString('base64');
            } catch (err) {
                console.error("Ошибка при загрузке изображения:", url, err);
                return null;
            }
        })
    );

    return buffers;
};


export const getProducts = async () => {
    /**
     *
     * store=US
     * offset=0
     * categoryId=8799 (например, для платьев)
     * limit=30
     */
    const { X_RapidAPI_Key, X_RapidAPI_Host } = process.env;
    if (!X_RapidAPI_Host || !X_RapidAPI_Key) {
        throw new CustomError('Нет X_RapidAPI_Host или X_RapidAPI_Key');
    }

    const response = await fetch('https://asos2.p.rapidapi.com/products/v2/list?store=US&offset=2&categoryId=8799&limit=30', {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': X_RapidAPI_Key,
            'X-RapidAPI-Host': X_RapidAPI_Host
        }
    });

    const data = await response.json();

    const products = data.products;

    let result = [];
    let images = [];

    for (const product of products) {
        result.push({
            name: product.name,
            price: product.price.current.value,
            url: product.url,
            imageUrl: product.imageUrl
        });
        images.push(product.imageUrl)
    }

    return { products: result, images };
}


export const filterProducts = async (imagesUrls) => {
    const result =
        await fetch('https://api.clarifai.com/v2/models/modest-dress-classifier/outputs', {
            method: 'POST',
            headers: {
                Authorization: process.env.TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "user_app_id": {
                    "user_id": "rustamka",
                    "app_id": "scanjab"
                },
                "inputs": imagesUrls
            })
        })

    const response = await result.json();

    if (response.status.code !== 10000) {
        throw new CustomError(response.status.description);
    }

    return response;
}
