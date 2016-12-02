'use strict';

describe('Service: utilityFactory', function () {

  // load the service's module
  beforeEach(module('travelFinderApp'));

  // instantiate service
  var utilityFactory;
  beforeEach(inject(function (_utilityFactory_) {
    utilityFactory = _utilityFactory_;
  }));

  it('should do something', function () {
    expect(!!utilityFactory).toBe(true);
  });

});
