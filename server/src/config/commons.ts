import dotenv from 'dotenv';
dotenv.config()

const dbConnectUri: string = process.env.DB_CONNECTION_URI as string;

const config = {
   port: process.env.PORT || 3000,
   host: process.env.HOST || 'http://localhost:3000',
   dbConnectUri: dbConnectUri,
   jwt_secret: process.env.JWT_SECRET as string

};

export default config;
