const express = require("express");
const body_parser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(body_parser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.Mongo_Cluster);
// mongoose.connect("mongodb://localhost:27017/todoDB");
const TODO = new mongoose.Schema({
  name: String,
});

const ITEM = mongoose.model("todo", TODO);

const chore1 = new ITEM({
  name: "clean house",
});
const chore2 = new ITEM({
  name: "make bed",
});
const chore3 = new ITEM({
  name: "tie shoe",
});

let TOdoarray = [chore1, chore2, chore3];

const listschema = {
  name: String,
  itemes: [TODO],
};

const Item = mongoose.model("item", listschema);

const today = new Date();
var options = {
  weekday: "long",
  day: "numeric",
  month: "short",
};
var day = today.toLocaleDateString("en-us", options);

app.get("/", function (req, res) {
  ITEM.find({}, function (err, result) {
    if (result.length === 0) {
      ITEM.insertMany(TOdoarray, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("seccess");
        }
      });
      res.redirect("/");
    } else {
      res.render("index", { dayejs: "Today", list: result });
    }
  });
});
app.post("/", function (req, res) {
  let data = req.body.todo;
  let listTitle = req.body.button;

  const item = new ITEM({
    name: data,
  });
  if (listTitle === "Today") {
    item.save();
    res.redirect("/");
  } else {
    Item.findOne({ name: listTitle }, function (err, F) {
      F.itemes.push(item);
      F.save();
      res.redirect("/" + listTitle);
    });
  }
});

app.get("/:custom", function (req, res) {
  const param = _.capitalize(req.params.custom);
  Item.findOne({ name: param }, function (err, founditem) {
    if (!err) {
      if (!founditem) {
        const list = new Item({
          name: param,
          items: TOdoarray,
        });
        list.save();
        res.redirect("/" + param);
      } else {
        res.render("index", { dayejs: founditem.name, list: founditem.itemes });
      }
    }
  });
});

app.post("/delete", function (req, res) {
  const delitem = req.body.checkbox;
  const delR = req.body.hidden;
  if (delR === "Today") {
    ITEM.findByIdAndRemove(delitem, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("seccessfuly deleted");
      }
    });
    res.redirect("/");
  } else {
    Item.findOneAndUpdate(
      { name: delR },
      { $pull: { itemes: { _id: delitem } } },
      function (err) {
        res.redirect("/" + delR);
      }
    );
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}

app.listen(port, function (req, res) {
  console.log("server is runnin on port 8080");
});
