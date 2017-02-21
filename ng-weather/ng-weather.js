(function () {
	 var angularWarning = false;
	var angularValid = function() {
		if (!angular || !angular.version || angular.version.major !== 1) {
			console.error("Invalid Angular version found. You may have other plugins loading Angular");
			return false;
		}
		if (angular.version.minor !== 2 && angular.version.dot !== 29) {
			angularWarning = "A different version of the AngularJS library was loaded. You may experience issues with ng-weather";
			return true;
		}
	};
    if (!angularValid()) {
        return false;
    }
angular.module("ngWeather", [])
    .factory("ngwService", function () {
        var ngwSrv = {
			lang: "en",
            dictionary: {
                it: {
                    srverror: "Non sono riuscito a recuperare i dati.",
                    notFound: "Città non trovata.",
                    configerror: "Ci sono alcuni errori nella configurazione!",
                    updatedAtText: "Ultimo aggiornamento",
                    updatedAtDate: "Oggi alle ",
                    newLocation: "Inserire nuova località",
                    technical: "Errore tecnico"
                },
                en: {
                    srverror: "Data can't be retrieved.",
                    notFound: "City not found.",
                    configerror: "There are some errors in your config!",
                    updatedAtText: "Last update",
                    updatedAtDate: "Today at ",
                    newLocation: "Enter new location",
                    technical: "Technical error"
                }
            },
            getLabel: function(key){
                return this.dictionary[this.lang][key] || this.dictionary[this.lang]["technical"];
            }
        };

        return ngwSrv;
    })
    .directive("ngwSettings", function () {
        return {
            restrict: "E",
            replace: true,
            scope: false,
            templateUrl: "./ng-weather/template/settings.html"
        };
    })
	.directive("ngwWarning", function () {
        return {
            restrict: "E",
            replace: true,
            scope: false,
            templateUrl: "./ng-weather/template/warning.html"
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
                , mode: '@?'
            },
            controller: ["$http", "$scope", "$locale", "$filter", "ngwService", "$timeout",
                function ($http, $scope, $locale, $filter, ngwService, $timeout) {

                    var localeId = $locale.id || "en";
                    if (!!$scope.locale) {
                        localeId = $scope.locale;
                    }
                    $scope.units = [
                        {key: "imperial",symbol: "°F"},
                        {key: "metric",symbol: "°C"},
                        {key: "absolute",symbol: "K"}
                    ];
                    $scope.unit = $scope.units[0];
                    if (localeId.indexOf("it") > -1) {
                        ngwService.lang = "it";
                        $scope.unit = $scope.units[1];
                    }
                    $scope.newLocationLabel = ngwService.getLabel("newLocation");

                    $scope.updatedAtText = ngwService.getLabel("updatedAtText");

                    var commonFunctions = {
                        getTemperatureByCityId: function (cityId) {
                            var request = commonFunctions.createRequest();
                            request.url += "&id=" + cityId;
                            getTemperature(request);
                        },
                        getTemperatureByCityName: function (city) {
                            var request = commonFunctions.createRequest();
                            request.url += "&q=" + city;
                            getTemperature(request);
                        },
                        createRequest: function () {
                            var apiUrl = "http://api.openweathermap.org/data/2.5/weather";
                            return {
                                method: "GET",
                                url: apiUrl + "?units=" + $scope.unit["key"] + '&appid=' + $scope.appId
                            };
                        }
                    };

                    function getTemperature(request) {
                        $scope.isError = false;
                        $scope.isLoading = true;
                        $http(request).then(function (response) {
                            if (!response || !response.data) {
                                throwError("srverror");
                                return false;
                            }
                            if (response.data.cod === "404") {
                                throwError("notFound");
                                return false;
                            }
                            var data = response.data;
                            $scope.city = data.name || $scope.city;
                            $scope.newCity = angular.copy($scope.city);
                            $scope.cityId = data.id || "";
                            $scope.updatedAtDate = ngwService.getLabel("updatedAtDate") + $filter("date")(new Date(), "HH:mm");
                            $scope.weather = data.weather[0].main;
                            $scope.weatherCode = data.weather[0].id;
                            $scope.temperature = parseInt(data.main.temp);
                        }, function () {
                            throwError("srverror");
                        })['finally'](function () {
                            $scope.isLoading = false;
                        });
                    }

                    function throwError(dictionaryKey) {
                        $scope.isError = true;
                        $scope.errorMessage = ngwService.getLabel(dictionaryKey);
                    }

                    $scope.reload = function (city) {
                        if (!city && !$scope.city && !$scope.cityId) {
                            throwError("configerror");
                            return;
                        }
                        if (!!city) {
                            $scope.city = city;
                            return commonFunctions.getTemperatureByCityName($scope.city);
                        }
                        if (!!$scope.cityId) {
                            return commonFunctions.getTemperatureByCityId($scope.cityId);
                        }
                        commonFunctions.getTemperatureByCityName($scope.city);
                    };

                    $scope.setLocation = function () {
                        $scope.reload($scope.newCity);
                        $scope.newCity = "";
                        $scope.showSettings = false;
                    };

                    $scope.openSettings = function () {
                        $scope.showSettings = true;
						$timeout(function(){
							angular.element("#newCity").focus();
						});
                    };

                    $scope.reload();
					
					if(!!angularWarning){
						$scope.showWarning = true;
						$scope.warningMessage = angularWarning;
					}
                }],
            templateUrl: "./ng-weather/template/template1.html"
        };
    });
	
})();