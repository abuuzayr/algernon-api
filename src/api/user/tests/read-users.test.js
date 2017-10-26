import request from 'supertest'
import { signSync } from '../../../services/jwt'
import express from '../../../services/express'
import routes, { User } from '..'

const app = () => express(routes)

let storeAdmin1, storeAdmin2, superAdmin, session1, superAdminSession

beforeEach(async () => {
  storeAdmin1 = await User.create({
    name: 'store_admin',
    email: 'a@a.com',
    password: '123456',
    role: 'store_admin'
  })
  storeAdmin2 = await User.create({
    name: 'store_admin2',
    email: 'b@b.com',
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

// super_admin can see all users
test('GET /users 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: superAdminSession })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

// super_admin can see and paginate users
test('GET /users?page=2&limit=1 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: superAdminSession, page: 2, limit: 1 })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

// super_admin can see filtered users
test('GET /users?q=store_admin 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: superAdminSession, q: 'store_admin' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

// super_admin can choose to only get certain fields of users
test('GET /users?fields=name 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: superAdminSession, fields: 'name' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(Object.keys(body[0])).toEqual(['id', 'name'])
})

// store_admin cannot see all users
test('GET /users 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: session1 })
  expect(status).toBe(401)
})

// store_admin cannot see and paginate users
test('GET /users?page=2&limit=1 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: session1, page: 2, limit: 1 })
  expect(status).toBe(401)
})

// store_admin cannot see filtered users
test('GET /users?q=store_admin 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: session1, q: 'store_admin' })
  expect(status).toBe(401)
})

// super_admin cannot choose to only get certain fields of users
test('GET /users?fields=name 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: session1, fields: 'name' })
  expect(status).toBe(401)
})

// public cannot see all users
test('GET /users 401', async () => {
  const { status } = await request(app())
    .get('/')
  expect(status).toBe(401)
})

// public cannot see and paginate users
test('GET /users?page=2&limit=1 401', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ page: 2, limit: 1 })
  expect(status).toBe(401)
})

// public cannot see filtered users
test('GET /users?q=store_admin 401', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ q: 'store_admin' })
  expect(status).toBe(401)
})

// public cannot choose to only get certain fields of users
test('GET /users?fields=name 401', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ fields: 'name' })
  expect(status).toBe(401)
})

// super_admin can see herself
test('GET /users/me 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/me')
    .query({ access_token: superAdminSession })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(superAdmin.id)
})

// store_admin can see herself
test('GET /users/me 200 (store_admin)', async () => {
  const { status, body } = await request(app())
    .get('/me')
    .query({ access_token: session1 })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(storeAdmin1.id)
})

// public user cannot see herself.
test('GET /users/me 401', async () => {
  const { status } = await request(app())
    .get('/me')
  expect(status).toBe(401)
})

// super_admin can see any user
test('GET /users/:id 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get(`/${storeAdmin1.id}`)
    .query({ access_token: superAdminSession })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(storeAdmin1.id)
})

test('GET /users/:id 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get(`/${storeAdmin2.id}`)
    .query({ access_token: superAdminSession })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(storeAdmin2.id)
})

test('GET /users/:id 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get(`/${superAdmin.id}`)
    .query({ access_token: superAdminSession })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(superAdmin.id)
})

// store_admin cannot see any users by id, even herself
// Use /me instead.
test('GET /users/:id 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get(`/${storeAdmin1.id}`)
    .query({ access_token: session1 })
  expect(status).toBe(401)
})

test('GET /users/:id 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get(`/${storeAdmin2.id}`)
    .query({ access_token: session1 })
  expect(status).toBe(401)
})

test('GET /users/:id 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get(`/${superAdmin.id}`)
    .query({ access_token: session1 })
  expect(status).toBe(401)
})

// guessing the id is forbidden if you have no rights
test('GET /users/:id 401', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(401)
})

test('GET /users/:id 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
    .query({ access_token: session1 })
  expect(status).toBe(401)
})

// Finally return not found for those with rights.
test('GET /users/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
    .query({ access_token: superAdminSession })
  expect(status).toBe(404)
})
