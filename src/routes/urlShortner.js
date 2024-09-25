import {Router} from 'express'
import urlShortner from '../service/urlShortner.js';
const routes = Router();

routes.post("/create",urlShortner.createShortUrl)
routes.get("/:shortUrlId",urlShortner.redirectUrl)
routes.delete("/delete",urlShortner.deleteUrl)
routes.get("/get/getall",urlShortner.getAllUrls)
routes.get("/get/myurls/:userId",urlShortner.getMyUrls)



export default routes