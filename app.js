const express = require("express");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");
require("dotenv/config");

app.use(express.json({ limit: "10mb" }));
app.use(cors());

//Import routes
const userRoute = require("./routes/userManagementRoute");
app.use("/user", userRoute);

const custRoute = require("./routes/customerRoute");
app.use("/cust", custRoute);

const fssRoute = require("./routes/fssDataRoute");
app.use("/fss", fssRoute);

const scRoute = require("./routes/scorecardRoute");
app.use("/sc", scRoute);

const paramsRoute = require("./routes/paramsRoute");
app.use("/params", paramsRoute);

//ROUTES
app.get("/", (req, res) => {
  res.send("Test API server");
});

//Connect to mongodb
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

mongoose.connect(process.env.DB_CONNECTION, options, () =>
  console.log("connected to mongodb!")
);

//Listening to the server
app.listen(process.env.UGRADE_PORT);
