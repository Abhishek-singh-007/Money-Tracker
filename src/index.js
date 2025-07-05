import app from "./app.js";
import dotenv from 'dotenv';
import ConnectDB from "./db/config.js";

dotenv.config();

const port = process.env.PORT || 8000;

ConnectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`server is running at port ${port}`);
        });
    })
    .catch((error) => {
        console.log(`MongoDB connection failed ${error.message}`);
    });
