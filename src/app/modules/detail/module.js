
(function() {

  var module = angular.module("vm.vchs.saas.detail", ["ngRoute", "vm.vchs.saas.dataService"]);

  module.config(function($routeProvider){
    $routeProvider.when("/detail/:serviceId", {
      templateUrl : "app/modules/detail/view.html",
      controller : "vm.vchs.saas.detail.controllers.main"
    })
  })

  module.controller("vm.vchs.saas.detail.controllers.main",["$scope", "vm.vchs.saas.dataService.types", "$routeParams", function($scope, vmTypes, $routeParams){
    $scope.id = $routeParams.serviceId;
    AAA = vmTypes;
    /*
    vmTypes.Service.get({id : $scope.id}).then(function(){

    })
*/
  }])

})();