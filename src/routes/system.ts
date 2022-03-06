import {Router, Request, Response } from "express";



export function sysRouterInit(): Router {
    const sysRouter: Router = Router();

    /**
     * @openapi
     * /system/about:
     *   get:
     *     description: Return information about the server.
     *     responses:
     *       200:
     *         description: Returns String with the server name.
     */
    sysRouter.get('/system/about', (req: Request, res: Response) => {
        res.send("HA");
    });

    return sysRouter;
}