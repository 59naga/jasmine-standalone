/*
Copyright (c) 2008-2015 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var getJasmineRequireObj = (function (jasmineGlobal) {
  var jasmineRequire;

  if (typeof module !== 'undefined' && module.exports) {
    jasmineGlobal = global;
    jasmineRequire = exports;
  } else {
    if (typeof window !== 'undefined' && typeof window.toString === 'function' && window.toString() === '[object GjsGlobal]') {
      jasmineGlobal = window;
    }
    jasmineRequire = jasmineGlobal.jasmineRequire = jasmineGlobal.jasmineRequire || {};
  }

  function getJasmineRequire() {
    return jasmineRequire;
  }

  getJasmineRequire().core = function(jRequire) {
    var j$ = {};

    jRequire.base(j$, jasmineGlobal);
    j$.util = jRequire.util();
    j$.errors = jRequire.errors();
    j$.Any = jRequire.Any(j$);
    j$.Anything = jRequire.Anything(j$);
    j$.CallTracker = jRequire.CallTracker();
    j$.MockDate = jRequire.MockDate();
    j$.Clock = jRequire.Clock();
    j$.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler();
    j$.Env = jRequire.Env(j$);
    j$.ExceptionFormatter = jRequire.ExceptionFormatter();
    j$.Expectation = jRequire.Expectation();
    j$.buildExpectationResult = jRequire.buildExpectationResult();
    j$.JsApiReporter = jRequire.JsApiReporter();
    j$.matchersUtil = jRequire.matchersUtil(j$);
    j$.ObjectContaining = jRequire.ObjectContaining(j$);
    j$.ArrayContaining = jRequire.ArrayContaining(j$);
    j$.pp = jRequire.pp(j$);
    j$.QueueRunner = jRequire.QueueRunner(j$);
    j$.ReportDispatcher = jRequire.ReportDispatcher();
    j$.Spec = jRequire.Spec(j$);
    j$.SpyRegistry = jRequire.SpyRegistry(j$);
    j$.SpyStrategy = jRequire.SpyStrategy();
    j$.StringMatching = jRequire.StringMatching(j$);
    j$.Suite = jRequire.Suite(j$);
    j$.Timer = jRequire.Timer();
    j$.TreeProcessor = jRequire.TreeProcessor();
    j$.version = jRequire.version();

    j$.matchers = jRequire.requireMatchers(jRequire, j$);

    return j$;
  };

  return getJasmineRequire;
})(this);

getJasmineRequireObj().requireMatchers = function(jRequire, j$) {
  var availableMatchers = [
      'toBe',
      'toBeCloseTo',
      'toBeDefined',
      'toBeFalsy',
      'toBeGreaterThan',
      'toBeLessThan',
      'toBeNaN',
      'toBeNull',
      'toBeTruthy',
      'toBeUndefined',
      'toContain',
      'toEqual',
      'toHaveBeenCalled',
      'toHaveBeenCalledWith',
      'toMatch',
      'toThrow',
      'toThrowError'
    ],
    matchers = {};

  for (var i = 0; i < availableMatchers.length; i++) {
    var name = availableMatchers[i];
    matchers[name] = jRequire[name](j$);
  }

  return matchers;
};

getJasmineRequireObj().base = function(j$, jasmineGlobal) {
  j$.unimplementedMethod_ = function() {
    throw new Error('unimplemented method');
  };

  j$.MAX_PRETTY_PRINT_DEPTH = 40;
  j$.MAX_PRETTY_PRINT_ARRAY_LENGTH = 100;
  j$.DEFAULT_TIMEOUT_INTERVAL = 5000;

  j$.getGlobal = function() {
    return jasmineGlobal;
  };

  j$.getEnv = function(options) {
    var env = j$.currentEnv_ = j$.currentEnv_ || new j$.Env(options);
    //jasmine. singletons in here (setTimeout blah blah).
    return env;
  };

  j$.isArray_ = function(value) {
    return j$.isA_('Array', value);
  };

  j$.isString_ = function(value) {
    return j$.isA_('String', value);
  };

  j$.isNumber_ = function(value) {
    return j$.isA_('Number', value);
  };

  j$.isA_ = function(typeName, value) {
    return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
  };

  j$.isDomNode = function(obj) {
    return obj.nodeType > 0;
  };

  j$.fnNameFor = function(func) {
    return func.name || func.toString().match(/^\s*function\s*(\w*)\s*\(/)[1];
  };

  j$.any = function(clazz) {
    return new j$.Any(clazz);
  };

  j$.anything = function() {
    return new j$.Anything();
  };

  j$.objectContaining = function(sample) {
    return new j$.ObjectContaining(sample);
  };

  j$.stringMatching = function(expected) {
    return new j$.StringMatching(expected);
  };

  j$.arrayContaining = function(sample) {
    return new j$.ArrayContaining(sample);
  };

  j$.createSpy = function(name, originalFn) {

    var spyStrategy = new j$.SpyStrategy({
        name: name,
        fn: originalFn,
        getSpy: function() { return spy; }
      }),
      callTracker = new j$.CallTracker(),
      spy = function() {
        var callData = {
          object: this,
          args: Array.prototype.slice.apply(arguments)
        };

        callTracker.track(callData);
        var returnValue = spyStrategy.exec.apply(this, arguments);
        callData.returnValue = returnValue;

        return returnValue;
      };

    for (var prop in originalFn) {
      if (prop === 'and' || prop === 'calls') {
        throw new Error('Jasmine spies would overwrite the \'and\' and \'calls\' properties on the object being spied upon');
      }

      spy[prop] = originalFn[prop];
    }

    spy.and = spyStrategy;
    spy.calls = callTracker;

    return spy;
  };

  j$.isSpy = function(putativeSpy) {
    if (!putativeSpy) {
      return false;
    }
    return putativeSpy.and instanceof j$.SpyStrategy &&
      putativeSpy.calls instanceof j$.CallTracker;
  };

  j$.createSpyObj = function(baseName, methodNames) {
    if (j$.isArray_(baseName) && j$.util.isUndefined(methodNames)) {
      methodNames = baseName;
      baseName = 'unknown';
    }

    if (!j$.isArray_(methodNames) || methodNames.length === 0) {
      throw 'createSpyObj requires a non-empty array of method names to create spies for';
    }
    var obj = {};
    for (var i = 0; i < methodNames.length; i++) {
      obj[methodNames[i]] = j$.createSpy(baseName + '.' + methodNames[i]);
    }
    return obj;
  };
};

getJasmineRequireObj().util = function() {

  var util = {};

  util.inherit = function(childClass, parentClass) {
    var Subclass = function() {
    };
    Subclass.prototype = parentClass.prototype;
    childClass.prototype = new Subclass();
  };

  util.htmlEscape = function(str) {
    if (!str) {
      return str;
    }
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  util.argsToArray = function(args) {
    var arrayOfArgs = [];
    for (var i = 0; i < args.length; i++) {
      arrayOfArgs.push(args[i]);
    }
    return arrayOfArgs;
  };

  util.isUndefined = function(obj) {
    return obj === void 0;
  };

  util.arrayContains = function(array, search) {
    var i = array.length;
    while (i--) {
      if (array[i] === search) {
        return true;
      }
    }
    return false;
  };

  util.clone = function(obj) {
    if (Object.prototype.toString.apply(obj) === '[object Array]') {
      return obj.slice();
    }

    var cloned = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        cloned[prop] = obj[prop];
      }
    }

    return cloned;
  };

  return util;
};

getJasmineRequireObj().Spec = function(j$) {
  function Spec(attrs) {
    this.expectationFactory = attrs.expectationFactory;
    this.resultCallback = attrs.resultCallback || function() {};
    this.id = attrs.id;
    this.description = attrs.description || '';
    this.queueableFn = attrs.queueableFn;
    this.beforeAndAfterFns = attrs.beforeAndAfterFns || function() { return {befores: [], afters: []}; };
    this.userContext = attrs.userContext || function() { return {}; };
    this.onStart = attrs.onStart || function() {};
    this.getSpecName = attrs.getSpecName || function() { return ''; };
    this.expectationResultFactory = attrs.expectationResultFactory || function() { };
    this.queueRunnerFactory = attrs.queueRunnerFactory || function() {};
    this.catchingExceptions = attrs.catchingExceptions || function() { return true; };
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;

    if (!this.queueableFn.fn) {
      this.pend();
    }

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      failedExpectations: [],
      passedExpectations: [],
      pendingReason: ''
    };
  }

  Spec.prototype.addExpectationResult = function(passed, data, isError) {
    var expectationResult = this.expectationResultFactory(data);
    if (passed) {
      this.result.passedExpectations.push(expectationResult);
    } else {
      this.result.failedExpectations.push(expectationResult);

      if (this.throwOnExpectationFailure && !isError) {
        throw new j$.errors.ExpectationFailed();
      }
    }
  };

  Spec.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Spec.prototype.execute = function(onComplete, enabled) {
    var self = this;

    this.onStart(this);

    if (!this.isExecutable() || this.markedPending || enabled === false) {
      complete(enabled);
      return;
    }

    var fns = this.beforeAndAfterFns();
    var allFns = fns.befores.concat(this.queueableFn).concat(fns.afters);

    this.queueRunnerFactory({
      queueableFns: allFns,
      onException: function() { self.onException.apply(self, arguments); },
      onComplete: complete,
      userContext: this.userContext()
    });

    function complete(enabledAgain) {
      self.result.status = self.status(enabledAgain);
      self.resultCallback(self.result);

      if (onComplete) {
        onComplete();
      }
    }
  };

  Spec.prototype.onException = function onException(e) {
    if (Spec.isPendingSpecException(e)) {
      this.pend(extractCustomPendingMessage(e));
      return;
    }

    if (e instanceof j$.errors.ExpectationFailed) {
      return;
    }

    this.addExpectationResult(false, {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: e
    }, true);
  };

  Spec.prototype.disable = function() {
    this.disabled = true;
  };

  Spec.prototype.pend = function(message) {
    this.markedPending = true;
    if (message) {
      this.result.pendingReason = message;
    }
  };

  Spec.prototype.getResult = function() {
    this.result.status = this.status();
    return this.result;
  };

  Spec.prototype.status = function(enabled) {
    if (this.disabled || enabled === false) {
      return 'disabled';
    }

    if (this.markedPending) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'passed';
    }
  };

  Spec.prototype.isExecutable = function() {
    return !this.disabled;
  };

  Spec.prototype.getFullName = function() {
    return this.getSpecName(this);
  };

  var extractCustomPendingMessage = function(e) {
    var fullMessage = e.toString(),
        boilerplateStart = fullMessage.indexOf(Spec.pendingSpecExceptionMessage),
        boilerplateEnd = boilerplateStart + Spec.pendingSpecExceptionMessage.length;

    return fullMessage.substr(boilerplateEnd);
  };

  Spec.pendingSpecExceptionMessage = '=> marked Pending';

  Spec.isPendingSpecException = function(e) {
    return !!(e && e.toString && e.toString().indexOf(Spec.pendingSpecExceptionMessage) !== -1);
  };

  return Spec;
};

if (typeof window == void 0 && typeof exports == 'object') {
  exports.Spec = jasmineRequire.Spec;
}

getJasmineRequireObj().Env = function(j$) {
  function Env(options) {
    options = options || {};

    var self = this;
    var global = options.global || j$.getGlobal();

    var totalSpecsDefined = 0;

    var catchExceptions = true;

    var realSetTimeout = j$.getGlobal().setTimeout;
    var realClearTimeout = j$.getGlobal().clearTimeout;
    this.clock = new j$.Clock(global, function () { return new j$.DelayedFunctionScheduler(); }, new j$.MockDate(global));

    var runnableLookupTable = {};
    var runnableResources = {};

    var currentSpec = null;
    var currentlyExecutingSuites = [];
    var currentDeclarationSuite = null;
    var throwOnExpectationFailure = false;

    var currentSuite = function() {
      return currentlyExecutingSuites[currentlyExecutingSuites.length - 1];
    };

    var currentRunnable = function() {
      return currentSpec || currentSuite();
    };

    var reporter = new j$.ReportDispatcher([
      'jasmineStarted',
      'jasmineDone',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ]);

    this.specFilter = function() {
      return true;
    };

    this.addCustomEqualityTester = function(tester) {
      if(!currentRunnable()) {
        throw new Error('Custom Equalities must be added in a before function or a spec');
      }
      runnableResources[currentRunnable().id].customEqualityTesters.push(tester);
    };

    this.addMatchers = function(matchersToAdd) {
      if(!currentRunnable()) {
        throw new Error('Matchers must be added in a before function or a spec');
      }
      var customMatchers = runnableResources[currentRunnable().id].customMatchers;
      for (var matcherName in matchersToAdd) {
        customMatchers[matcherName] = matchersToAdd[matcherName];
      }
    };

    j$.Expectation.addCoreMatchers(j$.matchers);

    var nextSpecId = 0;
    var getNextSpecId = function() {
      return 'spec' + nextSpecId++;
    };

    var nextSuiteId = 0;
    var getNextSuiteId = function() {
      return 'suite' + nextSuiteId++;
    };

    var expectationFactory = function(actual, spec) {
      return j$.Expectation.Factory({
        util: j$.matchersUtil,
        customEqualityTesters: runnableResources[spec.id].customEqualityTesters,
        customMatchers: runnableResources[spec.id].customMatchers,
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
      }
    };

    var defaultResourcesForRunnable = function(id, parentRunnableId) {
      var resources = {spies: [], customEqualityTesters: [], customMatchers: {}};

      if(runnableResources[parentRunnableId]){
        resources.customEqualityTesters = j$.util.clone(runnableResources[parentRunnableId].customEqualityTesters);
        resources.customMatchers = j$.util.clone(runnableResources[parentRunnableId].customMatchers);
      }

      runnableResources[id] = resources;
    };

    var clearResourcesForRunnable = function(id) {
        spyRegistry.clearSpies();
        delete runnableResources[id];
    };

    var beforeAndAfterFns = function(suite) {
      return function() {
        var befores = [],
          afters = [];

        while(suite) {
          befores = befores.concat(suite.beforeFns);
          afters = afters.concat(suite.afterFns);

          suite = suite.parentSuite;
        }

        return {
          befores: befores.reverse(),
          afters: afters
        };
      };
    };

    var getSpecName = function(spec, suite) {
      return suite.getFullName() + ' ' + spec.description;
    };

    // TODO: we may just be able to pass in the fn instead of wrapping here
    var buildExpectationResult = j$.buildExpectationResult,
        exceptionFormatter = new j$.ExceptionFormatter(),
        expectationResultFactory = function(attrs) {
          attrs.messageFormatter = exceptionFormatter.message;
          attrs.stackFormatter = exceptionFormatter.stack;

          return buildExpectationResult(attrs);
        };

    // TODO: fix this naming, and here's where the value comes in
    this.catchExceptions = function(value) {
      catchExceptions = !!value;
      return catchExceptions;
    };

    this.catchingExceptions = function() {
      return catchExceptions;
    };

    var maximumSpecCallbackDepth = 20;
    var currentSpecCallbackDepth = 0;

    function clearStack(fn) {
      currentSpecCallbackDepth++;
      if (currentSpecCallbackDepth >= maximumSpecCallbackDepth) {
        currentSpecCallbackDepth = 0;
        realSetTimeout(fn, 0);
      } else {
        fn();
      }
    }

    var catchException = function(e) {
      return j$.Spec.isPendingSpecException(e) || catchExceptions;
    };

    this.throwOnExpectationFailure = function(value) {
      throwOnExpectationFailure = !!value;
    };

    this.throwingExpectationFailures = function() {
      return throwOnExpectationFailure;
    };

    var queueRunnerFactory = function(options) {
      options.catchException = catchException;
      options.clearStack = options.clearStack || clearStack;
      options.timeout = {setTimeout: realSetTimeout, clearTimeout: realClearTimeout};
      options.fail = self.fail;

      new j$.QueueRunner(options).execute();
    };

    var topSuite = new j$.Suite({
      env: this,
      id: getNextSuiteId(),
      description: 'Jasmine__TopLevel__Suite',
      queueRunner: queueRunnerFactory
    });
    runnableLookupTable[topSuite.id] = topSuite;
    defaultResourcesForRunnable(topSuite.id);
    currentDeclarationSuite = topSuite;

    this.topSuite = function() {
      return topSuite;
    };

    this.execute = function(runnablesToRun) {
      if(!runnablesToRun) {
        if (focusedRunnables.length) {
          runnablesToRun = focusedRunnables;
        } else {
          runnablesToRun = [topSuite.id];
        }
      }
      var processor = new j$.TreeProcessor({
        tree: topSuite,
        runnableIds: runnablesToRun,
        queueRunnerFactory: queueRunnerFactory,
        nodeStart: function(suite) {
          currentlyExecutingSuites.push(suite);
          defaultResourcesForRunnable(suite.id, suite.parentSuite.id);
          reporter.suiteStarted(suite.result);
        },
        nodeComplete: function(suite, result) {
          if (!suite.disabled) {
            clearResourcesForRunnable(suite.id);
          }
          currentlyExecutingSuites.pop();
          reporter.suiteDone(result);
        }
      });

      if(!processor.processTree().valid) {
        throw new Error('Invalid order: would cause a beforeAll or afterAll to be run multiple times');
      }

      reporter.jasmineStarted({
        totalSpecsDefined: totalSpecsDefined
      });

      processor.execute(reporter.jasmineDone);
    };

    this.addReporter = function(reporterToAdd) {
      reporter.addReporter(reporterToAdd);
    };

    var spyRegistry = new j$.SpyRegistry({currentSpies: function() {
      if(!currentRunnable()) {
        throw new Error('Spies must be created in a before function or a spec');
      }
      return runnableResources[currentRunnable().id].spies;
    }});

    this.spyOn = function() {
      return spyRegistry.spyOn.apply(spyRegistry, arguments);
    };

    var suiteFactory = function(description) {
      var suite = new j$.Suite({
        env: self,
        id: getNextSuiteId(),
        description: description,
        parentSuite: currentDeclarationSuite,
        expectationFactory: expectationFactory,
        expectationResultFactory: expectationResultFactory,
        throwOnExpectationFailure: throwOnExpectationFailure
      });

      runnableLookupTable[suite.id] = suite;
      return suite;
    };

    this.describe = function(description, specDefinitions) {
      var suite = suiteFactory(description);
      addSpecsToSuite(suite, specDefinitions);
      return suite;
    };

    this.xdescribe = function(description, specDefinitions) {
      var suite = this.describe(description, specDefinitions);
      suite.disable();
      return suite;
    };

    var focusedRunnables = [];

    this.fdescribe = function(description, specDefinitions) {
      var suite = suiteFactory(description);
      suite.isFocused = true;

      focusedRunnables.push(suite.id);
      unfocusAncestor();
      addSpecsToSuite(suite, specDefinitions);

      return suite;
    };

    function addSpecsToSuite(suite, specDefinitions) {
      var parentSuite = currentDeclarationSuite;
      parentSuite.addChild(suite);
      currentDeclarationSuite = suite;

      var declarationError = null;
      try {
        specDefinitions.call(suite);
      } catch (e) {
        declarationError = e;
      }

      if (declarationError) {
        self.it('encountered a declaration exception', function() {
          throw declarationError;
        });
      }

      currentDeclarationSuite = parentSuite;
    }

    function findFocusedAncestor(suite) {
      while (suite) {
        if (suite.isFocused) {
          return suite.id;
        }
        suite = suite.parentSuite;
      }

      return null;
    }

    function unfocusAncestor() {
      var focusedAncestor = findFocusedAncestor(currentDeclarationSuite);
      if (focusedAncestor) {
        for (var i = 0; i < focusedRunnables.length; i++) {
          if (focusedRunnables[i] === focusedAncestor) {
            focusedRunnables.splice(i, 1);
            break;
          }
        }
      }
    }

    var specFactory = function(description, fn, suite, timeout) {
      totalSpecsDefined++;
      var spec = new j$.Spec({
        id: getNextSpecId(),
        beforeAndAfterFns: beforeAndAfterFns(suite),
        expectationFactory: expectationFactory,
        resultCallback: specResultCallback,
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: specStarted,
        description: description,
        expectationResultFactory: expectationResultFactory,
        queueRunnerFactory: queueRunnerFactory,
        userContext: function() { return suite.clonedSharedUserContext(); },
        queueableFn: {
          fn: fn,
          timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
        },
        throwOnExpectationFailure: throwOnExpectationFailure
      });

      runnableLookupTable[spec.id] = spec;

      if (!self.specFilter(spec)) {
        spec.disable();
      }

      return spec;

      function specResultCallback(result) {
        clearResourcesForRunnable(spec.id);
        currentSpec = null;
        reporter.specDone(result);
      }

      function specStarted(spec) {
        currentSpec = spec;
        defaultResourcesForRunnable(spec.id, suite.id);
        reporter.specStarted(spec.result);
      }
    };

    this.it = function(description, fn, timeout) {
      var spec = specFactory(description, fn, currentDeclarationSuite, timeout);
      currentDeclarationSuite.addChild(spec);
      return spec;
    };

    this.xit = function() {
      var spec = this.it.apply(this, arguments);
      spec.pend();
      return spec;
    };

    this.fit = function(){
      var spec = this.it.apply(this, arguments);

      focusedRunnables.push(spec.id);
      unfocusAncestor();
      return spec;
    };

    this.expect = function(actual) {
      if (!currentRunnable()) {
        throw new Error('\'expect\' was used when there was no current spec, this could be because an asynchronous test timed out');
      }

      return currentRunnable().expect(actual);
    };

    this.beforeEach = function(beforeEachFunction, timeout) {
      currentDeclarationSuite.beforeEach({
        fn: beforeEachFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.beforeAll = function(beforeAllFunction, timeout) {
      currentDeclarationSuite.beforeAll({
        fn: beforeAllFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.afterEach = function(afterEachFunction, timeout) {
      currentDeclarationSuite.afterEach({
        fn: afterEachFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.afterAll = function(afterAllFunction, timeout) {
      currentDeclarationSuite.afterAll({
        fn: afterAllFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.pending = function(message) {
      var fullMessage = j$.Spec.pendingSpecExceptionMessage;
      if(message) {
        fullMessage += message;
      }
      throw fullMessage;
    };

    this.fail = function(error) {
      var message = 'Failed';
      if (error) {
        message += ': ';
        message += error.message || error;
      }

      currentRunnable().addExpectationResult(false, {
        matcherName: '',
        passed: false,
        expected: '',
        actual: '',
        message: message,
        error: error && error.message ? error : null
      });
    };
  }

  return Env;
};

getJasmineRequireObj().JsApiReporter = function() {

  var noopTimer = {
    start: function(){},
    elapsed: function(){ return 0; }
  };

  function JsApiReporter(options) {
    var timer = options.timer || noopTimer,
        status = 'loaded';

    this.started = false;
    this.finished = false;

    this.jasmineStarted = function() {
      this.started = true;
      status = 'started';
      timer.start();
    };

    var executionTime;

    this.jasmineDone = function() {
      this.finished = true;
      executionTime = timer.elapsed();
      status = 'done';
    };

    this.status = function() {
      return status;
    };

    var suites = [],
      suites_hash = {};

    this.suiteStarted = function(result) {
      suites_hash[result.id] = result;
    };

    this.suiteDone = function(result) {
      storeSuite(result);
    };

    this.suiteResults = function(index, length) {
      return suites.slice(index, index + length);
    };

    function storeSuite(result) {
      suites.push(result);
      suites_hash[result.id] = result;
    }

    this.suites = function() {
      return suites_hash;
    };

    var specs = [];

    this.specDone = function(result) {
      specs.push(result);
    };

    this.specResults = function(index, length) {
      return specs.slice(index, index + length);
    };

    this.specs = function() {
      return specs;
    };

    this.executionTime = function() {
      return executionTime;
    };

  }

  return JsApiReporter;
};

getJasmineRequireObj().CallTracker = function() {

  function CallTracker() {
    var calls = [];

    this.track = function(context) {
      calls.push(context);
    };

    this.any = function() {
      return !!calls.length;
    };

    this.count = function() {
      return calls.length;
    };

    this.argsFor = function(index) {
      var call = calls[index];
      return call ? call.args : [];
    };

    this.all = function() {
      return calls;
    };

    this.allArgs = function() {
      var callArgs = [];
      for(var i = 0; i < calls.length; i++){
        callArgs.push(calls[i].args);
      }

      return callArgs;
    };

    this.first = function() {
      return calls[0];
    };

    this.mostRecent = function() {
      return calls[calls.length - 1];
    };

    this.reset = function() {
      calls = [];
    };
  }

  return CallTracker;
};

getJasmineRequireObj().Clock = function() {
  function Clock(global, delayedFunctionSchedulerFactory, mockDate) {
    var self = this,
      realTimingFunctions = {
        setTimeout: global.setTimeout,
        clearTimeout: global.clearTimeout,
        setInterval: global.setInterval,
        clearInterval: global.clearInterval
      },
      fakeTimingFunctions = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
      },
      installed = false,
      delayedFunctionScheduler,
      timer;


    self.install = function() {
      if(!originalTimingFunctionsIntact()) {
        throw new Error('Jasmine Clock was unable to install over custom global timer functions. Is the clock already installed?');
      }
      replace(global, fakeTimingFunctions);
      timer = fakeTimingFunctions;
      delayedFunctionScheduler = delayedFunctionSchedulerFactory();
      installed = true;

      return self;
    };

    self.uninstall = function() {
      delayedFunctionScheduler = null;
      mockDate.uninstall();
      replace(global, realTimingFunctions);

      timer = realTimingFunctions;
      installed = false;
    };

    self.withMock = function(closure) {
      this.install();
      try {
        closure();
      } finally {
        this.uninstall();
      }
    };

    self.mockDate = function(initialDate) {
      mockDate.install(initialDate);
    };

    self.setTimeout = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error('IE < 9 cannot support extra params to setTimeout without a polyfill');
        }
        return timer.setTimeout(fn, delay);
      }
      return Function.prototype.apply.apply(timer.setTimeout, [global, arguments]);
    };

    self.setInterval = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error('IE < 9 cannot support extra params to setInterval without a polyfill');
        }
        return timer.setInterval(fn, delay);
      }
      return Function.prototype.apply.apply(timer.setInterval, [global, arguments]);
    };

    self.clearTimeout = function(id) {
      return Function.prototype.call.apply(timer.clearTimeout, [global, id]);
    };

    self.clearInterval = function(id) {
      return Function.prototype.call.apply(timer.clearInterval, [global, id]);
    };

    self.tick = function(millis) {
      if (installed) {
        mockDate.tick(millis);
        delayedFunctionScheduler.tick(millis);
      } else {
        throw new Error('Mock clock is not installed, use jasmine.clock().install()');
      }
    };

    return self;

    function originalTimingFunctionsIntact() {
      return global.setTimeout === realTimingFunctions.setTimeout &&
        global.clearTimeout === realTimingFunctions.clearTimeout &&
        global.setInterval === realTimingFunctions.setInterval &&
        global.clearInterval === realTimingFunctions.clearInterval;
    }

    function legacyIE() {
      //if these methods are polyfilled, apply will be present
      return !(realTimingFunctions.setTimeout || realTimingFunctions.setInterval).apply;
    }

    function replace(dest, source) {
      for (var prop in source) {
        dest[prop] = source[prop];
      }
    }

    function setTimeout(fn, delay) {
      return delayedFunctionScheduler.scheduleFunction(fn, delay, argSlice(arguments, 2));
    }

    function clearTimeout(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function setInterval(fn, interval) {
      return delayedFunctionScheduler.scheduleFunction(fn, interval, argSlice(arguments, 2), true);
    }

    function clearInterval(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function argSlice(argsObj, n) {
      return Array.prototype.slice.call(argsObj, n);
    }
  }

  return Clock;
};

getJasmineRequireObj().DelayedFunctionScheduler = function() {
  function DelayedFunctionScheduler() {
    var self = this;
    var scheduledLookup = [];
    var scheduledFunctions = {};
    var currentTime = 0;
    var delayedFnCount = 0;

    self.tick = function(millis) {
      millis = millis || 0;
      var endTime = currentTime + millis;

      runScheduledFunctions(endTime);
      currentTime = endTime;
    };

    self.scheduleFunction = function(funcToCall, millis, params, recurring, timeoutKey, runAtMillis) {
      var f;
      if (typeof(funcToCall) === 'string') {
        /* jshint evil: true */
        f = function() { return eval(funcToCall); };
        /* jshint evil: false */
      } else {
        f = funcToCall;
      }

      millis = millis || 0;
      timeoutKey = timeoutKey || ++delayedFnCount;
      runAtMillis = runAtMillis || (currentTime + millis);

      var funcToSchedule = {
        runAtMillis: runAtMillis,
        funcToCall: f,
        recurring: recurring,
        params: params,
        timeoutKey: timeoutKey,
        millis: millis
      };

      if (runAtMillis in scheduledFunctions) {
        scheduledFunctions[runAtMillis].push(funcToSchedule);
      } else {
        scheduledFunctions[runAtMillis] = [funcToSchedule];
        scheduledLookup.push(runAtMillis);
        scheduledLookup.sort(function (a, b) {
          return a - b;
        });
      }

      return timeoutKey;
    };

    self.removeFunctionWithId = function(timeoutKey) {
      for (var runAtMillis in scheduledFunctions) {
        var funcs = scheduledFunctions[runAtMillis];
        var i = indexOfFirstToPass(funcs, function (func) {
          return func.timeoutKey === timeoutKey;
        });

        if (i > -1) {
          if (funcs.length === 1) {
            delete scheduledFunctions[runAtMillis];
            deleteFromLookup(runAtMillis);
          } else {
            funcs.splice(i, 1);
          }

          // intervals get rescheduled when executed, so there's never more
          // than a single scheduled function with a given timeoutKey
          break;
        }
      }
    };

    return self;

    function indexOfFirstToPass(array, testFn) {
      var index = -1;

      for (var i = 0; i < array.length; ++i) {
        if (testFn(array[i])) {
          index = i;
          break;
        }
      }

      return index;
    }

    function deleteFromLookup(key) {
      var value = Number(key);
      var i = indexOfFirstToPass(scheduledLookup, function (millis) {
        return millis === value;
      });

      if (i > -1) {
        scheduledLookup.splice(i, 1);
      }
    }

    function reschedule(scheduledFn) {
      self.scheduleFunction(scheduledFn.funcToCall,
        scheduledFn.millis,
        scheduledFn.params,
        true,
        scheduledFn.timeoutKey,
        scheduledFn.runAtMillis + scheduledFn.millis);
    }

    function forEachFunction(funcsToRun, callback) {
      for (var i = 0; i < funcsToRun.length; ++i) {
        callback(funcsToRun[i]);
      }
    }

    function runScheduledFunctions(endTime) {
      if (scheduledLookup.length === 0 || scheduledLookup[0] > endTime) {
        return;
      }

      do {
        currentTime = scheduledLookup.shift();

        var funcsToRun = scheduledFunctions[currentTime];
        delete scheduledFunctions[currentTime];

        forEachFunction(funcsToRun, function(funcToRun) {
          if (funcToRun.recurring) {
            reschedule(funcToRun);
          }
        });

        forEachFunction(funcsToRun, function(funcToRun) {
          funcToRun.funcToCall.apply(null, funcToRun.params || []);
        });
      } while (scheduledLookup.length > 0 &&
              // checking first if we're out of time prevents setTimeout(0)
              // scheduled in a funcToRun from forcing an extra iteration
                 currentTime !== endTime  &&
                 scheduledLookup[0] <= endTime);
    }
  }

  return DelayedFunctionScheduler;
};

getJasmineRequireObj().ExceptionFormatter = function() {
  function ExceptionFormatter() {
    this.message = function(error) {
      var message = '';

      if (error.name && error.message) {
        message += error.name + ': ' + error.message;
      } else {
        message += error.toString() + ' thrown';
      }

      if (error.fileName || error.sourceURL) {
        message += ' in ' + (error.fileName || error.sourceURL);
      }

      if (error.line || error.lineNumber) {
        message += ' (line ' + (error.line || error.lineNumber) + ')';
      }

      return message;
    };

    this.stack = function(error) {
      return error ? error.stack : null;
    };
  }

  return ExceptionFormatter;
};

getJasmineRequireObj().Expectation = function() {

  function Expectation(options) {
    this.util = options.util || { buildFailureMessage: function() {} };
    this.customEqualityTesters = options.customEqualityTesters || [];
    this.actual = options.actual;
    this.addExpectationResult = options.addExpectationResult || function(){};
    this.isNot = options.isNot;

    var customMatchers = options.customMatchers || {};
    for (var matcherName in customMatchers) {
      this[matcherName] = Expectation.prototype.wrapCompare(matcherName, customMatchers[matcherName]);
    }
  }

  Expectation.prototype.wrapCompare = function(name, matcherFactory) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0),
        expected = args.slice(0),
        message = '';

      args.unshift(this.actual);

      var matcher = matcherFactory(this.util, this.customEqualityTesters),
          matcherCompare = matcher.compare;

      function defaultNegativeCompare() {
        var result = matcher.compare.apply(null, args);
        result.pass = !result.pass;
        return result;
      }

      if (this.isNot) {
        matcherCompare = matcher.negativeCompare || defaultNegativeCompare;
      }

      var result = matcherCompare.apply(null, args);

      if (!result.pass) {
        if (!result.message) {
          args.unshift(this.isNot);
          args.unshift(name);
          message = this.util.buildFailureMessage.apply(null, args);
        } else {
          if (Object.prototype.toString.apply(result.message) === '[object Function]') {
            message = result.message();
          } else {
            message = result.message;
          }
        }
      }

      if (expected.length == 1) {
        expected = expected[0];
      }

      // TODO: how many of these params are needed?
      this.addExpectationResult(
        result.pass,
        {
          matcherName: name,
          passed: result.pass,
          message: message,
          actual: this.actual,
          expected: expected // TODO: this may need to be arrayified/sliced
        }
      );
    };
  };

  Expectation.addCoreMatchers = function(matchers) {
    var prototype = Expectation.prototype;
    for (var matcherName in matchers) {
      var matcher = matchers[matcherName];
      prototype[matcherName] = prototype.wrapCompare(matcherName, matcher);
    }
  };

  Expectation.Factory = function(options) {
    options = options || {};

    var expect = new Expectation(options);

    // TODO: this would be nice as its own Object - NegativeExpectation
    // TODO: copy instead of mutate options
    options.isNot = true;
    expect.not = new Expectation(options);

    return expect;
  };

  return Expectation;
};

//TODO: expectation result may make more sense as a presentation of an expectation.
getJasmineRequireObj().buildExpectationResult = function() {
  function buildExpectationResult(options) {
    var messageFormatter = options.messageFormatter || function() {},
      stackFormatter = options.stackFormatter || function() {};

    var result = {
      matcherName: options.matcherName,
      message: message(),
      stack: stack(),
      passed: options.passed
    };

    if(!result.passed) {
      result.expected = options.expected;
      result.actual = options.actual;
    }

    return result;

    function message() {
      if (options.passed) {
        return 'Passed.';
      } else if (options.message) {
        return options.message;
      } else if (options.error) {
        return messageFormatter(options.error);
      }
      return '';
    }

    function stack() {
      if (options.passed) {
        return '';
      }

      var error = options.error;
      if (!error) {
        try {
          throw new Error(message());
        } catch (e) {
          error = e;
        }
      }
      return stackFormatter(error);
    }
  }

  return buildExpectationResult;
};

getJasmineRequireObj().MockDate = function() {
  function MockDate(global) {
    var self = this;
    var currentTime = 0;

    if (!global || !global.Date) {
      self.install = function() {};
      self.tick = function() {};
      self.uninstall = function() {};
      return self;
    }

    var GlobalDate = global.Date;

    self.install = function(mockDate) {
      if (mockDate instanceof GlobalDate) {
        currentTime = mockDate.getTime();
      } else {
        currentTime = new GlobalDate().getTime();
      }

      global.Date = FakeDate;
    };

    self.tick = function(millis) {
      millis = millis || 0;
      currentTime = currentTime + millis;
    };

    self.uninstall = function() {
      currentTime = 0;
      global.Date = GlobalDate;
    };

    createDateProperties();

    return self;

    function FakeDate() {
      switch(arguments.length) {
        case 0:
          return new GlobalDate(currentTime);
        case 1:
          return new GlobalDate(arguments[0]);
        case 2:
          return new GlobalDate(arguments[0], arguments[1]);
        case 3:
          return new GlobalDate(arguments[0], arguments[1], arguments[2]);
        case 4:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3]);
        case 5:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4]);
        case 6:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4], arguments[5]);
        default:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4], arguments[5], arguments[6]);
      }
    }

    function createDateProperties() {
      FakeDate.prototype = GlobalDate.prototype;

      FakeDate.now = function() {
        if (GlobalDate.now) {
          return currentTime;
        } else {
          throw new Error('Browser does not support Date.now()');
        }
      };

      FakeDate.toSource = GlobalDate.toSource;
      FakeDate.toString = GlobalDate.toString;
      FakeDate.parse = GlobalDate.parse;
      FakeDate.UTC = GlobalDate.UTC;
    }
	}

  return MockDate;
};

getJasmineRequireObj().pp = function(j$) {

  function PrettyPrinter() {
    this.ppNestLevel_ = 0;
    this.seen = [];
  }

  PrettyPrinter.prototype.format = function(value) {
    this.ppNestLevel_++;
    try {
      if (j$.util.isUndefined(value)) {
        this.emitScalar('undefined');
      } else if (value === null) {
        this.emitScalar('null');
      } else if (value === 0 && 1/value === -Infinity) {
        this.emitScalar('-0');
      } else if (value === j$.getGlobal()) {
        this.emitScalar('<global>');
      } else if (value.jasmineToString) {
        this.emitScalar(value.jasmineToString());
      } else if (typeof value === 'string') {
        this.emitString(value);
      } else if (j$.isSpy(value)) {
        this.emitScalar('spy on ' + value.and.identity());
      } else if (value instanceof RegExp) {
        this.emitScalar(value.toString());
      } else if (typeof value === 'function') {
        this.emitScalar('Function');
      } else if (typeof value.nodeType === 'number') {
        this.emitScalar('HTMLNode');
      } else if (value instanceof Date) {
        this.emitScalar('Date(' + value + ')');
      } else if (j$.util.arrayContains(this.seen, value)) {
        this.emitScalar('<circular reference: ' + (j$.isArray_(value) ? 'Array' : 'Object') + '>');
      } else if (j$.isArray_(value) || j$.isA_('Object', value)) {
        this.seen.push(value);
        if (j$.isArray_(value)) {
          this.emitArray(value);
        } else {
          this.emitObject(value);
        }
        this.seen.pop();
      } else {
        this.emitScalar(value.toString());
      }
    } finally {
      this.ppNestLevel_--;
    }
  };

  PrettyPrinter.prototype.iterateObject = function(obj, fn) {
    for (var property in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, property)) { continue; }
      fn(property, obj.__lookupGetter__ ? (!j$.util.isUndefined(obj.__lookupGetter__(property)) &&
          obj.__lookupGetter__(property) !== null) : false);
    }
  };

  PrettyPrinter.prototype.emitArray = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitObject = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitScalar = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitString = j$.unimplementedMethod_;

  function StringPrettyPrinter() {
    PrettyPrinter.call(this);

    this.string = '';
  }

  j$.util.inherit(StringPrettyPrinter, PrettyPrinter);

  StringPrettyPrinter.prototype.emitScalar = function(value) {
    this.append(value);
  };

  StringPrettyPrinter.prototype.emitString = function(value) {
    this.append('\'' + value + '\'');
  };

  StringPrettyPrinter.prototype.emitArray = function(array) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Array');
      return;
    }
    var length = Math.min(array.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    this.append('[ ');
    for (var i = 0; i < length; i++) {
      if (i > 0) {
        this.append(', ');
      }
      this.format(array[i]);
    }
    if(array.length > length){
      this.append(', ...');
    }

    var self = this;
    var first = array.length === 0;
    this.iterateObject(array, function(property, isGetter) {
      if (property.match(/^\d+$/)) {
        return;
      }

      if (first) {
        first = false;
      } else {
        self.append(', ');
      }

      self.formatProperty(array, property, isGetter);
    });

    this.append(' ]');
  };

  StringPrettyPrinter.prototype.emitObject = function(obj) {
    var constructorName = obj.constructor ? j$.fnNameFor(obj.constructor) : 'null';
    this.append(constructorName);

    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      return;
    }

    var self = this;
    this.append('({ ');
    var first = true;

    this.iterateObject(obj, function(property, isGetter) {
      if (first) {
        first = false;
      } else {
        self.append(', ');
      }

      self.formatProperty(obj, property, isGetter);
    });

    this.append(' })');
  };

  StringPrettyPrinter.prototype.formatProperty = function(obj, property, isGetter) {
      this.append(property);
      this.append(': ');
      if (isGetter) {
        this.append('<getter>');
      } else {
        this.format(obj[property]);
      }
  };

  StringPrettyPrinter.prototype.append = function(value) {
    this.string += value;
  };

  return function(value) {
    var stringPrettyPrinter = new StringPrettyPrinter();
    stringPrettyPrinter.format(value);
    return stringPrettyPrinter.string;
  };
};

getJasmineRequireObj().QueueRunner = function(j$) {

  function once(fn) {
    var called = false;
    return function() {
      if (!called) {
        called = true;
        fn();
      }
    };
  }

  function QueueRunner(attrs) {
    this.queueableFns = attrs.queueableFns || [];
    this.onComplete = attrs.onComplete || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
    this.userContext = attrs.userContext || {};
    this.timeout = attrs.timeout || {setTimeout: setTimeout, clearTimeout: clearTimeout};
    this.fail = attrs.fail || function() {};
  }

  QueueRunner.prototype.execute = function() {
    this.run(this.queueableFns, 0);
  };

  QueueRunner.prototype.run = function(queueableFns, recursiveIndex) {
    var length = queueableFns.length,
      self = this,
      iterativeIndex;


    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var queueableFn = queueableFns[iterativeIndex];
      if (queueableFn.fn.length > 0) {
        attemptAsync(queueableFn);
        return;
      } else {
        attemptSync(queueableFn);
      }
    }

    var runnerDone = iterativeIndex >= length;

    if (runnerDone) {
      this.clearStack(this.onComplete);
    }

    function attemptSync(queueableFn) {
      try {
        queueableFn.fn.call(self.userContext);
      } catch (e) {
        handleException(e, queueableFn);
      }
    }

    function attemptAsync(queueableFn) {
      var clearTimeout = function () {
          Function.prototype.apply.apply(self.timeout.clearTimeout, [j$.getGlobal(), [timeoutId]]);
        },
        next = once(function () {
          clearTimeout(timeoutId);
          self.run(queueableFns, iterativeIndex + 1);
        }),
        timeoutId;

      next.fail = function() {
        self.fail.apply(null, arguments);
        next();
      };

      if (queueableFn.timeout) {
        timeoutId = Function.prototype.apply.apply(self.timeout.setTimeout, [j$.getGlobal(), [function() {
          var error = new Error('Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.');
          onException(error, queueableFn);
          next();
        }, queueableFn.timeout()]]);
      }

      try {
        queueableFn.fn.call(self.userContext, next);
      } catch (e) {
        handleException(e, queueableFn);
        next();
      }
    }

    function onException(e, queueableFn) {
      self.onException(e);
    }

    function handleException(e, queueableFn) {
      onException(e, queueableFn);
      if (!self.catchException(e)) {
        //TODO: set a var when we catch an exception and
        //use a finally block to close the loop in a nice way..
        throw e;
      }
    }
  };

  return QueueRunner;
};

getJasmineRequireObj().ReportDispatcher = function() {
  function ReportDispatcher(methods) {

    var dispatchedMethods = methods || [];

    for (var i = 0; i < dispatchedMethods.length; i++) {
      var method = dispatchedMethods[i];
      this[method] = (function(m) {
        return function() {
          dispatch(m, arguments);
        };
      }(method));
    }

    var reporters = [];

    this.addReporter = function(reporter) {
      reporters.push(reporter);
    };

    return this;

    function dispatch(method, args) {
      for (var i = 0; i < reporters.length; i++) {
        var reporter = reporters[i];
        if (reporter[method]) {
          reporter[method].apply(reporter, args);
        }
      }
    }
  }

  return ReportDispatcher;
};


getJasmineRequireObj().SpyRegistry = function(j$) {

  function SpyRegistry(options) {
    options = options || {};
    var currentSpies = options.currentSpies || function() { return []; };

    this.spyOn = function(obj, methodName) {
      if (j$.util.isUndefined(obj)) {
        throw new Error('spyOn could not find an object to spy upon for ' + methodName + '()');
      }

      if (j$.util.isUndefined(methodName)) {
        throw new Error('No method name supplied');
      }

      if (j$.util.isUndefined(obj[methodName])) {
        throw new Error(methodName + '() method does not exist');
      }

      if (obj[methodName] && j$.isSpy(obj[methodName])) {
        //TODO?: should this return the current spy? Downside: may cause user confusion about spy state
        throw new Error(methodName + ' has already been spied upon');
      }

      var spy = j$.createSpy(methodName, obj[methodName]);

      currentSpies().push({
        spy: spy,
        baseObj: obj,
        methodName: methodName,
        originalValue: obj[methodName]
      });

      obj[methodName] = spy;

      return spy;
    };

    this.clearSpies = function() {
      var spies = currentSpies();
      for (var i = 0; i < spies.length; i++) {
        var spyEntry = spies[i];
        spyEntry.baseObj[spyEntry.methodName] = spyEntry.originalValue;
      }
    };
  }

  return SpyRegistry;
};

getJasmineRequireObj().SpyStrategy = function() {

  function SpyStrategy(options) {
    options = options || {};

    var identity = options.name || 'unknown',
        originalFn = options.fn || function() {},
        getSpy = options.getSpy || function() {},
        plan = function() {};

    this.identity = function() {
      return identity;
    };

    this.exec = function() {
      return plan.apply(this, arguments);
    };

    this.callThrough = function() {
      plan = originalFn;
      return getSpy();
    };

    this.returnValue = function(value) {
      plan = function() {
        return value;
      };
      return getSpy();
    };

    this.returnValues = function() {
      var values = Array.prototype.slice.call(arguments);
      plan = function () {
        return values.shift();
      };
      return getSpy();
    };

    this.throwError = function(something) {
      var error = (something instanceof Error) ? something : new Error(something);
      plan = function() {
        throw error;
      };
      return getSpy();
    };

    this.callFake = function(fn) {
      plan = fn;
      return getSpy();
    };

    this.stub = function(fn) {
      plan = function() {};
      return getSpy();
    };
  }

  return SpyStrategy;
};

getJasmineRequireObj().Suite = function(j$) {
  function Suite(attrs) {
    this.env = attrs.env;
    this.id = attrs.id;
    this.parentSuite = attrs.parentSuite;
    this.description = attrs.description;
    this.expectationFactory = attrs.expectationFactory;
    this.expectationResultFactory = attrs.expectationResultFactory;
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;

    this.beforeFns = [];
    this.afterFns = [];
    this.beforeAllFns = [];
    this.afterAllFns = [];
    this.disabled = false;

    this.children = [];

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      failedExpectations: []
    };
  }

  Suite.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Suite.prototype.getFullName = function() {
    var fullName = this.description;
    for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
      if (parentSuite.parentSuite) {
        fullName = parentSuite.description + ' ' + fullName;
      }
    }
    return fullName;
  };

  Suite.prototype.disable = function() {
    this.disabled = true;
  };

  Suite.prototype.beforeEach = function(fn) {
    this.beforeFns.unshift(fn);
  };

  Suite.prototype.beforeAll = function(fn) {
    this.beforeAllFns.push(fn);
  };

  Suite.prototype.afterEach = function(fn) {
    this.afterFns.unshift(fn);
  };

  Suite.prototype.afterAll = function(fn) {
    this.afterAllFns.push(fn);
  };

  Suite.prototype.addChild = function(child) {
    this.children.push(child);
  };

  Suite.prototype.status = function() {
    if (this.disabled) {
      return 'disabled';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'finished';
    }
  };

  Suite.prototype.isExecutable = function() {
    return !this.disabled;
  };

  Suite.prototype.canBeReentered = function() {
    return this.beforeAllFns.length === 0 && this.afterAllFns.length === 0;
  };

  Suite.prototype.getResult = function() {
    this.result.status = this.status();
    return this.result;
  };

  Suite.prototype.sharedUserContext = function() {
    if (!this.sharedContext) {
      this.sharedContext = this.parentSuite ? clone(this.parentSuite.sharedUserContext()) : {};
    }

    return this.sharedContext;
  };

  Suite.prototype.clonedSharedUserContext = function() {
    return clone(this.sharedUserContext());
  };

  Suite.prototype.onException = function() {
    if (arguments[0] instanceof j$.errors.ExpectationFailed) {
      return;
    }

    if(isAfterAll(this.children)) {
      var data = {
        matcherName: '',
        passed: false,
        expected: '',
        actual: '',
        error: arguments[0]
      };
      this.result.failedExpectations.push(this.expectationResultFactory(data));
    } else {
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        child.onException.apply(child, arguments);
      }
    }
  };

  Suite.prototype.addExpectationResult = function () {
    if(isAfterAll(this.children) && isFailure(arguments)){
      var data = arguments[1];
      this.result.failedExpectations.push(this.expectationResultFactory(data));
      if(this.throwOnExpectationFailure) {
        throw new j$.errors.ExpectationFailed();
      }
    } else {
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        try {
          child.addExpectationResult.apply(child, arguments);
        } catch(e) {
          // keep going
        }
      }
    }
  };

  function isAfterAll(children) {
    return children && children[0].result.status;
  }

  function isFailure(args) {
    return !args[0];
  }

  function clone(obj) {
    var clonedObj = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        clonedObj[prop] = obj[prop];
      }
    }

    return clonedObj;
  }

  return Suite;
};

if (typeof window == void 0 && typeof exports == 'object') {
  exports.Suite = jasmineRequire.Suite;
}

getJasmineRequireObj().Timer = function() {
  var defaultNow = (function(Date) {
    return function() { return new Date().getTime(); };
  })(Date);

  function Timer(options) {
    options = options || {};

    var now = options.now || defaultNow,
      startTime;

    this.start = function() {
      startTime = now();
    };

    this.elapsed = function() {
      return now() - startTime;
    };
  }

  return Timer;
};

getJasmineRequireObj().TreeProcessor = function() {
  function TreeProcessor(attrs) {
    var tree = attrs.tree,
        runnableIds = attrs.runnableIds,
        queueRunnerFactory = attrs.queueRunnerFactory,
        nodeStart = attrs.nodeStart || function() {},
        nodeComplete = attrs.nodeComplete || function() {},
        stats = { valid: true },
        processed = false,
        defaultMin = Infinity,
        defaultMax = 1 - Infinity;

    this.processTree = function() {
      processNode(tree, false);
      processed = true;
      return stats;
    };

    this.execute = function(done) {
      if (!processed) {
        this.processTree();
      }

      if (!stats.valid) {
        throw 'invalid order';
      }

      var childFns = wrapChildren(tree, 0);

      queueRunnerFactory({
        queueableFns: childFns,
        onException: function() {
          tree.onException.apply(tree, arguments);
        },
        onComplete: done
      });
    };

    function runnableIndex(id) {
      for (var i = 0; i < runnableIds.length; i++) {
        if (runnableIds[i] === id) {
          return i;
        }
      }
    }

    function processNode(node, parentEnabled) {
      var executableIndex = runnableIndex(node.id);

      if (executableIndex !== undefined) {
        parentEnabled = true;
      }

      parentEnabled = parentEnabled && node.isExecutable();

      if (!node.children) {
        stats[node.id] = {
          executable: parentEnabled && node.isExecutable(),
          segments: [{
            index: 0,
            owner: node,
            nodes: [node],
            min: startingMin(executableIndex),
            max: startingMax(executableIndex)
          }]
        };
      } else {
        var hasExecutableChild = false;

        for (var i = 0; i < node.children.length; i++) {
          var child = node.children[i];

          processNode(child, parentEnabled);

          if (!stats.valid) {
            return;
          }

          var childStats = stats[child.id];

          hasExecutableChild = hasExecutableChild || childStats.executable;
        }

        stats[node.id] = {
          executable: hasExecutableChild
        };

        segmentChildren(node, stats[node.id], executableIndex);

        if (!node.canBeReentered() && stats[node.id].segments.length > 1) {
          stats = { valid: false };
        }
      }
    }

    function startingMin(executableIndex) {
      return executableIndex === undefined ? defaultMin : executableIndex;
    }

    function startingMax(executableIndex) {
      return executableIndex === undefined ? defaultMax : executableIndex;
    }

    function segmentChildren(node, nodeStats, executableIndex) {
      var currentSegment = { index: 0, owner: node, nodes: [], min: startingMin(executableIndex), max: startingMax(executableIndex) },
          result = [currentSegment],
          lastMax = defaultMax,
          orderedChildSegments = orderChildSegments(node.children);

      function isSegmentBoundary(minIndex) {
        return lastMax !== defaultMax && minIndex !== defaultMin && lastMax < minIndex - 1;
      }

      for (var i = 0; i < orderedChildSegments.length; i++) {
        var childSegment = orderedChildSegments[i],
          maxIndex = childSegment.max,
          minIndex = childSegment.min;

        if (isSegmentBoundary(minIndex)) {
          currentSegment = {index: result.length, owner: node, nodes: [], min: defaultMin, max: defaultMax};
          result.push(currentSegment);
        }

        currentSegment.nodes.push(childSegment);
        currentSegment.min = Math.min(currentSegment.min, minIndex);
        currentSegment.max = Math.max(currentSegment.max, maxIndex);
        lastMax = maxIndex;
      }

      nodeStats.segments = result;
    }

    function orderChildSegments(children) {
      var result = [];

      for (var i = 0; i < children.length; i++) {
        var child = children[i],
            segments = stats[child.id].segments;

        for (var j = 0; j < segments.length; j++) {
          result.push(segments[j]);
        }
      }

      result.sort(function(a, b) {
        if (a.min === null) {
          return b.min === null ? 0 : 1;
        }

        if (b.min === null) {
          return -1;
        }

        return a.min - b.min;
      });

      return result;
    }

    function executeNode(node, segmentNumber) {
      if (node.children) {
        return {
          fn: function(done) {
            nodeStart(node);

            queueRunnerFactory({
              onComplete: function() {
                nodeComplete(node, node.getResult());
                done();
              },
              queueableFns: wrapChildren(node, segmentNumber),
              userContext: node.sharedUserContext(),
              onException: function() {
                node.onException.apply(node, arguments);
              }
            });
          }
        };
      } else {
        return {
          fn: function(done) { node.execute(done, stats[node.id].executable); }
        };
      }
    }

    function wrapChildren(node, segmentNumber) {
      var result = [],
          segmentChildren = stats[node.id].segments[segmentNumber].nodes;

      for (var i = 0; i < segmentChildren.length; i++) {
        result.push(executeNode(segmentChildren[i].owner, segmentChildren[i].index));
      }

      if (!stats[node.id].executable) {
        return result;
      }

      return node.beforeAllFns.concat(result).concat(node.afterAllFns);
    }
  }

  return TreeProcessor;
};

getJasmineRequireObj().Any = function(j$) {

  function Any(expectedObject) {
    this.expectedObject = expectedObject;
  }

  Any.prototype.asymmetricMatch = function(other) {
    if (this.expectedObject == String) {
      return typeof other == 'string' || other instanceof String;
    }

    if (this.expectedObject == Number) {
      return typeof other == 'number' || other instanceof Number;
    }

    if (this.expectedObject == Function) {
      return typeof other == 'function' || other instanceof Function;
    }

    if (this.expectedObject == Object) {
      return typeof other == 'object';
    }

    if (this.expectedObject == Boolean) {
      return typeof other == 'boolean';
    }

    return other instanceof this.expectedObject;
  };

  Any.prototype.jasmineToString = function() {
    return '<jasmine.any(' + j$.fnNameFor(this.expectedObject) + ')>';
  };

  return Any;
};

getJasmineRequireObj().Anything = function(j$) {

  function Anything() {}

  Anything.prototype.asymmetricMatch = function(other) {
    return !j$.util.isUndefined(other) && other !== null;
  };

  Anything.prototype.jasmineToString = function() {
    return '<jasmine.anything>';
  };

  return Anything;
};

getJasmineRequireObj().ArrayContaining = function(j$) {
  function ArrayContaining(sample) {
    this.sample = sample;
  }

  ArrayContaining.prototype.asymmetricMatch = function(other) {
    var className = Object.prototype.toString.call(this.sample);
    if (className !== '[object Array]') { throw new Error('You must provide an array to arrayContaining, not \'' + this.sample + '\'.'); }

    for (var i = 0; i < this.sample.length; i++) {
      var item = this.sample[i];
      if (!j$.matchersUtil.contains(other, item)) {
        return false;
      }
    }

    return true;
  };

  ArrayContaining.prototype.jasmineToString = function () {
    return '<jasmine.arrayContaining(' + jasmine.pp(this.sample) +')>';
  };

  return ArrayContaining;
};

getJasmineRequireObj().ObjectContaining = function(j$) {

  function ObjectContaining(sample) {
    this.sample = sample;
  }

  function getPrototype(obj) {
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }

    if (obj.constructor.prototype == obj) {
      return null;
    }

    return obj.constructor.prototype;
  }

  function hasProperty(obj, property) {
    if (!obj) {
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      return true;
    }

    return hasProperty(getPrototype(obj), property);
  }

  ObjectContaining.prototype.asymmetricMatch = function(other) {
    if (typeof(this.sample) !== 'object') { throw new Error('You must provide an object to objectContaining, not \''+this.sample+'\'.'); }

    for (var property in this.sample) {
      if (!hasProperty(other, property) ||
          !j$.matchersUtil.equals(this.sample[property], other[property])) {
        return false;
      }
    }

    return true;
  };

  ObjectContaining.prototype.jasmineToString = function() {
    return '<jasmine.objectContaining(' + j$.pp(this.sample) + ')>';
  };

  return ObjectContaining;
};

getJasmineRequireObj().StringMatching = function(j$) {

  function StringMatching(expected) {
    if (!j$.isString_(expected) && !j$.isA_('RegExp', expected)) {
      throw new Error('Expected is not a String or a RegExp');
    }

    this.regexp = new RegExp(expected);
  }

  StringMatching.prototype.asymmetricMatch = function(other) {
    return this.regexp.test(other);
  };

  StringMatching.prototype.jasmineToString = function() {
    return '<jasmine.stringMatching(' + this.regexp + ')>';
  };

  return StringMatching;
};

getJasmineRequireObj().errors = function() {
  function ExpectationFailed() {}

  ExpectationFailed.prototype = new Error();
  ExpectationFailed.prototype.constructor = ExpectationFailed;

  return {
    ExpectationFailed: ExpectationFailed
  };
};
getJasmineRequireObj().matchersUtil = function(j$) {
  // TODO: what to do about jasmine.pp not being inject? move to JSON.stringify? gut PrettyPrinter?

  return {
    equals: function(a, b, customTesters) {
      customTesters = customTesters || [];

      return eq(a, b, [], [], customTesters);
    },

    contains: function(haystack, needle, customTesters) {
      customTesters = customTesters || [];

      if ((Object.prototype.toString.apply(haystack) === '[object Array]') ||
        (!!haystack && !haystack.indexOf))
      {
        for (var i = 0; i < haystack.length; i++) {
          if (eq(haystack[i], needle, [], [], customTesters)) {
            return true;
          }
        }
        return false;
      }

      return !!haystack && haystack.indexOf(needle) >= 0;
    },

    buildFailureMessage: function() {
      var args = Array.prototype.slice.call(arguments, 0),
        matcherName = args[0],
        isNot = args[1],
        actual = args[2],
        expected = args.slice(3),
        englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });

      var message = 'Expected ' +
        j$.pp(actual) +
        (isNot ? ' not ' : ' ') +
        englishyPredicate;

      if (expected.length > 0) {
        for (var i = 0; i < expected.length; i++) {
          if (i > 0) {
            message += ',';
          }
          message += ' ' + j$.pp(expected[i]);
        }
      }

      return message + '.';
    }
  };

  function isAsymmetric(obj) {
    return obj && j$.isA_('Function', obj.asymmetricMatch);
  }

  function asymmetricMatch(a, b) {
    var asymmetricA = isAsymmetric(a),
        asymmetricB = isAsymmetric(b);

    if (asymmetricA && asymmetricB) {
      return undefined;
    }

    if (asymmetricA) {
      return a.asymmetricMatch(b);
    }

    if (asymmetricB) {
      return b.asymmetricMatch(a);
    }
  }

  // Equality function lovingly adapted from isEqual in
  //   [Underscore](http://underscorejs.org)
  function eq(a, b, aStack, bStack, customTesters) {
    var result = true;

    var asymmetricResult = asymmetricMatch(a, b);
    if (!j$.util.isUndefined(asymmetricResult)) {
      return asymmetricResult;
    }

    for (var i = 0; i < customTesters.length; i++) {
      var customTesterResult = customTesters[i](a, b);
      if (!j$.util.isUndefined(customTesterResult)) {
        return customTesterResult;
      }
    }

    if (a instanceof Error && b instanceof Error) {
      return a.message == b.message;
    }

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    // A strict comparison is necessary because `null == undefined`.
    if (a === null || b === null) { return a === b; }
    var className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)) { return false; }
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a === 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }

    var aIsDomNode = j$.isDomNode(a);
    var bIsDomNode = j$.isDomNode(b);
    if (aIsDomNode && bIsDomNode) {
      // At first try to use DOM3 method isEqualNode
      if (a.isEqualNode) {
        return a.isEqualNode(b);
      }
      // IE8 doesn't support isEqualNode, try to use outerHTML && innerText
      var aIsElement = a instanceof Element;
      var bIsElement = b instanceof Element;
      if (aIsElement && bIsElement) {
        return a.outerHTML == b.outerHTML;
      }
      if (aIsElement || bIsElement) {
        return false;
      }
      return a.innerText == b.innerText && a.textContent == b.textContent;
    }
    if (aIsDomNode || bIsDomNode) {
      return false;
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) { return bStack[length] == b; }
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0;
    // Recursively compare objects and arrays.
    // Compare array lengths to determine if a deep comparison is necessary.
    if (className == '[object Array]' && a.length !== b.length) {
      result = false;
    }

    if (result) {
      // Objects with different constructors are not equivalent, but `Object`s
      // or `Array`s from different frames are.
      if (className !== '[object Array]') {
        var aCtor = a.constructor, bCtor = b.constructor;
        if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
               isFunction(bCtor) && bCtor instanceof bCtor)) {
          return false;
        }
      }
      // Deep compare objects.
      for (var key in a) {
        if (has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack, customTesters))) { break; }
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (has(b, key) && !(size--)) { break; }
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();

    return result;

    function has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function isFunction(obj) {
      return typeof obj === 'function';
    }
  }
};

getJasmineRequireObj().toBe = function() {
  function toBe() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual === expected
        };
      }
    };
  }

  return toBe;
};

getJasmineRequireObj().toBeCloseTo = function() {

  function toBeCloseTo() {
    return {
      compare: function(actual, expected, precision) {
        if (precision !== 0) {
          precision = precision || 2;
        }

        return {
          pass: Math.abs(expected - actual) < (Math.pow(10, -precision) / 2)
        };
      }
    };
  }

  return toBeCloseTo;
};

getJasmineRequireObj().toBeDefined = function() {
  function toBeDefined() {
    return {
      compare: function(actual) {
        return {
          pass: (void 0 !== actual)
        };
      }
    };
  }

  return toBeDefined;
};

getJasmineRequireObj().toBeFalsy = function() {
  function toBeFalsy() {
    return {
      compare: function(actual) {
        return {
          pass: !!!actual
        };
      }
    };
  }

  return toBeFalsy;
};

getJasmineRequireObj().toBeGreaterThan = function() {

  function toBeGreaterThan() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual > expected
        };
      }
    };
  }

  return toBeGreaterThan;
};


getJasmineRequireObj().toBeLessThan = function() {
  function toBeLessThan() {
    return {

      compare: function(actual, expected) {
        return {
          pass: actual < expected
        };
      }
    };
  }

  return toBeLessThan;
};
getJasmineRequireObj().toBeNaN = function(j$) {

  function toBeNaN() {
    return {
      compare: function(actual) {
        var result = {
          pass: (actual !== actual)
        };

        if (result.pass) {
          result.message = 'Expected actual not to be NaN.';
        } else {
          result.message = function() { return 'Expected ' + j$.pp(actual) + ' to be NaN.'; };
        }

        return result;
      }
    };
  }

  return toBeNaN;
};

getJasmineRequireObj().toBeNull = function() {

  function toBeNull() {
    return {
      compare: function(actual) {
        return {
          pass: actual === null
        };
      }
    };
  }

  return toBeNull;
};

getJasmineRequireObj().toBeTruthy = function() {

  function toBeTruthy() {
    return {
      compare: function(actual) {
        return {
          pass: !!actual
        };
      }
    };
  }

  return toBeTruthy;
};

getJasmineRequireObj().toBeUndefined = function() {

  function toBeUndefined() {
    return {
      compare: function(actual) {
        return {
          pass: void 0 === actual
        };
      }
    };
  }

  return toBeUndefined;
};

getJasmineRequireObj().toContain = function() {
  function toContain(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {

        return {
          pass: util.contains(actual, expected, customEqualityTesters)
        };
      }
    };
  }

  return toContain;
};

getJasmineRequireObj().toEqual = function() {

  function toEqual(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {
        var result = {
          pass: false
        };

        result.pass = util.equals(actual, expected, customEqualityTesters);

        return result;
      }
    };
  }

  return toEqual;
};

getJasmineRequireObj().toHaveBeenCalled = function(j$) {

  function toHaveBeenCalled() {
    return {
      compare: function(actual) {
        var result = {};

        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        if (arguments.length > 1) {
          throw new Error('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
        }

        result.pass = actual.calls.any();

        result.message = result.pass ?
          'Expected spy ' + actual.and.identity() + ' not to have been called.' :
          'Expected spy ' + actual.and.identity() + ' to have been called.';

        return result;
      }
    };
  }

  return toHaveBeenCalled;
};

getJasmineRequireObj().toHaveBeenCalledWith = function(j$) {

  function toHaveBeenCalledWith(util, customEqualityTesters) {
    return {
      compare: function() {
        var args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1),
          result = { pass: false };

        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        if (!actual.calls.any()) {
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' to have been called with ' + j$.pp(expectedArgs) + ' but it was never called.'; };
          return result;
        }

        if (util.contains(actual.calls.allArgs(), expectedArgs, customEqualityTesters)) {
          result.pass = true;
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' not to have been called with ' + j$.pp(expectedArgs) + ' but it was.'; };
        } else {
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' to have been called with ' + j$.pp(expectedArgs) + ' but actual calls were ' + j$.pp(actual.calls.allArgs()).replace(/^\[ | \]$/g, '') + '.'; };
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledWith;
};

getJasmineRequireObj().toMatch = function(j$) {

  function toMatch() {
    return {
      compare: function(actual, expected) {
        if (!j$.isString_(expected) && !j$.isA_('RegExp', expected)) {
          throw new Error('Expected is not a String or a RegExp');
        }

        var regexp = new RegExp(expected);

        return {
          pass: regexp.test(actual)
        };
      }
    };
  }

  return toMatch;
};

getJasmineRequireObj().toThrow = function(j$) {

  function toThrow(util) {
    return {
      compare: function(actual, expected) {
        var result = { pass: false },
          threw = false,
          thrown;

        if (typeof actual != 'function') {
          throw new Error('Actual is not a Function');
        }

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          result.message = 'Expected function to throw an exception.';
          return result;
        }

        if (arguments.length == 1) {
          result.pass = true;
          result.message = function() { return 'Expected function not to throw, but it threw ' + j$.pp(thrown) + '.'; };

          return result;
        }

        if (util.equals(thrown, expected)) {
          result.pass = true;
          result.message = function() { return 'Expected function not to throw ' + j$.pp(expected) + '.'; };
        } else {
          result.message = function() { return 'Expected function to throw ' + j$.pp(expected) + ', but it threw ' +  j$.pp(thrown) + '.'; };
        }

        return result;
      }
    };
  }

  return toThrow;
};

getJasmineRequireObj().toThrowError = function(j$) {
  function toThrowError (util) {
    return {
      compare: function(actual) {
        var threw = false,
          pass = {pass: true},
          fail = {pass: false},
          thrown;

        if (typeof actual != 'function') {
          throw new Error('Actual is not a Function');
        }

        var errorMatcher = getMatcher.apply(null, arguments);

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          fail.message = 'Expected function to throw an Error.';
          return fail;
        }

        if (!(thrown instanceof Error)) {
          fail.message = function() { return 'Expected function to throw an Error, but it threw ' + j$.pp(thrown) + '.'; };
          return fail;
        }

        if (errorMatcher.hasNoSpecifics()) {
          pass.message = 'Expected function not to throw an Error, but it threw ' + j$.fnNameFor(thrown) + '.';
          return pass;
        }

        if (errorMatcher.matches(thrown)) {
          pass.message = function() {
            return 'Expected function not to throw ' + errorMatcher.errorTypeDescription + errorMatcher.messageDescription() + '.';
          };
          return pass;
        } else {
          fail.message = function() {
            return 'Expected function to throw ' + errorMatcher.errorTypeDescription + errorMatcher.messageDescription() +
              ', but it threw ' + errorMatcher.thrownDescription(thrown) + '.';
          };
          return fail;
        }
      }
    };

    function getMatcher() {
      var expected = null,
          errorType = null;

      if (arguments.length == 2) {
        expected = arguments[1];
        if (isAnErrorType(expected)) {
          errorType = expected;
          expected = null;
        }
      } else if (arguments.length > 2) {
        errorType = arguments[1];
        expected = arguments[2];
        if (!isAnErrorType(errorType)) {
          throw new Error('Expected error type is not an Error.');
        }
      }

      if (expected && !isStringOrRegExp(expected)) {
        if (errorType) {
          throw new Error('Expected error message is not a string or RegExp.');
        } else {
          throw new Error('Expected is not an Error, string, or RegExp.');
        }
      }

      function messageMatch(message) {
        if (typeof expected == 'string') {
          return expected == message;
        } else {
          return expected.test(message);
        }
      }

      return {
        errorTypeDescription: errorType ? j$.fnNameFor(errorType) : 'an exception',
        thrownDescription: function(thrown) {
          var thrownName = errorType ? j$.fnNameFor(thrown.constructor) : 'an exception',
              thrownMessage = '';

          if (expected) {
            thrownMessage = ' with message ' + j$.pp(thrown.message);
          }

          return thrownName + thrownMessage;
        },
        messageDescription: function() {
          if (expected === null) {
            return '';
          } else if (expected instanceof RegExp) {
            return ' with a message matching ' + j$.pp(expected);
          } else {
            return ' with message ' + j$.pp(expected);
          }
        },
        hasNoSpecifics: function() {
          return expected === null && errorType === null;
        },
        matches: function(error) {
          return (errorType === null || error instanceof errorType) &&
            (expected === null || messageMatch(error.message));
        }
      };
    }

    function isStringOrRegExp(potential) {
      return potential instanceof RegExp || (typeof potential == 'string');
    }

    function isAnErrorType(type) {
      if (typeof type !== 'function') {
        return false;
      }

      var Surrogate = function() {};
      Surrogate.prototype = type.prototype;
      return (new Surrogate()) instanceof Error;
    }
  }

  return toThrowError;
};

getJasmineRequireObj().interface = function(jasmine, env) {
  var jasmineInterface = {
    describe: function(description, specDefinitions) {
      return env.describe(description, specDefinitions);
    },

    xdescribe: function(description, specDefinitions) {
      return env.xdescribe(description, specDefinitions);
    },

    fdescribe: function(description, specDefinitions) {
      return env.fdescribe(description, specDefinitions);
    },

    it: function() {
      return env.it.apply(env, arguments);
    },

    xit: function() {
      return env.xit.apply(env, arguments);
    },

    fit: function() {
      return env.fit.apply(env, arguments);
    },

    beforeEach: function() {
      return env.beforeEach.apply(env, arguments);
    },

    afterEach: function() {
      return env.afterEach.apply(env, arguments);
    },

    beforeAll: function() {
      return env.beforeAll.apply(env, arguments);
    },

    afterAll: function() {
      return env.afterAll.apply(env, arguments);
    },

    expect: function(actual) {
      return env.expect(actual);
    },

    pending: function() {
      return env.pending.apply(env, arguments);
    },

    fail: function() {
      return env.fail.apply(env, arguments);
    },

    spyOn: function(obj, methodName) {
      return env.spyOn(obj, methodName);
    },

    jsApiReporter: new jasmine.JsApiReporter({
      timer: new jasmine.Timer()
    }),

    jasmine: jasmine
  };

  jasmine.addCustomEqualityTester = function(tester) {
    env.addCustomEqualityTester(tester);
  };

  jasmine.addMatchers = function(matchers) {
    return env.addMatchers(matchers);
  };

  jasmine.clock = function() {
    return env.clock;
  };

  return jasmineInterface;
};

getJasmineRequireObj().version = function() {
  return '2.3.2';
};

/*
Copyright (c) 2008-2015 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
jasmineRequire.html = function(j$) {
  j$.ResultsNode = jasmineRequire.ResultsNode();
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter();
};

jasmineRequire.HtmlReporter = function(j$) {

  var noopTimer = {
    start: function() {},
    elapsed: function() { return 0; }
  };

  function HtmlReporter(options) {
    var env = options.env || {},
      getContainer = options.getContainer,
      createElement = options.createElement,
      createTextNode = options.createTextNode,
      onRaiseExceptionsClick = options.onRaiseExceptionsClick || function() {},
      onThrowExpectationsClick = options.onThrowExpectationsClick || function() {},
      addToExistingQueryString = options.addToExistingQueryString || defaultQueryString,
      timer = options.timer || noopTimer,
      results = [],
      specsExecuted = 0,
      failureCount = 0,
      pendingSpecCount = 0,
      htmlReporterMain,
      symbols,
      failedSuites = [];

    this.initialize = function() {
      clearPrior();
      htmlReporterMain = createDom('div', {className: 'jasmine_html-reporter'},
        createDom('div', {className: 'banner'},
          createDom('a', {className: 'title', href: 'http://jasmine.github.io/', target: '_blank'}),
          createDom('span', {className: 'version'}, j$.version)
        ),
        createDom('ul', {className: 'symbol-summary'}),
        createDom('div', {className: 'alert'}),
        createDom('div', {className: 'results'},
          createDom('div', {className: 'failures'})
        )
      );
      getContainer().appendChild(htmlReporterMain);

      symbols = find('.symbol-summary');
    };

    var totalSpecsDefined;
    this.jasmineStarted = function(options) {
      totalSpecsDefined = options.totalSpecsDefined || 0;
      timer.start();
    };

    var summary = createDom('div', {className: 'summary'});

    var topResults = new j$.ResultsNode({}, '', null),
      currentParent = topResults;

    this.suiteStarted = function(result) {
      currentParent.addChild(result, 'suite');
      currentParent = currentParent.last();
    };

    this.suiteDone = function(result) {
      if (result.status == 'failed') {
        failedSuites.push(result);
      }

      if (currentParent == topResults) {
        return;
      }

      currentParent = currentParent.parent;
    };

    this.specStarted = function(result) {
      currentParent.addChild(result, 'spec');
    };

    var failures = [];
    this.specDone = function(result) {
      if(noExpectations(result) && typeof console !== 'undefined' && typeof console.error !== 'undefined') {
        console.error('Spec \'' + result.fullName + '\' has no expectations.');
      }

      if (result.status != 'disabled') {
        specsExecuted++;
      }

      symbols.appendChild(createDom('li', {
          className: noExpectations(result) ? 'empty' : result.status,
          id: 'spec_' + result.id,
          title: result.fullName
        }
      ));

      if (result.status == 'failed') {
        failureCount++;

        var failure =
          createDom('div', {className: 'spec-detail failed'},
            createDom('div', {className: 'description'},
              createDom('a', {title: result.fullName, href: specHref(result)}, result.fullName)
            ),
            createDom('div', {className: 'messages'})
          );
        var messages = failure.childNodes[1];

        for (var i = 0; i < result.failedExpectations.length; i++) {
          var expectation = result.failedExpectations[i];
          messages.appendChild(createDom('div', {className: 'result-message'}, expectation.message));
          messages.appendChild(createDom('div', {className: 'stack-trace'}, expectation.stack));
        }

        failures.push(failure);
      }

      if (result.status == 'pending') {
        pendingSpecCount++;
      }
    };

    this.jasmineDone = function() {
      var banner = find('.banner');
      var alert = find('.alert');
      alert.appendChild(createDom('span', {className: 'duration'}, 'finished in ' + timer.elapsed() / 1000 + 's'));

      banner.appendChild(
        createDom('div', { className: 'run-options' },
          createDom('span', { className: 'trigger' }, 'Options'),
          createDom('div', { className: 'payload' },
            createDom('div', { className: 'exceptions' },
              createDom('input', {
                className: 'raise',
                id: 'raise-exceptions',
                type: 'checkbox'
              }),
              createDom('label', { className: 'label', 'for': 'raise-exceptions' }, 'raise exceptions')),
            createDom('div', { className: 'throw-failures' },
              createDom('input', {
                className: 'throw',
                id: 'throw-failures',
                type: 'checkbox'
              }),
              createDom('label', { className: 'label', 'for': 'throw-failures' }, 'stop spec on expectation failure'))
          )
        ));

      var raiseCheckbox = find('#raise-exceptions');

      raiseCheckbox.checked = !env.catchingExceptions();
      raiseCheckbox.onclick = onRaiseExceptionsClick;

      var throwCheckbox = find('#throw-failures');
      throwCheckbox.checked = env.throwingExpectationFailures();
      throwCheckbox.onclick = onThrowExpectationsClick;

      var optionsMenu = find('.run-options'),
          optionsTrigger = optionsMenu.querySelector('.trigger'),
          optionsPayload = optionsMenu.querySelector('.payload'),
          isOpen = /\bopen\b/;

      optionsTrigger.onclick = function() {
        if (isOpen.test(optionsPayload.className)) {
          optionsPayload.className = optionsPayload.className.replace(isOpen, '');
        } else {
          optionsPayload.className += ' open';
        }
      };

      if (specsExecuted < totalSpecsDefined) {
        var skippedMessage = 'Ran ' + specsExecuted + ' of ' + totalSpecsDefined + ' specs - run all';
        alert.appendChild(
          createDom('span', {className: 'bar skipped'},
            createDom('a', {href: '?', title: 'Run all specs'}, skippedMessage)
          )
        );
      }
      var statusBarMessage = '';
      var statusBarClassName = 'bar ';

      if (totalSpecsDefined > 0) {
        statusBarMessage += pluralize('spec', specsExecuted) + ', ' + pluralize('failure', failureCount);
        if (pendingSpecCount) { statusBarMessage += ', ' + pluralize('pending spec', pendingSpecCount); }
        statusBarClassName += (failureCount > 0) ? 'failed' : 'passed';
      } else {
        statusBarClassName += 'skipped';
        statusBarMessage += 'No specs found';
      }

      alert.appendChild(createDom('span', {className: statusBarClassName}, statusBarMessage));

      for(i = 0; i < failedSuites.length; i++) {
        var failedSuite = failedSuites[i];
        for(var j = 0; j < failedSuite.failedExpectations.length; j++) {
          var errorBarMessage = 'AfterAll ' + failedSuite.failedExpectations[j].message;
          var errorBarClassName = 'bar errored';
          alert.appendChild(createDom('span', {className: errorBarClassName}, errorBarMessage));
        }
      }

      var results = find('.results');
      results.appendChild(summary);

      summaryList(topResults, summary);

      function summaryList(resultsTree, domParent) {
        var specListNode;
        for (var i = 0; i < resultsTree.children.length; i++) {
          var resultNode = resultsTree.children[i];
          if (resultNode.type == 'suite') {
            var suiteListNode = createDom('ul', {className: 'suite', id: 'suite-' + resultNode.result.id},
              createDom('li', {className: 'suite-detail'},
                createDom('a', {href: specHref(resultNode.result)}, resultNode.result.description)
              )
            );

            summaryList(resultNode, suiteListNode);
            domParent.appendChild(suiteListNode);
          }
          if (resultNode.type == 'spec') {
            if (domParent.getAttribute('class') != 'specs') {
              specListNode = createDom('ul', {className: 'specs'});
              domParent.appendChild(specListNode);
            }
            var specDescription = resultNode.result.description;
            if(noExpectations(resultNode.result)) {
              specDescription = 'SPEC HAS NO EXPECTATIONS ' + specDescription;
            }
            if(resultNode.result.status === 'pending' && resultNode.result.pendingReason !== '') {
              specDescription = specDescription + ' PENDING WITH MESSAGE: ' + resultNode.result.pendingReason;
            }
            specListNode.appendChild(
              createDom('li', {
                  className: resultNode.result.status,
                  id: 'spec-' + resultNode.result.id
                },
                createDom('a', {href: specHref(resultNode.result)}, specDescription)
              )
            );
          }
        }
      }

      if (failures.length) {
        alert.appendChild(
          createDom('span', {className: 'menu bar spec-list'},
            createDom('span', {}, 'Spec List | '),
            createDom('a', {className: 'failures-menu', href: '#'}, 'Failures')));
        alert.appendChild(
          createDom('span', {className: 'menu bar failure-list'},
            createDom('a', {className: 'spec-list-menu', href: '#'}, 'Spec List'),
            createDom('span', {}, ' | Failures ')));

        find('.failures-menu').onclick = function() {
          setMenuModeTo('failure-list');
        };
        find('.spec-list-menu').onclick = function() {
          setMenuModeTo('spec-list');
        };

        setMenuModeTo('failure-list');

        var failureNode = find('.failures');
        for (var i = 0; i < failures.length; i++) {
          failureNode.appendChild(failures[i]);
        }
      }
    };

    return this;

    function find(selector) {
      return getContainer().querySelector('.jasmine_html-reporter ' + selector);
    }

    function clearPrior() {
      // return the reporter
      var oldReporter = find('');

      if(oldReporter) {
        getContainer().removeChild(oldReporter);
      }
    }

    function createDom(type, attrs, childrenVarArgs) {
      var el = createElement(type);

      for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];

        if (typeof child === 'string') {
          el.appendChild(createTextNode(child));
        } else {
          if (child) {
            el.appendChild(child);
          }
        }
      }

      for (var attr in attrs) {
        if (attr == 'className') {
          el[attr] = attrs[attr];
        } else {
          el.setAttribute(attr, attrs[attr]);
        }
      }

      return el;
    }

    function pluralize(singular, count) {
      var word = (count == 1 ? singular : singular + 's');

      return '' + count + ' ' + word;
    }

    function specHref(result) {
      return addToExistingQueryString('spec', result.fullName);
    }

    function defaultQueryString(key, value) {
      return '?' + key + '=' + value;
    }

    function setMenuModeTo(mode) {
      htmlReporterMain.setAttribute('class', 'jasmine_html-reporter ' + mode);
    }

    function noExpectations(result) {
      return (result.failedExpectations.length + result.passedExpectations.length) === 0 &&
        result.status === 'passed';
    }
  }

  return HtmlReporter;
};

jasmineRequire.HtmlSpecFilter = function() {
  function HtmlSpecFilter(options) {
    var filterString = options && options.filterString() && options.filterString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    var filterPattern = new RegExp(filterString);

    this.matches = function(specName) {
      return filterPattern.test(specName);
    };
  }

  return HtmlSpecFilter;
};

jasmineRequire.ResultsNode = function() {
  function ResultsNode(result, type, parent) {
    this.result = result;
    this.type = type;
    this.parent = parent;

    this.children = [];

    this.addChild = function(result, type) {
      this.children.push(new ResultsNode(result, type, this));
    };

    this.last = function() {
      return this.children[this.children.length - 1];
    };
  }

  return ResultsNode;
};

jasmineRequire.QueryString = function() {
  function QueryString(options) {

    this.navigateWithNewParam = function(key, value) {
      options.getWindowLocation().search = this.fullStringWithNewParam(key, value);
    };

    this.fullStringWithNewParam = function(key, value) {
      var paramMap = queryStringToParamMap();
      paramMap[key] = value;
      return toQueryString(paramMap);
    };

    this.getParam = function(key) {
      return queryStringToParamMap()[key];
    };

    return this;

    function toQueryString(paramMap) {
      var qStrPairs = [];
      for (var prop in paramMap) {
        qStrPairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(paramMap[prop]));
      }
      return '?' + qStrPairs.join('&');
    }

    function queryStringToParamMap() {
      var paramStr = options.getWindowLocation().search.substring(1),
        params = [],
        paramMap = {};

      if (paramStr.length > 0) {
        params = paramStr.split('&');
        for (var i = 0; i < params.length; i++) {
          var p = params[i].split('=');
          var value = decodeURIComponent(p[1]);
          if (value === 'true' || value === 'false') {
            value = JSON.parse(value);
          }
          paramMap[decodeURIComponent(p[0])] = value;
        }
      }

      return paramMap;
    }

  }

  return QueryString;
};

/*
Copyright (c) 2008-2015 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
 Starting with version 2.0, this file "boots" Jasmine, performing all of the necessary initialization before executing the loaded environment and all of a project's specs. This file should be loaded after `jasmine.js` and `jasmine_html.js`, but before any project source files or spec files are loaded. Thus this file can also be used to customize Jasmine for a project.

 If a project is using Jasmine via the standalone distribution, this file can be customized directly. If a project is using Jasmine via the [Ruby gem][jasmine-gem], this file can be copied into the support directory via `jasmine copy_boot_js`. Other environments (e.g., Python) will have different mechanisms.

 The location of `boot.js` can be specified and/or overridden in `jasmine.yml`.

 [jasmine-gem]: http://github.com/pivotal/jasmine-gem
 */

(function() {

  /**
   * ## Require &amp; Instantiate
   *
   * Require Jasmine's core files. Specifically, this requires and attaches all of Jasmine's code to the `jasmine` reference.
   */
  window.jasmine = jasmineRequire.core(jasmineRequire);

  /**
   * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
   */
  jasmineRequire.html(jasmine);

  /**
   * Create the Jasmine environment. This is used to run all specs in a project.
   */
  var env = jasmine.getEnv();

  /**
   * ## The Global Interface
   *
   * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
   */
  var jasmineInterface = jasmineRequire.interface(jasmine, env);

  /**
   * Add all of the Jasmine global/public interface to the global scope, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
   */
  extend(window, jasmineInterface);

  /**
   * ## Runner Parameters
   *
   * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
   */

  var queryString = new jasmine.QueryString({
    getWindowLocation: function() { return window.location; }
  });

  var catchingExceptions = queryString.getParam("catch");
  env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

  var throwingExpectationFailures = queryString.getParam("throwFailures");
  env.throwOnExpectationFailure(throwingExpectationFailures);

  /**
   * ## Reporters
   * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
   */
  var htmlReporter = new jasmine.HtmlReporter({
    env: env,
    onRaiseExceptionsClick: function() { queryString.navigateWithNewParam("catch", !env.catchingExceptions()); },
    onThrowExpectationsClick: function() { queryString.navigateWithNewParam("throwFailures", !env.throwingExpectationFailures()); },
    addToExistingQueryString: function(key, value) { return queryString.fullStringWithNewParam(key, value); },
    getContainer: function() { return document.body; },
    createElement: function() { return document.createElement.apply(document, arguments); },
    createTextNode: function() { return document.createTextNode.apply(document, arguments); },
    timer: new jasmine.Timer()
  });

  /**
   * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
   */
  env.addReporter(jasmineInterface.jsApiReporter);
  env.addReporter(htmlReporter);

  /**
   * Filter which specs will be run by matching the start of the full name against the `spec` query param.
   */
  var specFilter = new jasmine.HtmlSpecFilter({
    filterString: function() { return queryString.getParam("spec"); }
  });

  env.specFilter = function(spec) {
    return specFilter.matches(spec.getFullName());
  };

  /**
   * Setting up timing functions to be able to be overridden. Certain browsers (Safari, IE 8, phantomjs) require this hack.
   */
  window.setTimeout = window.setTimeout;
  window.setInterval = window.setInterval;
  window.clearTimeout = window.clearTimeout;
  window.clearInterval = window.clearInterval;

  /**
   * ## Execution
   *
   * Replace the browser window's `onload`, ensure it's called, and then run all of the loaded specs. This includes initializing the `HtmlReporter` instance and then executing the loaded Jasmine environment. All of this will happen after all of the specs are loaded.
   */
  var currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    htmlReporter.initialize();
    env.execute();
  };

  /**
   * Helper function for readability above.
   */
  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

}());

;(function(){
  var link=document.createElement('link');
  link.setAttribute('data-name','jasmine');
  link.setAttribute('rel','stylesheet');
  link.setAttribute('href',"data:text/css;charset=utf8;base64,Ym9keSB7IG92ZXJmbG93LXk6IHNjcm9sbDsgfQoKLmphc21pbmVfaHRtbC1yZXBvcnRlciB7IGJhY2tncm91bmQtY29sb3I6ICNlZWU7IHBhZGRpbmc6IDVweDsgbWFyZ2luOiAtOHB4OyBmb250LXNpemU6IDExcHg7IGZvbnQtZmFtaWx5OiBNb25hY28sICJMdWNpZGEgQ29uc29sZSIsIG1vbm9zcGFjZTsgbGluZS1oZWlnaHQ6IDE0cHg7IGNvbG9yOiAjMzMzOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgYSB7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIGE6aG92ZXIgeyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIHAsIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgaDEsIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgaDIsIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgaDMsIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgaDQsIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgaDUsIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgaDYgeyBtYXJnaW46IDA7IGxpbmUtaGVpZ2h0OiAxNHB4OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLmJhbm5lciwgLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3ltYm9sLXN1bW1hcnksIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN1bW1hcnksIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnJlc3VsdC1tZXNzYWdlLCAuamFzbWluZV9odG1sLXJlcG9ydGVyIC5zcGVjIC5kZXNjcmlwdGlvbiwgLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3BlYy1kZXRhaWwgLmRlc2NyaXB0aW9uLCAuamFzbWluZV9odG1sLXJlcG9ydGVyIC5hbGVydCAuYmFyLCAuamFzbWluZV9odG1sLXJlcG9ydGVyIC5zdGFjay10cmFjZSB7IHBhZGRpbmctbGVmdDogOXB4OyBwYWRkaW5nLXJpZ2h0OiA5cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuYmFubmVyIHsgcG9zaXRpb246IHJlbGF0aXZlOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLmJhbm5lciAudGl0bGUgeyBiYWNrZ3JvdW5kOiB1cmwoJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRm9BQUFBWkNBTUFBQUNHdXNueUFBQUNkbEJNVkVYLy8vLy9BUCtBZ0lDcVZhcUFRSUNaTTVtQVZZQ1NTWktBUUlDT09ZNkFUWUNMUm91QVFJQ0pPNG1TU1lDSVJJaVBRSUNIUEllT1I0Q0dRNGFNUUlDR1BZYUxSb0NGUTRXS1FJQ1BQWVdKUllDT1FvU0pRSUNOUG9TSVJJQ01Rb1NIUUlDSFJJQ0tRb09IUUlDS1BvT0pPNE9KUVlPTVFJQ01RNENJUVlLTFFJQ0lQb0tMUTRDS1FJQ05Qb0tKUUlTTVE0S0pRb1NMUVlLSlFJU0xRNEtJUW9TS1FZS0lRSUNJUUlTTVFvU0tRWUtMUUlPTFFvT0pRWUdMUUlPS1FJT01Rb0dLUVlPTFFZR0tRSU9MUW9HSlFZT0pRSU9LUVlHSlFJT0tRb0dLUUlHTFFJS0xRNEtLUW9HTFFZS0pRSUdLUVlLSlFJR0tRSUtKUW9HS1FZS0xRSUdLUVlLTFFJT0pRb0tLUW9PSlFZS0tRSU9KUW9LS1FvT0tRSU9MUW9LS1FZT0xRWUtKUUlPS1FvS0tRWUtLUW9LSlFZT0tRWUtMUUlPS1FvS0xRWU9LUVlLTFFJT0pRb0dLUVlLSlFZR0pRb0dLUVlLTFFvR0xRWUdLUW9HSlFZS0tRWUdKUUlLS1FvR0pRWUtMUUlLS1FZR0xRWUtLUVlHS1FZR0tRWUtKUVlPS1FvS0pRWU9LUVlLTFFZT0xRWU9LUVlLTFFZT0tRb0tLUVlLS1FZT0tRWU9KUVlLS1FZS0xRWUtLUUlLS1FvS0tRWUtLUVlLS1FvS0pRSUtLUVlLTFFZS0tRWUtLUUlLS1FZS0tRWUtLUVlLS1FJS0tRWUtKUVlHTFFZR0tRWUtLUVlLS1FZR0tRSUtLUVlHS1FZT0pRb0tLUVlPTFFZS0tRWU9LUW9LS1FZS0tRb0tLUVlLS1FZS0pRWUtMUVlLS1FZS0tRWUtLUVlLS1FZS0tRWUtLUVlLS1FZS0tRWUtKUVlLS1FZS0tRWUtLUVlLS1FZS0tRWUtLUVlLS1FZS0tRWUtLUVlLS1FZS0tRWUtMUVlLS1FZS0tRWUtLUVlLS1FZS0tRWUtLUVlLS1FZS0tRWUtLUVlLS1FZS0tRWUtLUVlLbUlEcEVBQUFBMFhSU1RsTUFBUUlEQkFVR0J3Z0pDZ3NNRFE0UEVCRVNFeFFWRmhjWUdSb2JIQjBlSHlBaUl5UWxKeWNvS2lzc0xTNHdNVFExTmpjNE9UbzdQRHcrUDBCQ1EwUklTVXBMVEUxT1VGTlVWVmRZV0ZsYVcxNWZZR0ZpWTJabmFHbHFhMnh0YjNCeGNuTjBkbmg1ZW50OGZYNS9nSUdDaElXSWlveU5qbytRa1pPVWxaYVltWnFibkoyZW9LR2lvNldtcUttc3JhNnZzTEd6dHJlNHVicTd2TDIrd01IRHhNakp5c3ZOenMvUTBkTFUxdGZZMmR2YzN0L2c0ZUxqNWVibjZPbnE2K3p0N3Uvdzh2UDA5ZmIzK1BuNisvejkvdmtWUVhBQUFBTWFTVVJCVkhoZTVkWHhWMU4xR01meHoyQUJiRGdJQW01VkRKT3lWRElKTFVNYVZwQldVWlVhR2JtcW9HcFpSU2lHaVJXcDZLb1o1QUIwWlk1MFJJbVpRSWxhaEtrTVlYdi9SOTBkQnZFVC9ySmZPcjNPdWM4djk5elBlYzU5enZmNTZqK3ZZS2xWaVNmNzI1MFg0TXIzTzI5VGdxMDhCZEdCNERoY2VrRUo1WWtRS0ZzZ1daZHRqOUpwVitJOHhQakxGcWtyc0VJcU84UEhTcGlzMzZqV2F6Y3FqRXNmSmprdlJzc1ZVMzdTZElPdTRYQ2Y1dkVKUHNud0pwblJOVTlKbXhoTWs4bDFnZWhJcnE3aFRGanpPRCtWZjg4NjI5cUtNSlZObHRJbkZlUmV4UlF5SmxOZXFkMWlHRGxTenJJVUl5WGJ5RmZtM1JZcHJjUVJlN2xxdFd5R1liZmM2ZFQwUjJ2bWRPT2tYM3U1NUMxclAzN2Z0aUgrdERieTRyL1JCVDB3OFR5RWtyK2VwQjlYZ1BEbVNZWVdicmhDdUZZYUl5dzNmRFFBWFRuU2toK0FOb2ZpSG1XZjlsK0ZZMUk5MEZkUVRldHN0TzAwbzIzbm92elZzSjd1QjMvQzVUa2JqUndaNUplcndWNGlSV3E5SEZiRk1hSy9kMFRZcWF5UmlRUHVJeHhTM0J1OEpXVTkwLzYwdEtpN3ZraGF6bmV6MGEvVGJWT0tqNUNhT1poNmZXRzYvTHl2OUIvWkxSMWd3L1MvZnBiZVZEM01DVzFsaTZTdldET242NXRyOTkvdXZXdEJTMFhEbTRzMXQrc09IcEcwa3BCS3gvbDc3d09TbnhMcGN4NlRYbVhMVFBRT0tZT2Y5UTFkZnI4L1NKMm1GZEN2bDFZbDkzRGlIVVp2WGVMSmJHU3pZdTVnVkoyc2xiU2FrT1I4ZHhDcTVhZFEyb0ZMcXNFOUV4M0w0cVFPMGVPUGVVNXg1NmJ5cFhwNG9uU0ViNU9rSUNYNmxEYXQ1NVRlb3p0TktRY0phYWtyejlLQ2I5NW9ENjlJS3EreUtXNFhQamtuYVM1MlYwVFpxRTJjVHRYamNIU0NSbVVPODhlKzg1aGozRVA3NGk5cDhweWx3N2x4Z01EeXlsNk9WN1plam5qTk1mYXR1ODdMeFJiSDBJUzM1Z3QyYTRaam1HcFZCZEtLM1dyNklOazhqV1dTR3FiQTU1Q0tnakJSQzZFOXc3OHlkVGczQUJTM0FGVjFRTjBZNEFhMnBnRWpXblFVUmo5TDBheUs2UjJ5c0VxeEhVS3pZbkx2dnlVK2k5S00ySkhKekU0dnlaT3lEY093T3N5U2FqZUxQYzhzTnZQSmtGbHlKZDIwd3BxQXpaZUFmWjNvV3lieGQrUC8zaitTRzN1U0JkZjJWUUFBQUFCSlJVNUVya0pnZ2c9PScpIG5vLXJlcGVhdDsgYmFja2dyb3VuZDogdXJsKCdkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBEOTRiV3dnZG1WeWMybHZiajBpTVM0d0lpQmxibU52WkdsdVp6MGlWVlJHTFRnaUlITjBZVzVrWVd4dmJtVTlJbTV2SWo4K0Nqd2hMUzBnUTNKbFlYUmxaQ0IzYVhSb0lFbHVhM05qWVhCbElDaG9kSFJ3T2k4dmQzZDNMbWx1YTNOallYQmxMbTl5Wnk4cElDMHRQZ29LUEhOMlp3b2dJQ0I0Yld4dWN6cGtZejBpYUhSMGNEb3ZMM0IxY213dWIzSm5MMlJqTDJWc1pXMWxiblJ6THpFdU1TOGlDaUFnSUhodGJHNXpPbU5qUFNKb2RIUndPaTh2WTNKbFlYUnBkbVZqYjIxdGIyNXpMbTl5Wnk5dWN5TWlDaUFnSUhodGJHNXpPbkprWmowaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1UazVPUzh3TWk4eU1pMXlaR1l0YzNsdWRHRjRMVzV6SXlJS0lDQWdlRzFzYm5NNmMzWm5QU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh5TURBd0wzTjJaeUlLSUNBZ2VHMXNibk05SW1oMGRIQTZMeTkzZDNjdWR6TXViM0puTHpJd01EQXZjM1puSWdvZ0lDQjRiV3h1Y3pwcGJtdHpZMkZ3WlQwaWFIUjBjRG92TDNkM2R5NXBibXR6WTJGd1pTNXZjbWN2Ym1GdFpYTndZV05sY3k5cGJtdHpZMkZ3WlNJS0lDQWdkbVZ5YzJsdmJqMGlNUzR4SWdvZ0lDQjNhV1IwYUQwaU5qZ3hMamsyTWpVeUlnb2dJQ0JvWldsbmFIUTlJakU0Tnk0MUlnb2dJQ0JwWkQwaWMzWm5NaUlLSUNBZ2VHMXNPbk53WVdObFBTSndjbVZ6WlhKMlpTSStQRzFsZEdGa1lYUmhDaUFnSUNBZ2FXUTlJbTFsZEdGa1lYUmhPQ0krUEhKa1pqcFNSRVkrUEdOak9sZHZjbXNLSUNBZ0lDQWdJQ0FnY21SbU9tRmliM1YwUFNJaVBqeGtZenBtYjNKdFlYUSthVzFoWjJVdmMzWm5LM2h0YkR3dlpHTTZabTl5YldGMFBqeGtZenAwZVhCbENpQWdJQ0FnSUNBZ0lDQWdjbVJtT25KbGMyOTFjbU5sUFNKb2RIUndPaTh2Y0hWeWJDNXZjbWN2WkdNdlpHTnRhWFI1Y0dVdlUzUnBiR3hKYldGblpTSWdMejQ4TDJOak9sZHZjbXMrUEM5eVpHWTZVa1JHUGp3dmJXVjBZV1JoZEdFK1BHUmxabk1LSUNBZ0lDQnBaRDBpWkdWbWN6WWlQanhqYkdsd1VHRjBhQW9nSUNBZ0lDQWdhV1E5SW1Oc2FYQlFZWFJvTVRnaVBqeHdZWFJvQ2lBZ0lDQWdJQ0FnSUdROUlrMGdNQ3d4TlRBd0lEQXNNQ0JzSURVME5UVXVOelFzTUNBd0xERTFNREFnVENBd0xERTFNREFnZWlJS0lDQWdJQ0FnSUNBZ2FXNXJjMk5oY0dVNlkyOXVibVZqZEc5eUxXTjFjblpoZEhWeVpUMGlNQ0lLSUNBZ0lDQWdJQ0FnYVdROUluQmhkR2d5TUNJZ0x6NDhMMk5zYVhCUVlYUm9Qand2WkdWbWN6NDhad29nSUNBZ0lIUnlZVzV6Wm05eWJUMGliV0YwY21sNEtERXVNalVzTUN3d0xDMHhMakkxTERBc01UZzNMalVwSWdvZ0lDQWdJR2xrUFNKbk1UQWlQanhuQ2lBZ0lDQWdJQ0IwY21GdWMyWnZjbTA5SW5OallXeGxLREF1TVN3d0xqRXBJZ29nSUNBZ0lDQWdhV1E5SW1jeE1pSStQR2NLSUNBZ0lDQWdJQ0FnYVdROUltY3hOQ0krUEdjS0lDQWdJQ0FnSUNBZ0lDQmpiR2x3TFhCaGRHZzlJblZ5YkNnalkyeHBjRkJoZEdneE9Da2lDaUFnSUNBZ0lDQWdJQ0FnYVdROUltY3hOaUkrUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdJQ0FnSUdROUltMGdNVFUwTkN3MU9Ua3VORE0wSUdNZ01DNDVNaXd0TkRBdU16VXlJREkxTGpZNExDMDRNUzQyTURJZ056RXVOVE1zTFRneExqWXdNaUF5Tnk0MU1Td3dJRFEzTGpZNExERXlMamd6TWlBMk1TNDBOQ3d6TlM0M05UUWdNVEl1T0RNc01qSXVPVE1nTVRJdU9ETXNOVFl1T0RVeUlERXlMamd6TERneUxqVXlOeUJzSURBc016STVMakU0TkNBdE56RXVOVElzTUNBd0xERXdOQzQxTkRNZ01qWTJMamd6TERBZ01Dd3RNVEEwTGpVME15QXROekF1Tml3d0lEQXNMVE0wTkM0M055QmpJREFzTFRVNExqWTVNU0F0TXk0Mk9Dd3RNVEEwTGpVek1TQXRORFF1T1RNc0xURTFNaTR5TVRnZ0xUTTJMalk0TEMwME1pNHhPQ0F0T1RZdU1qZ3NMVFkyTGpBeUlDMHhOVE11TVRRc0xUWTJMakF5SUMweE1UY3VNemNzTUNBdE1qQTNMakkwTERjM0xqazBNU0F0TWpBeUxqWTBMREU1Tnk0eE5EVWdiQ0F4TXpBdU1pd3dJZ29nSUNBZ0lDQWdJQ0FnSUNBZ2FXNXJjMk5oY0dVNlkyOXVibVZqZEc5eUxXTjFjblpoZEhWeVpUMGlNQ0lLSUNBZ0lDQWdJQ0FnSUNBZ0lHbGtQU0p3WVhSb01qSWlDaUFnSUNBZ0lDQWdJQ0FnSUNCemRIbHNaVDBpWm1sc2JEb2pPR0UwTVRneU8yWnBiR3d0YjNCaFkybDBlVG94TzJacGJHd3RjblZzWlRwdWIyNTZaWEp2TzNOMGNtOXJaVHB1YjI1bElpQXZQanh3WVhSb0NpQWdJQ0FnSUNBZ0lDQWdJQ0JrUFNKdElESXpNREV1TkN3Mk5qSXVOamsxSUdNZ01DdzRNQzQzTURNZ0xUWTJMamswTERFME5TNDRNVE1nTFRFME55NDJNeXd4TkRVdU9ERXpJQzA0TXk0ME5Dd3dJQzB4TkRjdU5qTXNMVFk0TGpjNE1TQXRNVFEzTGpZekxDMHhOVEV1TXpBeElEQXNMVGM1TGpjNE5TQTJOaTQ1TkN3dE1UUTFMamd3TVNBeE5EVXVPQ3d0TVRRMUxqZ3dNU0E0TkM0ek5Td3dJREUwT1M0ME5pdzJOeTQ0TlRJZ01UUTVMalEyTERFMU1TNHlPRGtnZWlCdElDMHhMamd6TEMweE9ERXVOVFEzSUdNZ0xUTTFMamMzTEMwMU5DNHdPVGNnTFRrekxqVXpMQzAzT0M0NE5Ua2dMVEUxTnk0M01pd3ROemd1T0RVNUlDMHhOREF1TXl3d0lDMHlOVEV1TWpRc01URTJMalEwT1NBdE1qVXhMakkwTERJMU5DNDVNVGdnTUN3eE5ESXVNVEk1SURFeE15NDNMREkyTUM0ME1TQXlOVFl1TnpRc01qWXdMalF4SURZekxqSTNMREFnTVRFNExqSTVMQzB5T1M0ek16WWdNVFV5TGpJeUxDMDRNaTQxTWpNZ2JDQXdMRFk1TGpZNE55QXhOelV1TVRRc01DQXdMQzB4TURRdU5USTNJQzAyTVM0ME5Dd3dJREFzTFRJNE1DNDFPVGdnTmpFdU5EUXNNQ0F3TEMweE1EUXVOVEkzSUMweE56VXVNVFFzTUNBd0xEWTJMakF4T1NJS0lDQWdJQ0FnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lDQWdJQ0JwWkQwaWNHRjBhREkwSWdvZ0lDQWdJQ0FnSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpoaE5ERTRNanRtYVd4c0xXOXdZV05wZEhrNk1UdG1hV3hzTFhKMWJHVTZibTl1ZW1WeWJ6dHpkSEp2YTJVNmJtOXVaU0lnTHo0OGNHRjBhQW9nSUNBZ0lDQWdJQ0FnSUNBZ1pEMGliU0F5TmpJeUxqTXpMRFUxTnk0eU5UZ2dZeUF6TGpZM0xDMDBOQzR3TVRZZ016TXVNREVzTFRjekxqTTBPQ0EzT0M0NE5pd3ROek11TXpRNElETXpMamt6TERBZ05qWXVPVE1zTWpNdU9ESTBJRFkyTGprekxEWXdMalV3TkNBd0xEUTRMall3TmlBdE5EVXVPRFFzTlRZdU9EVTJJQzA0TXk0ME5DdzJOaTQ1TkRFZ0xUZzFMakk0TERJeUxqQXdOQ0F0TVRjNExqZ3hMRFE0TGpZd05pQXRNVGM0TGpneExERTFOUzQ0TnprZ01DdzVNeTQxTXpZZ056Z3VPRFlzTVRRM0xqWXpNeUF4TmpVdU9UZ3NNVFEzTGpZek15QTBOQ3d3SURnekxqUXpMQzA1TGpFM05pQXhNVEF1T1RRc0xUUTBMakF3T0NCc0lEQXNNek11T1RJeUlEZ3lMalV6TERBZ01Dd3RNVE15TGprMk5TQXRNVEE0TGpJeExEQWdZeUF0TVM0NE15d3pOQzQ0TlRZZ0xUSTRMalF5TERVM0xqYzNOQ0F0TmpNdU1qWXNOVGN1TnpjMElDMHpNQzR5Tml3d0lDMDJNaTR6TlN3dE1UY3VOREl5SUMwMk1pNHpOU3d0TlRFdU16UTRJREFzTFRRMUxqZzBOeUEwTkM0NU15d3ROVFV1T1RNZ09EQXVOamtzTFRZMExqRTRJRGc0TGpBeUxDMHlNQzR4TnpVZ01UZ3lMalEzTEMwME55NDJPVFVnTVRneUxqUTNMQzB4TlRjdU56TTBJREFzTFRrNUxqQXlOeUF0T0RNdU5EUXNMVEUxTkM0d016a2dMVEUzTlM0eE15d3RNVFUwTGpBek9TQXRORGt1TlRNc01DQXRPVFF1TkRZc01UVXVOVGd5SUMweE1qWXVOVFVzTlRNdU1UZ2diQ0F3TEMwME1DNHpOQ0F0T0RVdU1qY3NNQ0F3TERFME1pNHhNamtnTVRFMExqWXlMREFpQ2lBZ0lDQWdJQ0FnSUNBZ0lDQnBibXR6WTJGd1pUcGpiMjV1WldOMGIzSXRZM1Z5ZG1GMGRYSmxQU0l3SWdvZ0lDQWdJQ0FnSUNBZ0lDQWdhV1E5SW5CaGRHZ3lOaUlLSUNBZ0lDQWdJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU00WVRReE9ESTdabWxzYkMxdmNHRmphWFI1T2pFN1ptbHNiQzF5ZFd4bE9tNXZibnBsY204N2MzUnliMnRsT201dmJtVWlJQzgrUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdJQ0FnSUdROUltMGdNams0T0M0eE9DdzRNREF1TWpVMElDMDJNeTR5Tml3d0lEQXNNVEEwTGpVeU55QXhOalV1TURVc01DQXdMQzAzTXk0ek5UVWdZeUF6TVM0eE9DdzFNUzR6TkRjZ056Z3VPRFlzT0RVdU1qYzNJREUwTVM0eU1TdzROUzR5TnpjZ05qY3VPRFVzTUNBeE1qUXVOekVzTFRReExqSTFPQ0F4TlRJdU1qRXNMVEV3TWk0Mk9Ua2dNall1Tml3Mk1pNHpOVEVnT1RJdU5qSXNNVEF5TGpZNU9TQXhOakF1TkRjc01UQXlMalk1T1NBMU15NHhPU3d3SURFd05TNDBOaXd0TWpJZ01UUXhMakl4TEMwMk1pNHpOVEVnTXpndU5USXNMVFEwTGprek9DQXpPQzQxTWl3dE9UTXVOVE15SURNNExqVXlMQzB4TkRrdU5EVTNJR3dnTUN3dE1UZzFMakl6T1NBMk15NHlOeXd3SURBc0xURXdOQzQxTWpjZ0xUSXpPQzQwTWl3d0lEQXNNVEEwTGpVeU55QTJNeTR5T0N3d0lEQXNNVFUzTGpjeE5TQmpJREFzTXpJdU1UQXlJREFzTmpBdU5USTNJQzB4TkM0Mk55dzRPQzQ1TlRjZ0xURTRMak0wTERJMkxqVTRNaUF0TkRndU5qRXNOREF1TXpRMElDMDNPUzQzTnl3ME1DNHpORFFnTFRNd0xqSTJMREFnTFRZekxqSTRMQzB4TWk0NE5EUWdMVGd5TGpVekxDMHpOaTQyTnpJZ0xUSXlMamt6TEMweU9TNHpOVFVnTFRJeUxqa3pMQzAxTmk0NE5qTWdMVEl5TGprekxDMDVNaTQyTWprZ2JDQXdMQzB4TlRjdU56RTFJRFl6TGpJM0xEQWdNQ3d0TVRBMExqVXlOeUF0TWpNNExqUXhMREFnTUN3eE1EUXVOVEkzSURZekxqSTRMREFnTUN3eE5UQXVNemd6SUdNZ01Dd3lPUzR6TkRnZ01DdzJOaTR3TWpNZ0xURTBMalkzTERreExqWTVPU0F0TVRVdU5Ua3NNamt1TXpNMklDMDBOeTQyT1N3ME5DNDVNelFnTFRnd0xqY3NORFF1T1RNMElDMHpNUzR4T0N3d0lDMDFOeTQzTnl3dE1URXVNREE0SUMwM055NDVOQ3d0TXpVdU56YzBJQzB5TkM0M055d3RNekF1TWpVeklDMHlOaTQyTEMwMk1pNHpORE1nTFRJMkxqWXNMVGs1TGprME1TQnNJREFzTFRFMU1TNHpNREVnTmpNdU1qY3NNQ0F3TEMweE1EUXVOVEkzSUMweU16Z3VOQ3d3SURBc01UQTBMalV5TnlBMk15NHlOaXd3SURBc01qZ3dMalU1T0NJS0lDQWdJQ0FnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lDQWdJQ0JwWkQwaWNHRjBhREk0SWdvZ0lDQWdJQ0FnSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpoaE5ERTRNanRtYVd4c0xXOXdZV05wZEhrNk1UdG1hV3hzTFhKMWJHVTZibTl1ZW1WeWJ6dHpkSEp2YTJVNmJtOXVaU0lnTHo0OGNHRjBhQW9nSUNBZ0lDQWdJQ0FnSUNBZ1pEMGliU0F6T1RrNExqWTJMRGsxTVM0MU5EY2dMVEV4TVM0NE55d3dJREFzTVRFNExqSTVNeUF4TVRFdU9EY3NNQ0F3TEMweE1UZ3VNamt6SUhvZ2JTQXdMQzAwTXpFdU9Ea3hJRFl6TGpJM0xEQWdNQ3d0TVRBMExqVXlOeUF0TWpNNUxqTXpMREFnTUN3eE1EUXVOVEkzSURZMExqRTVMREFnTUN3eU9EQXVOVGs0SUMwMk15NHlOeXd3SURBc01UQTBMalV5TnlBeE56VXVNVFFzTUNBd0xDMHpPRFV1TVRJMUlnb2dJQ0FnSUNBZ0lDQWdJQ0FnYVc1cmMyTmhjR1U2WTI5dWJtVmpkRzl5TFdOMWNuWmhkSFZ5WlQwaU1DSUtJQ0FnSUNBZ0lDQWdJQ0FnSUdsa1BTSndZWFJvTXpBaUNpQWdJQ0FnSUNBZ0lDQWdJQ0J6ZEhsc1pUMGlabWxzYkRvak9HRTBNVGd5TzJacGJHd3RiM0JoWTJsMGVUb3hPMlpwYkd3dGNuVnNaVHB1YjI1NlpYSnZPM04wY205clpUcHViMjVsSWlBdlBqeHdZWFJvQ2lBZ0lDQWdJQ0FnSUNBZ0lDQmtQU0p0SURReE5Ua3VNVElzT0RBd0xqSTFOQ0F0TmpNdU1qY3NNQ0F3TERFd05DNDFNamNnTVRjMUxqRTBMREFnTUN3dE5qa3VOamczSUdNZ01qa3VNelVzTlRRdU1UQXhJRGcwTGpNMkxEZ3dMalk1T1NBeE5EUXVPRGNzT0RBdU5qazVJRFV6TGpFNUxEQWdNVEExTGpRMUxDMHlNaTR3TVRZZ01UUXhMakl5TEMwMk1DNDFNamNnTkRBdU16UXNMVFEwTGprek5DQTBNUzR5Tml3dE9EZ3VNRE15SURReExqSTJMQzB4TkRNdU9UVTNJR3dnTUN3dE1Ua3hMalkxTXlBMk15NHlOeXd3SURBc0xURXdOQzQxTWpjZ0xUSXpPQzQwTERBZ01Dd3hNRFF1TlRJM0lEWXpMakkyTERBZ01Dd3hOVGd1TmpNM0lHTWdNQ3d6TUM0eU5qSWdNQ3cyTVM0ME16UWdMVEU1TGpJMkxEZzRMakF6TlNBdE1qQXVNVGNzTWpZdU5UZ3lJQzAxTXk0eE9Dd3pPUzQwTVRRZ0xUZzJMakU1TERNNUxqUXhOQ0F0TXpNdU9UTXNNQ0F0TmpndU56Y3NMVEV6TGpjMUlDMDRPQzQ1TkN3dE5ERXVNalVnTFRJeExqQTVMQzB5Tnk0MUlDMHlNUzR3T1N3dE5qa3VOamczSUMweU1TNHdPU3d0TVRBeUxqY3dOeUJzSURBc0xURTBNaTR4TWprZ05qTXVNallzTUNBd0xDMHhNRFF1TlRJM0lDMHlNemd1TkN3d0lEQXNNVEEwTGpVeU55QTJNeTR5Tnl3d0lEQXNNamd3TGpVNU9DSUtJQ0FnSUNBZ0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQWdJQ0FnSUNCcFpEMGljR0YwYURNeUlnb2dJQ0FnSUNBZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3Nkl6aGhOREU0TWp0bWFXeHNMVzl3WVdOcGRIazZNVHRtYVd4c0xYSjFiR1U2Ym05dWVtVnlienR6ZEhKdmEyVTZibTl1WlNJZ0x6NDhjR0YwYUFvZ0lDQWdJQ0FnSUNBZ0lDQWdaRDBpYlNBMU1EZ3lMalE0TERjd015NDVOalVnWXlBdE1Ua3VNalFzTnpBdU5qQTFJQzA0TVM0MkxERXhOUzQxTkRjZ0xURTFOQzR3TkN3eE1UVXVOVFEzSUMwMk5pNHdOQ3d3SUMweE1qa3VNeXd0TlRFdU16UTRJQzB4TkRNdU1EVXNMVEV4TlM0MU5EY2diQ0F5T1RjdU1Ea3NNQ0I2SUcwZ09EVXVNamNzTFRFME5DNDRPRE1nWXlBdE16Z3VOVEVzTFRrekxqVXlNeUF0TVRJNUxqSTNMQzB4TlRZdU56a3pJQzB5TXpFdU1EVXNMVEUxTmk0M09UTWdMVEUwTXk0d055d3dJQzB5TlRjdU5qZ3NNVEV4TGpnM01TQXRNalUzTGpZNExESTFOUzQ0TXpZZ01Dd3hORFF1T0RneklERXdPUzR4TWl3eU5qRXVNekk0SURJMU5DNDVNU3d5TmpFdU16STRJRFkzTGpnM0xEQWdNVE0xTGpjeUxDMHpNQzR5TlRnZ01UZ3pMak01TEMwM09DNDROak1nTkRndU5qSXNMVFV4TGpNME5DQTJPQzQzT1N3dE1URXpMalk1TlNBMk9DNDNPU3d0TVRnekxqTTRNeUJzSUMwekxqWTNMQzB6T1M0ME16UWdMVE01Tmk0eE15d3dJR01nTVRRdU5qY3NMVFkzTGpnMk15QTNOeTR3TXl3dE1URTNMak0yTXlBeE5EWXVOeklzTFRFeE55NHpOak1nTkRndU5Ua3NNQ0E1TUM0M05pd3hPQzR6TWpnZ01URTRMakk0TERVNExqWTNNaUJzSURFeE5pNDBOQ3d3SWdvZ0lDQWdJQ0FnSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUNBZ0lDQWdJR2xrUFNKd1lYUm9NelFpQ2lBZ0lDQWdJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qT0dFME1UZ3lPMlpwYkd3dGIzQmhZMmwwZVRveE8yWnBiR3d0Y25Wc1pUcHViMjU2WlhKdk8zTjBjbTlyWlRwdWIyNWxJaUF2UGp4d1lYUm9DaUFnSUNBZ0lDQWdJQ0FnSUNCa1BTSnRJRFk1TUM0NE9UVXNPRFV3TGpjd015QTVNQzQzTlN3d0lESXlMalUwTXl3ek1TNHdNelVnTUN3eU5ETXVNVEl5SUMweE16VXVPREk1TERBZ01Dd3RNalF6TGpFME1TQXlNaTQxTXpZc0xUTXhMakF4TmlJS0lDQWdJQ0FnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lDQWdJQ0JwWkQwaWNHRjBhRE0ySWdvZ0lDQWdJQ0FnSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpoaE5ERTRNanRtYVd4c0xXOXdZV05wZEhrNk1UdG1hV3hzTFhKMWJHVTZibTl1ZW1WeWJ6dHpkSEp2YTJVNmJtOXVaU0lnTHo0OGNHRjBhQW9nSUNBZ0lDQWdJQ0FnSUNBZ1pEMGliU0EyTXpJdU16azFMRGMwTWk0eU5UZ2dNamd1TURNNUxEZzJMak13TkNBdE1qSXVOVFV4TERNeExqQTBJQzB5TXpFdU1qSXpMRGMxTGpFeU9DQXROREV1T1RjMkxDMHhNamt1TVRneklESXpNUzR5TlRjc0xUYzFMakV6TnlBek5pNDBOVFFzTVRFdU9EUTRJZ29nSUNBZ0lDQWdJQ0FnSUNBZ2FXNXJjMk5oY0dVNlkyOXVibVZqZEc5eUxXTjFjblpoZEhWeVpUMGlNQ0lLSUNBZ0lDQWdJQ0FnSUNBZ0lHbGtQU0p3WVhSb016Z2lDaUFnSUNBZ0lDQWdJQ0FnSUNCemRIbHNaVDBpWm1sc2JEb2pPR0UwTVRneU8yWnBiR3d0YjNCaFkybDBlVG94TzJacGJHd3RjblZzWlRwdWIyNTZaWEp2TzNOMGNtOXJaVHB1YjI1bElpQXZQanh3WVhSb0NpQWdJQ0FnSUNBZ0lDQWdJQ0JrUFNKdElEY3hOeTQwTkRrc05qVXpMakV3TlNBdE56TXVOREVzTlRNdU16WWdMVE0yTGpRNE9Dd3RNVEV1T0RjMUlDMHhOREl1T1RBekxDMHhPVFl1TmpreUlERXdPUzQ0T0RNc0xUYzVMamd5T0NBeE5ESXVPVEU0TERFNU5pNDNNRE1nTUN3ek9DNHpNeklpQ2lBZ0lDQWdJQ0FnSUNBZ0lDQnBibXR6WTJGd1pUcGpiMjV1WldOMGIzSXRZM1Z5ZG1GMGRYSmxQU0l3SWdvZ0lDQWdJQ0FnSUNBZ0lDQWdhV1E5SW5CaGRHZzBNQ0lLSUNBZ0lDQWdJQ0FnSUNBZ0lITjBlV3hsUFNKbWFXeHNPaU00WVRReE9ESTdabWxzYkMxdmNHRmphWFI1T2pFN1ptbHNiQzF5ZFd4bE9tNXZibnBsY204N2MzUnliMnRsT201dmJtVWlJQzgrUEhCaGRHZ0tJQ0FnSUNBZ0lDQWdJQ0FnSUdROUltMGdPREk0TGpVeUxEY3dOaTQwTmpVZ0xUY3pMalF5Tml3dE5UTXVNelFnTUM0d01URXNMVE00TGpNMU9TQk1JRGc1T0M0d01EUXNOREU0TGpBM0lERXdNRGN1T1N3ME9UY3VPRGs0SURnMk5DNDVOek1zTmprMExqWXdPU0E0TWpndU5USXNOekEyTGpRMk5TSUtJQ0FnSUNBZ0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQWdJQ0FnSUNCcFpEMGljR0YwYURReUlnb2dJQ0FnSUNBZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3Nkl6aGhOREU0TWp0bWFXeHNMVzl3WVdOcGRIazZNVHRtYVd4c0xYSjFiR1U2Ym05dWVtVnlienR6ZEhKdmEyVTZibTl1WlNJZ0x6NDhjR0YwYUFvZ0lDQWdJQ0FnSUNBZ0lDQWdaRDBpYlNBNE1USXVNRGcyTERneU9DNDFPRFlnTWpndU1EVTFMQzA0Tmk0ek1pQXpOaTQwT0RRc0xURXhMamd6TmlBeU16RXVNakkxTERjMUxqRXhOeUF0TkRFdU9UY3NNVEk1TGpFNE15QXRNak14TGpJek9Td3ROelV1TVRRZ0xUSXlMalUxTlN3dE16RXVNREEwSWdvZ0lDQWdJQ0FnSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUNBZ0lDQWdJR2xrUFNKd1lYUm9ORFFpQ2lBZ0lDQWdJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qT0dFME1UZ3lPMlpwYkd3dGIzQmhZMmwwZVRveE8yWnBiR3d0Y25Wc1pUcHViMjU2WlhKdk8zTjBjbTlyWlRwdWIyNWxJaUF2UGp4d1lYUm9DaUFnSUNBZ0lDQWdJQ0FnSUNCa1BTSnRJRGN6Tmk0ek1ERXNNVE16TlM0NE9DQmpJQzB6TWpNdU1EUTNMREFnTFRVNE5TNDROelVzTFRJMk1pNDNPQ0F0TlRnMUxqZzNOU3d0TlRnMUxqYzRNaUF3TEMwek1qTXVNVEU0SURJMk1pNDRNamdzTFRVNE5TNDVOemNnTlRnMUxqZzNOU3d0TlRnMUxqazNOeUF6TWpNdU1ERTVMREFnTlRnMUxqZ3dPU3d5TmpJdU9EVTVJRFU0TlM0NE1Ea3NOVGcxTGprM055QXdMRE15TXk0d01ESWdMVEkyTWk0M09TdzFPRFV1TnpneUlDMDFPRFV1T0RBNUxEVTROUzQzT0RJZ2JDQXdMREFnZWlCdElEQXNMVEV4T0M0Mk1TQmpJREkxTnk0NU56SXNNQ0EwTmpjdU1UZzVMQzB5TURrdU1UTWdORFkzTGpFNE9Td3RORFkzTGpFM01pQXdMQzB5TlRndU1USTVJQzB5TURrdU1qRTNMQzAwTmpjdU16UTRJQzAwTmpjdU1UZzVMQzAwTmpjdU16UTRJQzB5TlRndU1EYzBMREFnTFRRMk55NHlOVFFzTWpBNUxqSXhPU0F0TkRZM0xqSTFOQ3cwTmpjdU16UTRJREFzTWpVNExqQTBNaUF5TURrdU1UZ3NORFkzTGpFM01pQTBOamN1TWpVMExEUTJOeTR4TnpJaUNpQWdJQ0FnSUNBZ0lDQWdJQ0JwYm10elkyRndaVHBqYjI1dVpXTjBiM0l0WTNWeWRtRjBkWEpsUFNJd0lnb2dJQ0FnSUNBZ0lDQWdJQ0FnYVdROUluQmhkR2cwTmlJS0lDQWdJQ0FnSUNBZ0lDQWdJSE4wZVd4bFBTSm1hV3hzT2lNNFlUUXhPREk3Wm1sc2JDMXZjR0ZqYVhSNU9qRTdabWxzYkMxeWRXeGxPbTV2Ym5wbGNtODdjM1J5YjJ0bE9tNXZibVVpSUM4K1BIQmhkR2dLSUNBZ0lDQWdJQ0FnSUNBZ0lHUTlJbTBnTVRBNU1TNHhNeXcyTVRrdU9EZ3pJQzB4TnpVdU56Y3hMRFUzTGpFeU1TQXhNUzQyTWprc016VXVPREE0SURFM05TNDNOaklzTFRVM0xqRXlNU0F0TVRFdU5qSXNMVE0xTGpnd09DSUtJQ0FnSUNBZ0lDQWdJQ0FnSUdsdWEzTmpZWEJsT21OdmJtNWxZM1J2Y2kxamRYSjJZWFIxY21VOUlqQWlDaUFnSUNBZ0lDQWdJQ0FnSUNCcFpEMGljR0YwYURRNElnb2dJQ0FnSUNBZ0lDQWdJQ0FnYzNSNWJHVTlJbVpwYkd3Nkl6aGhOREU0TWp0bWFXeHNMVzl3WVdOcGRIazZNVHRtYVd4c0xYSjFiR1U2Ym05dWVtVnlienR6ZEhKdmEyVTZibTl1WlNJZ0x6NDhjR0YwYUFvZ0lDQWdJQ0FnSUNBZ0lDQWdaRDBpVFNBNE5qWXVPVFUzTERrd01pNHdOelFnT0RNMkxqVXNPVEkwTGpFNU9TQTVORFV1TVRJeExERXdOek11TnpNZ09UYzFMalU0Tml3eE1EVXhMall4SURnMk5pNDVOVGNzT1RBeUxqQTNOQ0lLSUNBZ0lDQWdJQ0FnSUNBZ0lHbHVhM05qWVhCbE9tTnZibTVsWTNSdmNpMWpkWEoyWVhSMWNtVTlJakFpQ2lBZ0lDQWdJQ0FnSUNBZ0lDQnBaRDBpY0dGMGFEVXdJZ29nSUNBZ0lDQWdJQ0FnSUNBZ2MzUjViR1U5SW1acGJHdzZJemhoTkRFNE1qdG1hV3hzTFc5d1lXTnBkSGs2TVR0bWFXeHNMWEoxYkdVNmJtOXVlbVZ5Ynp0emRISnZhMlU2Ym05dVpTSWdMejQ4Y0dGMGFBb2dJQ0FnSUNBZ0lDQWdJQ0FnWkQwaVRTQTJNRGN1TkRZMUxEa3dNeTQwTkRVZ05EazRMamcxTlN3eE1EVXlMamszSURVeU9TNHpNaXd4TURjMUxqRWdOak0zTGprekxEa3lOUzQxTmpZZ05qQTNMalEyTlN3NU1ETXVORFExSWdvZ0lDQWdJQ0FnSUNBZ0lDQWdhVzVyYzJOaGNHVTZZMjl1Ym1WamRHOXlMV04xY25aaGRIVnlaVDBpTUNJS0lDQWdJQ0FnSUNBZ0lDQWdJR2xrUFNKd1lYUm9OVElpQ2lBZ0lDQWdJQ0FnSUNBZ0lDQnpkSGxzWlQwaVptbHNiRG9qT0dFME1UZ3lPMlpwYkd3dGIzQmhZMmwwZVRveE8yWnBiR3d0Y25Wc1pUcHViMjU2WlhKdk8zTjBjbTlyWlRwdWIyNWxJaUF2UGp4d1lYUm9DaUFnSUNBZ0lDQWdJQ0FnSUNCa1BTSnRJRE00TUM0Mk9EZ3NOakl5TGpFeU9TQXRNVEV1TmpJMkxETTFMamd3TVNBeE56VXVOelU0TERVM0xqQTVJREV4TGpZeU1Td3RNelV1T0RBeElDMHhOelV1TnpVekxDMDFOeTR3T1NJS0lDQWdJQ0FnSUNBZ0lDQWdJR2x1YTNOallYQmxPbU52Ym01bFkzUnZjaTFqZFhKMllYUjFjbVU5SWpBaUNpQWdJQ0FnSUNBZ0lDQWdJQ0JwWkQwaWNHRjBhRFUwSWdvZ0lDQWdJQ0FnSUNBZ0lDQWdjM1I1YkdVOUltWnBiR3c2SXpoaE5ERTRNanRtYVd4c0xXOXdZV05wZEhrNk1UdG1hV3hzTFhKMWJHVTZibTl1ZW1WeWJ6dHpkSEp2YTJVNmJtOXVaU0lnTHo0OGNHRjBhQW9nSUNBZ0lDQWdJQ0FnSUNBZ1pEMGliU0EzTVRZdU1qZzVMRE0zTmk0MU9TQXpOeTQyTkRBMkxEQWdNQ3d4T0RRdU9ERTJJQzB6Tnk0Mk5EQTJMREFnTUN3dE1UZzBMamd4TmlCNklnb2dJQ0FnSUNBZ0lDQWdJQ0FnYVc1cmMyTmhjR1U2WTI5dWJtVmpkRzl5TFdOMWNuWmhkSFZ5WlQwaU1DSUtJQ0FnSUNBZ0lDQWdJQ0FnSUdsa1BTSndZWFJvTlRZaUNpQWdJQ0FnSUNBZ0lDQWdJQ0J6ZEhsc1pUMGlabWxzYkRvak9HRTBNVGd5TzJacGJHd3RiM0JoWTJsMGVUb3hPMlpwYkd3dGNuVnNaVHB1YjI1NlpYSnZPM04wY205clpUcHViMjVsSWlBdlBqd3ZaejQ4TDJjK1BDOW5Qand2Wno0OEwzTjJaejQ9Jykgbm8tcmVwZWF0LCBub25lOyAtbW96LWJhY2tncm91bmQtc2l6ZTogMTAwJTsgLW8tYmFja2dyb3VuZC1zaXplOiAxMDAlOyAtd2Via2l0LWJhY2tncm91bmQtc2l6ZTogMTAwJTsgYmFja2dyb3VuZC1zaXplOiAxMDAlOyBkaXNwbGF5OiBibG9jazsgZmxvYXQ6IGxlZnQ7IHdpZHRoOiA5MHB4OyBoZWlnaHQ6IDI1cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuYmFubmVyIC52ZXJzaW9uIHsgbWFyZ2luLWxlZnQ6IDE0cHg7IHBvc2l0aW9uOiByZWxhdGl2ZTsgdG9wOiA2cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAjamFzbWluZV9jb250ZW50IHsgcG9zaXRpb246IGZpeGVkOyByaWdodDogMTAwJTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC52ZXJzaW9uIHsgY29sb3I6ICNhYWE7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuYmFubmVyIHsgbWFyZ2luLXRvcDogMTRweDsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5kdXJhdGlvbiB7IGNvbG9yOiAjZmZmOyBmbG9hdDogcmlnaHQ7IGxpbmUtaGVpZ2h0OiAyOHB4OyBwYWRkaW5nLXJpZ2h0OiA5cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3ltYm9sLXN1bW1hcnkgeyBvdmVyZmxvdzogaGlkZGVuOyAqem9vbTogMTsgbWFyZ2luOiAxNHB4IDA7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3ltYm9sLXN1bW1hcnkgbGkgeyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGhlaWdodDogOHB4OyB3aWR0aDogMTRweDsgZm9udC1zaXplOiAxNnB4OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN5bWJvbC1zdW1tYXJ5IGxpLnBhc3NlZCB7IGZvbnQtc2l6ZTogMTRweDsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5zeW1ib2wtc3VtbWFyeSBsaS5wYXNzZWQ6YmVmb3JlIHsgY29sb3I6ICMwMDcwNjk7IGNvbnRlbnQ6ICJcMDIwMjIiOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN5bWJvbC1zdW1tYXJ5IGxpLmZhaWxlZCB7IGxpbmUtaGVpZ2h0OiA5cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3ltYm9sLXN1bW1hcnkgbGkuZmFpbGVkOmJlZm9yZSB7IGNvbG9yOiAjY2EzYTExOyBjb250ZW50OiAiXGQ3IjsgZm9udC13ZWlnaHQ6IGJvbGQ7IG1hcmdpbi1sZWZ0OiAtMXB4OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN5bWJvbC1zdW1tYXJ5IGxpLmRpc2FibGVkIHsgZm9udC1zaXplOiAxNHB4OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN5bWJvbC1zdW1tYXJ5IGxpLmRpc2FibGVkOmJlZm9yZSB7IGNvbG9yOiAjYmFiYWJhOyBjb250ZW50OiAiXDAyMDIyIjsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5zeW1ib2wtc3VtbWFyeSBsaS5wZW5kaW5nIHsgbGluZS1oZWlnaHQ6IDE3cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3ltYm9sLXN1bW1hcnkgbGkucGVuZGluZzpiZWZvcmUgeyBjb2xvcjogI2JhOWQzNzsgY29udGVudDogIioiOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN5bWJvbC1zdW1tYXJ5IGxpLmVtcHR5IHsgZm9udC1zaXplOiAxNHB4OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN5bWJvbC1zdW1tYXJ5IGxpLmVtcHR5OmJlZm9yZSB7IGNvbG9yOiAjYmE5ZDM3OyBjb250ZW50OiAiXDAyMDIyIjsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5ydW4tb3B0aW9ucyB7IGZsb2F0OiByaWdodDsgbWFyZ2luLXJpZ2h0OiA1cHg7IGJvcmRlcjogMXB4IHNvbGlkICM4YTQxODI7IGNvbG9yOiAjOGE0MTgyOyBwb3NpdGlvbjogcmVsYXRpdmU7IGxpbmUtaGVpZ2h0OiAyMHB4OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnJ1bi1vcHRpb25zIC50cmlnZ2VyIHsgY3Vyc29yOiBwb2ludGVyOyBwYWRkaW5nOiA4cHggMTZweDsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5ydW4tb3B0aW9ucyAucGF5bG9hZCB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgZGlzcGxheTogbm9uZTsgcmlnaHQ6IC0xcHg7IGJvcmRlcjogMXB4IHNvbGlkICM4YTQxODI7IGJhY2tncm91bmQtY29sb3I6ICNlZWU7IHdoaXRlLXNwYWNlOiBub3dyYXA7IHBhZGRpbmc6IDRweCA4cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAucnVuLW9wdGlvbnMgLnBheWxvYWQub3BlbiB7IGRpc3BsYXk6IGJsb2NrOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLmJhciB7IGxpbmUtaGVpZ2h0OiAyOHB4OyBmb250LXNpemU6IDE0cHg7IGRpc3BsYXk6IGJsb2NrOyBjb2xvcjogI2VlZTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5iYXIuZmFpbGVkIHsgYmFja2dyb3VuZC1jb2xvcjogI2NhM2ExMTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5iYXIucGFzc2VkIHsgYmFja2dyb3VuZC1jb2xvcjogIzAwNzA2OTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5iYXIuc2tpcHBlZCB7IGJhY2tncm91bmQtY29sb3I6ICNiYWJhYmE7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuYmFyLmVycm9yZWQgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjY2EzYTExOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLmJhci5tZW51IHsgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgY29sb3I6ICNhYWE7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuYmFyLm1lbnUgYSB7IGNvbG9yOiAjMzMzOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLmJhciBhIHsgY29sb3I6IHdoaXRlOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIuc3BlYy1saXN0IC5iYXIubWVudS5mYWlsdXJlLWxpc3QsIC5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIuc3BlYy1saXN0IC5yZXN1bHRzIC5mYWlsdXJlcyB7IGRpc3BsYXk6IG5vbmU7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlci5mYWlsdXJlLWxpc3QgLmJhci5tZW51LnNwZWMtbGlzdCwgLmphc21pbmVfaHRtbC1yZXBvcnRlci5mYWlsdXJlLWxpc3QgLnN1bW1hcnkgeyBkaXNwbGF5OiBub25lOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnJ1bm5pbmctYWxlcnQgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjNjY2OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnJlc3VsdHMgeyBtYXJnaW4tdG9wOiAxNHB4OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIuc2hvd0RldGFpbHMgLnN1bW1hcnlNZW51SXRlbSB7IGZvbnQtd2VpZ2h0OiBub3JtYWw7IHRleHQtZGVjb3JhdGlvbjogaW5oZXJpdDsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyLnNob3dEZXRhaWxzIC5zdW1tYXJ5TWVudUl0ZW06aG92ZXIgeyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyLnNob3dEZXRhaWxzIC5kZXRhaWxzTWVudUl0ZW0geyBmb250LXdlaWdodDogYm9sZDsgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlci5zaG93RGV0YWlscyAuc3VtbWFyeSB7IGRpc3BsYXk6IG5vbmU7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlci5zaG93RGV0YWlscyAjZGV0YWlscyB7IGRpc3BsYXk6IGJsb2NrOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN1bW1hcnlNZW51SXRlbSB7IGZvbnQtd2VpZ2h0OiBib2xkOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5zdW1tYXJ5IHsgbWFyZ2luLXRvcDogMTRweDsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5zdW1tYXJ5IHVsIHsgbGlzdC1zdHlsZS10eXBlOiBub25lOyBtYXJnaW4tbGVmdDogMTRweDsgcGFkZGluZy10b3A6IDA7IHBhZGRpbmctbGVmdDogMDsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5zdW1tYXJ5IHVsLnN1aXRlIHsgbWFyZ2luLXRvcDogN3B4OyBtYXJnaW4tYm90dG9tOiA3cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3VtbWFyeSBsaS5wYXNzZWQgYSB7IGNvbG9yOiAjMDA3MDY5OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN1bW1hcnkgbGkuZmFpbGVkIGEgeyBjb2xvcjogI2NhM2ExMTsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5zdW1tYXJ5IGxpLmVtcHR5IGEgeyBjb2xvcjogI2JhOWQzNzsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5zdW1tYXJ5IGxpLnBlbmRpbmcgYSB7IGNvbG9yOiAjYmE5ZDM3OyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnN1bW1hcnkgbGkuZGlzYWJsZWQgYSB7IGNvbG9yOiAjYmFiYWJhOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLmRlc2NyaXB0aW9uICsgLnN1aXRlIHsgbWFyZ2luLXRvcDogMDsgfQouamFzbWluZV9odG1sLXJlcG9ydGVyIC5zdWl0ZSB7IG1hcmdpbi10b3A6IDE0cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3VpdGUgYSB7IGNvbG9yOiAjMzMzOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLmZhaWx1cmVzIC5zcGVjLWRldGFpbCB7IG1hcmdpbi1ib3R0b206IDI4cHg7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuZmFpbHVyZXMgLnNwZWMtZGV0YWlsIC5kZXNjcmlwdGlvbiB7IGJhY2tncm91bmQtY29sb3I6ICNjYTNhMTE7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuZmFpbHVyZXMgLnNwZWMtZGV0YWlsIC5kZXNjcmlwdGlvbiBhIHsgY29sb3I6IHdoaXRlOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnJlc3VsdC1tZXNzYWdlIHsgcGFkZGluZy10b3A6IDE0cHg7IGNvbG9yOiAjMzMzOyB3aGl0ZS1zcGFjZTogcHJlOyB9Ci5qYXNtaW5lX2h0bWwtcmVwb3J0ZXIgLnJlc3VsdC1tZXNzYWdlIHNwYW4ucmVzdWx0IHsgZGlzcGxheTogYmxvY2s7IH0KLmphc21pbmVfaHRtbC1yZXBvcnRlciAuc3RhY2stdHJhY2UgeyBtYXJnaW46IDVweCAwIDAgMDsgbWF4LWhlaWdodDogMjI0cHg7IG92ZXJmbG93OiBhdXRvOyBsaW5lLWhlaWdodDogMThweDsgY29sb3I6ICM2NjY7IGJvcmRlcjogMXB4IHNvbGlkICNkZGQ7IGJhY2tncm91bmQ6IHdoaXRlOyB3aGl0ZS1zcGFjZTogcHJlOyB9Cg==");
  document.head.appendChild(link);
})();
/*
    json2.js
    2014-02-04

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
