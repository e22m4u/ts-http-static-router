import {expect} from 'chai';
import {Service} from '@e22m4u/js-service';
import {DebuggableService} from './debuggable-service.js';

describe('DebuggableService', function () {
  it('has the debug method', function () {
    const res = new DebuggableService();
    expect(typeof res.debug).to.be.eq('function');
  });

  describe('constructor', function () {
    it('extends the Service class', function () {
      const res = new DebuggableService();
      expect(res).to.be.instanceof(Service);
    });
  });
});
