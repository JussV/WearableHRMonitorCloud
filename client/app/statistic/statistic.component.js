'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');
const Highcharts = require('highcharts/highstock');
require('highcharts/modules/exporting')(Highcharts);
import routes from './statistic.routes';

export class StatisticComponent {

  /*@ngInject*/
  constructor($http, $filter, $q, $scope) {
    this.$http = $http;
    this.$scope = $scope;
    this.message = 'Hello';
    this.intervals = [15, 30];
    this.intervalSelect = this.intervals[0];
    let self = this;
    $scope.loader = {loading: true};
    let today = new Date();
    $scope.endDate = today.toISOString().slice(0, 10);
    let fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(today.getDate() - 5);
    $scope.startDate = fiveDaysAgo.toISOString().slice(0, 10);
    this.getData($http, $filter, $q, $scope, fiveDaysAgo.getTime(), today.getTime(), this.intervalSelect).then(function(res) {
      $scope.statsChartOpts = {
        rangeSelector: {
          inputEnabled: false,
        },

        legend: {
          enabled: true
        },

        navigator: {
          enabled: true,
        },

        yAxis: {
          labels: {
            format: '{value}'
          },
          lineWidth: 3,
          tickInterval: 15,
          opposite: false
        },

        xAxis: {
          minRange: 1800 * 1000, // half an hour
        },

        plotOptions: {
          series: {
            showInNavigator: true,
          }
        },

        colors: ['#F7DD00', '#2b908f', '#26645D', '#ECBF00', '#AA3939', '#90ed7d', '#f45b5b', '#7cb5ec'],

        scrollbar: {
          liveRedraw: false
        },

        tooltip: {
          pointFormat: '<span style="color:{point.color}">●<strong>{point.y:.2f} bpm</strong> '
        },

        series: res
      };
    });

    $scope.submit = function() {
      if($scope.statsForm.$valid) {
        self.getData($http, $filter, $q, $scope, new Date($scope.startDate).getTime(), new Date($scope.endDate).getTime(), self.intervalSelect).then(function(res) {
          $scope.statsChartOpts.series = res;
        });
      } else {
        return;
      }
    };
  }

  getData($http, $filter, $q, $scope, startDate, endDate, interval) {
    let start = null;
    if(startDate) {
      start = startDate;
    }
    let end = null;
    if(endDate) {
      end = endDate;
    }
    $scope.loader.loading = true;
    let defer = $q.defer();
    let seriesOptions = [];
    let promises = [];
    function lastTask() {
      defer.resolve(seriesOptions);
      $scope.loader.loading = false;
    }
    promises.push(
      $http({
        method: 'JSONP',
      //  url: 'https://unlock-your-wearable.herokuapp.com/api/heartrates/show/chart'})
        url: 'http://localhost:3000/api/heartrates/show/interval/statistics?interval=' + interval + '&startDate=' + start + '&endDate=' + end})
        .then(function(res) {
          angular.forEach(res.data, function(obj, i) {
            seriesOptions[i] = {
              name: obj.device.name,
              data: obj.heartrates
            };
          });
        }));
    $q.all(promises).then(lastTask);
    return defer.promise;
  }
}

export default angular.module('wearableHrmonitorCloudApp.statistic', [uiRouter])
  .config(routes)
  .component('statistic', {
    template: require('./statistic.html'),
    controller: StatisticComponent,
    controllerAs: 'statisticCtrl'
  })
  .directive('hcStats', function() {
    return {
      restrict: 'EC',
      replace: true,
      template: '<div></div>',
      scope: {
        options: '='
      },
      link: function(scope, element) {
        scope.$watch('options', function(newValue) {
          if(typeof newValue != 'undefined' && newValue.series !== null && newValue.series.length > 0) {
            Highcharts.stockChart(element[0], scope.options);
          }
        }, true);
      }
    };
  })
  .name;
