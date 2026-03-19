const User = require("../models/User")
const Product = require("../models/Product")

module.exports.getDashboad = async (req , res ) => {
    try {
        const totalUsers = await User.countDocuments()  
        const TotalProduct = await Product.countDocuments()
        const Category = await Product.aggregate([
            {
                $group : {
                    _id: "$category",
                    total : {$sum : 1}
                }
            }
        ])
                const totalPrice = await Product.aggregate([
            {
                $group : {
                    _id : "$category",
                    total : {$count : "$price"}
                }
            }
        ])
        res.json({totalUsers ,
             TotalProduct ,
             Category,
             totalPrice
             })


    } catch (error) {
        return res.json(error)
    }
}

