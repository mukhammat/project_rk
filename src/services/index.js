import sharp from 'sharp';
import { CustomError } from '../errors/custom.error.js'

export const getImage = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    return buffer;
}


export const convertAvifToJpeg = async (inputPath) => {
    const buffer = await sharp(inputPath)
    .jpeg({ quality: 90 })
    .toBuffer();

    return buffer;
};


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

    for (const product of products) {
        result.push({
            name: product.name,
            price: product.price.current.value,
            url: product.url,
            imageUrl: product.imageUrl
        });
    }

    return result;
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

    console.log(response)

    return response;
}