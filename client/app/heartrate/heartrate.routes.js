'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('heartrate', {
      url: '/heartrate',
      authenticate: true,
      template: '<heartrate></heartrate>'
    });
}
