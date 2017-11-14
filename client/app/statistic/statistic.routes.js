'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('statistic', {
      url: '/statistic',
      template: '<statistic></statistic>'
    });
}
