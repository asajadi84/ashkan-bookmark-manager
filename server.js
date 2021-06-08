const express = require("express");
const app = express();
const mongoose = require("mongoose");
const moment = require("moment-jalaali");
app.set("view engine", "ejs");
app.use("/", express.static("public"));
app.use(express.urlencoded({
    extended: true
}));
moment.loadPersian();
mongoose.connect("mongodb://localhost:27017/ashkanbm", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    authSource: "admin",
});

const bookmarkSchema = new mongoose.Schema({
    bookmark_id: Number,
    bookmark_url: String,
    bookmark_plus: Boolean,
});
const Bookmark = mongoose.model("bookmark", bookmarkSchema);

app.get("/", function (req, res) {
    let urlsNormal = [];
    let urlsPlus = [];
    let timeNow = new Date();
    let timeNowEpoch = timeNow.getTime();

    Bookmark.find(null, null, {
        sort: {
            bookmark_url: 1
        }
    }, function (err, allBookmarks) {
        allBookmarks.forEach(function (item1, index1) {
            if (item1.bookmark_plus == true) {
                urlsPlus.push(item1);
            } else {
                urlsNormal.push(item1);
            }
        });

        if ("successful" in req.query) {

            res.render("index", {
                formattedTime: moment(timeNow).format("hh:mm jYYYY/jMM/jDD"),
                hasMessage: true,
                messageSuccess: true,
                messageContent: "بوکمارک با موفقیت اضافه شد",
                urlsNormal: urlsNormal,
                urlsPlus: urlsPlus,
                timeNow: timeNowEpoch,
            });

        } else if ("alreadyexists" in req.query) {

            res.render("index", {
                formattedTime: moment(timeNow).format("hh:mm jYYYY/jMM/jDD"),
                hasMessage: true,
                messageSuccess: false,
                messageContent: "بوکمارک از قبل در سیستم وجود دارد.",
                urlsNormal: urlsNormal,
                urlsPlus: urlsPlus,
                timeNow: timeNow,
            });

        } else {

            res.render("index", {
                formattedTime: moment(timeNow).format("hh:mm jYYYY/jMM/jDD"),
                hasMessage: false,
                messageSuccess: true,
                messageContent: "",
                urlsNormal: urlsNormal,
                urlsPlus: urlsPlus,
                timeNow: timeNow,
            });

        }

    });
});

app.post("/", function (req, res) {
    Bookmark.findOne({
        bookmark_url: req.body.theurl
    }, null, function (err, existingBookmark) {
        if (existingBookmark) {
            res.redirect("/?alreadyexists");
        } else {

            const bookmark = new Bookmark({
                bookmark_id: new Date().getTime(),
                bookmark_url: req.body.theurl,
                bookmark_plus: req.body.quality == "plus",
            });
            bookmark.save(function(err){
                res.redirect("/?successful");
            });

        }
    });
});

app.get("/redirect", function(req, res){
    res.redirect("https://" + req.query.url);
});

app.get("/delete/:url", function(req, res){
    Bookmark.deleteOne({bookmark_url: req.params.url}, function(err){
        res.redirect("/");
    });
});

app.listen(2418, function () {
    console.log("app is running on port 2418");
});