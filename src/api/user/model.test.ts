import * as crypto from "crypto";
import { User } from "./model";
import { SalesChannel } from "../sales-channel/model";

let user;

beforeEach(async () => {
  user = await User.create({
    name: "user",
    email: "a@a.com",
    password: "123456",
    role: "store_admin"
  });
});

describe("set email", () => {
  it("sets name automatically", () => {
    user.name = "";
    user.email = "test@example.com";
    expect(user.name).toBe("test");
  });

  it("sets picture automatically", () => {
    const hash = crypto.createHash("md5").update(user.email).digest("hex");
    expect(user.picture).toBe(`https://gravatar.com/avatar/${hash}?d=identicon`);
  });

  it("changes picture when it is gravatar", () => {
    user.email = "b@b.com";
    const hash = crypto.createHash("md5").update(user.email).digest("hex");
    expect(user.picture).toBe(`https://gravatar.com/avatar/${hash}?d=identicon`);
  });

  it("does not change picture when it is already set and is not gravatar", () => {
    user.picture = "not_gravatar.jpg";
    user.email = "c@c.com";
    expect(user.picture).toBe("not_gravatar.jpg");
  });
});

describe("view", () => {
  it("returns simple view", () => {
    const view = user.view();
    expect(view).toBeDefined();
    expect(view.id).toBe(user.id);
    expect(view.name).toBe(user.name);
    expect(view.email).toBe(user.email);
    expect(view.picture).toBe(user.picture);
    expect(view.createdAt).toEqual(user.createdAt);
  });

  it("returns full view", () => {
    const view = user.view(true);
    expect(view).toBeDefined();
    expect(view.id).toBe(user.id);
    expect(view.name).toBe(user.name);
    expect(view.email).toBe(user.email);
    expect(view.picture).toBe(user.picture);
    expect(view.createdAt).toEqual(user.createdAt);
  });
});

describe("authenticate", () => {
  it("returns the user when authentication succeed", async () => {
    expect(await user.authenticate("123456")).toBe(user);
  });

  it("returns false when authentication fails", async () => {
    expect(await user.authenticate("blah")).toBe(false);
  });
});

describe("createFromService", () => {
  let serviceUser;
  let storeAdmin;
  let salesChannel;

  beforeAll(async () => {
    storeAdmin = await new User({
      name: "Store Admin",
      email: "store_admin@example.com",
      password: "password123",
      role: "store_admin"
    }).save();

    salesChannel = await new SalesChannel({
      name: "Ecommerce Sales Channel",
      owner: storeAdmin,
      type: "ecommerce"
    });
  });

  beforeEach(() => {
    serviceUser = {
      id: "123",
      name: "Test Name",
      email: "test@test.com",
      picture: "test.jpg",
      domain: "test.example.com",
      salesChannel: salesChannel,
    };
  });

    ["facebook"].forEach((service) => {
      describe(service, () => {
        beforeEach(() => {
          serviceUser.service = service;
        });

        it("updates user when email is already registered", async () => {
          const updatedUser = await User.createFromService(
            service,
            { ...serviceUser, email: "a@a.com" }
          );
          // keep
          expect(updatedUser.id).toBe(user.id);
          expect(updatedUser.email).toBe(user.email);
          // update
          expect(updatedUser.name).toBe(serviceUser.name);
          expect(updatedUser.services[service]).toBe(serviceUser.id);
          expect(updatedUser.picture).toBe(serviceUser.picture);
        });

        it("updates user when service id is already registered", async () => {
          await user.set({ services: { [service]: serviceUser.id } }).save();
          const updatedUser = await User.createFromService(
            service, serviceUser
          );
          // keep
          expect(updatedUser.id).toBe(user.id);
          expect(updatedUser.email).toBe(user.email);
          // update
          expect(updatedUser.name).toBe(serviceUser.name);
          expect(updatedUser.services[service]).toBe(serviceUser.id);
          expect(updatedUser.picture).toBe(serviceUser.picture);
        });

        it("creates a new user when neither service id and email was found", async () => {
          const createdUser = await User.createFromService(service, serviceUser);
          expect(createdUser.id).not.toBe(user.id);
          expect(createdUser.services[service]).toBe(serviceUser.id);
          expect(createdUser.name).toBe(serviceUser.name);
          expect(createdUser.email).toBe(serviceUser.email);
          expect(createdUser.picture).toBe(serviceUser.picture);
        });
      });
    });
});