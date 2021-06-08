const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

let dynamicModels = {};
const schema = new mongoose.Schema({}, { versionKey: false, strict: false });

const dynamicModel = (collectionName) => {
  if (!dynamicModels[collectionName]) {
    dynamicModels[collectionName] = mongoose.model(
      collectionName,
      schema,
      collectionName
    );
  }
  return dynamicModels[collectionName];
};

router.get("/:paramname", async (req, res) => {
  try {
    var Param = dynamicModel(req.params.paramname);
    Param.find({})
      .lean()
      .exec(function (err, doc) {
        if (err || !doc) {
          res.status(200).json({
            message: "NOT_FOUND",
            params: [],
          });
          return;
        }
        res.status(200).json({
          message: "OK",
          params: doc,
        });
        return;
      });
  } catch (err) {
    console.log(err);
    res.json({ message: req.params.strsearch, error: err });
  }
});

module.exports = router;
