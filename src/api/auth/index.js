import { Router } from 'express'
import { login } from './controller'
import { password, facebook } from '../../services/passport'

const router = new Router()

router.post('/',
  password(),
  login)

router.post('/facebook',
  facebook(),
  login)

export default router
