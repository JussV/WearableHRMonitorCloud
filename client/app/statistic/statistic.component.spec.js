'use strict';

describe('Component: StatisticComponent', function() {
  // load the controller's module
  beforeEach(module('wearableHrmonitorCloudApp.statistic'));

  var StatisticComponent;
  var scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($http, $filter, $q, $rootScope, $componentController) {
    scope = $rootScope.$new();
    StatisticComponent = $componentController('statistic', {
      $http,
      $filter,
      $q,
      $scope: scope
    });
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
