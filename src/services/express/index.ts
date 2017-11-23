import * as express from "express";
import forceSSL from "express-force-ssl";
import * as cors from "cors";
import * as compression from "compression";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import { jsonifyErrors } from "./jsonify-errors";
import { domainFilter } from "./domain-filter";
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
  app.use(jsonifyErrors());
  app.use(domainFilter());
  return app;
};
