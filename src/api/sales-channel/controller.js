import _ from 'lodash'
import { success, notFound } from '../../services/response/'
import { SalesChannel } from '.'

export const create = ({ bodymen: { body }, user }, res, next) => {
  if (user.role === 'store_admin' && user.id !== body.userRef) {
    res.status(401).json({
      valid: false,
      message: 'You are not allowed to create SalesChannels for other users'
    })
    return
  }
  SalesChannel.create(body)
    .then((salesChannel) => salesChannel.view(true))
    .then(success(res, 201))
    .catch(next)
}

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  SalesChannel.find(query, select, cursor)
    .then((salesChannels) => salesChannels.map((salesChannel) => salesChannel.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params, user }, res, next) =>
  SalesChannel.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      if (user.role === 'super_admin' ||
        (user.role === 'store_admin' && (result.userRef + '') === user.id)) {
        return result
      }
      res.status(401).json({
        valid: false,
        message: 'You do not have access to this data.'
      })
      return null
    })
    .then((salesChannel) => salesChannel ? salesChannel.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  SalesChannel.findById(params.id)
    .then(notFound(res))
    .then((salesChannel) => salesChannel ? _.merge(salesChannel, body).save() : null)
    .then((salesChannel) => salesChannel ? salesChannel.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  SalesChannel.findById(params.id)
    .then(notFound(res))
    .then((salesChannel) => salesChannel ? salesChannel.remove() : null)
    .then(success(res, 204))
    .catch(next)
