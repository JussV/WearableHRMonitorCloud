'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('statistic', {
      url: '/statistic',
      authenticate: true,
      template: '<statistic></statistic>'
    });
}
