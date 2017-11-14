import * as http from "http";
import express from "./services/express";
import C from "./config";
import api from "./api";
import mongoose from "./services/mongoose";
import { User } from "./api/user/model";
import { SalesChannel } from "./api/sales-channel/model";

const app = express(api);
const server = http.createServer(app);

const p = mongoose.connect(
  C.mongo.uri,
  // Bug https://github.com/Automattic/mongoose/issues/5399
  { useMongoClient: true, promiseLibrary: global.Promise }
);

if (C.env === "development") {
  p.then(function () {
    const adminEmail = "super_admin@example.com";
    const storeAdmin1Email = "store_admin1@example.com";
    const storeAdmin2Email = "store_admin2@example.com";
    const sa1domain = "storeadmin1.example.com";
    const sa2domain = "storeadmin2.example.com";

    Promise.all([
      User.findOne({ email: adminEmail }).exec().then((user) => {
        if (user) return user;

        user = new User({
          email: adminEmail,
          password: "adminadmin",
          role: "super_admin"
        });
        return user.save();
      }),
      User.findOne({ email: storeAdmin1Email }).exec().then((user) => {
        if (user) return user;

        user = new User({
          email: storeAdmin1Email,
          password: "adminadmin",
          role: "store_admin"
        });

        return user.save();
      }),
      User.findOne({ email: storeAdmin2Email }).exec().then((user) => {
        if (user) return user;

        user = new User({
          email: storeAdmin2Email,
          password: "adminadmin",
          role: "store_admin"
        });
        return user.save();
      })
    ]).then(([superAdmin, storeAdmin1, storeAdmin2]) => {
      Promise.all([
        SalesChannel.findOne({ domain: sa1domain }).exec().then((sc) => {
          if (sc) return;

          return (new SalesChannel({
            userRef: storeAdmin1.id,
            domain: sa1domain,
            type: "ecommerce",
            name: "Store Admin 1 Ecommerce"
          })).save();
        }),
        SalesChannel.findOne({ domain: sa2domain }).exec().then((sc) => {
          if (sc) return;

          return (new SalesChannel({
            userRef: storeAdmin2.id,
            domain: sa2domain,
            type: "ecommerce",
            name: "Store Admin 2 Ecommerce"
          })).save();
        })
      ]).catch((err) => {
        if (err) throw err;
      });
    });
  });
}

setImmediate(() => {
  server.listen(C.port, C.ip, () => {
    console.log("Express server listening on http://%s:%d, in %s mode",
      C.ip, C.port, C.env);
  });
});
