import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let clientPromise = global._mongoClientPromise;

if (!clientPromise) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
}

export default clientPromise;

export async function pingMongo() {
  const client = await clientPromise;
  await client.db('admin').command({ ping: 1 });
  return true;
}
