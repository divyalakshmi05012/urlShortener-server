
import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors';

import Routes from './src/routes/index.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
//app.use(cors())
app.use(cors({
    origin: process.env.CLIENT_URL
}))
app.use(express.json());
app.use(Routes);

app.listen(PORT,()=> console.log(`App is listening to port ${PORT}`))