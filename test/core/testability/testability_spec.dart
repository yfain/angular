library angular2.test.core.testability.testability_spec;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        ddescribe,
        it,
        iit,
        xit,
        xdescribe,
        expect,
        beforeEach,
        SpyObject;
import "package:angular2/src/core/testability/testability.dart"
    show Testability;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/facade/lang.dart" show scheduleMicroTask;
import "package:angular2/src/facade/async.dart"
    show PromiseWrapper, EventEmitter, ObservableWrapper;

// Schedules a microtasks (using a resolved promise .then())
void microTask(Function fn) {
  scheduleMicroTask(() {
    // We do double dispatch so that we  can wait for scheduleMicrotas in the Testability when

    // NgZone becomes stable.
    scheduleMicroTask(fn);
  });
}

@Injectable()
class MockNgZone extends NgZone {
  EventEmitter<dynamic> _onUnstableStream;
  get onUnstable {
    return this._onUnstableStream;
  }

  EventEmitter<dynamic> _onStableStream;
  get onStable {
    return this._onStableStream;
  }

  MockNgZone() : super(enableLongStackTrace: false) {
    /* super call moved to initializer */;
    this._onUnstableStream = new EventEmitter(false);
    this._onStableStream = new EventEmitter(false);
  }
  void unstable() {
    ObservableWrapper.callEmit(this._onUnstableStream, null);
  }

  void stable() {
    ObservableWrapper.callEmit(this._onStableStream, null);
  }
}

main() {
  describe("Testability", () {
    Testability testability;
    dynamic execute;
    dynamic execute2;
    MockNgZone ngZone;
    beforeEach(() {
      ngZone = new MockNgZone();
      testability = new Testability(ngZone);
      execute = new SpyObject().spy("execute");
      execute2 = new SpyObject().spy("execute");
    });
    describe("Pending count logic", () {
      it("should start with a pending count of 0", () {
        expect(testability.getPendingRequestCount()).toEqual(0);
      });
      it(
          "should fire whenstable callbacks if pending count is 0",
          inject([AsyncTestCompleter], (async) {
            testability.whenStable(execute);
            microTask(() {
              expect(execute).toHaveBeenCalled();
              async.done();
            });
          }));
      it("should not fire whenstable callbacks synchronously if pending count is 0",
          () {
        testability.whenStable(execute);
        expect(execute).not.toHaveBeenCalled();
      });
      it(
          "should not call whenstable callbacks when there are pending counts",
          inject([AsyncTestCompleter], (async) {
            testability.increasePendingRequestCount();
            testability.increasePendingRequestCount();
            testability.whenStable(execute);
            microTask(() {
              expect(execute).not.toHaveBeenCalled();
              testability.decreasePendingRequestCount();
              microTask(() {
                expect(execute).not.toHaveBeenCalled();
                async.done();
              });
            });
          }));
      it(
          "should fire whenstable callbacks when pending drops to 0",
          inject([AsyncTestCompleter], (async) {
            testability.increasePendingRequestCount();
            testability.whenStable(execute);
            microTask(() {
              expect(execute).not.toHaveBeenCalled();
              testability.decreasePendingRequestCount();
              microTask(() {
                expect(execute).toHaveBeenCalled();
                async.done();
              });
            });
          }));
      it("should not fire whenstable callbacks synchronously when pending drops to 0",
          () {
        testability.increasePendingRequestCount();
        testability.whenStable(execute);
        testability.decreasePendingRequestCount();
        expect(execute).not.toHaveBeenCalled();
      });
      it(
          "should fire whenstable callbacks with didWork if pending count is 0",
          inject([AsyncTestCompleter], (async) {
            testability.whenStable(execute);
            microTask(() {
              expect(execute).toHaveBeenCalledWith(false);
              async.done();
            });
          }));
      it(
          "should fire whenstable callbacks with didWork when pending drops to 0",
          inject([AsyncTestCompleter], (async) {
            testability.increasePendingRequestCount();
            testability.whenStable(execute);
            microTask(() {
              testability.decreasePendingRequestCount();
              microTask(() {
                expect(execute).toHaveBeenCalledWith(true);
                testability.whenStable(execute2);
                microTask(() {
                  expect(execute2).toHaveBeenCalledWith(false);
                  async.done();
                });
              });
            });
          }));
    });
    describe("NgZone callback logic", () {
      it(
          "should fire whenstable callback if event is already finished",
          inject([AsyncTestCompleter], (async) {
            ngZone.unstable();
            ngZone.stable();
            testability.whenStable(execute);
            microTask(() {
              expect(execute).toHaveBeenCalled();
              async.done();
            });
          }));
      it("should not fire whenstable callbacks synchronously if event is already finished",
          () {
        ngZone.unstable();
        ngZone.stable();
        testability.whenStable(execute);
        expect(execute).not.toHaveBeenCalled();
      });
      it(
          "should fire whenstable callback when event finishes",
          inject([AsyncTestCompleter], (async) {
            ngZone.unstable();
            testability.whenStable(execute);
            microTask(() {
              expect(execute).not.toHaveBeenCalled();
              ngZone.stable();
              microTask(() {
                expect(execute).toHaveBeenCalled();
                async.done();
              });
            });
          }));
      it("should not fire whenstable callbacks synchronously when event finishes",
          () {
        ngZone.unstable();
        testability.whenStable(execute);
        ngZone.stable();
        expect(execute).not.toHaveBeenCalled();
      });
      it(
          "should not fire whenstable callback when event did not finish",
          inject([AsyncTestCompleter], (async) {
            ngZone.unstable();
            testability.increasePendingRequestCount();
            testability.whenStable(execute);
            microTask(() {
              expect(execute).not.toHaveBeenCalled();
              testability.decreasePendingRequestCount();
              microTask(() {
                expect(execute).not.toHaveBeenCalled();
                ngZone.stable();
                microTask(() {
                  expect(execute).toHaveBeenCalled();
                  async.done();
                });
              });
            });
          }));
      it(
          "should not fire whenstable callback when there are pending counts",
          inject([AsyncTestCompleter], (async) {
            ngZone.unstable();
            testability.increasePendingRequestCount();
            testability.increasePendingRequestCount();
            testability.whenStable(execute);
            microTask(() {
              expect(execute).not.toHaveBeenCalled();
              ngZone.stable();
              microTask(() {
                expect(execute).not.toHaveBeenCalled();
                testability.decreasePendingRequestCount();
                microTask(() {
                  expect(execute).not.toHaveBeenCalled();
                  testability.decreasePendingRequestCount();
                  microTask(() {
                    expect(execute).toHaveBeenCalled();
                    async.done();
                  });
                });
              });
            });
          }));
      it(
          "should fire whenstable callback with didWork if event is already finished",
          inject([AsyncTestCompleter], (async) {
            ngZone.unstable();
            ngZone.stable();
            testability.whenStable(execute);
            microTask(() {
              expect(execute).toHaveBeenCalledWith(true);
              testability.whenStable(execute2);
              microTask(() {
                expect(execute2).toHaveBeenCalledWith(false);
                async.done();
              });
            });
          }));
      it(
          "should fire whenstable callback with didwork when event finishes",
          inject([AsyncTestCompleter], (async) {
            ngZone.unstable();
            testability.whenStable(execute);
            microTask(() {
              ngZone.stable();
              microTask(() {
                expect(execute).toHaveBeenCalledWith(true);
                testability.whenStable(execute2);
                microTask(() {
                  expect(execute2).toHaveBeenCalledWith(false);
                  async.done();
                });
              });
            });
          }));
    });
  });
}
