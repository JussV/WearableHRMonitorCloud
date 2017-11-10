'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');
const Highcharts = require('highcharts/highstock');
require('highcharts/modules/exporting')(Highcharts);

import routes from './heartrate.routes';

export class HeartrateComponent {
  seriesOptions = [];
  chartOptions = {};

  /*@ngInject*/
  constructor($http, $filter, $q, $scope) {
    this.$http = $http;
    this.message = 'Hello';
    this.getData($q, $http, $filter).then(function(res) {
      $scope.chartOptions = {
        rangeSelector: {
          selected: 1
        },

        yAxis: {
          plotLines: [{
            value: 0,
            width: 2,
            color: 'silver'
          }]
        },

        plotOptions: {
          series: {
            compare: 'percent',
            showInNavigator: true
          }
        },

        series: res
      };
    });
  }

  drawChart(seriesOptions) {
    //  var seriesCounter = 0;
    this.chartOptions = {
      rangeSelector: {
        selected: 1
      },

      yAxis: {
        plotLines: [{
          value: 0,
          width: 2,
          color: 'silver'
        }]
      },

      plotOptions: {
        series: {
          compare: 'percent',
          showInNavigator: true
        }
      },

      series: seriesOptions
    };
  }

  getData($q, $http, $filter) {
    let defer = $q.defer();
    let seriesOptions = [];
    let names = ['MSFT', 'AAPL', 'GOOG'];
    let promises = [];

    function lastTask() {
      console.log('finished');
      defer.resolve(seriesOptions);
    }

    angular.forEach(names, function(name, i) {
      promises.push(
        $http({
          method: 'JSONP',
          url: 'https://www.highcharts.com/samples/data/jsonp.php?filename=' + $filter('lowercase')(name) + '-c.json'}).then(function(data) {
            seriesOptions[i] = {
              name: name,
              data: data.data
            };
          })
      );
    });
    $q.all(promises).then(lastTask);
    return defer.promise;
  }
}

export default angular.module('wearableHrmonitorCloudApp.heartrate', [uiRouter])
  .config(routes)
  .component('heartrate', {
    template: require('./heartrate.html'),
    controller: HeartrateComponent,
    controllerAs: 'heartrateCtrl'
  })
  .directive('hcChart', function() {
    return {
      restrict: 'EC',
      replace: true,
      template: '<div></div>',
      scope: {
        options: '='
      },
      link: function(scope, element) {
        scope.$watch('options', function(newValue) {
          if(newValue != undefined && newValue.series !== null) {
            var chart = Highcharts.stockChart(element[0], scope.options);
            chart.series[0].setData(newValue, true);
          }
        }, true);
      }
    };
  })
  .name;
