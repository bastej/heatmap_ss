// var http = require("http");
var fs = require("fs");

// var server = http.createServer(function(req, res) {
//   console.log("requet made:" + req.url);
//   if (req.url === "/home" || req.url === "/") {
//     res.writeHead(200, { "Content-Type": "text/html" });
//     fs.createReadStream(__dirname + "/index.html", "utf-8").pipe(res);
//   } else if (req.url === "/api/heatmap") {
//     fs.readFile("heatmap.json", function(err, buf) {
//       res.writeHead(200, { "Content-Type": "application/json" });
//       res.end(buf);
//     });
//   } else if (req.url === "/api/saveHeatmap") {
//     res.writeHead(200, { "Content-Type": "application/json" });
//     req.on("data", function(chunk) {
//       fs.writeFile("heatmap.json", chunk.toString(), function(err) {
//         if (err) throw err;
//         console.log("SUCCESS");
//       });
//     });
//     res.end();
//   }
// });

// server.listen(8081, "127.0.0.1");
// console.log("listening to port 3000");

var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var path = require("path");
var config = require("./webpack.config");

const options = {
  // contentBase: __dirname + "/",
  // publicPath: "/",
  stats: {
    colors: true
  },
  inline: true,
  hot: true,
  host: "localhost",
  proxy: {
    "^/api/*": {
      target: "http://localhost:8081/api/",
      secure: false,
      changeOrigin: true
    }
  },
  headers: { "X-Custom-Header": "yes" },
  before: function(app) {
    // Here you can access the Express app object and add your own custom middleware to it.
    // For example, to define custom handlers for some paths:
    app.get("/api/heatmap", function(req, res) {
      fs.readFile("heatmap.json", function(err, buf) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(buf);
      });
    });
    app.post("/api/saveHeatmap", function(req, res) {
      res.writeHead(200, {
        "Content-Type": "application/x-www-form-urlencoded"
      });
      req.on("data", function(chunk) {
        fs.unlink("heatmap.json", function(err) {
          //if (err) throw err;
          // if no error, file has been deleted successfully
          fs.writeFile("heatmap.json", chunk.toString(), function(err) {
            if (err) throw err;
            console.log("SUCCESS");
          });
        });
      });
      res.end();
    });
  }
};

WebpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
var server = new WebpackDevServer(compiler, options);

server.listen(8081, "127.0.0.1", error => {
  if (error) {
    console.log(error);
  }

  console.log("Starting server on http://localhost:8081");
});

// if (module.hot) {
//   module.hot.accept("./src/index.html", function() {
//     console.log("Accepting the updated printMe module!");
//     printMe();
//   });
// }
