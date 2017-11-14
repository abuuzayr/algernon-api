import * as _ from "lodash";
import { schema } from "./model";

const defaultValidator = schema.obj;

const updateValidator = _.cloneDeep(defaultValidator);
delete updateValidator.role.required;
delete updateValidator.email.required;
delete updateValidator.password.required;

const updateMeValidator = _.cloneDeep(updateValidator);

export default {
  create: defaultValidator,
  update: updateValidator,
  updateMe: updateMeValidator,
  updatePassword: { password: defaultValidator.password }
};
