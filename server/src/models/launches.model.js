const launchesDataBase = require("./launcher.mangoose");
const planets = require("./planets.mongoose");
const launches = new Map();
const axios = require("axios");
const launcherMangoose = require("./launcher.mangoose");
let DefaultFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler mission",
  rocket: "IS1 rocket",
  launch: new Date("Sep 03 2023"),
  target: "Kepler-442 b",
  customers: ["NASA"],
  upcoming: true,
  success: true,
};

saveLaunch(launch);

const SPACE_X_Url = `https://api.spacexdata.com/v4/launches/query`;

async function loadLaunchData() {

  const firstlaunch = await findLaunch({
    flightNumber : 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  })
  if(firstlaunch){
    console.log('Launch data loaded successfully')
  }else{
    await populateLaunches();
  }
  
}
async function populateLaunches() {
  const response = await axios.post(SPACE_X_Url, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
          path: "payloads",
          select: {
            "customers": 1,
          },
        },
      ],
    },
  });

  if(response.status !== 200) {
    console.log('Problem with response: ' + response.status);
    throw new Error('Problem with response: ' + response.status);
  }
  let launchDoc = response.data.docs;
  for(const launchDocs of launchDoc) {
    const payloads = launchDocs['payloads'];
    const customers = payloads.flatMap((payloads)=>{
      return payloads['customers'];
    })
  }
}
async function findLaunch(filter){
  return await launchesDataBase.findOne(filter)
}

async function existsLaunchwithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getAllLaunches( skip, limit ) {
  return await launchesDataBase.find({}, { __v: 0, _d: 0 }).sort({flightNumber: 1}).skip(skip).limit(limit);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDataBase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DefaultFlightNumber;
  }

  return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {

  await launchesDataBase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ["NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  let response = await launchesDataBase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  console.log(response);
  return response;
}

module.exports = {
  getAllLaunches,
  existsLaunchwithId,
  abortLaunchById,
  scheduleNewLaunch,
  loadLaunchData,
};
