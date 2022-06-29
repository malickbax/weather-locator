// Declaring variables needed for the weather function to work properly 
var myAPIKey = "5c79ccf79253242b3c0d32e5f3861eba";
var cityInputEl = $('#city-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var pastSearchedCitiesEl = $('#past-searches');

// use Open Weather 'One Call API' to get weather based on city coordinates
// Weather is displayed in metric system (KM, Celcius, international date format DD/MM/YYYY)
// CREDIT: get weather function below was done with the help of Brams Lo 
function getWeather(data) {

    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${myAPIKey}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // current weather
            console.log(data)
            var currentConditionsEl = $("#currentConditions");
            currentConditionsEl.addClass("border border-primary");

// Display city name 
            var cityNameEl = $("<h2>");
            cityNameEl.text(currentCity);
            currentConditionsEl.append(cityNameEl);

//Retrieve and display icon showing weather conditions             
            var currentCityWeatherIcon = data.current.weather[0].icon; 
            var currentWeatherIconEl = $("<img>");
            currentWeatherIconEl.attr("src", "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png");
            cityNameEl.append(currentWeatherIconEl);

//Retrieve and display temperature,humidity, wind, UV information  
            var currentCityTemp = data.current.temp;
            var currentTempEl = $('<p>')
            currentTempEl.text(`Temp: ${currentCityTemp}°C`)
            currentConditionsEl.append(currentTempEl);
            
            var currentCityHumidity = data.current.humidity;
            var currentHumidityEl = $("<p>")
            currentHumidityEl.text(`Humidity: ${currentCityHumidity}%`)
            currentConditionsEl.append(currentHumidityEl);
           
            var currentCityWind = data.current.wind_speed;
            var currentWindEl = $("<p>")
            currentWindEl.text(`Wind: ${currentCityWind} KPH`)
            currentConditionsEl.append(currentWindEl);

            var currentCityUV = data.current.uvi;
            var currentUvEl = $("<p>");
            var currentUvSpanEl = $("<span>");
            currentUvEl.append(currentUvSpanEl);

// Conditional colouring for UV index information
            currentUvSpanEl.text(`UV: ${currentCityUV}`)
            if ( currentCityUV < 3 ) {
                currentUvSpanEl.css({"background-color":"green", "color":"white"});
            } else if ( currentCityUV < 6 ) {
                currentUvSpanEl.css({"background-color":"yellow", "color":"black"});
            } else if ( currentCityUV < 8 ) {
                currentUvSpanEl.css({"background-color":"orange", "color":"white"});
            } else if ( currentCityUV < 11 ) {
                currentUvSpanEl.css({"background-color":"red", "color":"white"});
            } else {
                currentUvSpanEl.css({"background-color":"violet", "color":"white"});
            }
            currentConditionsEl.append(currentUvEl);


// Display forecast on the main page 
// CREDIT: variables below were made with the help of Brams Lo 
            var fiveDayForecastHeaderEl = $("#fiveDayForecastHeader");
            var fiveDayHeaderEl = $("<h2>");
            fiveDayHeaderEl.text("5-Day Forecast:");
            fiveDayForecastHeaderEl.append(fiveDayHeaderEl);
            var fiveDayForecastEl = $("#fiveDayForecast");

            for (var i = 1; i <=5; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;
                date = data.daily[i].dt;
                date = moment.unix(date).format("DD/MM/YYYY");
                temp = data.daily[i].temp.day;
                icon = data.daily[i].weather[0].icon;
                wind = data.daily[i].wind_speed;
                humidity = data.daily[i].humidity;

                var dateEl = $("<h2>");
                dateEl.text(date);
                fiveDayForecastEl.append(dateEl);

                var tempEl = $("<p>");
                tempEl.text(temp);
                fiveDayForecastEl.append(tempEl);

                var windEl = $("<p>");
                windEl.text(wind);
                fiveDayForecastEl.append(windEl);

                var humidityEl = $("<p>");
                humidityEl.text(humidity);
                fiveDayForecastEl.append(humidityEl);
        }
    })
}

// Display search history as buttons
function displaySearchHistory() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    var pastSearchesEl = document.getElementById("past-searches");

    pastSearchesEl.innerHTML ="";

    for (i = 0; i < storedCities.length; i++) {
        
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-primary", "my-2", "past-city");
        pastCityBtn.setAttribute("style", "width: 80%");
        pastCityBtn.textContent = `${storedCities[i].city}`;
        pastSearchesEl.appendChild(pastCityBtn);
    }
    return;
}

// Get current weather data to get city coordinates to then get weather info
function getCoordinates () {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${myAPIKey}`;
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
          } else {
            throw Error(response.statusText);
          }
      })
      .then(function(data) {
//  console.log(data)
        var cityInfo = {
            city: currentCity,
            lon: data.coord.lon,
            lat: data.coord.lat
        }

        storedCities.push(cityInfo);
        localStorage.setItem("cities", JSON.stringify(storedCities));
        displaySearchHistory();
        return cityInfo;
      })

      .then(function (data) {
        console.log(data)
        getWeather(data);
      })
}

// Clear history function
function handleClearHistory (event) {
    event.preventDefault();
    var pastSearchesEl = document.getElementById("past-searches");
    localStorage.removeItem("cities");
    pastSearchesEl.innerHTML ="";
}

function clearCurrentCityWeather () {
    var currentConditionsEl = document.getElementById("currentConditions");
    currentConditionsEl.innerHTML = "";

    var fiveDayForecastHeaderEl = document.getElementById("fiveDayForecastHeader");
    fiveDayForecastHeaderEl.innerHTML = "";

    var fiveDayForecastEl = document.getElementById("fiveDayForecast");
    fiveDayForecastEl.innerHTML = "";
}

function handleCityFormSubmit (event) {
    event.preventDefault();
    currentCity = cityInputEl.val().trim();
    clearCurrentCityWeather();
    getCoordinates();
}

//Reload page for previous city when button is clicked
// CREDIT: function below was done with the help of Brams Lo 
function getPastCity (event) {
    var element = event.target;
    if (element.matches(".past-city")) {
        currentCity = element.textContent;
        clearCurrentCityWeather();
        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${myAPIKey}`;
        
        fetch(requestUrl)
          .then(function (response) {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
              } else {
                throw Error(response.statusText);
              }
           })
           .then(function(data) {
                var cityInfo = {
                    city: currentCity,
                    lon: data.coord.lon,
                    lat: data.coord.lat
                }
                return cityInfo;
            })
           .then(function (data) {
                getWeather(data);
        })
    }
}
// Calling funtions
displaySearchHistory();
searchBtn.on("click", handleCityFormSubmit);
pastSearchedCitiesEl.on("click", getPastCity);
clearBtn.on("click", handleClearHistory);
