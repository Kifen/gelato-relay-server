import express from 'express';
import { relay } from './controller';
import {asyncHandler} from './utils';

const route: express.Router = express.Router();

route.post("/api/v1/relay", asyncHandler(relay));

export { route }