import Product from "../models/Product.js"


export const getProducts = async (req, res) => {

    try {
        const products = await Product.find();
        console.log(products)
        res.json({ success: true, products: products })

    } catch (error) {
        console.log(error)
    }

}

export const createProduct = async (req, res) => {

    try {
        const { name, description, stock } = req.body;

        const newProduct = await Product.create({
            name, description, stock
        })


        console.log(newProduct);
        res.json({ success: true, newProduct: newProduct });

    } catch (error) {
        console.log(error)
    }

}

export const deleteProduct = async (req, res) => {

    try {
        const productId = req.params.id;

        await Product.findByIdAndDelete(productId);

        res.json({ success: true, message: `product id:${productId} deleted` })

    } catch (error) {
        console.log(error)
    }

}