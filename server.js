const express = require('express');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs')
const sql = require("sqlite3").verbose();
const FormData = require("form-data");
const keys = require("./config/keys");


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// set up database
const postcardDB = new sql.Database("postcards.db");

// table creation
let cmd = "SELECT name FROM sqlite_master WHERE type='table' AND name='PostcardTable' ";
postcardDB.get(cmd, (err, val) => {
    // console.log(err, val);
    if (val == undefined) {
        console.log("No database file - creating one");
        createPostcardDB();
    } else {
        console.log("Database file found")
    }
});

// create postcard database
function createPostcardDB() {
    const cmd = 'CREATE TABLE PostcardTable (id TEXT PRIMARY KEY UNIQUE, image TEXT, message TEXT, font TEXT, color TEXT)';
    postcardDB.run(cmd, (err, val) => {
        if (err) {
            console.log("Database creation failure", err.message);
        } else {
            console.log("Create database")
        }
    });
}


// make a storage object that explains to multer where to store images
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/images')
    },
    // keep the file's original name
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

// usethat storage object we just make to a multer object that knows how to 
// parse FormData objects and store the files they contain
let uploadMulter = multer({ storage: storage });

// serve any static request
app.use(express.static('public'));

// sever images put of /images directory
app.use("/images", express.static('images'));


//if no path given, look at the postcard creator page
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/public/creator.html');
});

// handle post request to upload image
app.post('/upload', uploadMulter.single('newImage'), function (req, res) {
    console.log("Recieved", req.file.originalname, req.file.size, "bytes")

    // if req.file exits
    if (req.file) {
        sendMediaStore(req.file.originalname, req, res);
        // res.send("Server recieved" + req.file.originalname);
    }
    else throw 'error';
})

// handle post request to share postcard
app.post('/sharePostcard', function (req, res, next) {
    console.log("Server recieved", req.body);
    let image = req.body.image;
    let message = req.body.message;
    let font = req.body.font;
    let color = req.body.color;
    let id = generateID();
    console.log("id", id, "image", image, "message", message, "font", font, "color", color);

    // put new items into database
    cmd = "INSERT INTO PostcardTable (id, image, message, font, color) VALUES(?, ?, ?, ?, ?)";
    postcardDB.run(cmd, id, image, message, font, color, (err) => {
        if (err) {
            console.log("DB insert error", err.message);
            next();
        } else {
            let newId = id; // the rowid of last inserted item
            res.send(newId);
        }
    });
});

function handlePostcardList(req, res, next) {
    console.log("handle post card");
    let id = req.query.id;
    let cmd = "SELECT * FROM PostcardTable WHERE id = ?";
    postcardDB.get(cmd, id, (err, rows) => {
        if (err) {
            console.log("Database reading error", err.message);
            next();
        } else {
            // send data to brower in HTTP response body as JSON
            res.json(rows);
        }
    });
}


// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
    let apiKey = keys.keys.storageKey;
    if (apiKey === undefined) {
        serverResponse.status(400);
        serverResponse.send("No API key provided");
    } else {
        // we'll send the image from the server in a FormData object
        let form = new FormData();

        // we can stick other stuff in there too, like the apiKey
        form.append("apiKey", apiKey);
        // stick the image into the formdata object
        form.append("storeImage", fs.createReadStream(__dirname + "/images/" + filename));
        // and send it off to this URL
        form.submit("http://ecs162.org:3000/fileUploadToAPI", function (err, APIres) {
            if (APIres) {
                console.log("API response status", APIres.statusCode);

                let body = "";
                APIres.on("data", chunk => {
                    body += chunk;
                });
                APIres.on("end", () => {
                    if (APIres.statusCode != 200) {
                        serverResponse.status(400); // bad request
                        serverResponse.send(" Media server says: " + body);
                    } else {
                        serverResponse.status(200);
                        console.log(body)
                        serverResponse.send(body);
                    }
                    fs.unlink(__dirname + "/images/" + filename, (err) => {
                        if (err) {
                            console.log("failed to delete local image:" + err);
                        } else {
                            console.log('successfully deleted local image');
                        }
                    });

                });
            } else { // didn't get APIres at all
                serverResponse.status(500); // internal server error
                serverResponse.send("Media server seems to be down.");
            }
        });
    }
}


function generateID() {
    let r = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return r;
}


app.get('/display?*', handlePostcardList);

// custom 404 message for when no other response worked
app.all("*", function (request, response) {
    response.status(404);  // the code for "not found"
    response.send("This is not the droid you are looking for");
});



const PORT = process.env.PORT || 1800;
var listener = app.listen(PORT, process.env.IP, function () {
    console.log('Your app is listen on port ' + PORT)
});
