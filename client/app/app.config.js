'use strict';

export function routeConfig($urlRouterProvider, $locationProvider, $sceDelegateProvider) {
  'ngInject';

  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://www.highcharts.com/samples/data/jsonp.php**',
    'https://www.highcharts.com/samples/data/from-sql.php**',
    'https://unlock-your-wearable.herokuapp.com/api/heartrates/show/chart**',
    'http://localhost:3000/api/heartrates/show/chart**'
  ]);
}
