
(function() {
  var dependencies = [
    "ngRoute",
    "vm.vchs.saas.catalog",
    "vm.vchs.saas.detail",
    "mgcrea.ngStrap",
    "vm.vchs.saas.dataService"
  ]
  var module = angular.module("vm.vchs.saas", dependencies);

  module.service("vm.vchs.saas.services.controllerProvider", function(){
    var subClassOf = function(parentClassCapsule, dependencies , classMeta){
      var parentClassDef = parentClassCapsule.pop();
      dependencies = parentClassCapsule.concat(dependencies);

      var classDef = function(){
        angular.extend(this, new parentClassDef(arguments));
        angular.extend(this, classMeta);
        this.services = {};
        angular.forEach(arguments, angular.bind(this, function(item, index){
          this.services[dependencies[index]] = item;
        }))
      }

      dependencies.push(classDef);

      return dependencies;
    }

    var base = ["$http", "$scope", function(){
      this.parentName = "base";
      this.testName = "from parent";
    }];

    var catalog = subClassOf(base, ["$http", "$scope"], {
      name : "catalog",
      testName : "from child",
      myMethod : function(){
        alert(this.name);
        alert(this.parentName);
      }
    });

    return {

    }
  });


  module.factory('controllerService', function($q, $cacheFactory) {
      var controllerPromises = {};
      var serviceStub = {};
      var controllerCache = $cacheFactory("controllerCache");
      serviceStub.getControllerDescriptor = function(controllerId){
        if(controllerPromises[controllerId]){
          return controllerPromises[controllerId];
        }

        var deferred = $q.defer();
        controllerPromises[controllerId] = deferred.promise;

        if(controllerCache.get(controllerId)){
          deferred.resolve( controllerCache.get(controllerId) );
        }else{
          $.ajax({
            url : controllerId + "/controller.js",
            dataType : "text"
          }).done(function(controllerDescriptoStr){
            
            var dummyFn = new Function("return (" + controllerDescriptoStr + ")");
            var controllerDescriptor = dummyFn.apply(this);
            controllerCache.put(controllerId, controllerDescriptor);
            deferred.resolve(controllerDescriptor);
            
          })
        }
        return deferred.promise;
      }
      return serviceStub;
  });

  module.directive("vmController", function(){
    return {
      restrict : "A",
      scope : {
        param : "=param"
      },
      controller : ["$scope", "$element", "$http", "controllerService", function($scope, $element, $http, controllerService){
        var componentName = $element.attr("vm-controller");
        $scope.templateURL = componentName + "/view.html";
        controllerService.getControllerDescriptor(componentName).then(function (controllerDescriptor) {
          for(var key in controllerDescriptor){
            
            if(typeof($scope[key]) == "function" || typeof($scope[key]) == "undefined"){
              if(typeof(controllerDescriptor[key]) == "function"){
                $scope[key] = angular.bind($scope, controllerDescriptor[key]);
              }else{
                $scope[key] = controllerDescriptor[key];
              }
              
            } 
          }
        })
      }],
      template : "<div ng-include='templateURL'></div>" 
    }
  })





  module.controller("vm.vchs.saas.controllers.main", ["$scope", function($scope){
    $scope.name = "abe";
  }]);
  module.controller("vm.vchs.saas.controllers.pageNotFound", ["$scope", function($scope){
    $scope.name = " Page not found";
  }]);

  module.config(function($routeProvider){
    $routeProvider.otherwise({
      templateUrl : "core/views/404.html",
      controller : "vm.vchs.saas.controllers.pageNotFound"
    })
  })

  
  
  $(document).ready(function(){
    angular.bootstrap(document, ['vm.vchs.saas']);
  })
  

})();