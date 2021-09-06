var mySearchCity = "";
var searchCityLon = "";
var searchCityLat = "";

var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearHistory = $("#clear-history");
var currentCity = $("#current-city");
var currentTemp = $("#temperature");
var currentHumid = $("#humidity");
var currentWindS = $("#wind-speed");
var currentUV = $("#uv-index");
var searchedCities = [];

var weatherAPIKey = "0eb9f7e4e18d24e86308bd07d0bca414";

function findSearchedCity (city) {
    for (var i=0; i<searchedCities.length; i++) {
        if(city===searchedCities[i]) {
            return false;
        }
    }
    return true;
}

function displayWeather (event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        mySearchCity = searchCity.val().trim();
        getCityLoc(mySearchCity);
    }

}

function getCityLoc (city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + weatherAPIKey + "&units=imperial";
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response) {
        //console.log(response);
        searchCityLon = response.coord.lon;
        searchCityLat = response.coord.lat;
        var date = new Date(response.dt*1000).toLocaleDateString();
        $(currentCity).html(response.name + " (" + date + ")")
        //console.log(searchCityLoc);
        getCityWeather(searchCityLon,searchCityLat);
        $(searchCity).val("");
    });
}

function getCityWeather (lon, lat) {
    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&appid=" +weatherAPIKey + "&units=imperial";
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){
        // console.log(response);
        var currentWeatherIcon = response.current.weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/wn/" + currentWeatherIcon + "@2x.png";
        $(currentCity).append("<img src=" + iconUrl + ">");
        var tempF = response.current.temp;
        $(currentTemp).html((tempF).toFixed(2)+"&#8457");
        $(currentHumid).html(response.current.humidity+"%");
        $(currentWindS).html(response.current.wind_speed + "mph");
        $(currentUV).html(response.current.uvi)

        for (i=0; i<5; i++) {
            var date = new Date(response.daily[i+1].dt*1000).toLocaleDateString();
            var iconCode = response.daily[i+1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
            var highTemp = response.daily[i+1].temp.max;
            var lowTemp = response.daily[i+1].temp.min;
            var humidity = response.daily[i+1].humidity;

            $("#fDate"+ i).html(date);
            $("#fImg"+ i).html("<img src=" + iconurl + ">");
            $("#fHigh" + i).html(highTemp + "&#8457");
            $("#fLow" + i).html(lowTemp + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }
        
        searchedCities = JSON.parse(localStorage.getItem("cityName"));
        //console.log(searchedCities);
        if (searchedCities == null) {
            if (mySearchCity !== "") {
                searchedCities = [];
                searchedCities.push(mySearchCity);
                localStorage.setItem("cityName",JSON.stringify(searchedCities));
                addToCityList(mySearchCity);
                //console.log(searchedCities);
            }
            
        } else {
            if (findSearchedCity(mySearchCity)) {
                if (mySearchCity !== "") {
                    searchedCities.push(mySearchCity);
                    localStorage.setItem("cityName",JSON.stringify(searchedCities));
                    addToCityList(mySearchCity);
                }
            }
        }        
    });
}

function addToCityList (city) {
    var listEl = $("<li>" + city + "</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value", city);
    $(".list-group").append(listEl);
}

function loadPreviousSearch (event) {
    var listEl = event.target;
    if (event.target.matches("li")) {
        city = listEl.textContent.trim();
        getCityLoc(city);
    }
}

function loadLastCity() {
    $("ul").empty();
    searchedCities = JSON.parse(localStorage.getItem("cityName"));
    if (searchedCities !== null) {
        searchedCities = JSON.parse(localStorage.getItem("cityName"));
        for (i=0; i < searchedCities.length; i++) {
            addToCityList(searchedCities[i]);
        }
        city = searchedcities[i-1];
        getCityLoc(city);
    }
}

function clearSearchedCities (event) {
    event.preventDefault();
    searchedCities=[];
    localStorage.removeItem("cityName");
    document.location.reload();
}

$("#search-button").on("click", displayWeather);
$(document).on("click", loadPreviousSearch);
$(window).on("load", loadLastCity);
$("#clear-history").on("click", clearSearchedCities);

