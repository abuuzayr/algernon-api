import * as express from "express";
import forceSSL from "express-force-ssl";
import * as cors from "cors";
import * as compression from "compression";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import { errorHandler as queryErrorHandler } from "querymen";
import { errorHandler as bodyErrorHandler } from "bodymen";
import { jsonifyErrors } from "./jsonify-errors";
import { domainTools } from "./domain-tools";
import C from "../../config";

export default (routes: express.Router) => {
  const app = express();

  if (C.env === "production") {
    app.set("forceSSLOptions", {
      enable301Redirects: false,
      trustXFPHeader: true
    });
    app.use(forceSSL);
  }

  if (C.env === "production" || C.env === "development") {
    app.use(cors());
    app.use(compression());
    app.use(morgan("dev"));
  }

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(routes);
  app.use(queryErrorHandler());
  app.use(bodyErrorHandler());
  app.use(jsonifyErrors());
  app.use(domainTools());
  return app;
};
