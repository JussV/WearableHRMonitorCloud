'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('statistic', {
      url: '/',
      authenticate: true,
      template: '<statistic></statistic>'
    });
}
