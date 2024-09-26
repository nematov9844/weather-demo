import React, { useState, useEffect } from "react";

const apiKey = "8446a94aba159427c75b7e43ed594827"; // OpenWeatherMap API kalitingizni kiriting

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState("");
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Dark mode holati
  const [time, setTime] = useState(new Date()); // Soat
  const [bgImage, setBgImage] = useState(""); // Fon rasmi uchun holat

  // Soatni yangilab turish uchun interval o'rnatamiz
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer); // komponentdan chiqqanda intervalni tozalaymiz
  }, []);

  // Brauzerdan foydalanuvchining hozirgi joylashuvini olish
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        setError("Joylashuvni aniqlash imkoni bo'lmadi");
        setLoading(false);
      }
    );
  }, []);

  // Ob-havo va kun/tunga qarab fon rasmni o'rnatish
  const updateBackground = (weather, currentTime) => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 18) {
      // Kun va ob-havoga qarab fon
      if (weather.includes("cloud")) {
        setBgImage("url('/images/day_cloudy.jpg')");
      } else if (weather.includes("rain")) {
        setBgImage("url('/images/day_rainy.jpg')");
      } else {
        setBgImage("url('/images/day_clear.jpg')");
      }
    } else {
      // Tun va ob-havoga qarab fon
      if (weather.includes("cloud")) {
        setBgImage("url('/images/night_cloudy.jpg')");
      } else if (weather.includes("rain")) {
        setBgImage("url('/images/night_rainy.jpg')");
      } else {
        setBgImage("url('/images/night_clear.jpg')");
      }
    }
  };

  // Geolokatsiya orqali ob-havo ma'lumotlarini olish
  useEffect(() => {
    if (location.lat && location.lon) {
      const getWeatherByCoords = async () => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Ob-havo ma'lumotlari topilmadi");
          }
          const data = await response.json();
          const filteredData = data.list.filter((reading) =>
            reading.dt_txt.includes("12:00:00")
          ); // Har kuni soat 12:00 uchun prognoz
          setWeatherData(filteredData);
          setCity(data.city.name);
          updateBackground(filteredData[0].weather[0].description, new Date());
          setError("");
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      getWeatherByCoords();
    }
  }, [location]);

  const getWeatherByCity = async (cityName) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Shahar topilmadi");
      }
      const data = await response.json();
      const filteredData = data.list.filter((reading) =>
        reading.dt_txt.includes("12:00:00")
      ); // Har kuni soat 12:00 uchun prognoz
      setWeatherData(filteredData);
      setCity(data.city.name);
      updateBackground(filteredData[0].weather[0].description, new Date());
      setError("");
    } catch (err) {
      setError(err.message);
      setWeatherData([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city) {
      getWeatherByCity(city);
    }
  };

  // Dark mode'ni almashtirish funksiyasi
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-cover bg-center transition duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
      style={{
        backgroundImage: bgImage,
      }}
    >
      <div className={`flex flex-col md:flex-row bg-opacity-10 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-4xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* Dark mode tugmasi */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white rounded"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Soatni ko'rsatish */}
        <div className="absolute top-4 left-4 p-2 bg-gray-700 bg-opacity-50 rounded text-white">
          <h2 className="text-xl font-bold">{time.toLocaleTimeString()}</h2>
        </div>

        {/* Asosiy ob-havo ma'lumotlari */}
        <div className="flex-1 p-4">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Weather App
          </h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className={`w-full p-3 border border-green-500 placeholder:text-gray-600 ${darkMode ? "bg-gray-700 text-white" : "bg-transparent text-black"} rounded mb-4 outline-none `}
            />
            <button
              type="submit"
              className="w-full bg-blue-500 bg-opacity-85 hover:bg-blue-700 text-white p-3 rounded transition duration-300"
            >
              Get Weather
            </button>
          </form>

          <div className="text-center">
            {loading ? (
              <p className="text-xl">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : weatherData.length > 0 ? (
              <div className="bg-gray-300 bg-opacity-55 backdrop-blur-md p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">
                  {weatherData[0].main.temp}°C
                </h2>
                <p className="text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">{weatherData[0].weather[0].description}</p>
                <p className="text-md font-bold bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">City: {city}</p>
                {/* Iconka uchun */}
                <img
                  src={`http://openweathermap.org/img/wn/${weatherData[0].weather[0].icon}@2x.png`}
                  alt="Weather Icon"
                />
              </div>
            ) : (
              <p className="text-xl">Joylashuvni kiriting yoki aniqlayapmiz...</p>
            )}
          </div>
        </div>

        {/* 5 kunlik prognoz */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {weatherData.map((weather, index) => (
            <div
              key={index}
              className={`bg-green-500 bg-opacity-55 -z-10 backdrop-blur-md rounded p-6 flex flex-col items-center justify-center text-center ${darkMode ? "text-white" : "text-black"}`}
            >
              <h3 className="font-bold text-lg">
                {new Date(weather.dt_txt).toLocaleDateString()}
              </h3>
              <p className="text-xl">{weather.main.temp}°C</p>
              <p className="text-md">{weather.weather[0].description}</p>
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="Weather Icon"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
