/*!
 * Hubot Airbrake Script.
 *
 * LOOKK Dev Team <dev@lookk.com>
 * http://lookk.com
 * MIT License
 */

/**
 * Support.
 */
var should = require('chai').should();
var jack = require('jack');

/**
 * Subject.
 */
var airbrake = require('../lib/hubot-airbrake');
var Exception = airbrake.Exception;
var Project = airbrake.Project;
var Request = airbrake.Request;
var Formatter = airbrake.Formatter;


describe('Exception', function() {
  it('accepts env and message', function() {
    var exception = new Exception('env', 'message');

    exception.env().should.eql('env');
    exception.message().should.eql('message');
  });

  describe('#env', function() {
    it('is accessor', function() {
      var subject = new Exception;

      subject.env('env');
      subject.env().should.eql('env');
    });
  });

  describe('#message', function() {
    it('is accessor', function() {
      var subject = new Exception;

      subject.message('foo');
      subject.message().should.eql('foo');
    });
  });
});

describe('Formatter', function() {
  describe('#format', function() {
    it('returns empty array if there are no exceptions', function() {
      var formatter = new Formatter;
      formatter.format([]).should.eql([]);
    });

    it('returns congrats message when there are no exceptions and forece is tru', function() {
      var formatter = new Formatter;
      formatter.format([], {force: true}).should.eql(['There are 0 unresolved exceptions. You are the man!']);
    });

    it('returns an array with formatted exceptions', function() {
      var formatter = new Formatter;
      var exceptions = [new Exception('env', 'msg')];

      formatter.format(exceptions).should.eql(['Unresolved exceptions: 1', '', '- (env) msg']);
    });
  });
});

describe('Project', function() {
  describe('#params', function() {
    it('can build request params', function() {
      var project = new Project('name', 'token');
      project.params().should.eql({name: 'name', token: 'token'})
    });
  });

  describe('#unresolved', function() {
    it('can return request errors', function(done) {
      var engine = new Request;

      engine.stub('get').and.replace(function(_, fn) {
        fn(new Error);
      });

      var project = new Project('name', 'token', engine);

      project.unresolved(function(err) {
        err.should.be.ok;
        done();
      });
    });

    it('can return airbrake exceptions', function(done) {
      var engine = new Request;

      engine.stub('get').and.replace(function(_, fn) {
        var exception = {
          'rails-env': 'env',
          'error-message': 'message',
        };

        fn(null, [exception]);
      });

      var project = new Project('name', 'token', engine);

      project.unresolved(function(_, exceptions) {
        exceptions[0].env().should.eql('env');
        exceptions[0].message().should.eql('message');
        done();
      });
    });
  });

  describe('Request', function() {
    it('accepts driver and parser', function() {
      var request = new Request('driver', 'parser');

      request.driver.should.eql('driver');
      request.parser.should.eql('parser');
    });

    it('can build an airbrake url from supplied params', function() {
      var request = new Request;
      request.url({name: 'name', token: 'token'}).should.eql('https://name.airbrake.io/errors.xml?auth_token=token');
    });

    describe('#get', function() {
      it('fetches exceptions', function(done) {
        var driver = {
          get: function(_, fn) {
            fn(null, null, 'error');
          }
        };

        var parser = {
          toJson: function() {
            return '{ "groups": { "group": "errors" } }';
          }
        };

        var request = new Request(driver, parser);

        request.get({}, function(_, errors) {
          errors.should.eql('errors');
          done();
        });
      });

      it('returns http errors', function(done) {
        var driver = {
          get: function(_, fn) {
            fn('err');
          }
        };

        var request = new Request(driver);

        request.get({}, function(err) {
          err.should.be.ok;
          done();
        });
      });

      it('returns parsing errors', function(done) {
        var driver = {
          get: function(_, fn) {
            fn();
          }
        };

        var parser = {
          toJson: function() {
            return 'not json at all';
          }
        };

        var request = new Request(driver);

        request.get({}, function(err) {
          err.should.be.ok;
          done();
        });
      });
    });
  });
});
