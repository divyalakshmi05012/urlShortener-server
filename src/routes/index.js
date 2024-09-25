import {Router} from 'express'
import userRoutes from './UserRouter.js'
import urlRoutes from './urlShortner.js'

const routes = Router();

routes.get('/',(req,res) => {
    res.send(`<h1>Welcome to Url-shortener</h1>`)
})

routes.use('/user',userRoutes);
routes.use('/url',urlRoutes);

export default routes