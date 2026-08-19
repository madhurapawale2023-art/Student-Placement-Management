angular.module("placementApp")
.controller("DashboardController", function($scope, StorageService){
  var d=StorageService.all(); $scope.data=d;
  $scope.stats=function(){
    var placed=d.students.filter(function(s){return s.placementStatus==="Placed";});
    var packages=placed.map(function(s){return Number(s.package)||0;}).filter(Boolean);
    return {
      students:d.students.length, placed:placed.length, companies:d.companies.length,
      applications:d.applications.length, rate:d.students.length?Math.round(placed.length/d.students.length*100):0,
      avg:packages.length?(packages.reduce(function(a,b){return a+b;},0)/packages.length).toFixed(2):"0.00",
      high:packages.length?Math.max.apply(null,packages).toFixed(2):"0.00"
    };
  };
  $scope.statsData=$scope.stats();
  $scope.departments=d.students.reduce(function(a,s){
    a[s.department]=a[s.department]||{total:0,placed:0}; a[s.department].total++;
    if(s.placementStatus==="Placed")a[s.department].placed++; return a;
  },{});
  $scope.upcoming=d.students.filter(function(s){return s.interviewDate && new Date(s.interviewDate)>=new Date();}).sort(function(a,b){return new Date(a.interviewDate)-new Date(b.interviewDate);}).slice(0,5);
})
.controller("StudentsController", function($scope,$location,StorageService,ToastService){
  $scope.students=StorageService.all().students;
  $scope.filters={search:"",department:"",batch:"",placement:"",application:""};
  $scope.departments=[...new Set($scope.students.map(function(s){return s.department;}))];
  $scope.batches=[...new Set($scope.students.map(function(s){return s.batch;}))];
  $scope.filtered=function(s){
    var f=$scope.filters,q=f.search.toLowerCase();
    return (!q||[s.id,s.name,s.email,s.department,s.company].join(" ").toLowerCase().indexOf(q)>=0)
      &&(!f.department||s.department===f.department)&&(!f.batch||s.batch===f.batch)
      &&(!f.placement||s.placementStatus===f.placement)&&(!f.application||s.applicationStatus===f.application);
  };
  $scope.edit=function(id){$location.path("/students/edit/"+id);};
  $scope.remove=function(s){
    if(confirm("Delete "+s.name+"?")){var a=$scope.students,i=a.indexOf(s);a.splice(i,1);StorageService.save();ToastService.show("Student deleted.");}
  };
})
.controller("StudentFormController", function($scope,$routeParams,$location,StorageService,ToastService){
  var data=StorageService.all(), id=$routeParams.id;
  $scope.editMode=!!id; $scope.departments=["Computer Engineering","Information Technology","Mechanical Engineering","Electronics","Civil Engineering"];
  $scope.form=id?angular.copy(data.students.find(function(s){return s.id===id;})): {gender:"Female",batch:"2027",placementStatus:"Not Placed",applicationStatus:"Applied",package:0};
  $scope.save=function(){
    if(!$scope.form.name||!$scope.form.email||!$scope.form.department||!$scope.form.cgpa){ToastService.show("Please complete required fields.","warning");return;}
    if(id){var i=data.students.findIndex(function(s){return s.id===id;});data.students[i]=$scope.form;}
    else {$scope.form.id=StorageService.nextId("STU",data.students);data.students.push($scope.form);}
    StorageService.save(); ToastService.show(id?"Student updated successfully.":"Student added successfully."); $location.path("/students");
  };
})
.controller("CompaniesController", function($scope,$location,StorageService,ToastService){
  $scope.companies=StorageService.all().companies;$scope.q="";
  $scope.filtered=function(c){return !($scope.q)&&true || [c.id,c.name,c.industry,c.city,c.jobRole].join(" ").toLowerCase().indexOf($scope.q.toLowerCase())>=0;};
  $scope.edit=function(id){$location.path("/companies/edit/"+id);};
  $scope.remove=function(c){if(confirm("Delete "+c.name+"?")){$scope.companies.splice($scope.companies.indexOf(c),1);StorageService.save();ToastService.show("Company deleted.");}};
})
.controller("CompanyFormController", function($scope,$routeParams,$location,StorageService,ToastService){
  var data=StorageService.all(),id=$routeParams.id;$scope.editMode=!!id;
  $scope.form=id?angular.copy(data.companies.find(function(c){return c.id===id;})):{country:"India",workMode:"Hybrid",status:"Active",experience:"Fresher"};
  $scope.save=function(){
    if(!$scope.form.name||!$scope.form.industry||!$scope.form.jobRole){ToastService.show("Please complete required fields.","warning");return;}
    if(id){data.companies[data.companies.findIndex(function(c){return c.id===id;})]=$scope.form;}
    else {$scope.form.id=StorageService.nextId("COM",data.companies);data.companies.push($scope.form);}
    StorageService.save();ToastService.show(id?"Company updated successfully.":"Company added successfully.");$location.path("/companies");
  };
})
.controller("ApplicationsController", function($scope,StorageService,ToastService){
  var d=StorageService.all();$scope.applications=d.applications;$scope.students=d.students;$scope.companies=d.companies;$scope.q="";
  $scope.add=function(){
    if(!$scope.form||!$scope.form.studentId||!$scope.form.company){ToastService.show("Select student and company.","warning");return;}
    var s=d.students.find(function(x){return x.id===$scope.form.studentId;});
    var app=angular.copy($scope.form);app.id=StorageService.nextId("APP",d.applications);app.student=s.name;app.applyDate=app.applyDate||new Date().toISOString().slice(0,10);app.status=app.status||"Applied";d.applications.push(app);StorageService.save();$scope.form={};ToastService.show("Application added.");
  };
  $scope.remove=function(a){if(confirm("Delete this application?")){$scope.applications.splice($scope.applications.indexOf(a),1);StorageService.save();ToastService.show("Application deleted.");}};
})
.controller("PlacementsController", function($scope,StorageService,ToastService){
  var d=StorageService.all();$scope.placements=d.placements;$scope.students=d.students;
  $scope.add=function(){
    if(!$scope.form||!$scope.form.student||!$scope.form.company||!$scope.form.package){ToastService.show("Student, company and package are required.","warning");return;}
    var p=angular.copy($scope.form);p.id=StorageService.nextId("PLC",d.placements);p.status=p.status||"Confirmed";d.placements.push(p);
    var s=d.students.find(function(x){return x.name===p.student;}); if(s){s.placementStatus="Placed";s.company=p.company;s.package=Number(p.package);s.jobRole=p.role;}
    d.activities.unshift({type:"Placement",text:p.student+" placed at "+p.company,date:new Date().toISOString().slice(0,10)});
    StorageService.save();$scope.form={};ToastService.show("Placement record added.");
  };
  $scope.remove=function(p){if(confirm("Delete this placement?")){$scope.placements.splice($scope.placements.indexOf(p),1);StorageService.save();ToastService.show("Placement deleted.");}};
})
.controller("ReportsController", function($scope,StorageService){
  var d=StorageService.all();$scope.students=d.students;$scope.applications=d.applications;$scope.placements=d.placements;$scope.companies=d.companies;
  $scope.statusCount=function(status){return d.applications.filter(function(a){return a.status===status;}).length;};
  $scope.companyCount=function(company){return d.placements.filter(function(p){return p.company===company.name;}).length;};
});