import express, { Request, Response } from 'express';
import config from './config/commons';
import connection from './config/db';
import routes from './config/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import swaggerUI from 'swagger-ui-express';
import swaggerSetup from './config/swagger'

const app = express();
app.use(express.json());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSetup));

app.use(cors({
   origin: 'http://localhost:5173',
   credentials: true
}));
// app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

connection(config.dbConnectUri);
routes(app);


app.get('/', (req: Request, res: Response) => {
   res.send('Hello World!');
});

app.listen(config.port, () => {
   console.log(`Server is running on ${config.host}:${config.port}`);
});
