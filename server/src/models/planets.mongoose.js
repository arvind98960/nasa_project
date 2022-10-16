const mongoose = require("mongoose");
const schema = mongoose.Schema;
const planetSchema = new schema({
  keplerName: {
    type: String,
    required: true,
  }
});


module.exports = mongoose.model("planets", planetSchema);
