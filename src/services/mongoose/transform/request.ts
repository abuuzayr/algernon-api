import * as _ from "lodash";
import { Request, Response, NextFunction } from "express";

export const transformQuery = () => (req: Request, res: Response, next: NextFunction) => {
  if (!req.query) return next();

  if (!req.mongoose) req.mongoose = {
    query: _.cloneDeep(req.query),
  };

  // Match ?q=<stuff>
  if (req.query.q) {
    req.mongoose = _.merge(req.mongoose, {
      query: {
        query: {
          keywords: {
            $regex: req.query.q,
            $options: "i",
          },
        },
      },
    });
  }

  // Match ?page=<stuff>&limit=<stuff>
  // Logical XOR
  // Both page and limit must exist, and not be falsy.
  // Or both can not exist too.
  if (!req.query.page !== !req.query.limit) {
    return res.status(400);
  }
  if (req.query.page && req.query.limit) {
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    req.mongoose = _.merge(req.mongoose, {
      query: {
        cursor: {
          skip: limit * (page - 1),
          limit: limit,
        },
      },
    });
  }

  // Match ?fields=<stuff>
  if (req.query.fields) {
    req.mongoose = _.merge(req.mongoose, {
      query: {
        select: req.query.fields.replace(/,/g, " "),
      },
    });
  }

  next();
};

export const transformBody = () => (req: Request, res: Response, next: NextFunction) => {
  if (!req.body) return next();

  if (!req.mongoose) req.mongoose = {
    body: _.cloneDeep(req.body),
  };

  next();
};