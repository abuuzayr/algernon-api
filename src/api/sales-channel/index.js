import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
export SalesChannel, { schema } from './model'

const router = new Router()
const { userRef, domain, name, type, siteData, emailTemplates, easyShip, facebook, sendGrid } = schema.tree

router.post('/',
  token({ required: true, roles: ['super_admin', 'store_admin'] }),
  body({ userRef, domain, name, type, siteData, emailTemplates, easyShip, facebook, sendGrid }),
  create)

router.get('/',
  token({ required: true, roles: ['super_admin', 'store_admin'] }),
  query(),
  index)

router.get('/:id',
  token({ required: true, roles: ['super_admin', 'store_admin'] }),
  show)

router.put('/:id',
  token({ required: true, roles: ['super_admin'] }),
  body({ userRef, domain, name, type, siteData, emailTemplates, easyShip, facebook, sendGrid }),
  update)

router.delete('/:id',
  token({ required: true, roles: ['super_admin'] }),
  destroy)

export default router
