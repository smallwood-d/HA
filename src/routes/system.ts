import {Router, Request, Response } from "express";
import {sgininUser, verifyUser, genrateJWT} from '../utils/auth';

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

    /**
     * @openapi
     * /system/login:
     *   post:
     *     description: login to NightChef.
     *     parameters:
     *       - in: body
     *         name: user
     *         description: User name
     *         schema:
     *           type: string
     *           example: JDad
     *         required: true
     *       - in: body
     *         name: pass
     *         description: Cryptic digest of the password.
     *         schema:
     *           type: string
     *         required: true
     *     responses:
     *       200:
     *         description: Returns JSON with all the match recepies.
     *       403: 
     *         bad user creadentilas
     */
    sysRouter.post('/system/login', (req: Request, res: Response) => {
        const user = req.body.user;
        const key = req.body.key;
        if (verifyUser(user, key)) {
            const token = genrateJWT({"user": user});
            res.cookie('session_id', token, { maxAge: 900000, httpOnly: true });
            res.sendStatus(200);
        } else {
            res.sendStatus(403);
        }
    });

    sysRouter.post('/system/signin', (req: Request, res: Response) => {
        sgininUser(req.body.user, req.body.key);
        res.sendStatus(200);

    });

    return sysRouter;
}