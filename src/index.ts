import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { sysRouterInit } from "./routes/system";
import { HARouterInit } from "./routes/routes";
import { DB } from "./db/mongo";


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
        apis: ['./src/routes/**/*'], // files containing annotations as above
        };

    const openapiSpecification = swaggerJsdoc(options);

    const db = new DB();
    db.setDB("ha");
    await db.connect();

    app.use(sysRouterInit());
    app.use(HARouterInit(db));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));



    app.listen(PORT, () => {
        console.log(`Deploy server at http://localhost:${PORT}`);
    });
}

async function run() {
    await server();
}

run();
