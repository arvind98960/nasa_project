const request = require("supertest");
const app = require("../../app");
describe("Test GET /launches", () => {
  test("It should respose with 200 status", async () => {
    const response = await request(app)
      .get("/launches")
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("Test POST /launches", () => {
  const completeLaunchData = {
    mission: "abc",
    rocket: "IS1",
    target: "launchesRouter",
    launchDate: "Jan 1, 2015",
  };

  const launchDateWithoutDate = {
    mission: "abc",
    rocket: "IS1",
    target: "launchesRouter",
  };

  test("It should respose with 201 status", async () => {
    const response = await request(app)
      .post("/launches")
      .send({completeLaunchData})
      .expect("Content-Type", /json/)
      .expect(201);

    const requestDate = new Date(completeLaunchData.launchDate).valueOf();
    const resposeDate = new Date(response.body.launchDate).valueOf();

    expect(resposeDate).toBe(requestDate);

    expect(response.body).toMatchObject({
        launchDateWithoutDate
    });
  });
  test("It should catch misssing required properties", () => {});
  test("It should catch invalid dates", () => {});
});
