'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');
const Highcharts = require('highcharts/highstock');
require('highcharts/modules/exporting')(Highcharts);

import routes from './heartrate.routes';

export class HeartrateComponent {


  /*@ngInject*/
  constructor($http, $filter, $q, $scope) {
    this.$http = $http;
    this.$scope = $scope;
    this.message = 'Hello';
    let self = this;
    $scope.loader = {loading: true};
   /* let today = new Date();
    let todayToMiliSec = $filter('inMilliseconds')(today);
    let beforeOneWeek = new Date();
    beforeOneWeek.setDate(beforeOneWeek.getDate() - 5);
    let beforeOneWeekToMiliSec = $filter('inMilliseconds')(beforeOneWeek);*/
    this.getData($http, $filter, $q, $scope).then(function(res) {
      $scope.chartOptions = {
        rangeSelector: {
          buttons: [{
            type: 'hour',
            count: 1,
            text: '1h'
          }, {
            type: 'hour',
            count: 6,
            text: '6h'
          }, {
            type: 'hour',
            count: 12,
            text: '12h'
          }, {
            type: 'day',
            count: 1,
            text: '1d'
          }, {
            type: 'day',
            count: 3,
            text: '3d'
          }, {
            type: 'week',
            count: 1,
            text: '1w'
          }, {
            type: 'week',
            count: 2,
            text: '2w'
          }/*, {
            type: 'month',
            count: 1,
            text: '1m'
          }*/],
          inputEnabled: true,
          selected: 6
        },

        legend: {
          enabled: true
        },

        navigator: {
          enabled: true,
        //  adaptToUpdatedData: false
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

        colors: ['#f45b5b', '#7cb5ec', '#2b908f', '#7cb5ec', '#ECBF00', '#26645D', '#AA3939', '#90ed7d', '#F7DD00'],

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

  getData($http, $filter, $q, $scope) {
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
        url: 'https://unlock-your-wearable.herokuapp.com/api/heartrates/show/chart'})
      //  url: 'http://localhost:3000/api/heartrates/show/chart'})
        .then(function(res) {
          angular.forEach(res.data, function(obj, i) {
            seriesOptions[i] = {
              name: obj.device[0].name,
              data: obj.data
            };
          });
        }));
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
          if(typeof newValue != 'undefined' && newValue.series !== null && newValue.series.length > 0) {
            Highcharts.stockChart(element[0], scope.options);
           /* if(chart.series.setData) {
             // chart.series.setData(newValue, true);
              angular.forEach(newValue, function(serie, i) {
                chart.series[i].setData(serie);
              });
            }*/
          }
        }, true);
      }
    };
  })
  .filter('inMilliseconds', function() {
    return function(x) {
      return new Date(x).getTime();
    };
  })
  .name;
