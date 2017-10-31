import { Router } from 'express'
import user from './user'
import auth from './auth'
import passwordReset from './password-reset'
import salesChannel from './sales-channel'

const router = new Router()

router.use('/users', user)
router.use('/auth', auth)
router.use('/password-resets', passwordReset)
router.use('/sales-channels', salesChannel)

export default router
