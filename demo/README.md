NgCategories
============

An easy way to manage data with **AngularJS**!

# Index

  - [Introduction](#introduction)
  - [Requirements](#requirements)
  - [Usage](#usage)
  - [Options](#options)    
    - [ngCategories:strict](##ngCategories:strict)
    - [ngOnce:count](##ngOnce:count)
  - [License](#license)

# Introduction

**NgCategories** let you create a CMS-like way to manage and show data.
You can filter by array of data and it will sum filters automatically.

# Requirements

The only requirement needed is [angularJS](https://docs.angularjs.org/misc/downloading) that you can install it via [Bower](http://bower.io/).

# Usage

Simply include the ng-categories.js
```html
<html>
    <head>
        <script type="text/javascript" src="path-to/js/ng-categories.js"></script>
    </head>
</html>
```
Include **ngCategories** in your angular app
```javascript
var module = angular.module("myApp", ["ngCategories"]);
```
Optionally you can include the ngCatoggle factory in your controller
```javascript
module.controller("myController", ["$scope", "ngCatoggle", function($scope, ngCatoggle) {
```
And connect it to the scope, because you'll need to call it from the page!
```javascript
$scope.catoggle = ngCatoggle;
```
Get your data and create an array with the filter you want to use
```javascript
$scope.data = myData; //get a JSON array of content
/* 
    each element in data is
    {
    "id": 39,
    "name": "Prodotto 39",
    "cat": "D",
    "param3": 0.13,
    "nationality": "New York"
  }
*/
$scope.panels = {
        "cat": [],
        "nationality": []
    };
//So I want to filter just by cat and nationality
```
Almost done, create your list. For example:
```html
<table class="table table-striped">
    <thead>
        <th>ID</th>
        <th>Name</th>
        <th>Cat</th>
        <th>Nationality</th>
    </thead>
    <tbody>
        <tr ng-repeat="el in filteredList = (myList | ngCategories:panels)">
            <td>{{$index}}</td>
            <td>{{el.name}}</td>
            <td>{{el.cat}}</td>
            <td>{{el.nationality}}</td>
        </tr>
        <tr ng-hide="filteredList.length">
            <td colspan="4">
                Nothing to show.
            </td>
        </tr>
    </tbody>
</table>
```
Finally, create your list of filters: this will push and splice data from "$scope.panels".
Remember to include the ngCatoggle factory!!
```html
<div class="box" ng-repeat="(key,filter) in panels">
    <div ng-repeat="f in myList | ngOnce:key">
        <input type="checkbox" ng-click="catoggle(filter,f[key])" />{{f[key]}}
    </div>
</div>
```

#Options

##ngCategories:strict

If true, filter will match exactly items in list.

E.g. **cagegoryValue = "ass"**

if **strict** is **false**, will match "ass", "pass", "glass", "bass"...ecc..

otherwise it will match **just** "ass".

###Usage

```html
<myElement ng-repeat="el in myList | ngCategories:panels:strict"></myElement>
```

##ngOnce:count

If true, filter will count occourrences of filtered values and put the result, as property of the filtered list

###Usage
```js
    $scope.count = true; //(or false)
```
```html
<myList ng-repeat="= el in filtered = (myList | ngCategories:panels:strict)"></myList>
<myElement ng-repeat="el in myList | ngOnce:key:count:filtered"></myElement>
```

# License

Check out LICENSE file (MIT)