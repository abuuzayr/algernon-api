import * as express from "express";
import forceSSL from "express-force-ssl";
import * as cors from "cors";
import * as compression from "compression";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import { errorHandler as queryErrorHandler } from "querymen";
import { errorHandler as bodyErrorHandler } from "bodymen";
import config from "../../config";
import { DomainError } from "../../error";

export default (routes: express.Router) => {
  const app = express();

  if (config.env === "production") {
    app.set("forceSSLOptions", {
      enable301Redirects: false,
      trustXFPHeader: true
    });
    app.use(forceSSL);
  }

  if (config.env === "production" || config.env === "development") {
    app.use(cors());
    app.use(compression());
    app.use(morgan("dev"));
  }

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(routes);
  app.use(queryErrorHandler());
  app.use(bodyErrorHandler());

  app.use((err: Error, req: express.Request, res: express.Response, next: Function) => {
    let statusCode = err.StatusCode || 500;

    if (config.env !== "development") {
      delete err.stack;
    }

    if (err.name === "ValidationError") {
      statusCode = 400;
    }

    if (err instanceof DomainError) {
      statusCode = 404;
    }

    res.status(statusCode).json(err);
  });
  return app;
};
