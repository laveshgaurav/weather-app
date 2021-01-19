import axios from "axios";
import React, { useState, useEffect } from "react";

import CanvasJSReact from "./assets/canvasjs.react";
import "./App.css";

//var CanvasJSReact = require('./canvasjs.react');
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

function App() {
  const [data, setData] = useState([]);
  const [city, setCity] = useState([]);
  const [initialdata, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);

  // const options = {
  //   type: "areaspline",
  //   title: {
  //     text: "My chart",
  //   },
  //   series: [
  //     {
  //       data: [1, 2, 3],
  //     },
  //   ],
  // };

  const getMyLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async function (position) {
          console.log("Latitude is :", position.coords.latitude);
          console.log("Longitude is :", position.coords.longitude);

          try {
            var resp = await axios.get(
              `https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&exclude=hourly,minutely&appid=c0e338a36480ecce8e72b69694d1cee5`
            );
            console.log(resp.data);
            setData(resp.data);
            setInitialData(resp.data.daily[0]);
            setLoading(false);
          } catch (err) {
            console.log(err.message);
          }
        },
        function (error) {
          alert("Please enable your location!");
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
        }
      );
    }
  };

  const citySearch = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=c0e338a36480ecce8e72b69694d1cee5`
      );
      const resp = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${response.data[0].lat}&lon=${response.data[0].lon}&exclude=hourly,minutely&appid=c0e338a36480ecce8e72b69694d1cee5`
      );
      setData(resp.data);
      setInitialData(resp.data.daily[0]);
    } catch (e) {
      alert("An error occurred, please try again!");
    }
  };

  const kelvinToCelsius = (temp) => {
    var constantTemp = 273.15;
    var inCel = parseInt(temp) - constantTemp;
    return inCel;
  };

  useEffect(() => {
    getMyLocation();
  }, []);

  return (
    <div className="container">
      <div className="search">
        <span onClick={getMyLocation}>
          <i className="fa fa-map-marker" aria-hidden="true"></i>
        </span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            citySearch();
          }}
        >
          <input
            value={city}
            placeholder="Search City"
            onChange={(e) => setCity(e.target.value)}
          />
        </form>
        <button onClick={citySearch}>
          <i className="fa fa-search" aria-hidden="true"></i>
        </button>
      </div>
      {loading ? (
        <p>Loading</p>
      ) : (
        <div className="day-slider">
          {data.daily.map((item, i) => (
            <div
              className="daily-card"
              key={i}
              onClick={() => setInitialData(data.daily[i])}
            >
              <p>
                {new Date(parseInt(item.dt.toString() + "000"))
                  .toDateString()
                  .slice(0, 3)}
              </p>
              <p>
                {kelvinToCelsius(item.temp.max).toFixed()}/
                {kelvinToCelsius(item.temp.min).toFixed()}°
              </p>
              <img
                src={`https://openweathermap.org/img/w/${item.weather[0].icon}.png`}
                alt="icon"
              />
              <p>{item.weather[0].main}</p>
            </div>
          ))}
        </div>
      )}
      <div className="main-container">
        {loading ? null : (
          <>
            <div className="heading">
              <h1>{kelvinToCelsius(initialdata.temp.day).toFixed()}°C</h1>
              <img
                src={`https://openweathermap.org/img/w/${initialdata.weather[0].icon}.png`}
                alt="icon"
              />
            </div>
            <div style={{ height: "200px" }}>
              <CanvasJSChart
                options={{
                  animationEnabled: true,
                  axisX: {
                    gridThickness: 1,
                    gridColor: "lightblue",
                    lineThickness: 0,
                  },
                  axisY: {
                    lineThickness: 0,
                    gridThickness: 0,
                    labelFontSize: 0,
                    // minimum: -10,
                    interval: 20,
                    // maximum: 30,
                  },
                  data: [
                    {
                      type: "splineArea",
                      color: "rgba(0, 183, 255, 0.363)",
                      dataPoints: [
                        {
                          label:
                            "Morning" +
                            "(" +
                            parseInt(
                              `${kelvinToCelsius(
                                initialdata.temp.morn
                              ).toFixed()}`
                            ) +
                            ")",
                          y: parseInt(
                            `${kelvinToCelsius(
                              initialdata.temp.morn
                            ).toFixed()}`
                          ),
                        },
                        {
                          label:
                            "Day" +
                            "(" +
                            parseInt(
                              `${kelvinToCelsius(
                                initialdata.temp.day
                              ).toFixed()}`
                            ) +
                            ")",
                          y: parseInt(
                            `${kelvinToCelsius(initialdata.temp.day).toFixed()}`
                          ),
                        },
                        {
                          label:
                            "Evening" +
                            "(" +
                            parseInt(
                              `${kelvinToCelsius(
                                initialdata.temp.eve
                              ).toFixed()}`
                            ) +
                            ")",
                          y: parseInt(
                            `${kelvinToCelsius(initialdata.temp.eve).toFixed()}`
                          ),
                        },
                        {
                          label:
                            "Night" +
                            "(" +
                            parseInt(
                              `${kelvinToCelsius(
                                initialdata.temp.night
                              ).toFixed()}`
                            ) +
                            ")",
                          y: parseInt(
                            `${kelvinToCelsius(
                              initialdata.temp.night
                            ).toFixed()}`
                          ),
                        },
                      ],
                    },
                  ],
                }}
              />
            </div>
            <div className="pressure">
              <div className="box">
                <h5>Pressure</h5>
                <p>{initialdata.pressure} hpa</p>
              </div>

              <div className="box">
                <h5>Humidity</h5>
                <p>{initialdata.humidity} %</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
