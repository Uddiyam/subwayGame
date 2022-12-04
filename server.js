const express = require("express");
const path = require("path");
const http = require("http");
const socketHandler = require("./socketHandler");

const port = 8080;

const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const fs = require("fs");
fs.readFile("./line1.csv", "utf-8", (err, data2) => {
  const rowToData2 = data2.split("\r\n");

  console.log(rowToData2); /*
  const userArray = [];
  for (let j = 0; j < rowToData2.length - 1; j++) {
    const dataObject = {};
    for (let i = 0; i < rowToData2.length - 1; i++) {
      dataObject[data2Key[i]] = rowToData2[j + 1].split(",")[i];
    }
    userArray.push(dataObject);
  }*/
  const line1 = JSON.stringify(rowToData2);
  fs.writeFileSync("./line1.json", line1);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "subwaygame_react/build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/subwaygame_react/build/index.html"));
});

const httpServer = http.createServer(app);
socketHandler(httpServer);

httpServer.listen(port, () => {
  console.log(`listening on ${port}`);
});
