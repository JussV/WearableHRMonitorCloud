'use strict';

describe('Component: HeartrateComponent', function() {
  // load the controller's module
  beforeEach(module('wearableHrmonitorCloudApp.heartrate'));

  var HeartrateComponent;
  var scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($http, $filter, $q, $rootScope, $componentController) {
    scope = $rootScope.$new();
    HeartrateComponent = $componentController('heartrate', {
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
