angular.module("placementApp").factory("StorageService", function($window) {
  var KEY = "placementManagementData";
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function getData(){
    var saved = $window.localStorage.getItem(KEY);
    if(saved) { try { return JSON.parse(saved); } catch(e) {} }
    return clone(window.DEMO_DATA);
  }
  var data = getData();
  function save(){ $window.localStorage.setItem(KEY, JSON.stringify(data)); }
  return {
    all:function(){return data;},
    save:save,
    reset:function(){ data=clone(window.DEMO_DATA); save(); return data; },
    clear:function(){ data={students:[],companies:[],applications:[],placements:[],activities:[]}; save(); return data; },
    nextId:function(prefix, list){
      var max=0;
      list.forEach(function(x){ var n=parseInt(String(x.id||"").replace(prefix,""),10); if(!isNaN(n)) max=Math.max(max,n); });
      return prefix+String(max+1).padStart(3,"0");
    }
  };
}).factory("ToastService", function($rootScope){
  return { show:function(message,type){ $rootScope.$broadcast("toast:show",{message:message,type:type||"success"}); } };
});