import "../index.html";
import "./testScript";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.scss";

//insert appinterface
// document
//   .querySelector("body")
//   .firstElementChild.insertAdjacentHTML(
//     "beforebegin",
//     '<div id="cav-box" data-type="off">' +
//       '<canvas id="canvas"></canvas>' +
//       '<button id="startBtn">Start watch</button>' +
//       '<button id="stopBtn">Stop watch</button>' +
//       '<button id="heatmapBtn">Show HM</button>' +
//       '<button id="hideHeatmapBtn">Hide HM</button>' +
//       '<div id="slider"><span>Dim Screen</span>' +
//       '<input id="slide" type="range" min="0" max="0.9" step="0.01" value="0"/>' +
//       "</div>" +
//       "</div>"
//   );

// //heatmap object constructor
function Heatmap() {
  this.pageIdentity = location.pathname; //unikalna zmienna tworzona dla kazdej podstrony
  this.showSwitch = document.getElementById("showSwitch");
  this.drawSwitch = document.getElementById("drawSwitch");
  this.clearBtn = document.getElementById("clearBtn");
  this.slider = document.getElementById("slider");
  this.points = [];
  this.dataStatus = "ok";
  this.resultPoints = [];
  this.heatmapStatus = "off";
  // let timeout;
  // let executed = false;
  // let interval_5;
  // let interval_15;
  let _this = this;

  this.getColor = (hex, opacity) => {
    if (hex[0] === "#") hex = hex.substring(1);
    if (hex.length === 6) {
      let r = parseInt(hex.slice(0, 2), 16);
      let g = parseInt(hex.slice(2, 4), 16);
      let b = parseInt(hex.slice(4, 6), 16);
      return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
    } else {
      console.log("podana wartosc jest nieprawidłowa");
    }
  };

  this.getMouseXY = e => {
    // pobiera wspolrzedne myszy i zapisuje kazdy ruch w tablicy
    if (_this.heatmapStatus === "on") {
      let x = e.pageX;
      let y = e.pageY;
      if (e.type === "mousemove") {
        _this.points.push({
          x: x,
          y: y
        });
      }
    }
  };

  this.getJSONandDrawHeatmap = () => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        _this.c.clearRect(0, 0, _this.canvas.width, _this.canvas.height); // czyści element canvas zeby nie dublowały się gradienty
        _this.points = JSON.parse(xhr.responseText);
        _this.resultPoints = [];
        let gradient;

        //tworzy nwoa tablice na podstawie zebranyh punktow, zlicza kopie, i dodaje parametr count,color itp..
        _this.resultPoints = [
          ..._this.points
            .reduce((r, e) => {
              let k = `${e.x}|${e.y}`;
              if (!r.has(k))
                r.set(k, Object.assign({ count: 1, color: "" }, e));
              else r.get(k).count++;
              let obj = r.get(k);

              if (obj.count > 4) {
                obj.color = "#ff0000";
                obj.opacity = obj.count / 20;
                obj.gradRadius = obj.count * 8;
                obj.circleRadius = obj.count * 12;
              } else if (obj.count > 2) {
                obj.color = "#fcff00";
                obj.opacity = obj.count / 20;
                obj.gradRadius = obj.count * 17;
                obj.circleRadius = obj.count * 20;
              } else if (obj.count > 1) {
                obj.color = "#0cff00";
                obj.opacity = obj.count / 40;
                obj.gradRadius = obj.count * 35;
                obj.circleRadius = obj.count * 40;
              } else {
                obj.color = "#6888fe";
                obj.opacity = obj.count / 50;
                obj.gradRadius = obj.count * 90;
                obj.circleRadius = obj.count * 100;
              }

              return r;
            }, new Map())
            .values()
        ].sort((a, b) => (a.count > b.count ? 1 : b.count > a.count ? -1 : 0));
        //rysuje mape na podstawie tablicy
        for (let i in _this.resultPoints) {
          let obj = _this.resultPoints[i];
          gradient = _this.c.createRadialGradient(
            obj.x,
            obj.y,
            5,
            obj.x,
            obj.y,
            obj.gradRadius
          );
          gradient.addColorStop(0.5, _this.getColor(obj.color, obj.opacity));
          gradient.addColorStop(1, _this.getColor(obj.color, "0"));
          _this.c.beginPath();
          _this.c.arc(obj.x, obj.y, obj.circleRadius, 0, Math.PI * 2);
          _this.c.fillStyle = gradient;
          _this.c.fill();
        }
      }
    };
    xhr.open("GET", location.href + "api/heatmap");
    xhr.send();
    _this.canvas.style.display = "block";
    return _this.pointsArr;
  };

  this.drawHeatmap = e => {
    if (_this.heatmapStatus === "on") {
      _this.c.clearRect(0, 0, _this.canvas.width, _this.canvas.height); // czyści element canvas zeby nie dublowały się gradienty
      let gradient;
      _this.resultPoints = [];
      //rysuje mape na podstawie tablicy
      let x = e.pageX;
      let y = e.pageY;
      if (e.type === "mousemove") {
        _this.points.push({
          x: x,
          y: y
        });
        _this.dataStatus = "toUpdate";
        _this.points.length > 700 && _this.points.shift();

        //tworzy nwoa tablice na podstawie zebranyh punktow, zlicza kopie, i dodaje parametr count,color itp..
        _this.resultPoints = [
          ..._this.points
            .reduce((r, e) => {
              let k = `${e.x}|${e.y}`;
              if (!r.has(k))
                r.set(k, Object.assign({ count: 1, color: "" }, e));
              else r.get(k).count++;
              let obj = r.get(k);

              //old configuration
              // if (obj.count > 4) {
              //   obj.color = "#ff0000";
              //   obj.opacity = obj.count / 20;
              //   obj.gradRadius = obj.count * 8;
              //   obj.circleRadius = obj.count * 12;
              // } else if (obj.count > 2) {
              //   obj.color = "#fcff00";
              //   obj.opacity = obj.count / 20;
              //   obj.gradRadius = obj.count * 17;
              //   obj.circleRadius = obj.count * 20;
              // } else if (obj.count > 1) {
              //   obj.color = "#0cff00";
              //   obj.opacity = obj.count / 40;
              //   obj.gradRadius = obj.count * 35;
              //   obj.circleRadius =  obj.count * 40;
              // } else {
              //   obj.color = "#6888fe";
              //   obj.opacity = obj.count / 50;
              //   obj.gradRadius = obj.count * 90;
              //   obj.circleRadius = obj.count * 100;
              // }

              if (obj.count > 3) {
                obj.color = "#ff0000";
                obj.opacity = obj.count / 15;
                obj.gradRadius = obj.count * 8;
                obj.circleRadius = obj.count * 12;
              } else if (obj.count > 2) {
                obj.color = "#fcff00";
                obj.opacity = obj.count / 15;
                obj.gradRadius = obj.count * 17;
                obj.circleRadius = obj.count * 20;
              } else if (obj.count > 1) {
                obj.color = "#0cff00";
                obj.opacity = obj.count / 15;
                obj.gradRadius = obj.count * 35;
                obj.circleRadius = obj.count * 40;
              } else {
                obj.color = "#6888fe";
                obj.opacity = obj.count / 15;
                obj.gradRadius = obj.count * 90;
                obj.circleRadius = obj.count * 100;
              }

              return r;
            }, new Map())
            .values()
        ].sort((a, b) => (a.count > b.count ? 1 : b.count > a.count ? -1 : 0));
        //rysuje mape na podstawie tablicy
        for (let i in _this.resultPoints) {
          let obj = _this.resultPoints[i];
          gradient = _this.c.createRadialGradient(
            obj.x,
            obj.y,
            5,
            obj.x,
            obj.y,
            obj.gradRadius
          );
          gradient.addColorStop(0.5, _this.getColor(obj.color, obj.opacity));
          gradient.addColorStop(1, _this.getColor(obj.color, "0"));
          _this.c.beginPath();
          _this.c.arc(obj.x, obj.y, obj.circleRadius, 0, Math.PI * 2);
          _this.c.fillStyle = gradient;
          _this.c.fill();
        }
      }
      console.log("pobrano wspolrzedna myszy");
    }
  };

  //pobiera tablice z punktami z pliku JSON
  this.getFromJSON = () => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        _this.points = JSON.parse(xhr.responseText);
      }
    };
    xhr.open("GET", location.href + "api/heatmap");
    xhr.send();
    return _this.points;
  };
  window.onload = this.getFromJSON(); //po załadowaiu strony pobiera punkty z JSON

  //zapisuje punkty zebrane do tablicy points do pliku JSON
  this.saveToJSON = callback => {
    let xhr = new XMLHttpRequest();
    let json_upload = JSON.stringify(_this.points);

    xhr.open("POST", location.href + "api/saveHeatmap", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log("wyslane do pliku");
        // console.log("status", this.dataStatus);
        callback && callback();
        _this.dataStatus = "ok";
      } else {
        console.log("error przy wysylaniu");
      }
    };

    xhr.send(json_upload);
  };

  //ustawia interval wysyłania punktów do pliku JSON
  // this.startAJAXSending = () => {
  //   if (_this.heatmapStatus === "on" && executed === false) {
  //     console.log("START");
  //     let something = (() => {
  //       return () => {
  //         if (!executed) {
  //           executed = true;
  //           interval_5 = setInterval(_this.saveToJSON, 3000);
  //         }
  //       };
  //     })();
  //     if (window.onbeforeunload) {
  //       //zapisuje do JSON zanim ktoś przeładuje okno
  //       _this.saveToJSON();
  //     } else {
  //       document.onmousemove = () => {
  //         // wysyła punkty ajax'em co 5sek jezeli myszka w ruchu, jezeli nie to co 20sek.
  //         clearInterval(interval_15);
  //         something();

  //         clearTimeout(timeout);
  //         timeout = setTimeout(() => {
  //           if (_this.heatmapStatus === "on") {
  //             /* interval 5 */
  //             clearInterval(interval_5);
  //             console.log("inter 5 off");
  //             /* interval 15 */
  //             interval_15 = setInterval(_this.saveToJSON, 7000);
  //             console.log("inter 15 on");
  //             executed = false;
  //           } else {
  //           }
  //         }, 7000);
  //       };
  //     }
  //   }
  // };

  /* EVENTS HANDLER */
  this.showSwitch.addEventListener("click", e => {
    e.target.classList.toggle("on");
    if (e.target.classList.contains("on")) {
      console.log("wł SHOW");
      if (
        !this.drawSwitch.classList.contains("touched") &&
        !e.target.classList.contains("touched")
      ) {
        this.getJSONandDrawHeatmap();
      }
      this.canvas.style.display = "block";
      this.slider.style.opacity = 1;
      this.slider.style.visibility = "visible";
    } else {
      console.log("wył SHOW");
      this.canvas.style.display = "none";
      this.slider.style.opacity = 0;
      this.slider.style.visibility = "hidden";
    }
    e.target.classList.add("touched");
  });

  this.drawSwitch.addEventListener("click", e => {
    e.target.classList.toggle("on");
    if (e.target.classList.contains("on")) {
      e.target.classList.contains("touched") &&
        !this.dataStatus === "ok" &&
        this.getFromJSON();
      this.heatmapStatus = "on";
      console.log("wł DRAW");
      //_this.startAJAXSending();
    } else {
      console.log("wył DRAW");
      // clearInterval(interval_5);
      // clearInterval(interval_15);
      this.dataStatus === "toUpdate" && this.saveToJSON();

      this.heatmapStatus = "off";
      executed = false;
      // _this.startAJAXSending();
    }
    e.target.classList.add("touched");
  });

  this.clearBtn.addEventListener("click", e => {
    // console.log(this.points);
    this.points = [];
    this.saveToJSON(this.getJSONandDrawHeatmap);
  });

  this.slider.addEventListener("change", e => {
    let val = e.target.value;
    this.canvas.style.backgroundColor = "rgba(0, 0, 0," + val + ")";
  });

  document.addEventListener("mousemove", this.drawHeatmap);
}

/* obiekt z elementem canvas */
function CanvasHM() {
  if (canvas.getContext) {
    this.c = canvas.getContext("2d");
    this.canvas = document.getElementById("canvas");
    this.canvas.style.filter = "blur(2.5px)"; //rozmywa warstwe canvas
    this.docHeight = document.body.clientHeight;
    this.docWidth = document.body.clientWidth;
    this.canvas.height = this.docHeight;
    this.canvas.width = this.docWidth;
  }
}

/* dziedziczenie pola 'c' */
Heatmap.prototype = new CanvasHM();
Heatmap.prototype.constructor = Heatmap;

window.heatmap = new Heatmap();
