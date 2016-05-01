angular.module("ngWeather", [])
	.directive("ngwSpinner", function () {
		return {
			restrict: 'A',
			scope: false,
			link: function (scope, element, attrs) {
				var loadingLayer = angular.element('<div class="ngw-spinner">'
					+ '<img src="./img/ajax-loader.gif" />'
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
			scope: {city: '@', appId: '@'},
			controller: ["$http", "$scope", "$locale", '$filter', function ($http, $scope, $locale, $filter) {
				var dictionary = {
					it: {
						srverror: "Non sono riuscito a recuperare i dati.",
						configerror: "Ci sono alcuni errori nella configurazione!",
						updatedAtText: "Ultimo aggiornamento",
						updatedAtDate: "Oggi alle "
					},
					en: {
						srverror: "Data can't be retrieved.",
						configerror: "There are some errors in your config!",
						updatedAtText: "Last update",
						updatedAtDate: "Today at "
					}
				};

				console.log("%c %s", "color:orange; background:blue; font-size: 16pt", "LOCALE");
				console.debug($locale)
				var apiUrl = "http://api.openweathermap.org/data/2.5/weather";
				var localeId = $locale.id || "en";
				var lang = "en";
				var units = "imperial";
				$scope.unit = "°F";
				if (localeId.indexOf("it") > -1) {
					lang = "it";
					units = "metric";
					$scope.unit = "°C";
				}

				var params = "mode=json&units=" + units + "&callback=JSON_CALLBACK";
				$scope.updatedAtText = dictionary[lang]["updatedAtText"];


				$scope.getTemperature = function (city) {
					var request = {
						method: "JSONP",
						url: apiUrl + "?" + params + "&q=" + city + '&appid=' + $scope.appId
					};

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
				};

				function onError(dictionaryKey) {
					$scope.isError = true;
					return dictionary[lang][dictionaryKey];
				}

				$scope.reload = function (city) {
					if (!city && !$scope.city) {
						onError("configerror");
						return;
					}
					$scope.city = city || $scope.city;
					$scope.getTemperature($scope.city);
				};

				$scope.openSettings = function () {
					$scope.showSettings = true;
				};

				$scope.setLocation = function (city) {
					$scope.reload(city);
					$scope.showSettings = false;
				};

				$scope.reload();
			}],
			templateUrl: "./ngwTpl.html"
		};
	});