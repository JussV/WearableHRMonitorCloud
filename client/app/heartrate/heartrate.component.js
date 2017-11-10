'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');
const Highcharts = require('highcharts/highstock');
require('highcharts/modules/exporting')(Highcharts);

import routes from './heartrate.routes';

export class HeartrateComponent {
  seriesOptions = [];
  chartOptions = {};

  /**
   * Load new data depending on the selected min and max
   */


  /*@ngInject*/
  constructor($http, $filter, $q, $scope) {
    $scope.afterSetExtremes = function(e) {
      var chart = Highcharts.charts[0];
     // chart.showLoading('Loading data from server...');
    }
    this.$http = $http;
    this.message = 'Hello';
    this.getData($q, $http, $filter).then(function(res) {
      $scope.chartOptions = {
        rangeSelector: {
          selected: 1
        },

        legend: {
          enabled: true
        },

        navigator: {
          enabled: true,
          adaptToUpdatedData: false
        },

        yAxis: {
          labels: {
            format: '{value}'
          },
          lineWidth: 3,
          opposite: false
         /* floor: 0,
          ceiling: 180,
          allowDecimals: false*!/
         /* maxPadding: 0.1,
          startOnTick: false,
          endOnTick: true*/
        },

        xAxis: {
          events: {
            afterSetExtremes: $scope.afterSetExtremes
          },
          minRange: 1800 * 1000, // half an hour
        },

        plotOptions: {
          series: {
            showInNavigator: true,
          }
        },

        colors: ['#f45b5b', '#7cb5ec', '#2b908f', '#7cb5ec', '#ECBF00', '#26645D', '#AA3939', '#90ed7d', '#F7DD00' ],

        scrollbar: {
          liveRedraw: false
        },

        tooltip: {
          pointFormat: '<span style="color:{point.color}">●<strong>{point.y:.2f} bpm</strong> '
       /*   pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
          valueDecimals: 2,
          split: true*/
        },

        series: res
      };
    });
  }

  getData($q, $http, $filter) {
    let defer = $q.defer();
    let seriesOptions = [];
    let names = [11, 200];
    let uniquePhoneId = 'c25965ee-1854-4bf9-9a97-ec1c9c275d4b';
    let promises = [];

    function lastTask() {
      console.log('finished');
      defer.resolve(seriesOptions);
    }

    var today = new Date();
    var todayToMiliSec = $filter('inMilliseconds')(today);
    var beforeOneWeek = new Date();
    beforeOneWeek.setDate(beforeOneWeek.getDate() - 5);
    var beforeOneWeekToMiliSec = $filter('inMilliseconds')(beforeOneWeek);
    /*angular.forEach(names, function(name, i) {
      promises.push(
        $http({
          method: 'JSONP',
          url: 'http://localhost:3000/api/heartrates/' + name + '/heartrates?startDate=' + beforeOneWeekToMiliSec + '&endDate=' + todayToMiliSec + '&uniquePhoneId=' + uniquePhoneId })
          .then(function(data) {
            seriesOptions[i] = {
              name: name,
              data: data.data,
              threshold: 0
            };
          })
      );
    });
    $q.all(promises).then(lastTask);
    return defer.promise;*/
    promises.push(
    $http({
      method: 'JSONP',
      url: 'http://localhost:3000/api/heartrates/show/chart?startDate=' + beforeOneWeekToMiliSec + '&endDate=' + todayToMiliSec + '&uniquePhoneId=' + uniquePhoneId })
      .then(function(res) {
        angular.forEach(res.data, function(obj, i) {
          seriesOptions[i] = {
            name: obj._id,
            data: obj.data,
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
          if(newValue != undefined && newValue.series !== null && newValue.series.length > 0) {
            var chart = Highcharts.stockChart(element[0], scope.options);
            chart.series.setData(newValue, true);
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
