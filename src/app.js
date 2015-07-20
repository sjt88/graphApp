(function() {

var app = angular.module('graphEquationsApp', ['navbar-directive']);

app.controller('GraphController', ['$scope', function($scope){
    /**
     * returns an array of [x,y] coordinates which form a cosine curve
     * axesModel's x values are used for the min/max values
     */
    function generateCos() {
      var data = {
        key: 'Math.cos(x/10)',
        color: '#FF8B00',
        values:[]
      };
      var min = $scope.axesModel.x.min;
      var max = $scope.axesModel.x.max;
      for (var i = min; i < max+1; i++) {
        data.values.push({x:i,y:Math.cos(i/10)});
      }
      return data;
    }

    /**
     * returns an array of [x,y] coordinates forming a sine curve
     * axesModel's x values are used for the min/max values
     */
    function generateSin() {
      var data = {
        key: 'Math.sin(x/10)',
        color: '#2D176D',
        values:[]
      };
      var min = $scope.axesModel.x.min;
      var max = $scope.axesModel.x.max;
      for (var i = min; i < max+1; i++) {
        data.values.push({x:i,y:Math.sin(i/10)});
      }
      return data;
    }

    /**
     * returns array of [x,y] coordinates forming a curve based on the user input expression
     */
    function generateCustomExpressionData(expressionString) {
      console.log(expressionString);
      var data = {
        key: expressionString,
        color: '#ff0000',
        values:[]
      };
      var min = $scope.axesModel.x.min;
      var max = $scope.axesModel.x.max;
      for (var x = min; x < max+1; x++) {
        data.values.push({ x:x, y: eval(expressionString)} );
      }
      return data;
    }

    /** 
     * set graphs x/y min/max ranges
     * these are pulled from the axesModel
     */
    $scope.setDomain = function() {
      var x = $scope.axesModel.x;
      var y = $scope.axesModel.y;
      $scope.chart.xDomain([x.min, x.max]);
      $scope.chart.yDomain([y.min, y.max]);
      $scope.updateGraph();
    };

    /**
     * update graph with chosen equations
     */
    $scope.updateGraph = function() {
      $scope.graphData = [];
      if ($scope.checkboxModel.sin) $scope.graphData.push(generateSin());
      if ($scope.checkboxModel.cos) $scope.graphData.push(generateCos());
      if ($scope.customExpression) $scope.graphData.push(generateCustomExpressionData($scope.customExpression));
      d3.select('#chart').datum($scope.graphData).call($scope.chart);
    };

    /**
     * Attempts to parse the input expression string
     */
    $scope.parseEq = function() {
      try {
        var output = jsep($scope.customEq);
        $scope.customExpression = rebuildEq(output);
        $scope.updateGraph();
      } catch (err) {
        alert('could not parse equation');
        console.log(err);
        return;
      }

      /**
       * Extracts & rebuilds the equation from parsed expression tree
       * can't handle multiple arguments within a function call :(
      */
      function rebuildEq(obj) {
        var left;
        var right;
        if (typeof obj.left === 'undefined' && typeof obj.right === 'undefined' && obj.type !== 'CallExpression') return;
        var args;
        if (obj.type === 'CallExpression') {
          console.log(obj);
          if (obj.arguments[0].right) {
            args = rebuildEq(obj.arguments[0]);
          } else if (obj.arguments[0].raw) {
            args = obj.arguments[0].raw;
          } else if (obj.arguments[0].name) {
            args = obj.arguments[0].name;
          }
          return obj.callee.object.name + '.' + obj.callee.property.name + '(' + args + ')';
        }

        if (obj.left.left) left = rebuildEq(obj.left);
        if (obj.right.right) right = rebuildEq(obj.right);

        var newleft = false;
        var newright = false;

        if (obj.left.raw) newleft = obj.left.raw;
        if (obj.right.raw) newright = obj.right.raw;
        if (obj.left.name) newleft = obj.left.name;
        if (obj.right.name) newright = obj.right.name;

        if (obj.left.type === 'CallExpression') newleft = rebuildEq(obj.left);
        if (obj.right.type === 'CallExpression') newright = rebuildEq(obj.right);


        if (newleft && newright) {
          return newleft + obj.operator + newright;
        } else if (newleft) {
          return newleft + obj.operator + right;
        } else if (newright) {
          return left + obj.operator + newright;
        } else {
          return left + obj.operator + right;
        }
      }

    };

    $scope.checkboxModel = {
      cos:true,
      sin:true,
    };
    $scope.axesModel = {
      x: {
        min: 0,
        max: 100
      },
      y: {
        min: -1,
        max: 1
      }
    };

    $scope.customEq = '';
    $scope.chart = nv.models.lineChart()
            .useInteractiveGuideline(true)
            .showLegend(true)
            .showYAxis(true)
            .showXAxis(true);
    $scope.chart.xAxis
        .axisLabel('X')
        .tickFormat(d3.format(',r'));
    $scope.chart.yAxis
        .axisLabel('Y')
        .tickFormat(d3.format('.02f'));
    $scope.graphData = [];
    nv.utils.windowResize(function() { $scope.chart.update(); });
    $scope.updateGraph({cos:true,sin:true});

}]);

app.directive('lineChart', function($window){
  return {
    restrict:'EA',
    template: '<svg id="chart" width="960" height="500"></svg>'
  };
});

})();