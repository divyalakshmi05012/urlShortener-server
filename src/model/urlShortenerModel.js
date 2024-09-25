import mongoose from "./index.js";
import { nanoid } from 'nanoid'
//model.id = nanoid() //=> "V1StGXR8_Z5jdHi6B-myT"


const UrlSchema = new mongoose.Schema({
    url: {
      type: String,
      required: true,
    },
    userId:{
      type:String,
      required:[true,'User Id is required']
    },
    shortUrlId: {
      type: String,
      required: true
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now() 
    }
  });
  
  const urlModel = mongoose.model("urls", UrlSchema);

  export default urlModel;