import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import config from '../config';
import { route } from './relayer/routes';

const app: Express = express();
const PORT: number = config.PORT || 5000;

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS");
//   res.header("Access-Control-Allow-Methods", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", true);
//   next()
// })
app.use(bodyParser.json());
app.use(express.json({limit: "50mb"}))
app.use("/", route);

app.listen(PORT, function () {
  console.log(`App is listening on port ${PORT} !`)
});