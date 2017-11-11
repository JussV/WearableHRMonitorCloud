'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('heartrate', {
      url: '/heartrate',
      template: '<heartrate></heartrate>'
    });
}
