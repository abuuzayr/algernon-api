import request from 'supertest-as-promised'
import { apiKey } from '../../config'
import express from '../../services/express'
import routes, { SalesChannel } from '.'

const app = () => express(routes)

let salesChannel

beforeEach(async () => {
  salesChannel = await SalesChannel.create({
    name: 'test',
    type: 'ecommerce',
    sub_domain: 'test'
  })
})

test('POST /sales-channels 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: apiKey,
      name: 'test1',
      type: 'ecommerce',
      sub_domain: 'test1'
    })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test1')
  expect(body.type).toEqual('ecommerce')
  expect(body.sub_domain).toEqual('test1')
})

test('POST /sales-channels 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /sales-channels 200 (master)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: apiKey })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /sales-channels 401', async () => {
  const { status } = await request(app())
    .get('/')
  expect(status).toBe(401)
})

test('GET /sales-channels/:id 200 (master)', async () => {
  const { status, body } = await request(app())
    .get(`/${salesChannel.id}`)
    .query({ access_token: apiKey })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(salesChannel.id)
})

test('GET /sales-channels/:id 401', async () => {
  const { status } = await request(app())
    .get(`/${salesChannel.id}`)
  expect(status).toBe(401)
})

test('GET /sales-channels/:id 404 (master)', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
    .query({ access_token: apiKey })
  expect(status).toBe(404)
})

test('PUT /sales-channels/:id 200 (master)', async () => {
  const { status, body } = await request(app())
    .put(`/${salesChannel.id}`)
    .send({
      access_token: apiKey,
      name: 'test2',
      type: 'marketplace',
      sub_domain: 'test2' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(salesChannel.id)
  expect(body.name).toEqual('test2')
  expect(body.type).toEqual('marketplace')
  expect(body.sub_domain).toEqual('test2')
})

test('PUT /sales-channels/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${salesChannel.id}`)
  expect(status).toBe(401)
})

test('PUT /sales-channels/:id 404 (master)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({
      access_token: apiKey,
      name: 'test1',
      type: 'ecommerce',
      sub_domain: 'test1'})
  expect(status).toBe(404)
})

test('DELETE /sales-channels/:id 204 (master)', async () => {
  const { status } = await request(app())
    .delete(`/${salesChannel.id}`)
    .query({ access_token: apiKey })
  expect(status).toBe(204)
})

test('DELETE /sales-channels/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${salesChannel.id}`)
  expect(status).toBe(401)
})

test('DELETE /sales-channels/:id 404 (master)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: apiKey })
  expect(status).toBe(404)
})
