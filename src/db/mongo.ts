import {MongoClient, ListDatabasesResult, CreateCollectionOptions} from 'mongodb';
import { image, deployment } from '../data';
import { HADB } from './db';


// TODO add exception handeling and timeout for connection.

/**
 * Wrapper for connectiong and handeling a DB.
 */
 export class DB implements HADB{
    private client: MongoClient; // the mongodb client.
    private db: string; // the current db name.

    constructor(address="localhost:27017") {
        const uri = `mongodb://${address}/?retryWrites=true&w=majority`;
        this.client = new MongoClient(uri);
    }

    /**
     * Connect to remote DB and verify the connection.
     */
    public async connect(): Promise<void> {
        let connected = false;
        while (!connected) {
            try {
                await this.client.connect();
                await this.client.db("admin").command({ ping: 1 });
                connected = true;
                console.log("Connected successfully to server");
            } catch (e: any) {
                console.log("fail to connect to mongo retry.");
            }
        }
    }

    /**
     * Choose database form the remote DB.
     * @param {*} db
     */
    public setDB(db: string): void {
        this.db = db;
    }

    public async createCollection(collection: string, options: CreateCollectionOptions = {}): Promise<string> {
        const result = await this.client.db(this.db).createCollection(collection, options);
        return result.collectionName;
    }

    /**
     * list all databases avaible on the remote DB.
     */
    public async listDatabases(): Promise<ListDatabasesResult>{
        const databasesList = await this.client.db().admin().listDatabases();
        return databasesList;
    }

    /**
     * list all collections avaible on the DB.
     */
    public async listCollections(): Promise<any[]>{
        const collectionsList = await this.client.db(this.db).listCollections().toArray();
        return collectionsList;
    }

    /**
     * close the connetion to the remote DB.
     */
    public close(): Promise<void> {
        return this.client.close();
    }

    /**
     * Return an image by id from the db.
     * @param ID image id
     * @returns 
     */
    public async getImage(ID: string): Promise<any> {
        const result = await this.client.db(this.db)
            .collection("images").findOne({id : ID});
        return result;
    }
    /**
     * reutne all the images in the DB.
     */
    public getAllImages(): Promise<image[]> {

    }

    /**
     * combination of all the images
     */
    public getCombo(): Promise<image[]> {

    }
    
    /**
     * create new image in the db
     * @param i image
     * @returns 
     */
    public createImage(i: image): Promise<boolean> {
        return this.create(i, "images");
    }

    
    /**
     * update image in the db, the metadata is merged with the existsing .
     * @param i 
     * @param upsert 
     * @returns 
     */
    public updateImage(i: image, upsert: boolean): Promise<boolean> {
        const myquery = { id: i.id };
        return this.update(i, myquery, "images", upsert);
    }

    /**
     * create deployment in the mongodb
     * @param d 
     * @returns 
     */
    public createDeploymenyt(d: deployment): Promise<boolean> {
        return this.create(d, "deploymnent");
    }
    
    /**
     * return all the deployments
     */
    public getAllDeployments(): Promise<deployment[]> {

    }
    
    /**
     * retuen number of deployments in the DB.
     */
    public countDeployment(): Promise<number> {

    }

    /**
     * create an new oage in the db,
     */
    private async create(rec: Record<string, any>, collection: string): Promise<boolean> {
        const result = await this.client.db(this.db)
            .collection(collection).insertOne(rec);
        return result.acknowledged;
    }

    /**
     * create an new oage in the db,
     */
    private async update(rec: Record<string, any>, query : Record<string, any>, collection: string, upsert: boolean = false): Promise<boolean> {
        const recUpdate = { $set: rec };
        const result = await this.client.db(this.db)
            .collection(collection).updateOne(query, recUpdate, {upsert: upsert});
        return result.acknowledged;
    }
}

