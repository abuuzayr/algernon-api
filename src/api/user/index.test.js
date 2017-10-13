import request from 'supertest-as-promised'
import { masterKey } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import routes, { User } from '.'

const app = () => express(routes)

let storeAdmin1, storeAdmin2, superAdmin, session1, session2, superAdminSession

beforeEach(async () => {
  storeAdmin1 = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })
  storeAdmin2 = await User.create({ name: 'user', email: 'b@b.com', password: '123456' })
  superAdmin = await User.create({ email: 'c@c.com', password: '123456', role: 'super_admin' })
  session1 = signSync(storeAdmin1.id)
  session2 = signSync(storeAdmin2.id)
  superAdminSession = signSync(superAdmin.id)
})

test('GET /users 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: superAdminSession })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /users?page=2&limit=1 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: superAdminSession, page: 2, limit: 1 })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /users?q=user 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: superAdminSession, q: 'user' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(2)
})

test('GET /users?fields=name 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: superAdminSession, fields: 'name' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(Object.keys(body[0])).toEqual(['id', 'name'])
})

test('GET /users 401 (user)', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: session1 })
  expect(status).toBe(401)
})

test('GET /users 401', async () => {
  const { status } = await request(app())
    .get('/')
  expect(status).toBe(401)
})

test('GET /users/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .get('/me')
    .query({ access_token: session1 })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(storeAdmin1.id)
})

test('GET /users/me 401', async () => {
  const { status } = await request(app())
    .get('/me')
  expect(status).toBe(401)
})

test('GET /users/:id 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get(`/${storeAdmin1.id}`)
    .query({ access_token: superAdminSession })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(storeAdmin1.id)
})

test('GET /users/:id 404 (super_admin)', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
    .query({ access_token: superAdminSession })
  expect(status).toBe(404)
})

test('GET /users/:id 401 (user)', async () => {
  const { status } = await request(app())
    .get(`/${storeAdmin1.id}`)
    .query({ access_token: session1 })
  expect(status).toBe(401)
})

test('GET /users/:id 401', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(401)
})

test('POST /users 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

test('POST /users 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'store_admin' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

test('POST /users 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'super_admin' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('d@d.com')
})

test('POST /users 409 (master) - duplicated email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'a@a.com', password: '123456' })
  expect(status).toBe(409)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

test('POST /users 400 (master) - invalid email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'invalid', password: '123456' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

test('POST /users 400 (master) - missing email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, password: '123456' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('email')
})

test('POST /users 400 (master) - invalid password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('POST /users 400 (master) - missing password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('POST /users 400 (master) - invalid role', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'invalid' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('role')
})

test('POST /users 401 (super_admin)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: superAdminSession, email: 'd@d.com', password: '123456' })
  expect(status).toBe(401)
})

test('POST /users 401 (user)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: session1, email: 'd@d.com', password: '123456' })
  expect(status).toBe(401)
})

test('POST /users 401', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ email: 'd@d.com', password: '123456' })
  expect(status).toBe(401)
})

test('PUT /users/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: session1, name: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('test')
})

test('PUT /users/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: session1, email: 'test@test.com' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
})

test('PUT /users/me 401', async () => {
  const { status } = await request(app())
    .put('/me')
    .send({ name: 'test' })
  expect(status).toBe(401)
})

test('PUT /users/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${storeAdmin1.id}`)
    .send({ access_token: session1, name: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('test')
})

test('PUT /users/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${storeAdmin1.id}`)
    .send({ access_token: session1, email: 'test@test.com' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
})

test('PUT /users/:id 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${storeAdmin1.id}`)
    .send({ access_token: superAdminSession, name: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.name).toBe('test')
})

test('PUT /users/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${storeAdmin1.id}`)
    .send({ access_token: session2, name: 'test' })
  expect(status).toBe(401)
})

test('PUT /users/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${storeAdmin1.id}`)
    .send({ name: 'test' })
  expect(status).toBe(401)
})

test('PUT /users/:id 404 (super_admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: superAdminSession, name: 'test' })
  expect(status).toBe(404)
})

const passwordMatch = async (password, userId) => {
  const user = await User.findById(userId)
  return !!await user.authenticate(password)
}

test('PUT /users/me/password 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
  expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /users/me/password 400 (user) - invalid password', async () => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('PUT /users/me/password 401 (user) - invalid authentication method', async () => {
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

test('PUT /users/:id/password 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${storeAdmin1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.email).toBe('a@a.com')
  expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /users/:id/password 400 (user) - invalid password', async () => {
  const { status, body } = await request(app())
    .put(`/${storeAdmin1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('password')
})

test('PUT /users/:id/password 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${storeAdmin1.id}/password`)
    .auth('b@b.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(401)
})

test('PUT /users/:id/password 401 (user) - invalid authentication method', async () => {
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

test('PUT /users/:id/password 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toBe(404)
})

test('DELETE /users/:id 204 (super_admin)', async () => {
  const { status } = await request(app())
    .delete(`/${storeAdmin1.id}`)
    .send({ access_token: superAdminSession })
  expect(status).toBe(204)
})

test('DELETE /users/:id 401 (user)', async () => {
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
