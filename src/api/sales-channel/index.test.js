import request from 'supertest'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { SalesChannel } from '.'

const app = () => express(routes)

let userSession,
  userId,
  user2Session,
  adminId,
  adminSession,
  salesChannel

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', name: 'store_admin1', password: '123456', role: 'store_admin' })
  const user2 = await User.create({ email: 'b@b.com', name: 'store_admin2', password: '123456', role: 'store_admin' })
  const admin = await User.create({ email: 'c@c.com', name: 'super_admin', password: '123456', role: 'super_admin' })
  userId = user.id
  userSession = signSync(userId)
  user2Session = signSync(user2.id)
  adminId = admin.id
  adminSession = signSync(adminId)
  salesChannel = await SalesChannel.create({
    userRef: userId,
    domain: 'sadmin1.example.com',
    name: 'test',
    type: 'ecommerce'
  })
})

// Create sales_channel correctly.
test('POST /sales-channels 201 (super_admin)', async () => {
  const scdomain = 'test.example.com'
  const sctype = 'ecommerce'
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: adminSession,
      userRef: userId,
      domain: scdomain,
      name: 'test',
      type: sctype,
      siteData: 'test',
      emailTemplates: 'test',
      easyShip: 'test',
      facebook: 'test',
      sendGrid: 'test'
    })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.userRef).toEqual(userId)
  expect(body.domain).toEqual(scdomain)
  expect(body.name).toEqual('test')
  expect(body.type).toEqual(sctype)
  expect(body.siteData).toEqual('test')
  expect(body.emailTemplates).toEqual('test')
  expect(body.easyShip).toEqual('test')
  expect(body.facebook).toEqual('test')
  expect(body.sendGrid).toEqual('test')
})

// Attempt to create with invalid domain
test('POST /sales-channels 400 (super_admin)', async () => {
  const scdomain = 'testexamplecom'
  const sctype = 'ecommerce'
  const { status } = await request(app())
    .post('/')
    .send({
      access_token: adminSession,
      userRef: userId,
      domain: scdomain,
      name: 'test',
      type: sctype,
      siteData: 'test',
      emailTemplates: 'test',
      easyShip: 'test',
      facebook: 'test',
      sendGrid: 'test'
    })
  expect(status).toBe(400)
})

// Attempt to create with invalid sales channel
test('POST /sales-channels 400 (super_admin)', async () => {
  const scdomain = 'test.example.com'
  const sctype = 'xxx'
  const { status } = await request(app())
    .post('/')
    .send({
      access_token: adminSession,
      userRef: userId,
      domain: scdomain,
      name: 'test',
      type: sctype,
      siteData: 'test',
      emailTemplates: 'test',
      easyShip: 'test',
      facebook: 'test',
      sendGrid: 'test'
    })
  expect(status).toBe(400)
})

// Attempt to create with invalid userref
test('POST /sales-channels 400 (super_admin)', async () => {
  const scdomain = 'test.example.com'
  const sctype = 'xxx'
  const { status } = await request(app())
    .post('/')
    .send({
      access_token: adminSession,
      userRef: adminId,
      domain: scdomain,
      name: 'test',
      type: sctype,
      siteData: 'test',
      emailTemplates: 'test',
      easyShip: 'test',
      facebook: 'test',
      sendGrid: 'test'
    })
  expect(status).toBe(400)
})

// store_admin are not allowed to create sales channel
test('POST /sales-channels 401 (store_admin)', async () => {
  const scdomain = 'test.example.com'
  const sctype = 'ecommerce'
  const { status } = await request(app())
    .post('/')
    .send({
      access_token: userSession,
      userRef: userId,
      domain: scdomain,
      name: 'test',
      type: sctype,
      siteData: 'test',
      emailTemplates: 'test',
      easyShip: 'test',
      facebook: 'test',
      sendGrid: 'test'
    })
  expect(status).toBe(401)
})

// public are not allowed to create sales channel
test('POST /sales-channels 401', async () => {
  const scdomain = 'test.example.com'
  const sctype = 'ecommerce'
  const { status } = await request(app())
    .post('/')
    .send({
      userRef: userId,
      domain: scdomain,
      name: 'test',
      type: sctype,
      siteData: 'test',
      emailTemplates: 'test',
      easyShip: 'test',
      facebook: 'test',
      sendGrid: 'test'
    })
  expect(status).toBe(401)
})

// Able to get list of sales channels
test('GET /sales-channels 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

// Unable to get list of sales channel as store_admin
test('GET /sales-channels 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

// Unable to get list of sales channel as public
test('GET /sales-channels 401', async () => {
  const { status } = await request(app())
    .get('/')
  expect(status).toBe(401)
})

// Able to get info of any sales channel as super_admin
test('GET /sales-channels/:id 200 (super_admin)', async () => {
  const { status, body } = await request(app())
    .get(`/${salesChannel.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(salesChannel.id)
})

// Able to get information of my sales channel
test('GET /sales-channels/:id 200 (store_admin)', async () => {
  const { status } = await request(app())
    .get(`/${salesChannel.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(200)
})

// Not able to get information of others sales channel
test('GET /sales-channels/:id 401 (store_admin)', async () => {
  const { status } = await request(app())
    .get(`/${salesChannel.id}`)
    .query({ access_token: user2Session })
  expect(status).toBe(401)
})

test('GET /sales-channels/:id 401', async () => {
  const { status } = await request(app())
    .get(`/${salesChannel.id}`)
  expect(status).toBe(401)
})

/*

test('PUT /sales-channels/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${salesChannel.id}`)
    .send({ access_token: adminSession, userRef: 'test', domain: 'test', name: 'test', type: 'test', siteData: 'test', emailTemplates: 'test', easyShip: 'test', facebook: 'test', sendGrid: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(salesChannel.id)
  expect(body.userRef).toEqual('test')
  expect(body.domain).toEqual('test')
  expect(body.name).toEqual('test')
  expect(body.type).toEqual('test')
  expect(body.siteData).toEqual('test')
  expect(body.emailTemplates).toEqual('test')
  expect(body.easyShip).toEqual('test')
  expect(body.facebook).toEqual('test')
  expect(body.sendGrid).toEqual('test')
})

test('PUT /sales-channels/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`/${salesChannel.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /sales-channels/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${salesChannel.id}`)
  expect(status).toBe(401)
})

test('PUT /sales-channels/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: adminSession, userRef: 'test', domain: 'test', name: 'test', type: 'test', siteData: 'test', emailTemplates: 'test', easyShip: 'test', facebook: 'test', sendGrid: 'test' })
  expect(status).toBe(404)
})

test('DELETE /sales-channels/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`/${salesChannel.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /sales-channels/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${salesChannel.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /sales-channels/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${salesChannel.id}`)
  expect(status).toBe(401)
})

test('DELETE /sales-channels/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
*/
