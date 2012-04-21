/*!
 * Hubot Airbrake Script.
 *
 * LOOKK Dev Team <dev@lookk.com>
 * http://lookk.com
 * MIT License
 */

/**
 * Dependencies.
 */
var env = process.env;
var request = require('request');
var xmlParser = require('xml2json');

/**
 * Project class.
 *
 * @param {String} name
 * @param {String} token
 * @param {Object} [optional] request engine
 * @api public
 */
function Project(name, token, engine) {
  this.name = name;
  this.token = token;
  this.engine = engine || new Request;
};

/**
 * Return the unresolved errors.
 *
 * @param {Function} callback
 * @api public
 */
Project.prototype.unresolved = function(fn) {
  this.engine.get(this.params(), function(err, items) {
    if (err) return fn(err);

    var exceptions = items.map(function(item){
      return new Exception(item['rails-env'], item['error-message']);
    });

    fn(null, exceptions);
  });
};

/**
 * Build request params.
 *
 * @returns {Object}
 * @api public
 */
Project.prototype.params = function() {
  var name = this.name;
  var token = this.token;

  return {
    name: name,
    token: token,
  };
};

/**
 * Request. Used for HTTP requests.
 *
 * @param {Object} driver
 * @param {Object} parser
 * @api public
 */
function Request(driver, parser) {
  this.driver = driver || request;
  this.parser = parser || xmlParser;
};

/**
 * Fetch exceptions form airbrake.
 *
 * @param {Object} params
 * @param {Function} callback
 * @api public
 */
Request.prototype.get = function(params, fn) {
  var parser = this.parser;

  this.driver.get(this.url(params), function(err, res, body) {
    if (err) return fn(err);
    var response = null;

    try {
      response = JSON.parse(parser.toJson(body))
      if (response.errors) err = new Error(response.errors.error);
    } catch (e) {
      err = e;
    }

    if (err) return fn(err);
    fn(null, response.groups.group);
  });
};

/**
 * Return errors url.
 *
 * @param {Object} params
 * @returns {String}
 * @api public
 */
Request.prototype.url = function(params) {
  return 'https://{name}.airbrake.io/errors.xml?auth_token={token}'
    .replace('{name}', params.name)
    .replace('{token}', params.token);
};

/**
 * Exception class. Represents Airbrake exception.
 *
 * @param {String} env
 * @param {String} Message
 * @api public
 */
function Exception(env, message) {
  return this.env(env).message(message);
};

/**
 * env accessor.
 *
 * @param {String} env
 * @returns {String} env
 * @api public
 */
Exception.prototype.env = function(env) {
  if (arguments.length === 0) return this._env;
  this._env = env;
  return this;
};

/**
 * Message accessor.
 *
 * @param {String} message
 * @returns {String} message
 * @api public
 */
Exception.prototype.message = function(message) {
  if (arguments.length === 0) return this._message;
  this._message = message;
  return this;
};

/**
 * Exception formatter.
 *
 * @api public
 */
function Formatter() {};

/**
 * Format the supplied excpetions.
 *
 * @param {Array} exceptions
 * @param {Object} params
 * @returns {Array}
 */
Formatter.prototype.format = function(exceptions, params) {
  var out = [];
  params || (params = {});

  if (exceptions.length === 0) {
    if (params.force) out.push('There are 0 unresolved exceptions. You are the man!');
    return out;
  }

  out.push('Unresolved exceptions: ' + exceptions.length);
  out.push('');

  exceptions.forEach(function(exception) {
    out.push('- ' + '(' + exception.env() + ') ' + exception.message());
  });

  return out;
};

/**
 * Initializer.
 *
 * @param {Object} Hubot.
 */
var initializer = function(robot) {

  /**
   * Project name.
   *
   * @type {String}
   */
  var name = env.AIRBRAKE_PROJECT;

  /**
   * Airbrake token
   *
   * @type {String}
   */
  var token = env.AIRBRAKE_AUTH_TOKEN;

  /**
   * Unresolved errors interval.
   *
   * @type {Number}
   */
  var interval = +env.AIRBRAKE_INTERVAL;

  /**
   * The airbrake project.
   *
   * @type {Object}
   */
  var project = new Project(name, token);

  /**
   * The errors printer.
   *
   * @type {Object}
   */
  var formatter = new Formatter;

  /**
   * Print the unresolved errors.
   *
   * @params {Object} params
   * @returns {Function}
   */
  var printErrors = function(params) {
    return function() {
      project.unresolved(function(err, exceptions) {
        if (err) return console.log('Airbrake gave me an error: ' + err);

        var out = formatter.format(exceptions, params);

        switch (out.length) {
          case 0:
            break;
          case 1:
            console.log(out[0]);
            break;
          default:
            console.log(out.join('\n'));
        }
      });
    };
  };

  /**
   * The robot responds to:
   *
   *    "show me airbrake"
   */
  robot.respond(/show me airbrake/i, printErrors({ force: true }));

  /**
   * Checks if an interval is set and if so
   * it prints the unresolved errors every `interval` ms.
   */
  if (interval) setTimeout(printErrors(), interval);
};

/**
 * Expose `Initializer`.
 */
module.exports = initializer;

/**
 * Expose `Project`.
 */
module.exports.Project = Project;

/**
 * Expose `Request`.
 */
module.exports.Request = Request;

/**
 * Expose `Exception`.
 */
module.exports.Exception = Exception;

/**
 * Expose `Formatter`.
 */
module.exports.Formatter = Formatter;
