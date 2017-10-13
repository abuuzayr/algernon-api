import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { master } from '../../services/passport'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
export SalesChannel, { schema } from './model'

const router = new Router()
const { name, type, sub_domain, facebook, paypal, easy_ship, google_analytics, email_service, site_data, email_templates } = schema.tree

/**
 * @api {post} /sales-channels Create sales channel
 * @apiName CreateSalesChannel
 * @apiGroup SalesChannel
 * @apiPermission master
 * @apiParam {String} access_token master access token.
 * @apiParam name Sales channel's name.
 * @apiParam type Sales channel's type.
 * @apiParam sub_domain Sales channel's sub_domain.
 * @apiParam facebook Sales channel's facebook.
 * @apiParam paypal Sales channel's paypal.
 * @apiParam easy_ship Sales channel's easy_ship.
 * @apiParam google_analytics Sales channel's google_analytics.
 * @apiParam email_service Sales channel's email_service.
 * @apiParam site_data Sales channel's site_data.
 * @apiParam email_templates Sales channel's email_templates.
 * @apiSuccess {Object} salesChannel Sales channel's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Sales channel not found.
 * @apiError 401 master access only.
 */
router.post('/',
  master(),
  body({ name, type, sub_domain, facebook, paypal, easy_ship, google_analytics, email_service, site_data, email_templates }),
  create)

/**
 * @api {get} /sales-channels Retrieve sales channels
 * @apiName RetrieveSalesChannels
 * @apiGroup SalesChannel
 * @apiPermission master
 * @apiParam {String} access_token master access token.
 * @apiUse listParams
 * @apiSuccess {Object[]} salesChannels List of sales channels.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 master access only.
 */
router.get('/',
  master(),
  query(),
  index)

/**
 * @api {get} /sales-channels/:id Retrieve sales channel
 * @apiName RetrieveSalesChannel
 * @apiGroup SalesChannel
 * @apiPermission master
 * @apiParam {String} access_token master access token.
 * @apiSuccess {Object} salesChannel Sales channel's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Sales channel not found.
 * @apiError 401 master access only.
 */
router.get('/:id',
  master(),
  show)

/**
 * @api {put} /sales-channels/:id Update sales channel
 * @apiName UpdateSalesChannel
 * @apiGroup SalesChannel
 * @apiPermission master
 * @apiParam {String} access_token master access token.
 * @apiParam name Sales channel's name.
 * @apiParam type Sales channel's type.
 * @apiParam sub_domain Sales channel's sub_domain.
 * @apiParam facebook Sales channel's facebook.
 * @apiParam paypal Sales channel's paypal.
 * @apiParam easy_ship Sales channel's easy_ship.
 * @apiParam google_analytics Sales channel's google_analytics.
 * @apiParam email_service Sales channel's email_service.
 * @apiParam site_data Sales channel's site_data.
 * @apiParam email_templates Sales channel's email_templates.
 * @apiSuccess {Object} salesChannel Sales channel's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Sales channel not found.
 * @apiError 401 master access only.
 */
router.put('/:id',
  master(),
  body({ name, type, sub_domain, facebook, paypal, easy_ship, google_analytics, email_service, site_data, email_templates }),
  update)

/**
 * @api {delete} /sales-channels/:id Delete sales channel
 * @apiName DeleteSalesChannel
 * @apiGroup SalesChannel
 * @apiPermission master
 * @apiParam {String} access_token master access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Sales channel not found.
 * @apiError 401 master access only.
 */
router.delete('/:id',
  master(),
  destroy)

export default router
