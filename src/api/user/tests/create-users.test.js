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

// super_admin can create users (by default store_admins)
test('POST /users 201 (super_admin)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: superAdminSession,
      email: 'd@d.com',
      password: '123456'
    })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

// super_admin can create store_admins
test('POST /users 201 (super_admin)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: superAdminSession,
      email: 'd@d.com',
      password: '123456',
      role: 'store_admin'
    })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

// super_admin can create super_admins
test('POST /users 201 (super_admin)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: superAdminSession,
      email: 'd@d.com',
      password: '123456',
      role: 'super_admin'
    })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

// super_admin attempts creating account with duplicated email
test('POST /users 409 (super_admin) - duplicated email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: superAdminSession,
      email: 'a@a.com',
      password: '123456'
    })
  expect(status).toBe(409)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

// super_admin attempts creating account with invalid email
test('POST /users 400 (super_admin) - invalid email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: superAdminSession,
      email: 'invalid',
      password: '123456'
    })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

// super_admin attempts creating account with missing email
test('POST /users 400 (super_admin) - missing email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: superAdminSession, password: '123456' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

// super_admin attempts creating account with invalid_password
test('POST /users 400 (super_admin) - invalid password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: superAdminSession, email: 'd@d.com', password: '123' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

// super_admin attempts creating account with missing_password
test('POST /users 400 (super_admin) - missing password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: superAdminSession, email: 'd@d.com' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

// super_admin attempts creating account with invalid role
test('POST /users 400 (super_admin) - invalid role', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: superAdminSession,
      email: 'd@d.com',
      password: '123456',
      role: 'invalid'
    })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('role')
})

// store_admin cannot create user
test('POST /users 401 (store_admin)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: session1, email: 'd@d.com', password: '123456' })
  expect(status).toBe(401)
})

// public cannot create user
test('POST /users 401', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ email: 'd@d.com', password: '123456' })
  expect(status).toBe(401)
})

