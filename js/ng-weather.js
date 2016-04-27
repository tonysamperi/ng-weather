angular.module("ngWeather", [])
.directive("ngwSpinner", function(){
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
.directive("ngWeather", function(){
	var linkFn = function(scope, el, attrs, ctrl){
		scope.isLoading = true;
		if(!!attrs.city && !!attrs.appId)
			scope.getTemp(attrs.city, attrs.appId);
		else{
			$scope.isLoading = false;
			$scope.isError = true;
			$scope.errorMessage = data[lang]["configerror"];
		}
	};

	return {
		restrict: "E",
		replace: true,
		//require: "^city",
		scope: { city: '@', appId: '@'},
		controller: ["$http", "$scope", "$element","$locale", '$filter',"$timeout", function($http, $scope,$element,$locale,$filter,$timeout){

			var cmp = function(s1,s2){
				s1 = s1.toLowerCase();
				s2 = s2.toLowerCase();
				return (s1.indexOf(s2) < 0);
			}
			var data = {
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
			}
			console.log("%c %s", "color:orange; background:blue; font-size: 16pt", "LOCALE");
			console.debug($locale);
			var locale = $locale.id;
			var lang = !!$locale.id && $locale.id.indexOf("IT")>-1 ? "it" : "en";
			var units = lang == "it" ? "metric" : "imperial";
			$scope.unit = lang == "it" ? "°C" : "°F";
			var apiUrl = "http://api.openweathermap.org/data/2.5/weather";
			var params = "mode=json&units="+units+"&cnt=7&callback=JSON_CALLBACK";
			$scope.getTemp = function(city, appId){
				console.info("Getting weather for: "+city);
				console.info("APP ID: "+appId);
				var config = {
					method: "JSONP",
					url: apiUrl + "?" + params + "&q=" + city + '&appid=' + appId
				};
				$http(config).then(function(r){
					var response = r.data;
					var name = r.data.name;
					if(cmp($scope.city,name)) $scope.city = name;
					$scope.updatedAtText = data[lang]["updatedAtText"];
					$scope.updatedAtDate = data[lang]["updatedAtDate"] + $filter("date")(new Date(),"HH:mm");
					$scope.weather = response.weather[0].main;
					$scope.weatherCode = response.weather[0].id;
					$scope.temp = parseInt(response.main.temp);
					$scope.isLoading = false;
				}, function(){
					$scope.isLoading = false;
					$scope.isError = true;
					$scope.errorMessage = data[lang]["srverror"];
				});
			};

			$scope.reload = function(city){
				if(!!city) $scope.city = city;
				$scope.showSettings = false;
				$scope.isError = false;
				$scope.isLoading = true;
				if(!!$scope.city && $scope.appId)
					$scope.getTemp($scope.city, $scope.appId);
				else{
					$scope.isLoading = false;
					$scope.isError = true;
					$scope.errorMessage = data[lang]["configerror"];
				}
			};

			$scope.setLocation = function(){
				$scope.showSettings = true;
				$timeout(function(){
					$element.find(".ngw-input").focus();
				},250);
			};
		}],
		link: linkFn,
		templateUrl: "./ngwTpl.html"
	};
});