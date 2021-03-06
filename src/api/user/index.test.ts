import *  as request from "supertest";
import C from "../../config";
import { signSync } from "../../services/jwt";
import express from "../../services/express";
import { User } from "./model";
import routes from ".";

const app = () => express(routes);

let storeAdmin1, storeAdmin2, superAdmin, session1, superAdminSession;

beforeEach(async () => {
  storeAdmin1 = await User.create({
    profile: {
      firstName: "Store",
      lastName: "Admin",
    },
    email: "a@a.com",
    password: "123456",
    role: "store_admin"
  });
  storeAdmin2 = await User.create({
    profile: {
      firstName: "Store",
      lastName: "Admin 2",
    },
    email: "b@b.com",
    password: "123456",
    role: "store_admin"
  });
  superAdmin = await User.create({
    profile: {
      firstName: "Super",
      lastName: "Admin 2",
    },
    email: "c@c.com",
    password: "123456",
    role: "super_admin"
  });

  session1 = signSync(storeAdmin1.id);
  superAdminSession = signSync(superAdmin.id);
});

// super_admin can create store_admins
test("POST /users 201 (super_admin)", async () => {
  const x = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      email: "d@d.com",
      password: "123456",
      role: "store_admin",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  const { status, body } = x;
  expect(status).toBe(201);
  expect(typeof body).toBe("object");
  expect(body.email).toBe("d@d.com");
});

// super_admin can create super_admins
test("POST /users 201 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      email: "d@d.com",
      password: "123456",
      role: "super_admin",
      profile: {
        firstName: "Super",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(201);
  expect(typeof body).toBe("object");
  expect(body.email).toBe("d@d.com");
});
// super_admin attempts creating account with duplicated email
test("POST /users 409 (super_admin) - duplicated email", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      email: "a@a.com",
      password: "123456",
      role: "store_admin",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(409);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("email");
});

// super_admin attempts creating account with invalid email
test("POST /users 400 (super_admin) - invalid email", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      email: "invalid",
      password: "123456",
      role: "store_admin",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("email");
});

// super_admin attempts creating account with missing email
test("POST /users 400 (super_admin) - missing email", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      password: "123456",
      role: "store_admin",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("email");
});

// super_admin attempts creating account with invalid_password
test("POST /users 400 (super_admin) - invalid password", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      email: "d@d.com",
      password: "123",
      role: "store_admin",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("password");
});

// super_admin attempts creating account with missing_password
test("POST /users 400 (super_admin) - missing password", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      email: "d@d.com",
      role: "store_admin",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("password");
});

// super_admin attempts creating account with invalid role
test("POST /users 400 (super_admin) - invalid role", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      email: "d@d.com",
      password: "123456",
      role: "invalid",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("role");
});

// super_admin attempts creating account with no profile
test("POST /users 400 (super_admin) - no profile", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: superAdminSession,
      role: "store_admin",
      email: "d@d.com",
      password: "123456",
    });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  // TODO: Test no profile.
});

// store_admin cannot create store_admin
test("POST /users 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: session1,
      email: "d@d.com",
      password: "123456",
      role: "store_admin",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(401);
});

// store_admin cannot create super_admin
test("POST /users 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      access_token: session1,
      email: "d@d.com",
      password: "123456",
      role: "super_admin",
      profile: {
        firstName: "Super",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(401);
});

// public cannot create super_admin
test("POST /users 401 (public)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      email: "d@d.com",
      password: "123456",
      role: "super_admin",
      profile: {
        firstName: "Super",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(401);
});

// public cannot create store_admin
test("POST /users 401 (public)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .post("/")
    .send({
      email: "d@d.com",
      password: "123456",
      role: "store_admin",
      profile: {
        firstName: "Store",
        lastName: "Admin 3",
      }
    });
  expect(status).toBe(401);
});

// super_admin can see all users
test("GET /users 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: superAdminSession });
  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
});

// super_admin can see and paginate users
test("GET /users?page=2&limit=1 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: superAdminSession, page: 2, limit: 1 });
  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(1);
});

// super_admin can see filter users by name
test("GET /users?q=store_admin 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: superAdminSession, q: "Store" });
  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(2);
});

// super_admin can choose to only get certain fields of users
test("GET /users?fields=name 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: superAdminSession, fields: "profile.firstName,profile.lastName" });
  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(Object.keys(body[0])).toEqual(["id", "profile"]);
  expect(Object.keys(body[0].profile).sort()).toEqual(["firstName", "lastName"]);
});

// store_admin cannot see all users
test("GET /users 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: session1 });
  expect(status).toBe(401);
});

// store_admin cannot see and paginate users
test("GET /users?page=2&limit=1 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: session1, page: 2, limit: 1 });
  expect(status).toBe(401);
});

// store_admin cannot filter users by name
test("GET /users?q=store_admin 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: session1, q: "store_admin" });
  expect(status).toBe(401);
});

// super_admin cannot choose to only get certain fields of users
test("GET /users?fields=name 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/")
    .query({ access_token: session1, fields: "name" });
  expect(status).toBe(401);
});

// public cannot see all users
test("GET /users 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/");
  expect(status).toBe(401);
});

// public cannot see and paginate users
test("GET /users?page=2&limit=1 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/")
    .query({ page: 2, limit: 1 });
  expect(status).toBe(401);
});

// public cannot see filter users by name
test("GET /users?q=store_admin 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/")
    .query({ q: "store_admin" });
  expect(status).toBe(401);
});

// public cannot choose to only get certain fields of users
test("GET /users?fields=name 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/")
    .query({ fields: "name" });
  expect(status).toBe(401);
});

// super_admin can see herself
test("GET /users/me 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get("/me")
    .query({ access_token: superAdminSession });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.id).toBe(superAdmin.id);
});

// store_admin can see herself
test("GET /users/me 200 (store_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get("/me")
    .query({ access_token: session1 });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.id).toBe(storeAdmin1.id);
});

// public user cannot see herself.
test("GET /users/me 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/me");
  expect(status).toBe(401);
});

// super_admin can see any user
test("GET /users/:id 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get(`/${storeAdmin1.id}`)
    .query({ access_token: superAdminSession });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.id).toBe(storeAdmin1.id);
});

test("GET /users/:id 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get(`/${storeAdmin2.id}`)
    .query({ access_token: superAdminSession });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.id).toBe(storeAdmin2.id);
});

test("GET /users/:id 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .get(`/${superAdmin.id}`)
    .query({ access_token: superAdminSession });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.id).toBe(superAdmin.id);
});

// store_admin cannot see any users by id, even herself
// Use /me instead.
test("GET /users/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get(`/${storeAdmin1.id}`)
    .query({ access_token: session1 });
  expect(status).toBe(401);
});

test("GET /users/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get(`/${storeAdmin2.id}`)
    .query({ access_token: session1 });
  expect(status).toBe(401);
});

test("GET /users/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get(`/${superAdmin.id}`)
    .query({ access_token: session1 });
  expect(status).toBe(401);
});

// guessing the id is forbidden if you have no rights
test("GET /users/:id 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/123456789098765432123456");
  expect(status).toBe(401);
});

test("GET /users/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/123456789098765432123456")
    .query({ access_token: session1 });
  expect(status).toBe(401);
});

// Finally return not found for those with rights.
test("GET /users/:id 404", async () => {
  const { status } = await request(app(), C.manageDomain)
    .get("/123456789098765432123456")
    .query({ access_token: superAdminSession });
  expect(status).toBe(404);
});

// I can change my name as super_admin
test("PUT /users/me 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put("/me")
    .send({
      access_token: superAdminSession,
      profile: {
        firstName: "Super!",
        lastName: "Admin!",
      }
    });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.profile.firstName).toBe("Super!");
  expect(body.profile.lastName).toBe("Admin!");
});

// I can change my email as super_admin
test("PUT /users/me 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put("/me")
    .send({ access_token: superAdminSession, email: "super_admin1@example.com" });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.email).toBe("super_admin1@example.com");
});

// I can change my name as store_admin
test("PUT /users/me 200 (store_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put("/me")
    .send({
      access_token: session1,
      profile: {
        firstName: "Store123",
        lastName: "Admin123",
      }
    });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(typeof body.profile).toBe("object");
  expect(body.profile.firstName).toBe("Store123");
  expect(body.profile.lastName).toBe("Admin123");
});

// I can change my email as store_admin
test("PUT /users/me 200 (store_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put("/me")
    .send({ access_token: session1, email: "store_admin@example.com" });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.email).toBe("store_admin@example.com");
});

// I cannot change anything as public
test("PUT /users/me 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put("/me")
    .send({ name: "test" });
  expect(status).toBe(401);
});

// I can change a super_admin as super_admin
test("PUT /users/:id 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put(`/${superAdmin.id}`)
    .send({
      access_token: superAdminSession,
      profile: {
        firstName: "Super123",
        lastName: "Admin123",
      }
    });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(typeof body.profile).toBe("object");
  expect(body.profile.firstName).toBe("Super123");
  expect(body.profile.lastName).toBe("Admin123");
});

// I can change a store_admin as super_admin
test("PUT /users/:id 200 (super_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put(`/${storeAdmin1.id}`)
    .send({
      access_token: superAdminSession,
      profile: {
        firstName: "Store321",
        lastName: "Admin321",
      }
    });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(typeof body.profile).toBe("object");
  expect(body.profile.firstName).toBe("Store321");
  expect(body.profile.lastName).toBe("Admin321");
});

// I cannot change anything as store_admin
test("PUT /users/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put(`/${storeAdmin1.id}`)
    .send({ access_token: session1, name: "test" });
  expect(status).toBe(401);
});

// I cannot change anything by id as public user
test("PUT /users/:id 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put(`/${storeAdmin1.id}`)
    .send({ name: "test" });
  expect(status).toBe(401);
});

// I cannot change a non existing user by super_admin
test("PUT /users/:id 404 (super_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put("/123456789098765432123456")
    .send({ access_token: superAdminSession, name: "test" });
  expect(status).toBe(404);
});

// I am not allowed to get what users are existing by store_admin
test("PUT /users/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put("/123456789098765432123456")
    .send({ access_token: session1, name: "test" });
  expect(status).toBe(401);
});

const passwordMatch = async (password, userId) => {
  const user = await User.findById(userId);
  return !!await user.authenticate(password);
};

test("PUT /users/me/password 200 (store_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put("/me/password")
    .auth("a@a.com", "123456")
    .send({ password: "654321" });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.email).toBe("a@a.com");
  expect(await passwordMatch("654321", body.id)).toBe(true);
});

test("PUT /users/me/password 400 (store_admin) - invalid password", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put("/me/password")
    .auth("a@a.com", "123456")
    .send({ password: "321" });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("password");
});

test("PUT /users/me/password 401 (store_admin) - invalid authentication method", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put("/me/password")
    .send({ access_token: session1, password: "654321" });
  expect(status).toBe(401);
});

test("PUT /users/me/password 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put("/me/password")
    .send({ password: "654321" });
  expect(status).toBe(401);
});

test("PUT /users/:id/password 200 (store_admin)", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put(`/${storeAdmin1.id}/password`)
    .auth("a@a.com", "123456")
    .send({ password: "654321" });
  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.email).toBe("a@a.com");
  expect(await passwordMatch("654321", body.id)).toBe(true);
});

test("PUT /users/:id/password 400 (store_admin) - invalid password", async () => {
  const { status, body } = await request(app(), C.manageDomain)
    .put(`/${storeAdmin1.id}/password`)
    .auth("a@a.com", "123456")
    .send({ password: "321" });
  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.errors).toBe("object");
  expect(body.errors).toHaveProperty("password");
});

test("PUT /users/:id/password 401 (store_admin) - another user", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put(`/${storeAdmin1.id}/password`)
    .auth("b@b.com", "123456")
    .send({ password: "654321" });
  expect(status).toBe(401);
});

test("PUT /users/:id/password 401 (store_admin) - invalid authentication method", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put(`/${storeAdmin1.id}/password`)
    .send({ access_token: session1, password: "654321" });
  expect(status).toBe(401);
});

test("PUT /users/:id/password 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put(`/${storeAdmin1.id}/password`)
    .send({ password: "654321" });
  expect(status).toBe(401);
});

test("PUT /users/:id/password 404 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .put("/123456789098765432123456/password")
    .auth("a@a.com", "123456")
    .send({ password: "654321" });
  expect(status).toBe(404);
});

test("DELETE /users/:id 204 (super_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete(`/${storeAdmin1.id}`)
    .send({ access_token: superAdminSession });
  expect(status).toBe(204);
});

test("DELETE /users/:id 401 (store_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete(`/${storeAdmin1.id}`)
    .send({ access_token: session1 });
  expect(status).toBe(401);
});

test("DELETE /users/:id 401", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete(`/${storeAdmin1.id}`);
  expect(status).toBe(401);
});

test("DELETE /users/:id 404 (super_admin)", async () => {
  const { status } = await request(app(), C.manageDomain)
    .delete("/123456789098765432123456")
    .send({ access_token: superAdminSession });
  expect(status).toBe(404);
});