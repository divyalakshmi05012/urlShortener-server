import { nanoid } from "nanoid";
import urlModel from "../model/urlShortenerModel.js";

const generateId = async() => {
    let urlId = nanoid(6)
    while(true) {
        const urlCheck = await urlModel.findOne({urlId})
        if(!urlCheck){
            break;
        }
        urlId = nanoid(6)
    }
   return urlId;
}

export default generateId;