import * as mongoose from "mongoose";
import C from "../../config";

Object.keys(C.mongo.options).forEach((key) => {
  mongoose.set(key, C.mongo.options[key]);
});

// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/10743
require("mongoose").Promise = global.Promise;

mongoose.Types.ObjectId.prototype.view = function () {
  return { id: this.toString() };
};

mongoose.connection.on("error", (err: Error) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

export default mongoose;
