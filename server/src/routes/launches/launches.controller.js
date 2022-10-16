const { request } = require("express");
const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchwithId,
  abortLaunchById,
} = require("../../models/launches.model");

const {getPagination} = require("../../services/query");
async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}
async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({ error: "Missing launch Property" });
  }

  if (launch.launchDate.toString() === "Invalid Date") {
    return res.status(400).json({ error: "Invalid launch Date" });
  }

  launch.launchDate = new Date(launch.launchDate);
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const existsLaunch = await existsLaunchwithId(launchId);
  if (!existsLaunch) {
    return res.status(400).json({ error: "launch not found" });
  }

  const aborted = await abortLaunchById(launchId);
  if(!aborted){
    return res.status(200).json({ error: "launch Not aborted" });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
