import _ from 'lodash'
import { success, notFound } from '../../services/response/'
import { SalesChannel } from '.'

export const create = ({ bodymen: { body }, user }, res, next) => {
  const msg = 'You are not allowed to create SalesChannels for other users'
  if (user.role === 'store_admin' && user.id !== body.userRef) {
    res.status(401).json({
      valid: false,
      message: msg
    })
  }
  return SalesChannel.create(body)
    .then((salesChannel) => salesChannel.view(true))
    .then(success(res, 201))
    .catch(next)
}

export const index = ({ querymen: { query, select, cursor }, user }, res, next) =>
  SalesChannel.find(query, select, cursor)
    .then((salesChannels) => salesChannels.filter((sc) => sc.userRef + '' === user.id))
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

export const update = ({ bodymen: { body }, params, user }, res, next) =>
  SalesChannel.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      if (body.hasOwnProperty('type') && body.type !== result.type) {
        res.status(401).json({
          valid: false,
          message: 'SalesChannelType is not allowed to be modified by anyone.'
        })
        return null
      }
      if (user.role === 'super_admin') {
        return result
      }
      if (user.role === 'store_admin' && (result.userRef + '') === user.id) {
        if (body.hasOwnProperty('userRef') && body.userRef !== user.id) {
          res.status(401).json({
            valid: false,
            message: 'You have no rights to modify this data.'
          })
          return null
        }
        return result
      }
      res.status(401).json({
        valid: false,
        message: 'You have no rights to modify this data.'
      })
      return null
    })
    .then((salesChannel) => salesChannel ? _.merge(salesChannel, body).save() : null)
    .then((salesChannel) => salesChannel ? salesChannel.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params, user }, res, next) =>
  SalesChannel.findById(params.id)
    .then(notFound(res))
    .then((sc) => {
      if (user.role === 'super_admin' ||
        (user.role === 'store_admin' && (sc.userRef + '') === user.id)) {
        return sc
      }
      res.status(401).json({
        valid: false,
        message: 'You have no rights to delete this data.'
      })
      return null
    })
    .then((salesChannel) => salesChannel ? salesChannel.remove() : null)
    .then(success(res, 204))
    .catch(next)
