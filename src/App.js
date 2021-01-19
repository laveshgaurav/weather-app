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
  const [searchArray, setSearchArray] = useState([]);
  // const [searchCity, setSearchCity] = useState([]);
  const [location, setLocation] = useState(true);

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
          setLocation(false);

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
    } else {
      try {
        var resp = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall?lat=0&lon=0&exclude=hourly,minutely&appid=c0e338a36480ecce8e72b69694d1cee5`
        );
        console.log(resp.data);
        setData(resp.data);
        setInitialData(resp.data.daily[0]);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
      }
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
      setLoading(false);
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
  const fetchOnKeyStroke = async (e) => {
    e.preventDefault();
    setCity(e.target.value);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${e.target.value}&limit=10&appid=c0e338a36480ecce8e72b69694d1cee5`
      );
      console.log(response.data);
      // setSearchCity(response.data);
      var result = await Promise.all(
        response.data.map(
          async (item) =>
            await axios.get(
              `https://api.openweathermap.org/data/2.5/onecall?lat=${item.lat}&lon=${item.lon}&exclude=hourly,minutely&appid=c0e338a36480ecce8e72b69694d1cee5`
            )
        )
      );
      // setSearchCity(response.data);
      setSearchArray(result);
      console.log(result);
      // setSearchArray(result);
    } catch (e) {
      searchArray.length = 0;
      console.log(e.message);
    }
  };

  // const getSearchArrayLocation = async (lat, lon) => {
  //   const resp = await axios.get(
  //     `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=c0e338a36480ecce8e72b69694d1cee5`
  //   );
  //   return resp.data;
  // };

  useEffect(() => {
    getMyLocation();
  }, []);

  return (
    <>
      {location ? (
        <div
          style={{
            width: "100%",
            textAlign: "center",
            height: "100vh",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h1>Enable gps and reload 🧭</h1>
        </div>
      ) : (
        <div className="container">
          <div className="search">
            <span
              onClick={() => {
                getMyLocation();
                setCity("");
              }}
            >
              <i className="fa fa-map-marker" aria-hidden="true"></i>
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                citySearch();
                searchArray.length = 0;
              }}
            >
              <input
                value={city}
                placeholder="Search City"
                onChange={fetchOnKeyStroke}
              />
            </form>
            <button onClick={citySearch}>
              <i className="fa fa-search" aria-hidden="true"></i>
            </button>
          </div>
          {searchArray.length > 0 ? (
            <div className="searchArray">
              {searchArray.map((item, i) => (
                <div
                  className="search-item"
                  onClick={() => {
                    setData(item.data);
                    setLoading(false);

                    searchArray.length = 0;
                    setInitialData(item.data.daily[0]);
                  }}
                >
                  <p style={{ fontWeight: "bold" }}>{item.data.timezone}</p>
                  <div className="icon-box">
                    <div className="searchTemp">
                      <p>
                        {kelvinToCelsius(item.data.current.temp).toFixed()}°C
                      </p>
                      <p>{item.data.current.weather[0].main}</p>
                    </div>
                    <img
                      src={`https://openweathermap.org/img/w/${item.data.current.weather[0].icon}.png`}
                      alt="icon"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {loading ? null : (
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
                    width="72px"
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
                                `${kelvinToCelsius(
                                  initialdata.temp.day
                                ).toFixed()}`
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
                                `${kelvinToCelsius(
                                  initialdata.temp.eve
                                ).toFixed()}`
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
                <div className="suntime">
                  <div className="box2">
                    <h5>Sunrise</h5>
                    <p>
                      {new Date(
                        parseInt(initialdata.sunrise.toString() + "000")
                      )
                        .toTimeString()
                        .slice(0, 5)}
                      am
                    </p>
                  </div>

                  <div className="box2">
                    <h5>Sunset</h5>
                    <p>
                      {new Date(parseInt(initialdata.sunset.toString() + "000"))
                        .toTimeString()
                        .slice(0, 5)}
                      pm
                    </p>
                  </div>
                </div>
                <div className="suntime"></div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
