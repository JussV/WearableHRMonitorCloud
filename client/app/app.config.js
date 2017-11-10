'use strict';

export function routeConfig($urlRouterProvider, $locationProvider, $sceDelegateProvider) {
  'ngInject';

  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://www.highcharts.com/samples/data/jsonp.php**'
  ]);
}
