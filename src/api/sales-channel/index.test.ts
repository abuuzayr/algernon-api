import * as request from "supertest";
import { signSync } from "../../services/jwt";
import express from "../../services/express";
import C from "../../config";
import { User } from "../user/model";
import { SalesChannel } from "./model";
import routes from ".";

const app = () => express(routes);

let userSession,
  userId,
  user2Id,
  user2Session,
  adminId,
  adminSession,
  salesChannel;

beforeEach(async () => {
  const user = await User.create({ email: "a@a.com", name: "store_admin1", password: "123456", role: "store_admin" });
  const user2 = await User.create({ email: "b@b.com", name: "store_admin2", password: "123456", role: "store_admin" });
  const admin = await User.create({ email: "c@c.com", name: "super_admin", password: "123456", role: "super_admin" });
  userId = user.id;
  user2Id = user2.id;
  userSession = signSync(userId);
  user2Session = signSync(user2Id);
  adminId = admin.id;
  adminSession = signSync(adminId);
  salesChannel = await SalesChannel.create({
    owner: userId,
    domain: "storeadmin.example.com",
    name: "test",
    type: "ecommerce"
  });
});

// Create sales_channel correctly with super_admin.
test("POST /sales-channels 201 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: adminSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(201);
  expect(typeof body).toEqual("object");
  expect(body.owner).toEqual(userId);
  expect(body.domain).toEqual(scdomain);
  expect(body.name).toEqual("test");
  expect(body.type).toEqual(sctype);
  expect(body.siteData).toEqual("test");
  expect(body.emailTemplates).toEqual("test");
  expect(body.easyShip).toEqual("test");
  expect(body.facebook).toEqual("test");
  expect(body.sendGrid).toEqual("test");
});

// Attempt to create with invalid domain with super_admin
test("POST /sales-channels 400 (super_admin)", async () => {
  const scdomain = "testexamplecom";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: adminSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Attempt to create with invalid sales channel with super_admin
test("POST /sales-channels 400 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "xxx";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: adminSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Attempt to create with invalid userref with super_admin
test("POST /sales-channels 400 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: adminSession,
      owner: "xxx",
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Attempt to create with invalid userref with super_admin
test("POST /sales-channels 400 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: adminSession,
      owner: adminId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// TODO: more restrictive acl for store_admin. Eg, Limiting number of
// stores for example.
// Create sales_channel correctly with store_admin.
test("POST /sales-channels 201 (store_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: userSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(201);
  expect(typeof body).toEqual("object");
  expect(body.owner).toEqual(userId);
  expect(body.domain).toEqual(scdomain);
  expect(body.name).toEqual("test");
  expect(body.type).toEqual(sctype);
  expect(body.siteData).toEqual("test");
  expect(body.emailTemplates).toEqual("test");
  expect(body.easyShip).toEqual("test");
  expect(body.facebook).toEqual("test");
  expect(body.sendGrid).toEqual("test");
});

// Attempt to create with invalid domain with store_admin
test("POST /sales-channels 400 (store_admin)", async () => {
  const scdomain = "testexamplecom";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: userSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Attempt to create with invalid sales channel with store_admin
test("POST /sales-channels 400 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "xxx";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: userSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Attempt to create userref thats not the same as my store_admin's id
// (super_admin's id)
test("POST /sales-channels 401 (store_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: userSession,
      owner: adminId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(401);
});

// Attempt to create userref thats not the same as my store_admin's id
// (another store_admin's id)
test("POST /sales-channels 401 (store_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: userSession,
      owner: user2Id,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(401);
});

// public are not allowed to create sales channel
test("POST /sales-channels 401", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(401);
});

// Able to get list of sales channels as super_admin
test("GET /sales-channels 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: adminSession });
  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
});

// Able to get list of sales channel as store_admin only for
// his sales channels.
test("GET /sales-channels 200 (store_admin)", async () => {
  await SalesChannel.create({
    owner: userId,
    domain: "storeadmin1.example.com",
    name: "test",
    type: "ecommerce"
  });
  await SalesChannel.create({
    owner: user2Id,
    domain: "storeadmin2.example.com",
    name: "test",
    type: "ecommerce"
  });
  const { status, body } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: userSession });
  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body.reduce((reduced, value) => {
    return reduced || value.owner === userId;
  }, true)).toBe(true);
});

// Unable to get list of sales channel as public
test("GET /sales-channels 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/");
  expect(status).toBe(401);
});

// Able to get info of any sales channel as super_admin
test("GET /sales-channels/:id 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get(`/${salesChannel.id}`)
    .query({ access_token: adminSession });
  expect(status).toBe(200);
  expect(typeof body).toEqual("object");
  expect(body.id).toEqual(salesChannel.id);
});

// Able to get information of my sales channel
test("GET /sales-channels/:id 200 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get(`/${salesChannel.id}`)
    .query({ access_token: userSession });
  expect(status).toBe(200);
});

// Not able to get information of others sales channel
test("GET /sales-channels/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get(`/${salesChannel.id}`)
    .query({ access_token: user2Session });
  expect(status).toBe(401);
});

test("GET /sales-channels/:id 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get(`/${salesChannel.id}`);
  expect(status).toBe(401);
});

// Able to modify sales channel by id as a super_admin
test("PUT /sales-channels/:id 200 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status, body } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: adminSession,
      owner: user2Id,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(200);
  expect(typeof body).toEqual("object");
  expect(body.id).toEqual(salesChannel.id);
  expect(body.owner).toEqual(user2Id);
  expect(body.domain).toEqual(scdomain);
  expect(body.name).toEqual("test");
  expect(body.type).toEqual(sctype);
  expect(body.siteData).toEqual("test");
  expect(body.emailTemplates).toEqual("test");
  expect(body.easyShip).toEqual("test");
  expect(body.facebook).toEqual("test");
  expect(body.sendGrid).toEqual("test");
});

// Cannot modify saleschannel by id as a super_admin (invalid domain)
test("PUT /sales-channels/:id 400 (super_admin)", async () => {
  const scdomain = "testexamplecom";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: adminSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Cannot modify saleschannel by id as a super_admin (invalid sctype)
test("PUT /sales-channels/:id 400 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommercess";
  const { status } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: adminSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// TODO: to test to modify the sctype fields. Not testable
// as there is only 1 sctype now.

// Cannot modify saleschannel by id as a super_admin
// (invalid sctype)
test("PUT /sales-channels/:id 400 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommercesss";
  const { status } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: adminSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Cannot modify saleschannel by id as a super_admin (invalid owner)
test("PUT /sales-channels/:id 400 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: adminSession,
      owner: "59f06076fe0ea41a2ae04536",
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Able to modify sales channel by id as a store_admin
// (my own sales channels only)
test("PUT /sales-channels/:id 200 (store_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status, body } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: userSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(200);
  expect(typeof body).toEqual("object");
  expect(body.id).toEqual(salesChannel.id);
  expect(body.owner).toEqual(userId);
  expect(body.domain).toEqual(scdomain);
  expect(body.name).toEqual("test");
  expect(body.type).toEqual(sctype);
  expect(body.siteData).toEqual("test");
  expect(body.emailTemplates).toEqual("test");
  expect(body.easyShip).toEqual("test");
  expect(body.facebook).toEqual("test");
  expect(body.sendGrid).toEqual("test");
});

// Cannot modify saleschannel by id as a store_admin (invalid domain)
test("PUT /sales-channels/:id 200 (store_admin)", async () => {
  const scdomain = "testexamplecom";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: userSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Cannot modify saleschannel by id as a store_admin
// (invalid sctype)
test("PUT /sales-channels/:id 400 (store_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommercess";
  const { status } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: userSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(400);
});

// Cannot modify saleschannel by id as a store_admin
// (not allowed to write to userref)
test("PUT /sales-channels/:id 401 (store_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`)
    .send({
      access_token: userSession,
      owner: user2Id,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(401);
});

// Cannot modify sc by id as public user
test("PUT /sales-channels/:id 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put(`/${salesChannel.id}`);
  expect(status).toBe(401);
});

// Cannot modify sc by non existent id (super_admin)
test("PUT /sales-channels/:id 404 (super_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .put("/123456789098765432123456")
    .send({
      access_token: adminSession,
      owner: user2Id,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(404);
});

// Cannot modify sc by non existent id (store_admin)
test("PUT /sales-channels/:id 404 (store_admin)", async () => {
  const scdomain = "test.example.com";
  const sctype = "ecommerce";
  const { status } = await request(app(), C.manageDomain)
    .put("/123456789098765432123456")
    .send({
      access_token: adminSession,
      owner: userId,
      domain: scdomain,
      name: "test",
      type: sctype,
      siteData: "test",
      emailTemplates: "test",
      easyShip: "test",
      facebook: "test",
      sendGrid: "test"
    });
  expect(status).toBe(404);
});

// Able to delete sc by id by super_admin
test("DELETE /sales-channels/:id 204 (super_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete(`/${salesChannel.id}`).query({ access_token: adminSession });
  expect(status).toBe(204);
});

// Able to delete sc by id by store_admin
test("DELETE /sales-channels/:id 204 (store_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .delete(`/${salesChannel.id}`).query({ access_token: userSession });
  expect(status).toBe(204);
});

// Not able to delete sc by id by store_admin if sc does not belongs to me
test("DELETE /sales-channels/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete(`/${salesChannel.id}`).query({ access_token: user2Session });
  expect(status).toBe(401);
});

// Not able to delete sc by id by public user
test("DELETE /sales-channels/:id 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete(`/${salesChannel.id}`);
  expect(status).toBe(401);
});

// Not able to delete non-existent sc (as super_admin)
test("DELETE /sales-channels/:id 404 (super_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete("/123456789098765432123456")
    .query({ access_token: adminSession });
  expect(status).toBe(404);
});

// Not able to delete non-existent sc (as store_admin)
test("DELETE /sales-channels/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete("/123456789098765432123456")
    .query({ access_token: userId });
  expect(status).toBe(401);
});