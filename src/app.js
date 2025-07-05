import express from 'express';
import cors from 'cors';
import routes from './routes/index.routes.js'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.USER_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
)

app.use(express.json({ limit: '80kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/api/v1', routes);

app.get("/", (req, res) => {
    res.send("Hello from budget tracker!");
});

export default app;