
(function() {
  var dependencies = [
    "ngRoute",
    "vm.vchs.saas.catalog",
    "vm.vchs.saas.detail",
    "mgcrea.ngStrap",
    "vm.vchs.saas.dataService"
  ]
  var module = angular.module("vm.vchs.saas", dependencies);


  module.factory('vm.vchs.saas.dataAccess', function($q, $cacheFactory, $http) {
    var dataAccessCache = $cacheFactory("dataAccessCache");
    var serviceStub = {};
    var dataAccessDefPromise = {};


    var noop = angular.noop,
      forEach = angular.forEach,
      extend = angular.extend,
      copy = angular.copy,
      isFunction = angular.isFunction;

    function encodeUriSegment(val) {
      return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
    }

    function encodeUriQuery(val, pctEncodeSpaces) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    
    function getURLFromPattern(url, params){
      var urlParams = {};
      forEach(url.split(/\W/), function(param){
        if (param === 'hasOwnProperty') {
          throw "hasOwnProperty is not a valid parameter name.";
        }
        if (!(new RegExp("^\\d+$").test(param)) && param &&
             (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
          urlParams[param] = true;
        }
      });

      url = url.replace(/\\:/g, ':');

      params = params || {};
      forEach(urlParams, function(_, urlParam){
        var val = params[urlParam];
        if (angular.isDefined(val) && val !== null) {
          encodedVal = encodeUriSegment(val);
          url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function(match, p1) {
            return encodedVal + p1;
          });
        } else {
          url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match,
              leadingSlashes, tail) {
            if (tail.charAt(0) == '/') {
              return tail;
            } else {
              return leadingSlashes + tail;
            }
          });
        }
      });

      return url;
    }

    function getDataFromPatter(dataPattern, object){
      //TBD
      var data = {};
      return data;
    }


    function serviceParser(serviceDef){
      var serviceObj = {};
      angular.forEach(serviceDef, function(item, key){

        serviceObj[key] = function(configObj){
          var deferred = $q.defer();

          $http({
            url : getURLFromPattern(item.url, configObj),
            data : getDataFromPatter(item.data, configObj),
            method : item.method
          }).then(function(data){
            deferred.resolve(data);
          }, function(error){
            deferred.reject(error);
          })

          return deferred.promise;
        }

      })
      return serviceObj;
    }

    serviceStub.callService = function(serviceName, operationName, configObj){
      var deferred = $q.defer();

      serviceStub.getServiceHelper(serviceName).then(function(service){
        ( service[operationName].apply(this, [configObj]) ).then(function(data){
          deferred.resolve(data);
        }, function(error){
          deferred.reject(error);
        })
      }, function(){
        deferred.reject("error while fetching service");
      })

      return deferred.promise;
    }

    serviceStub.getServiceHelper = function(serviceId){
      if(dataAccessDefPromise[serviceId]){
        return dataAccessDefPromise[serviceId];
      }
      var deferred = $q.defer();

      if(dataAccessCache.get(serviceId)){
        deferred.resolve( dataAccessCache.get(serviceId) );
      }else{
        $http({
          url : serviceId + ".json",
          method : "GET"
        }).then(function(httpStub){
          var service = httpStub.data;
          var serviceObj = serviceParser(service);
          dataAccessCache.put(serviceId, serviceObj);
          deferred.resolve(serviceObj);
        }, function(){ 
          deferred.reject("no such service def file");
        })
      }

      return deferred.promise;
    }
    return serviceStub;
  })

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
      restrict : "A",
      scope : {
        param : "=param",
        componentName : "=vmComponent",
        children : "=children"
      },
      controller : [
        "$scope",
        "$element", 
        "$http",
        "$compile",
        "$log",
        "$q",
        "$interpolate",
        "controllerService",
        "vm.vchs.saas.dataAccess",
        "vm.vchs.saas.i18n",
        function($scope, $element, $http, $compile, $log, $q, $interpolate, controllerService, dataAccess, i18nService){
          
          $scope.services = { //services to provide to each component instance
            dataAccess : dataAccess,
            "$log" : $log
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
                    $scope[name] = $scope.param[name] ? $scope.param[name] : attr;
                  }

                  if(typeof($scope.init) == "function"){
                    $scope.init.apply($scope, []);
                  }


                })
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

    $scope.formattedJSON = function(){
      return JSON.stringify($scope.descriptor, null, '\t')
    }

  }]);
  

  
  
  $(document).ready(function(){
    angular.bootstrap(document, ['vm.vchs.saas']);
  })
  

})();