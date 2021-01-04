import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import * as chalk from 'chalk'
import {Request, Response} from "express";
import routes from "./routes";
import {User} from "./entity/User";

createConnection()
    .then(async connection => {

        // create express app
        const app = express();

        const PORT = process.env.NODE_ENV === 'development' ? 8000 : process.env.PORT;

        // Call middleware
        app.use(cors());
        app.use(helmet());
        app.use(bodyParser.json());

        // Set all routes from routes folder
        app.use('/', routes);

        // start express server
        app.listen(PORT, () => {
            console.log(chalk.cyan(`> Started API on port ${chalk.yellow(PORT.toString())}`));
        });

    })
    .catch(error => console.log(error));
