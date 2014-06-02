
(function() {
  var dependencies = ["ngResource"];
  var module = angular.module("vm.vchs.saas.dataService", dependencies);

  module.service("vm.vchs.saas.dataService.types", function($q, $resource){
    
    function defineClass (SuperClass, classConfig){
      if( typeof(SuperClass)!=="function" ){
        SuperClass = function(){};
      }
      var SubClass = function(instanceConfig){
        angular.extend(this, instanceConfig);
      };
      SubClass.prototype = new SuperClass();

      if(typeof(classConfig) == "object"){
        angular.extend(SubClass.prototype, classConfig);
      }

      return SubClass;
    }

    var vmTypes = {};
    
    /*
      base class
    */
    vmTypes.Object = function(instanceConfig){
      this._objectStatus = $q.defer();
      this.stable = this._objectStatus.promise;
      this._instanceConfig = instanceConfig;
    }

    vmTypes.Object.prototype.fetch = function(objectId){
      var deferred = $q.defer();

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

      if(typeof(objectId) == "string"){
       $http({
        url : getURLFromPattern(this.url, this),
        method : "GET"
       }).then(function(){

       })
      }else{
        deferred.reject();
      }
      return deferred.promise;
    }

    vmTypes.Object.factory = function(className, instanceConfig){
      var deferred = $q.defer();
      var theClass = vmTypes[className];
      if(!theClass){
        deferred.reject( vmTypes.Object.factory("State", {code : 2}) )
      }else{
        var instance = new theClass(instanceConfig);
        instance.init().then(function(){
          deferred.resolve(instance);
        }, function(state){
          deferred.reject(state);
        })
      }
      return deferred.promise;
    }



    vmTypes.Restful = defineClass(vmTypes.Object, {
      url : "/user/:id",
      init : function(){
        var resource = $resource(url);
      }
    })

    var statesMapping = [
      "unknown", 
      "error",
      "unsupported"
    ]

    vmTypes.State = defineClass(vmTypes.Object, {
      code : undefined, //Number
      state : undefined, //String
      init : function(){
        var deferred = $q.defer();
        this.reason = statesMapping[code];
        if(this.reason == undefined){
          this.reason = statesMapping[0];
        }
        deferred.resolve();
        return deferred.promise;
      }
    })

    
    vmTypes.Service = defineClass(vmTypes.Object, {
      id : undefined,
      name : undefined,
      init : function(){
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
      }
    })
    

    vmTypes.Service = $resource("api/service/:id");

    return vmTypes;
  });
  

})();