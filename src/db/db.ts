import { deployment, image } from "../data";

export interface HADB {
    getImage(ID: string): Promise<image>;
    getAllImages(offset?: number, limit?: number): Promise<any[]>;
    getCombo(): Promise<any[]>;
    createImage(i: image): Promise<boolean>;
    updateImage(i: image, upsert: boolean): Promise<boolean>;

    createDeploymenyt(d: deployment): Promise<boolean>;
    getAllDeployments(offset?: number, limit?: number): Promise<deployment[]>;
    countDeployment(): Promise<number>;
}