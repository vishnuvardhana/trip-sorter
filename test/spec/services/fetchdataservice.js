'use strict';

describe('Service: fetchDataService', function () {

  // load the service's module
  beforeEach(module('travelFinderApp'));

  // instantiate service
  var fetchDataService;
  beforeEach(inject(function (_fetchDataService_) {
    fetchDataService = _fetchDataService_;
  }));

  it('should do something', function () {
    expect(!!fetchDataService).toBe(true);
  });

});
