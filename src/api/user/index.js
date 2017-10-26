import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { password as passwordAuth, token } from '../../services/passport'
import { index, showMe, show, create, update, updateMe, updatePassword, destroy } from './controller'
import v from './validator'
export validator from './validator'
export User, { schema } from './model'

const router = new Router()

/**
 * @api {get} /users Retrieve users
 * @apiName RetrieveUsers
 * @apiGroup User
 * @apiPermission super_admin
 * @apiParam {String} access_token User access_token.
 * @apiUse listParams
 * @apiSuccess {Object[]} users List of users.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 super_admin access only.
 */
router.get('/',
  token({ required: true, roles: ['super_admin'] }),
  query(),
  index)

/**
 * @api {get} /users/me Retrieve current user
 * @apiName RetrieveCurrentUser
 * @apiGroup User
 * @apiPermission store_admin
 * @apiParam {String} access_token User access_token.
 * @apiSuccess {Object} user User's data.
 */
router.get('/me',
  token({ required: true }),
  showMe)

/**
 * @api {get} /users/:id Retrieve user
 * @apiName RetrieveUser
 * @apiGroup User
 * @apiPermission public
 * @apiSuccess {Object} user User's data.
 * @apiError 404 User not found.
 */
router.get('/:id',
  token({ required: true, roles: ['super_admin'] }),
  show)

/**
 * @api {post} /users Create user
 * @apiName CreateUser
 * @apiGroup User
 * @apiPermission token
 * @apiParam {String} access_token token jwt token.
 * @apiParam {String} email User's email.
 * @apiParam {String{6..}} password User's password.
 * @apiParam {String} [name] User's name.
 * @apiParam {String} [picture] User's picture.
 * @apiParam {String=store_admin,super_admin} [role=store_admin] User's picture.
 * @apiSuccess (Sucess 201) {Object} user User's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 token access only.
 * @apiError 409 Email already registered.
 */
router.post('/',
  token({ required: true, roles: ['super_admin'] }),
  body(v.create),
  create)

/**
 * @api {put} /users/me Update current user
 * @apiName UpdateUser
 * @apiGroup User
 * @apiPermission store_admin, super_admin
 * @apiParam {String} access_token User access_token.
 * @apiParam {String} [name] User's name.
 * @apiParam {String} [picture] User's picture.
 * @apiSuccess {Object} user User's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Current user access only.
 * @apiError 404 User not found.
 */
router.put('/me',
  token({ required: true }),
  body(v.updateMe),
  updateMe)

/**
 * @api {put} /users/:id Update user
 * @apiName UpdateUser
 * @apiGroup User
 * @apiPermission super_admin
 * @apiParam {String} access_token User access_token.
 * @apiParam {String} [name] User's name.
 * @apiParam {String} [picture] User's picture.
 * @apiSuccess {Object} user User's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 super_admin access only.
 * @apiError 404 User not found.
 */
router.put('/:id',
  token({ required: true, roles: ['super_admin'] }),
  body(v.update),
  update)

/**
 * @api {put} /users/:id/password Update password
 * @apiName UpdatePassword
 * @apiGroup User
 * @apiHeader {String} Authorization Basic authorization with email and password.
 * @apiParam {String{6..}} password User's new password.
 * @apiSuccess (Success 201) {Object} user User's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Current user access only.
 * @apiError 404 User not found.
 */
router.put('/:id/password',
  passwordAuth(),
  body(v.updatePassword),
  updatePassword)

/**
 * @api {delete} /users/:id Delete user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiPermission super_admin
 * @apiParam {String} access_token User access_token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 401 super_admin access only.
 * @apiError 404 User not found.
 */
router.delete('/:id',
  token({ required: true, roles: ['super_admin'] }),
  destroy)

export default router
