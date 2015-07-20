(function() {

  var navbar = angular.module('navbar-directive',[]);

  navbar.directive('navbar', function() {
    return {
      templateUrl: 'components/navbar.html',
      controller: ['$scope', function($scope) {
        $scope.brand = 'Mathematical Equation Graph';
      }],
      controllerAs: 'navbarCtrl'
    };
  });

})();