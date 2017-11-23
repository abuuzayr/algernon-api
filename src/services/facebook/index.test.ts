import * as nock from "nock";
import * as facebook from ".";
import { IFacebookUser } from "./interfaces";

it("parses facebook user", async () => {
  const fbUser: IFacebookUser = {
    id: "123",
    first_name: "John",
    last_name: "Smith",
    email: "email@example.com",
    picture: { data: { url: "test.jpg" } }
  };

  nock("https://graph.facebook.com").get("/me").query(true).reply(200, fbUser);

  const data = await facebook.getUser("123");
  expect(typeof data.services).toBe("object");
  expect(data.services).toHaveProperty("facebook");
  expect(data.email).toBe(fbUser.email);
  expect(data.services.facebook).toBe(fbUser.id);
  expect(data.profile.firstName).toBe(fbUser.first_name);
  expect(data.profile.lastName).toBe(fbUser.last_name);
  expect(data.profile.picture).toBe(fbUser.picture.data.url);
});
