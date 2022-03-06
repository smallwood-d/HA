import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { sysRouterInit } from "./routes/system";


const app = express();
const PORT = 7811;


app.use(cors());
app.use(express.json());

async function server() {
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
            title: 'HA',
            version: '1.0.0',
            },
        },
        apis: ['./src/routes/*.js'], // files containing annotations as above
        };

    const openapiSpecification = swaggerJsdoc(options);

    app.use(sysRouterInit());
    app.use('/api-docs', swaggerUi.setup(openapiSpecification));



    app.listen(PORT, () => {
        console.log(`Deploy server at http://localhost:${PORT}`);
    });
}

async function run() {
    await server();
}

run();
