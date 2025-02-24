import { MongoClient } from "mongodb";

// 🔹 Verificamos que la variable de entorno esté definida
if (!process.env.DATABASE_URL_MONGODB) {
  throw new Error("Falta la variable DATABASE_URL_MONGODB en el archivo .env");
}

const uri = process.env.DATABASE_URL_MONGODB;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
