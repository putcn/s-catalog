
(function() {
  var dependencies = [
    "ngRoute",
    "vm.vchs.saas.catalog",
    "vm.vchs.saas.detail",
    "mgcrea.ngStrap",
    "vm.vchs.saas.dataService"
  ]
  var module = angular.module("vm.vchs.saas", dependencies);


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

  module.factory('vm.vchs.saas.i18n', function($q, $cacheFactory, $http) {

      var i18nPromises = {};
      var serviceStub = {};
      var currentLang = "en_us";//$i18nProvider.getLang(); TBD
      var i18nCache = $cacheFactory("i18nCache" + currentLang);
      serviceStub.getI18nDictionary = function(componentId){
        var langBundleId = componentId + "/nls/" +  currentLang + ".json";
        if(i18nPromises[langBundleId]){
          return i18nPromises[langBundleId];
        }

        var deferred = $q.defer();
        i18nPromises[langBundleId] = deferred.promise;
        if( i18nCache.get(langBundleId) ){
          deferred.resolve( i18nCache.get(langBundleId) );
        }else{
          $http.get(langBundleId).then(function(langBundle){
            deferred.resolve(langBundle.data);
          }, function(){
            deferred.resolve({});
          })
        }
        return deferred.promise;

      }
      
      return serviceStub;
  });


  module.directive("vmComponent", function(){
    return {
      restrict : "AE",
      scope : {
        param : "=param",
        componentName : "=vmComponent",
        children : "=children"
      },
      link : {
        pre : function(scope, iElement, iAttrs, controller){
        },
        post : function(){

        }
      },
      controller : [
        "$scope",
        "$element", 
        "$http",
        "$compile",
        "$log",
        "$q",
        "$interpolate",
        "$interval",
        "controllerService",
        "vm.vchs.saas.i18n",
        '$cacheFactory',
        function($scope, $element, $http, $compile, $log, $q, $interpolate, $interval, controllerService, i18nService, $cacheFactory){
          //services to provide to each component instance
          $scope.services = { 
            "$log" : $log,
            "$cacheFactory" : $cacheFactory,
            "$interval" : $interval
          }

          $scope.i18nDictonary = {};

          $scope.i18n = function(key, config){
            var stringTemplate = $scope.i18nDictonary[key];
            var retString;
            if(!key){
              return "%KEY MISSING%";
            }
            if(!stringTemplate){
              return key;
            }
            if( stringTemplate.indexOf("{{")>0 && stringTemplate.indexOf("}}")>0 ){
              config = config || {};
              retString = $interpolate(stringTemplate)(config);
            }else{
              retString = stringTemplate;
            }
            return retString;
          }


          $scope.$watch("componentName", function(){

            var componentName = $scope.componentName;
            if(componentName){
              $scope.templateURL = componentName + "/view.html";
              $q.all([
                controllerService.getControllerDescriptor(componentName),
                i18nService.getI18nDictionary(componentName)
              ])
              .then(function (deferredValues) {
                var controllerDescriptor = deferredValues[0];
                var i18nDictonary = deferredValues[1];
                $scope.i18nDictonary = i18nDictonary;
                angular.forEach(controllerDescriptor, function(attr, name){
                  if(typeof(attr) == "function"){
                    $scope[name] = angular.bind($scope, attr);
                  }else{
                    if($scope.param){
                      $scope[name] = $scope.param[name] || attr;
                    }else{
                      $scope[name] = attr;
                    }
                    
                  }

                })
                if(typeof($scope.init) == "function"){
                  $scope.init.apply($scope, []);
                }
              })
            }
          }) //end of componentName watch
          
        }
      ],
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

    $scope.messageDialogConfig = {
      dialog : {
        shouldShow : false
      }
    }

    $scope.showMessages = function(){
      $scope.messageDialogConfig.dialog.shouldShow = true;
    }

    $scope.formattedJSON = function(){
      return JSON.stringify($scope.descriptor, null, '\t')
    }

  }]);
  

  
  
  $(document).ready(function(){
    angular.bootstrap(document, ['vm.vchs.saas']);
  })
  

})();