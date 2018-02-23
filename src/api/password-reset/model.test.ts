import { PasswordReset } from "./model";
import { User } from "../user/model";

let passwordReset;

beforeEach(async () => {
  const user = await User.create({
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

describe("view", () => {
  it("returns simple view", () => {
    const view = passwordReset.view();
    expect(view.token).toBe(passwordReset.token);
    expect(typeof view.user).toBe("object");
  });

  it("returns full view", () => {
    const view = passwordReset.view(true);
    expect(view.token).toBe(passwordReset.token);
    expect(view.user).toEqual(passwordReset.user.view(true));
  });
});
