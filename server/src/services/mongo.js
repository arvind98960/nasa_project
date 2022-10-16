const mongoose = require("mongoose");
const MONGO_url = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
  console.log("Mongoose connection ready");
});

mongoose.connection.on("error", (err) => console.error(err));

async function mongooseConnect() {
  await mongoose.connect(MONGO_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = { mongooseConnect };
