import { deployment, image } from "../data";

export interface HADB {
    getImage(ID: string): image;
    getAllImages(): image[];
    getCombo(): image[];
    createImage(i: image): boolean;
    updateImage(i: image): boolean;

    createDeploymenyt(d: deployment): boolean;
    getAllDeployments(): deployment[];
    countDeployment(): number;
}