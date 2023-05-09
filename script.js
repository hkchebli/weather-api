var today = dayjs();
$("#search-value").val("enter a city here");
$(document).ready(function () {

  var APIcode = "9c44d08aed7ea854fb73e65b38175b5b";

  $('#currentDay').text(today.format('dddd, MMMM D YYYY'));

  $("#search-value").on("click", function () {
    $("#search-value").val("");
  });

  //search button feature
  $("#search-button").on("click", function () {

    var searchTerm = $("#search-value").val();

    weatherFunction(searchTerm);
    weatherForecast(searchTerm);
  });

  //search button enter key feature. 
  $("#search-button").keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode === 13) {
      weatherFunction(searchTerm);
      weatherForecast(searchTerm);
    }
  });

  //pull previous searches from local storage
  var historyEl = $(".searchedHistory");
  var history = JSON.parse(localStorage.getItem("searchedHistory")) || [];

  //sets history array search to correct length
  if (history.length > 0) {
    weatherFunction(history[history.length - 1]);
  }
  //makes a row for each element in history array(searchTerms)
  for (var i = 0; i < history.length; i++) {
    createRow(history[i]);
  }

  //puts the searched cities underneath the previous searched city 
  function createRow(text) {
    var listItem = $("<li>").addClass("list-group-item ").text(text);
    historyEl.append(listItem);
  }

  //listener for list item on click function
  historyEl.on("click", "li", function () {
    weatherFunction($(this).text());
    weatherForecast($(this).text());
  });

  function weatherFunction(searchTerm) {

    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=" + APIcode,


    }).then(function (data) {
      //if index of search value does not exist
      if (history.indexOf(searchTerm) === -1) {
        //push searchValue to history array
        history.push(searchTerm);
        //places item pushed into local storage
        localStorage.setItem("history", JSON.stringify(history));
        createRow(searchTerm);
      }
      // clears out old content
      $("#today").empty();

      var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
      var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");


      var card = $("<div>").addClass("card");
      var cardBody = $("<div>").addClass("card-body");
      var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
      var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + " %");
      var temp = $("<p>").addClass("card-text").text("Temperature: " + Math.trunc((1.8 * (data.main.temp - 273)) + 32) + " °F");
      console.log(data)
      var lon = data.coord.lon;
      var lat = data.coord.lat;


      fetch("https://api.openweathermap.org/data/2.5/uvi?appid=" + APIcode + "&lat=" + lat + "&lon=" + lon, {
        method: 'GET', //GET is the default.
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
      })
        .then(function (response) {
          //return response.json();
          var uvIndex = $("<p>").addClass("card-text").text("UV Index: " + response.value);
          cardBody.append(uvIndex);
          $("#today .card-body").append(uvIndex.append(btn));

        })
        .then(function (data) {
          console.log(data);
        });

      // merge and add to page
      title.append(img);
      cardBody.append(title, temp, humid, wind);
      card.append(cardBody);
      $("#today").append(card);
      console.log(data);
    });
  }
  // function weatherForecast(searchTerm) 
  function weatherForecast(searchTerm) {

    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + searchTerm + "&appid=" + APIcode + "&units=imperial", {
      method: 'GET', //GET is the default.
      credentials: 'same-origin', // include, *same-origin, omit
      redirect: 'follow', // manual, *follow, error
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        $("#weatherForecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
        for (var i = 0; i < data.list.length; i++) {

          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

            var titleFive = $("<h3>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            var imgFive = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            var colFive = $("<div>").addClass("col-md-2.5");
            var cardFive = $("<div>").addClass("card bg-orange text-black");
            var cardBodyFive = $("<div>").addClass("card-body p-2");
            var humidFive = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
            var tempFive = $("<p>").addClass("card-text").text("Temperature: " + Math.trunc(data.list[i].main.temp) + " °F");
            var windfive = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[i].wind.speed + " MPH");

            //merge together and put on page
            colFive.append(cardFive.append(cardBodyFive.append(titleFive, imgFive, tempFive, humidFive, windfive)));
            //append card to column, body to card, and other elements to body
            $("#weatherForecast .row").append(colFive);
          }
        }

      });


  }

});