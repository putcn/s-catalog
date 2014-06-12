
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

  module.directive("vmComponent", function(){
    return {
      restrict : "A",
      scope : {
        param : "=param",
        componentName : "=vmComponent",
        children : "=children"
      },
      controller : ["$scope", "$element", "$http", "controllerService", function($scope, $element, $http, controllerService){
        
        $scope.$watch("componentName", function(){

          var componentName = $scope.componentName;
          if(componentName){
            $scope.templateURL = componentName + "/view.html";
            controllerService.getControllerDescriptor(componentName).then(function (controllerDescriptor) {
              angular.forEach(controllerDescriptor, function(attr, name){
                if(typeof($scope[name]) == "function" || typeof($scope[name]) == "undefined"){
                  if(typeof(attr) == "function"){
                    $scope[name] = angular.bind($scope, attr);
                  }else{
                    $scope[name] = attr;
                  }
                }

                if(typeof($scope[name]) != "function"){
                  $scope[name] = $scope.param[name];
                }

              })
            })
          }
        }) //end of componentName watch
        
      }],
      template : "<div ng-include='templateURL'></div>" 
    }
  })

  module.directive("vmParser", function(){
    return {
      restrict : "A",
      scope : {
        descriptor : "=vmParser"
      },
      template : "<div vm-component='descriptor.type' children='descriptor.children' param='descriptor'></div>" 
    }
  })





  module.controller("vm.vchs.saas.controllers.main", ["$scope", "$location", "$http", function($scope, $location, $http){
    $scope.$watch(function(){
      return $location.path();
    }, function(path){
      if(path == ""){
        $location.path("/descriptors/demo.json");
      }else{
        path = path.substring(1);
        $http.get(path)
          .then(function(response){
              $scope.descriptor = response.data;
          })
      }
    })

    $scope.formattedJSON = function(){
      return JSON.stringify($scope.descriptor, null, '\t')
    }

  }]);
  

  
  
  $(document).ready(function(){
    angular.bootstrap(document, ['vm.vchs.saas']);
  })
  

})();