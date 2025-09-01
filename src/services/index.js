import { CustomError } from '../errors/custom.error.js'

export const getImages = async (imagesUrls) => {
    const buffers = await Promise.all(
        imagesUrls.map(async url => {
            const res = await fetch(`https://${url}`);
            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer).toString("base64");
        })
    );

    return buffers;
}


export const getProducts = async () => {
    /**
     * 
     * store=US
     * offset=0
     * categoryId=8799 (например, для платьев)
     * limit=30
     */
    const {X_RapidAPI_Key, X_RapidAPI_Host} = process.env;
    if(!X_RapidAPI_Host || !X_RapidAPI_Key) {
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

    return {products: result, images};
}


/**
 * 
 * @param {{data: {image: {url: string}}}[]} imagesUrls 
 */
export const filterProducts = async (imagesUrls) => {
    console.log('Q')
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