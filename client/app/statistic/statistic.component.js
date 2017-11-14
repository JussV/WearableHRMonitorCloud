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
    let self = this;

    this.getData($http, $filter, $q).then(function(res) {
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
  }

  getData($http, $filter, $q) {
    let defer = $q.defer();
    let seriesOptions = [];
    let promises = [];
    function lastTask() {
      defer.resolve(seriesOptions);
    }
    promises.push(
      $http({
        method: 'JSONP',
      //  url: 'https://unlock-your-wearable.herokuapp.com/api/heartrates/show/chart'})
        url: 'http://localhost:3000/api/heartrates/show/interval/statistics?interval=15&startDate=1509922800000&endDate=1510441200000'})
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
