import {Router, Request, Response } from "express";
import { deployment } from "../data";

import { DB } from "../db/mongo";


export function HARouterInit(db : DB): Router {
    const haRouter: Router = Router();

    /**
     * @openapi
     * /image:
     *   get:
     *     description: return images information.
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         description: ID of the image to get
     *     responses:
     *       200:
     *         description: found the image or return all the images.
     */
    haRouter.get('/image/:id?', async (req: Request, res: Response) => {
        const imageID = req.params.id;
        let resultCode = 201;
        let result: any;
        if (imageID) {
            try {
                result = await db.getImage(imageID);
                console.log(result)
            } catch (e) {
                console.log(e.message);
                resultCode = 500;
            }
        } else {
            try {
                result = await db.getAllImages();
                console.log(result)
            } catch (e) {
                console.log(e.message);
                resultCode = 500;
            }  
        }
        res.status(resultCode).send(result);
        
    });

        /**
     * @openapi
     * /image:
     *   put:
     *     description: Return the databases list.
     *     parameters:
     *       - in: body
     *         name: image
     *         description: The image to create.
     *         schema:
     *           type: object
     *           required:
     *             - id
     *             - name
     *             - repository
     *             - version
     *           properties:
     *             id:
     *               type: string
     *             name:
     *               type: string
     *             repository:
     *               type: string
     *             version:
     *               type: string
     *             metadata:
     *               type: object
     *       - in: body
     *         name: upsert
     *         description: upsert instead of create
     *         schema:
     *           type: boolean
     *     responses:
     *       201:
     *         description: Created
     *       200:
     *         description: Updated
     *       400: 
     *         description: Updated
     */
    haRouter.put('/image', async (req: Request, res: Response) => {
        let resultCode = 201;
        try {
            if (req.body.upsert) {
                await db.updateImage(req.body.image, req.body.upsert);
            } else {
                await db.createImage(req.body.image);
            }
        } catch (e) {
            console.log(e.message);
            resultCode = 500;
        }
        res.sendStatus(resultCode);
    });

    /**
     * @openapi
     * /combo:
     *   get:
     *     description: Return all possible combinations of different images.
     *     parameters:
     *       - in: query
     *         name: length
     *         schema:
     *           type: integer
     *           example: 3
     *         description: length of the return array.
     *     responses:
     *       200:
     *         description: Array of images permutation.
     */
    haRouter.get('/combo', async (req: Request, res: Response) => {
        let resultCode = 200;
        let result;
        try {
            result = await db.getCombo();
        } catch (e) {
            console.log(e.message);
            resultCode = 500;
        }
        res.status(200).send(result);
    });

    /**
     * @openapi
     * /deployment:
     *   get:
     *     description: get all deplyment information.
     *     parameters:
     *       - in: query
     *         name: count
     *         schema:
     *           type: boolean
     *     responses:
     *       200:
     *         description: Array of all the deployments or number of the deployment if count is set.
     */
    haRouter.get('/deployment', async (req: Request, res: Response) => {
        let result: deployment[] | string;
        let resultCode = 200;
        try {
            if (req.query.count) {
                result = (await db.countDeployment()).toString();
            } else {
                result = await db.getAllDeployments();
            }
        } catch (e) {
            console.log(e.message);
            resultCode = 500;
        }
        res.status(resultCode).send(result);
    });

    /**
     * @openapi
     * /deployment:
     *   post:
     *     description: Return the databases list.
     *     parameters:
     *       - in: body
     *         name: deployment
     *         description: The image to create.
     *         schema:
     *           name: ImageID
     *           type: string
     *           required: true
     *     responses:
     *       201:
     *         description: Created
     */
     haRouter.post('/deployment', async (req: Request, res: Response) => {
         let resCode = 201;
        try {
            await db.createDeploymenyt({imageID: req.body.imageID});     
        } catch (e) {
            resCode = 500;    
            console.log(e.message);
        }
        res.sendStatus(resCode);
    });

    return haRouter;
}
