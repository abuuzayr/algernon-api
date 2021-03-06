import * as request from "supertest";
import * as nock from "nock";
import C from "../../config";
import express from "../../services/express";
import { User } from "../user/model";
import { PasswordReset } from "./model";
import routes from ".";

const app = () => express(routes);

let user, passwordReset;

beforeEach(async () => {
  nock("https://api.sendgrid.com").post("/v3/mail/send").reply(202);
  user = await User.create({
    email: "a@a.com",
    password: "123456",
    role: "store_admin",
    profile: {
      firstName: "Store",
      lastName: "Admin",
    }
  });
  passwordReset = await PasswordReset.create({ user });
});

afterEach(() => {
  nock.restore();
});

test("POST /password-resets 400 - missing email", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({ link: "http://example.com" });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("email");
});

test("POST /password-resets 400 - missing link", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({ email: "a@a.com" });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("link");
});

test("POST /password-resets 404", async () => {
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({ email: "b@b.com", link: "http://example.com" });
  expect(status).toBe(404);
});

test("POST /password-resets 400 - invalid email", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({ email: "invalid", link: "http://example.com" });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("email");
});

test("POST /password-resets 202", async () => {
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({ email: "a@a.com", link: "http://example.com" });
  expect(status).toBe(202);
});

test("GET /password-resets/:token 200", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get(`/${passwordReset.token}`);
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(typeof body.token).toBe("string");
  expect(typeof body.user).toBe("object");
  expect(body.user.id).toBe(user.id);
});

test("GET /password-resets/:token 404", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/123");
  expect(status).toBe(404);
});

test("PUT /password-resets/:token 200", async () => {
  await PasswordReset.create({ user });
  const x = await request(app(), C.manageDomain)
    .put(`/${passwordReset.token}`)
    .send({ password: "654321" });
  const [updatedUser, passwordResets] = await Promise.all([
    User.findById(passwordReset.user.id),
    PasswordReset.find({})
  ]);
  const { status, body } = x;
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.id).toBe(user.id);
  expect(passwordResets.length).toBe(0);
  expect(await updatedUser.authenticate("123456")).toBeFalsy();
  expect(await updatedUser.authenticate("654321")).toBeTruthy();
});

test("PUT /password-resets/:token 400 - invalid password", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put(`/${passwordReset.token}`)
    .send({ password: "321" });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("password");
});

test("PUT /password-resets/:token 400 - missing password", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put(`/${passwordReset.token}`);
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("password");
});

test("PUT /password-resets/:token 404", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put("/123")
    .send({ password: "654321" });
  expect(status).toBe(404);
});
