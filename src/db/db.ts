import { deployment, image } from "../data";

export interface HADB {
    getImage(ID: string): Promise<image>;
    getAllImages(): Promise<image[]>;
    getCombo(): Promise<image[]>;
    createImage(i: image): Promise<boolean>;
    updateImage(i: image, upsert: boolean): Promise<boolean>;

    createDeploymenyt(d: deployment): Promise<boolean>;
    getAllDeployments(): Promise<deployment[]>;
    countDeployment(): Promise<number>;
}