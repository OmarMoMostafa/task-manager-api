const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("connected succssefully"))
  .catch((e) => console.log(e));
