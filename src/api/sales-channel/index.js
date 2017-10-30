import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
export SalesChannel, { schema } from './model'

const router = new Router()
const { userRef, domain, name, type, siteData, emailTemplates, easyShip, facebook, sendGrid } = schema.tree

/**
 * @api {post} /sales-channels Create sales channel
 * @apiName CreateSalesChannel
 * @apiGroup SalesChannel
 * @apiPermission super_admin
 * @apiParam {String} access_token super_admin access token.
 * @apiParam userRef Sales channel's userRef.
 * @apiParam domain Sales channel's domain.
 * @apiParam name Sales channel's name.
 * @apiParam type Sales channel's type.
 * @apiParam siteData Sales channel's siteData.
 * @apiParam emailTemplates Sales channel's emailTemplates.
 * @apiParam easyShip Sales channel's easyShip.
 * @apiParam facebook Sales channel's facebook.
 * @apiParam sendGrid Sales channel's sendGrid.
 * @apiSuccess {Object} salesChannel Sales channel's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Sales channel not found.
 * @apiError 401 super_admin access only.
 */
router.post('/',
  token({ required: true, roles: ['super_admin'] }),
  body({ userRef, domain, name, type, siteData, emailTemplates, easyShip, facebook, sendGrid }),
  create)

/**
 * @api {get} /sales-channels Retrieve sales channels
 * @apiName RetrieveSalesChannels
 * @apiGroup SalesChannel
 * @apiPermission super_admin
 * @apiParam {String} access_token super_admin access token.
 * @apiUse listParams
 * @apiSuccess {Object[]} salesChannels List of sales channels.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 super_admin access only.
 */
router.get('/',
  token({ required: true, roles: ['super_admin'] }),
  query(),
  index)

/**
 * @api {get} /sales-channels/:id Retrieve sales channel
 * @apiName RetrieveSalesChannel
 * @apiGroup SalesChannel
 * @apiPermission super_admin
 * @apiParam {String} access_token super_admin access token.
 * @apiSuccess {Object} salesChannel Sales channel's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Sales channel not found.
 * @apiError 401 super_admin access only.
 */
router.get('/:id',
  token({ required: true, roles: ['super_admin', 'store_admin'] }),
  show)

/**
 * @api {put} /sales-channels/:id Update sales channel
 * @apiName UpdateSalesChannel
 * @apiGroup SalesChannel
 * @apiPermission super_admin
 * @apiParam {String} access_token super_admin access token.
 * @apiParam userRef Sales channel's userRef.
 * @apiParam domain Sales channel's domain.
 * @apiParam name Sales channel's name.
 * @apiParam type Sales channel's type.
 * @apiParam siteData Sales channel's siteData.
 * @apiParam emailTemplates Sales channel's emailTemplates.
 * @apiParam easyShip Sales channel's easyShip.
 * @apiParam facebook Sales channel's facebook.
 * @apiParam sendGrid Sales channel's sendGrid.
 * @apiSuccess {Object} salesChannel Sales channel's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Sales channel not found.
 * @apiError 401 super_admin access only.
 */
router.put('/:id',
  token({ required: true, roles: ['super_admin'] }),
  body({ userRef, domain, name, type, siteData, emailTemplates, easyShip, facebook, sendGrid }),
  update)

/**
 * @api {delete} /sales-channels/:id Delete sales channel
 * @apiName DeleteSalesChannel
 * @apiGroup SalesChannel
 * @apiPermission super_admin
 * @apiParam {String} access_token super_admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Sales channel not found.
 * @apiError 401 super_admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['super_admin'] }),
  destroy)

export default router
