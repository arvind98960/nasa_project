const path = require("path");
const parse = require("csv-parse");
const fs = require("fs");
const planets = require("./planets.mongoose");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          saveAllPlanets(data);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", async () => {
        const count= (await getAllPlanets()).length
        console.log(`${count} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({});
}

async function saveAllPlanets(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,

      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true
      }
    );
  } catch (error) {
    console.log('error'+error);
  }
}

module.exports = { getAllPlanets, loadPlanetsData };
