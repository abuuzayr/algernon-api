import * as crypto from "crypto";
import { User } from "./model";
import { SalesChannel } from "../sales-channel/model";
import { IUser } from "./interfaces";

let user: IUser;

beforeEach(async () => {
  user = await User.create({
    profile: {
      firstName: "store",
      lastName: "admin",
    },
    email: "a@a.com",
    password: "123456",
    role: "store_admin"
  });
});

describe("set email", () => {
  it("sets picture automatically", () => {
    const hash = crypto.createHash("md5").update(user.email).digest("hex");
    expect(user.profile.picture).toBe(`https://gravatar.com/avatar/${hash}?d=identicon`);
  });

  it("changes picture when it is gravatar", () => {
    user.email = "b@b.com";
    const hash = crypto.createHash("md5").update(user.email).digest("hex");
    expect(user.profile.picture).toBe(`https://gravatar.com/avatar/${hash}?d=identicon`);
  });

  it("does not change picture when it is already set and is not gravatar", () => {
    user.profile.picture = "not_gravatar.jpg";
    user.email = "c@c.com";
    expect(user.profile.picture).toBe("not_gravatar.jpg");
  });
});

describe("view", () => {
  it("returns simple view", () => {
    const view = user.view();
    expect(view).toBeDefined();
    expect(view.id).toBe(user.id);
    expect(view.email).toBe(user.email);
    expect(typeof view.profile).toBe("object");
    expect(view.profile.firstName).toBe(user.profile.firstName);
    expect(view.profile.lastName).toBe(user.profile.lastName);
    expect(view.profile.picture).toBe(user.profile.picture);
    expect(view.createdAt).toEqual(user.createdAt);
  });

  it("returns full view", () => {
    const view = user.view(true);
    expect(view).toBeDefined();
    expect(view.id).toBe(user.id);
    expect(view.email).toBe(user.email);
    expect(typeof view.profile).toBe("object");
    expect(view.profile.firstName).toBe(user.profile.firstName);
    expect(view.profile.lastName).toBe(user.profile.lastName);
    expect(view.profile.picture).toBe(user.profile.picture);
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
      email: "store_admin@example.com",
      password: "password123",
      role: "store_admin",
      profile: {
        firstName: "store",
        lastName: "admin",
      },
    }).save();

    salesChannel = await new SalesChannel({
      name: "Ecommerce Sales Channel",
      owner: storeAdmin,
      type: "ecommerce"
    });
  });

  beforeEach(() => {
    serviceUser = {
      email: "test@test.com",
      profile: {
        firstName: "Customer",
        lastName: "1",
        picture: "test.jpg",
      },
      salesChannel: salesChannel,
      services: {},
    };
  });

    ["facebook"].forEach((service) => {
      describe(service, () => {
        beforeEach(() => {
          serviceUser.services[service] = "123";
        });

        it("updates user when email is already registered", async () => {
          const createdUser = await (new User(serviceUser)).save();
          const updatedUser = await User.createFromService(
            { ...serviceUser, email: "test@test.com" }
          );
          // keep
          expect(updatedUser.id).toBe(createdUser.id);
          expect(updatedUser.email).toBe(createdUser.email);
          // update
          expect(updatedUser.profile.firstName).toBe(createdUser.profile.firstName);
          expect(updatedUser.profile.lastName).toBe(createdUser.profile.lastName);
          expect(updatedUser.services[service]).toBe(createdUser.services[service]);
          expect(updatedUser.profile.picture).toBe(createdUser.profile.picture);
        });

        it("updates user when service id is already registered", async () => {
          await user.set({ services: { [service]: serviceUser.id } }).save();
          const updatedUser = await User.createFromService(serviceUser);
          // keep
          expect(updatedUser.id).toBe(user.id);
          expect(updatedUser.email).toBe(user.email);
          // update
          expect(updatedUser.profile.firstName).toBe(serviceUser.profile.firstName);
          expect(updatedUser.profile.lastName).toBe(serviceUser.profile.lastName);
          expect(updatedUser.services[service]).toBe(serviceUser.services[service];
          expect(updatedUser.profile.picture).toBe(serviceUser.profile.picture);
        });

        it("creates a new user when neither service id and email was found", async () => {
          const createdUser = await User.createFromService(serviceUser);
          expect(createdUser.id).not.toBe(user.id);
          expect(createdUser.services[service]).toBe(serviceUser.id);
          expect(createdUser.profile.firstName).toBe(serviceUser.profile.firstName);
          expect(createdUser.profile.lastName).toBe(serviceUser.profile.lastName);
          expect(createdUser.email).toBe(serviceUser.email);
          expect(createdUser.profile.picture).toBe(serviceUser.profile.picture);
        });
      });
    });
});
