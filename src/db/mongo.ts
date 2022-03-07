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
    public getAllImages(offset?: number, limit?: number): Promise<any[]> {
        const aggregateQuery: Record<string, unknown>[] = 
        [ 
            { "$match": {} },
            {
                "$project": {
                    "_id": 0
                }
            }
        ];
            
        offset && aggregateQuery.push({ $skip: offset });
        limit && aggregateQuery.push({ $limit: limit });

        const result = this.client.db(this.db)
            .collection('images')
            .aggregate(aggregateQuery);
        return result.toArray();
    }

    /**
     * combination of all the images
     */
    public getCombo(): Promise<any[]> {
        const aggregateQuery: Record<string, unknown>[] = 
        [ 
            {$group:{
                "_id":"",
                "id":{
                    $push : "$id"
                }
            }},
            {$project:{"id":1,"_id":0, 
            "new": {$reduce:{
                input:{$range:[0,{$size:"$id"}]}, 
                initialValue:[], 
                in:{$concatArrays:[ 
                   "$$value", 
                   {$let:{
                      vars:{i:"$$this"},
                      in:{$map:{
                         input:{$range:[{$add:[1,"$$i"]},{$size:"$id"}]},
                         in:[ {$arrayElemAt:["$id","$$i"]}, {$arrayElemAt:["$id","$$this"]}] }}
                   }}
                ]}
             }}
            }}
            
        ];

        const result = this.client.db(this.db)
            .collection('images')
            .aggregate(aggregateQuery);
        return result.toArray();
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
        return this.create(d, "deployment");
    }
    
    /**
     * return all the deployments
     */
    public getAllDeployments(offset?: number, limit?: number): Promise<any[]> {
        const aggregateQuery: Record<string, unknown>[] = 
        [ 
            { "$match": {} },
            {
                "$project": {
                    "imageID": 1,
                    "_id": 0
                }
            }
        ];
            
        offset && aggregateQuery.push({ $skip: offset });
        limit && aggregateQuery.push({ $limit: limit });

        const result = this.client.db(this.db)
            .collection('deployment')
            .aggregate(aggregateQuery);
        return result.toArray();

    }
    
    /**
     * retuen number of deployments in the DB.
     */
    public async countDeployment(): Promise<number> {
        const result = await this.client.db(this.db)
            .collection("deployment").count({});
        return result;
    }

    /**
     * create  a new ent in the db,
     */
    private async create(rec: Record<string, any>, collection: string): Promise<boolean> {
        const result = await this.client.db(this.db)
            .collection(collection).insertOne(rec);
        return result.acknowledged;
    }

    /**
     * create an new  deployment  in the DB.
     */
    private async update(rec: Record<string, any>, query : Record<string, any>, collection: string, upsert: boolean = false): Promise<boolean> {
        const recUpdate = { $set: rec };
        const result = await this.client.db(this.db)
            .collection(collection).updateOne(query, recUpdate, {upsert: upsert});
        return result.acknowledged;
    }
}

