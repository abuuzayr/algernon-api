import _ from 'lodash'
import { schema } from './model'

const defaultValidator = schema.tree

let updateValidator = _.cloneDeep(defaultValidator)
delete updateValidator.name.required
delete updateValidator.domain.required
delete updateValidator.userRef.required
delete updateValidator.type.required

export default {
  create: defaultValidator,
  update: updateValidator
}
