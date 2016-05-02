angular.module("ngWeather", [])
    .directive("ngwSpinner", function () {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                var loadingLayer = angular.element('<div class="ngw-spinner">'
                    + '<img src="./ng-weather/images/ajax-loader.gif" />'
                    + '</div>');
                element.append(loadingLayer).addClass("ngw-spinner-outer");
                scope.$watch(attrs.ngwSpinner, function (value) {
                    loadingLayer.toggleClass('ng-hide', !value);
                });
            }
        };
    })
    .directive("ngWeather", function () {
        return {
            restrict: "E",
            replace: true,
            scope: {
                city: '@?'
                , cityId: '@?'
                , appId: '@'
                , locale: '@'
            },
            controller: ["$http", "$scope", "$locale", '$filter'
                , function ($http, $scope, $locale, $filter) {
                    var dictionary = {
                        it: {
                            srverror: "Non sono riuscito a recuperare i dati.",
                            configerror: "Ci sono alcuni errori nella configurazione!",
                            updatedAtText: "Ultimo aggiornamento",
                            updatedAtDate: "Oggi alle ",
                            newLocation: "Inserire nuova località"
                        },
                        en: {
                            srverror: "Data can't be retrieved.",
                            configerror: "There are some errors in your config!",
                            updatedAtText: "Last update",
                            updatedAtDate: "Today at ",
                            newLocation: "Enter new location"
                        }
                    };


                    var apiUrl = "http://api.openweathermap.org/data/2.5/weather";
                    var localeId = $locale.id || "en";
                    if (!!$scope.locale) {
                        localeId = $scope.locale;
                    }
                    var lang = "en";
                    var units = "imperial";
                    $scope.units = [
                        {
                            key: "imperial",
                            symbol: "°F"
                        },
                        {
                            key: "metric",
                            symbol: "°C"
                        },
                        {
                            key: "absolute",
                            symbol: "°K"
                        }];
                    $scope.unit = $scope.units[0];
                    if (localeId.indexOf("it") > -1) {
                        lang = "it";
                        $scope.unit = $scope.units[1];
                    }
                    $scope.newLocationLabel = dictionary[lang]["newLocation"];

                    $scope.updatedAtText = dictionary[lang]["updatedAtText"];

                    $scope.getTemperatureByCityId = function (cityId) {
                        var params = "mode=json&units=" + $scope.unit["key"] + "&callback=JSON_CALLBACK";
                        var request = {
                            method: "JSONP",
                            url: apiUrl + "?" + params + "&id=" + cityId + '&appid=' + $scope.appId
                        };
                        getTemperature(request);
                    };

                    $scope.getTemperatureByCityName = function (city) {
                        var params = "mode=json&units=" + $scope.unit["key"] + "&callback=JSON_CALLBACK";
                        var request = {
                            method: "JSONP",
                            url: apiUrl + "?" + params + "&q=" + city + '&appid=' + $scope.appId
                        };
                        getTemperature(request);
                    };

                    function getTemperature(request) {
                        $scope.isError = false;
                        $scope.isLoading = true;
                        $http(request).then(function (response) {
                            if (!response || !response.data) {
                                onError("srverror");
                            }
                            var data = response.data;
                            $scope.city = data.name || $scope.city;
                            $scope.updatedAtDate = dictionary[lang]["updatedAtDate"] + $filter("date")(new Date(), "HH:mm");
                            $scope.weather = data.weather[0].main;
                            $scope.weatherCode = data.weather[0].id;
                            $scope.temperature = parseInt(data.main.temp);
                        }, function () {
                            onError("srverror");
                        })['finally'](function () {
                            $scope.isLoading = false;
                        });
                    }

                    function onError(dictionaryKey) {
                        $scope.isError = true;
                        return dictionary[lang][dictionaryKey];
                    }

                    $scope.reload = function (city) {
                        if (!city && !$scope.city && !$scope.cityId) {
                            onError("configerror");
                            return;
                        }
                        if (!!$scope.cityId) {
                            $scope.getTemperatureByCityId($scope.cityId);
                        } else {
                            $scope.city = city || $scope.city;
                            $scope.getTemperatureByCityName($scope.city);
                        }
                    };

                    $scope.openSettings = function () {
                        $scope.showSettings = true;
                    };

                    $scope.setLocation = function () {
                        $scope.reload($scope.newCity);
                        $scope.newCity = "";
                        $scope.showSettings = false;
                    };

                    $scope.reload();
                }],
            templateUrl: "./ng-weather/template/template1.html"
        };
    });