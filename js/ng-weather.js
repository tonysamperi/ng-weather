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
		else
			console.error("INVALID CITY!");
	};

	return {
		restrict: "E",
		replace: true,
		//require: "^city",
		scope: { city: '@', appId: '@'},
		controller: ["$http", "$scope", "$locale", function($http, $scope,$locale){
			console.log("%c %s", "color:orange; background:blue; font-size: 16pt", "LOCALE");
			console.debug($locale);
			var locale = $locale.id;
			var units = !!$locale.id && $locale.id.indexOf("en")>-1 ? "imperial" : "metric"
			$scope.unit = units == "metric" ? "°C" : "°F";
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
					$scope.weather = response.weather[0].main;
					$scope.weatherCode = response.weather[0].id;
					$scope.temp = parseInt(response.main.temp);
					$scope.isLoading = false;
				}, function(){
					$scope.isLoading = false;
					$scope.isError = true;
					$scope.errorMessage = "Data can't be retrieved.";
					console.error("ERROR RETRIEVING WEATHER");
				});
			};

			$scope.reload = function(){
				$scope.isError = false;
				$scope.isLoading = true;
				if(!!$scope.city && $scope.appId)
					$scope.getTemp($scope.city, $scope.appId);
				else{
					$scope.isLoading = false;
					$scope.isError = true;
					$scope.errorMessage = "There are some errors in your config!";
				}
			};
		}],
		link: linkFn,
		template: '<div class="ngw-container ngw-row {{weather}}" ngw-spinner="isLoading">\
		<span class="glyphicon glyphicon-refresh ngw-reload" ng-click="reload()"></span>\
		<div ng-if="!isError">\
		<div class="ngw-col">\
		<div class="ngw-icon"><i class="owf owf-{{weatherCode}}" aria-label="{{weather}}"></i></div>\
		</div>\
		<div class="ngw-col">\
		<div class="ngw-temp"><span ng-bind="temp || \'-\'"></span>&nbsp;<span ng-bind="unit"></span></div>\
		<div class="ngw-location">\
		<i class="glyphicon glyphicon-pushpin" aria-label="Location"></i><span ng-bind="city"></span>\
		</div>\
		</div>\
		</div>\
		<div class="ngw-col" ng-if="isError">\
		<span ng-bind="errorMessage"></span>\
		</div>\
		<div class="ngw-clearfix">\
		</div>\
		</div>'
	};
});