"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var config_1 = __importDefault(require("../config"));
//import { route } from './relayer/routes';
var app = express_1.default();
var PORT = config_1.default.PORT || 5000;
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS");
//   res.header("Access-Control-Allow-Methods", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", true);
//   next()
// })
app.use(body_parser_1.default.json());
app.use(express_1.default.json({ limit: "50mb" }));
//app.use("/", route);
app.listen(PORT, function () {
    console.log("App is listening on port " + PORT + " !");
});
