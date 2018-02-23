import * as _ from "lodash";
import { schema } from "./model";

const defaultValidator = schema.obj;

const createValidator = _.cloneDeep(defaultValidator);
for (const k of Object.keys(createValidator.profile)) {
  const v = createValidator.profile[k];
  createValidator[`profile.${k}`] = v;
}
delete createValidator.profile;

const updateValidator = _.cloneDeep(defaultValidator);
delete updateValidator.role.required;
delete updateValidator.email.required;
delete updateValidator.password.required;
delete updateValidator.profile.firstName.required;
delete updateValidator.profile.lastName.required;

const updateMeValidator = _.cloneDeep(updateValidator);

export default {
  create: defaultValidator,
  update: updateValidator,
  updateMe: updateMeValidator,
  updatePassword: { password: defaultValidator.password }
};
