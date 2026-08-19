angular.module("placementApp", ["ngRoute"])
.config(function($routeProvider){
  $routeProvider
    .when("/", {templateUrl:"views/dashboard.html", controller:"DashboardController"})
    .when("/students", {templateUrl:"views/students.html", controller:"StudentsController"})
    .when("/students/new", {templateUrl:"views/student-form.html", controller:"StudentFormController"})
    .when("/students/edit/:id", {templateUrl:"views/student-form.html", controller:"StudentFormController"})
    .when("/companies", {templateUrl:"views/companies.html", controller:"CompaniesController"})
    .when("/companies/new", {templateUrl:"views/company-form.html", controller:"CompanyFormController"})
    .when("/companies/edit/:id", {templateUrl:"views/company-form.html", controller:"CompanyFormController"})
    .when("/applications", {templateUrl:"views/applications.html", controller:"ApplicationsController"})
    .when("/placements", {templateUrl:"views/placements.html", controller:"PlacementsController"})
    .when("/reports", {templateUrl:"views/reports.html", controller:"ReportsController"})
    .otherwise({redirectTo:"/"});
})
.run(function(StorageService){ StorageService.save(); })
.controller("AppController", function($scope, $rootScope, StorageService, ToastService){
  $scope.toast={show:false};
  $scope.$on("toast:show",function(e,d){
    $scope.toast={show:true,message:d.message,type:d.type};
    setTimeout(function(){$scope.$apply(function(){$scope.toast.show=false;});},2800);
  });
  $scope.resetDemo=function(){
    if(confirm("Reset all application data to professional demo data?")){
      StorageService.reset(); location.reload();
    }
  };
  $rootScope.exportCSV=function(type){
    var data=StorageService.all()[type]||[];
    if(!data.length){ ToastService.show("No data available to export.","warning"); return; }
    var keys=Object.keys(data[0]);
    var csv=[keys.join(",")].concat(data.map(function(row){
      return keys.map(function(k){ return '"'+String(row[k]??"").replace(/"/g,'""')+'"'; }).join(",");
    })).join("\n");
    var blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=type+"-export.csv"; a.click(); URL.revokeObjectURL(a.href);
  };
});