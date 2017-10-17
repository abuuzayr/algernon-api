import request from 'supertest'
import { signSync } from '../../../services/jwt'
import express from '../../../services/express'
import routes, { User } from '..'

const app = () => express(routes)

let storeAdmin1, superAdmin, session1, superAdminSession

beforeEach(async () => {
  storeAdmin1 = await User.create({ name: 'store_admin', email: 'a@a.com', password: '123456' })
  superAdmin = await User.create({ email: 'c@c.com', password: '123456', role: 'super_admin' })
  session1 = signSync(storeAdmin1.id)
  superAdminSession = signSync(superAdmin.id)
})

test('DELETE /users/:id 204 (super_admin)', async () => {
  const { status } = await request(app())
    .delete(`/${storeAdmin1.id}`)
    .send({ access_token: superAdminSession })
  expect(status).toBe(204)
})

test('DELETE /users/:id 401 (store_admin)', async () => {
  const { status } = await request(app())
    .delete(`/${storeAdmin1.id}`)
    .send({ access_token: session1 })
  expect(status).toBe(401)
})

test('DELETE /users/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${storeAdmin1.id}`)
  expect(status).toBe(401)
})

test('DELETE /users/:id 404 (super_admin)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .send({ access_token: superAdminSession })
  expect(status).toBe(404)
})
