
(function() {

  var module = angular.module("vm.vchs.saas.catalog", ["ngRoute"]);

  module.config(function($routeProvider){
    $routeProvider.when("/catalog", {
      templateUrl : "app/modules/catalog/view.html",
      controller : "vm.vchs.saas.catalog.controllers.main"
    })
  })

  module.controller("vm.vchs.saas.catalog.controllers.main",["$scope", "$http", function($scope, $http){
    $scope.services = [{
      name : "DBasS",
      id : "123",
      icon : "visual/icons/addressbook-011.png",
      description : " test des"
    },{
      name : "DBasS",
      id : "12",
      icon : "visual/icons/appStore1.png",
      description : " test des"
    },{
      name : "DBasS",
      id : "153",
      icon : "visual/icons/cal-01.png",
      description : " test des"
    },{
      name : "DBasS",
      id : "123",
      icon : "visual/icons/Messages.png",
      description : " test des"
    },{
      name : "DBasS",
      id : "123",
      icon : "visual/icons/gamecentre-01.png",
      description : " test des"
    },{
      name : "DBasS",
      id : "123",
      icon : "visual/icons/trashempty-01.png",
      description : " test des"
    },{
      name : "DBasS",
      id : "123",
      icon : "visual/icons/timemachine-01.png",
      description : " test des"
    },{
      name : "DBasS",
      id : "123",
      icon : "visual/icons/Notes-01.png",
      description : " test des"
    },{
      name : "DBasS",
      id : "123",
      icon : "visual/icons/Terminal-02.png",
      description : " test des"
    }];
  }])

})();