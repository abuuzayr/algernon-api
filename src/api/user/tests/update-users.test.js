import request from 'supertest'
import { signSync } from '../../../services/jwt'
import express from '../../../services/express'
import routes, { User } from '..'

const app = () => express(routes)

let storeAdmin1, superAdmin, session1, superAdminSession

beforeEach(async () => {
  storeAdmin1 = await User.create({
    name: 'store_admin',
    email: 'a@a.com',
    password: '123456',
    role: 'store_admin'
  })
  superAdmin = await User.create({
    email: 'c@c.com',
    password: '123456',
    role: 'super_admin'
  })

  session1 = signSync(storeAdmin1.id)
  superAdminSession = signSync(superAdmin.id)
})

// I can change my name as super_admin
test('PUT /users/me 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: superAdminSession, name: 'super_admin' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('super_admin')
})

// I can change my email as super_admin
test('PUT /users/me 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: superAdminSession, email: 'super_admin@example.com' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('super_admin@example.com')
})

// I can change my name as store_admin
test('PUT /users/me 200 (store_admin)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: session1, name: 'store_admin' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('store_admin')
})

// I can change my email as store_admin
test('PUT /users/me 200 (store_admin)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: session1, email: 'store_admin@example.com' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('store_admin@example.com')
})

// I cannot change anything as public
test('PUT /users/me 401', async () => {
  const { status } = await request(app())
    .put('/me')
    .send({ name: 'test' })
  expect(status).toBe(401)
})

// I can change a super_admin as super_admin
test('PUT /users/:id 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${superAdmin.id}`)
    .send({ access_token: superAdminSession, name: 'super_admin1' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('super_admin1')
})

// I can change a store_admin as super_admin
test('PUT /users/:id 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${storeAdmin1.id}`)
    .send({ access_token: superAdminSession, name: 'store_admin1' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('store_admin1')
})

// I cannot change anything as store_admin
test('PUT /users/:id 401 (store_admin)', async () => {
  const { status } = await request(app())
    .put(`/${storeAdmin1.id}`)
    .send({ access_token: session1, name: 'test' })
  expect(status).toBe(401)
})

// I cannot change anything by id as public user
test('PUT /users/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${storeAdmin1.id}`)
    .send({ name: 'test' })
  expect(status).toBe(401)
})

// I cannot change a non existing user by super_admin
test('PUT /users/:id 404 (super_admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: superAdminSession, name: 'test' })
  expect(status).toBe(404)
})

// I am not allowed to get what users are existing by store_admin
test('PUT /users/:id 401 (store_admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: session1, name: 'test' })
  expect(status).toBe(401)
})

const passwordMatch = async (password, userId) => {
  const user = await User.findById(userId)
  return !!await user.authenticate(password)
}

test('PUT /users/me/password 200 (store_admin)', async () => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
  expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /users/me/password 400 (store_admin) - invalid password', async () => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('PUT /users/me/password 401 (store_admin) - invalid authentication method', async () => {
  const { status } = await request(app())
    .put('/me/password')
    .send({ access_token: session1, password: '654321' })
  expect(status).toBe(401)
})

test('PUT /users/me/password 401', async () => {
  const { status } = await request(app())
    .put('/me/password')
    .send({ password: '654321' })
  expect(status).toBe(401)
})

test('PUT /users/:id/password 200 (store_admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${storeAdmin1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
  expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /users/:id/password 400 (store_admin) - invalid password', async () => {
  const { status, body } = await request(app())
    .put(`/${storeAdmin1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('PUT /users/:id/password 401 (store_admin) - another user', async () => {
  const { status } = await request(app())
    .put(`/${storeAdmin1.id}/password`)
    .auth('b@b.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(401)
})

test('PUT /users/:id/password 401 (store_admin) - invalid authentication method', async () => {
  const { status } = await request(app())
    .put(`/${storeAdmin1.id}/password`)
    .send({ access_token: session1, password: '654321' })
  expect(status).toBe(401)
})

test('PUT /users/:id/password 401', async () => {
  const { status } = await request(app())
    .put(`/${storeAdmin1.id}/password`)
    .send({ password: '654321' })
  expect(status).toBe(401)
})

test('PUT /users/:id/password 404 (store_admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(404)
})