import { Schema, model } from "mongoose";
import { uid } from "rand-token";
import { IPasswordReset, IPasswordResetModel } from "./interfaces";

const passwordResetSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  token: {
    type: String,
    unique: true,
    index: true,
    default: () => uid(32)
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

passwordResetSchema.methods = {
  view (full: boolean) {
    return {
      user: this.user.view(full),
      token: this.token
    };
  }
};

export const PasswordReset = model<IPasswordReset, IPasswordResetModel>("PasswordReset", passwordResetSchema);
export const schema = PasswordReset.schema;