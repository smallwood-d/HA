const {MongoClient} = require('mongodb');

describe('images', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db(global.__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('merge', async () => {
    // test the update and merge option
  });

  it('get by id', async () => {
    //check get by id  when trhe image exits and not
  });

  it('get all', async () => {
    //test get all 
  });
  it('get combo', async () => {
    // test the get combo functions
  });
});

describe('deployment', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db(global.__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('get all', async () => {
    //test get all 
  });

  it('count', async () => {
    //test the count functions
  });
});