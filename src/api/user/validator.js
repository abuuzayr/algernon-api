import { schema } from './model'

const defaultValidator = schema.tree

let updateValidator = Object.assign({}, defaultValidator)
delete updateValidator.password

let updateMeValidator = Object.assign({}, updateValidator)
delete updateMeValidator.email.required

export default {
  create: defaultValidator,
  update: updateValidator,
  updateMe: updateMeValidator,
  updatePassword: { password: defaultValidator.password }
}
