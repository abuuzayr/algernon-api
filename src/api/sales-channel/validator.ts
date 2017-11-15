import * as _ from "lodash";
import { schema } from "./model";

const defaultValidator = schema.obj;

const updateValidator = _.cloneDeep(defaultValidator);
delete updateValidator.name.required;
delete updateValidator.domain.required;
delete updateValidator.owner.required;
delete updateValidator.type.required;

export default {
  create: defaultValidator,
  update: updateValidator
};
