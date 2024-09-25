import urlModel from "../model/urlShortenerModel.js";
import validateUrl from "../utils/validateUrl.js";
import generateId from "../utils/generateUniqueID.js";
import dotenv from 'dotenv'


dotenv.config();

const createShortUrl = async(req,res) => {
        const { url, id } = req.body
        const clientUrl = process.env.CLIENT_URL 

        if(!validateUrl(url)){
            res.status(400).send({
                message: "Invalid URL"
            })
        }
        else {
            try {

                // check for url already exist in DB
                const fullUrlExist = await urlModel.findOne({url})
                if(fullUrlExist){
                    const shortUrl = `${fullUrlExist.shortUrlId}`
                    res.status(200).send({
                        message:"url already exist",
                        shortUrl:shortUrl,
                        clicks: fullUrlExist.clicks
                    })
                }
                else{
                    // Create ShortUrl using nanoid

                    const shortUrlId = await generateId()

                    await urlModel.create({
                        url,
                        shortUrlId,
                        userId:id
                    })

                    const shortUrl = `${shortUrlId}`
                    res.status(200).send({
                        message:"ShortUrl created successfully",
                        shortUrl : shortUrl,
                        clicks : 0
                    })
                }
            } catch (error) {
                console.log(error)
                res.status(500).send({
                    message:"Internal server error"
                })
            }
        }

}

const redirectUrl = async(req,res) => {
    const {shortUrlId} = req.params


    try {
        const shortUrlExist = await urlModel.findOne({shortUrlId})

        if(shortUrlExist){
            await urlModel.findByIdAndUpdate(shortUrlExist._id,{$inc: {"clicks" :1}})
            return res.status(200).redirect(shortUrlExist.url)
        }
        else{
            res.status(404).send({
                message:"URL does not exists"
            })
        }
    }
    catch(error){
        console.log(error)
        res.status(500).send({
            message:"Internal server error"
        })
    }
}

const getAllUrls = async(req,res) => {
    try {
        const getAll =await urlModel.find({},{_id:0})
        if (getAll){
           res.status(200).send({
                data:getAll
           })
        }
        else{
            res.status(404).send({
                message:"NO records found"
            })
        }
    } catch (error) {
        
    }
}

const getMyUrls = async(req,res) => {
    try {
        let {userId} = req.params;
        let urls = await urlModel.find({userId:userId})
        res.status(200).send({
            message:"Data fetched successfully",
            data:urls
        })
    } catch (error) {
        res.status(500).send({
            message:error.message || "Internal Server Error",
            error
        })
    }
}

const deleteUrl = async(req,res) => {
    const {url} = req.body
    try {
        const delete_url = await urlModel.deleteOne({url})
        if(delete_url.deletedCount == 0){
            res.status(400).send({
                message: "URL does not exist"
            })
        }
        else{
            res.status(200).send({
                message:`URl ${url} deleted successfully`
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"server error"
        })
    }
}
export default {
    createShortUrl,
    redirectUrl,
    deleteUrl,
    getAllUrls,
    getMyUrls
}