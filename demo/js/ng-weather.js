angular.module("ngWeather", [])
.directive("ngwSpinner", function(){
	return {
		restrict: 'A',
		scope: false,
		link: function (scope, element, attrs) {
			scope.isLoading = true;
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
		if(!!attrs.city && !!attrs.appId)
			scope.getTemp(attrs.city, attrs.appId);
		else
			console.error("INVALID CITY!");
	};

	return {
		restrict: "E",
		//require: "^city",
		scope: { city: '@', appId: '@'},
		controller: ["$http", "$scope", function($http, $scope){
			var apiUrl = "http://api.openweathermap.org/data/2.5/weather";
			var params = "mode=json&units=metric&cnt=7&callback=JSON_CALLBACK";

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
					console.error("ERROR RETRIEVING WEATHER");
				});
			};
		}],
		link: linkFn,
		template: '<div class="ngw-container ngw-row {{weather}}" ngw-spinner="isLoading">\
		<div class="ngw-col">\
		<div class="ngw-icon"><i class="owf owf-{{weatherCode}}" aria-label="{{weather}}"></i></div>\
		</div>\
		<div class="ngw-col">\
		<div class="ngw-temp"><span ng-bind="temp"></span>&nbsp;<span>°C</span></div>\
		<div class="ngw-location">\
		<i class="glyphicon glyphicon-pushpin" aria-label="Location"></i><span ng-bind="city"></span>\
		</div>\
		</div>\
		<div class="ngw-clearfix">\
		</div>\
		</div>'
	};
});