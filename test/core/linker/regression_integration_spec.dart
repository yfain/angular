library angular2.test.core.linker.regression_integration_spec;

import "dart:async";
import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        el,
        dispatchEvent,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit,
        containsRegexp,
        stringifyElement,
        TestComponentBuilder,
        fakeAsync,
        tick,
        clearPendingTimers,
        ComponentFixture;
import "package:angular2/src/facade/lang.dart" show IS_DART;
import "package:angular2/core.dart"
    show
        Component,
        Pipe,
        PipeTransform,
        provide,
        ViewMetadata,
        PLATFORM_PIPES,
        OpaqueToken,
        Injector;
import "package:angular2/compiler.dart" show CompilerConfig;

main() {
  if (IS_DART) {
    declareTests(false);
  } else {
    describe("jit", () {
      beforeEachProviders(() => [
            provide(CompilerConfig,
                useValue: new CompilerConfig(true, false, true))
          ]);
      declareTests(true);
    });
    describe("no jit", () {
      beforeEachProviders(() => [
            provide(CompilerConfig,
                useValue: new CompilerConfig(true, false, false))
          ]);
      declareTests(false);
    });
  }
}

declareTests(bool isJit) {
  // Place to put reproductions for regressions
  describe("regressions", () {
    describe("platform pipes", () {
      beforeEachProviders(() => [
            provide(PLATFORM_PIPES, useValue: [PlatformPipe], multi: true)
          ]);
      it(
          "should overwrite them by custom pipes",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "{{true | somePipe}}", pipes: [CustomPipe]))
                .createAsync(MyComp)
                .then((fixture) {
              fixture.detectChanges();
              expect(fixture.nativeElement).toHaveText("someCustomPipe");
              async.done();
            });
          }));
    });
    describe("providers", () {
      Future<Injector> createInjector(
          TestComponentBuilder tcb, List<dynamic> proviers) {
        return tcb
            .overrideProviders(MyComp, [proviers])
            .createAsync(MyComp)
            .then((fixture) => fixture.componentInstance.injector);
      }
      it(
          "should support providers with an OpaqueToken that contains a `.` in the name",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            var token = new OpaqueToken("a.b");
            var tokenValue = 1;
            createInjector(tcb, [provide(token, useValue: tokenValue)])
                .then((Injector injector) {
              expect(injector.get(token)).toEqual(tokenValue);
              async.done();
            });
          }));
      it(
          "should support providers with string token with a `.` in it",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            var token = "a.b";
            var tokenValue = 1;
            createInjector(tcb, [provide(token, useValue: tokenValue)])
                .then((Injector injector) {
              expect(injector.get(token)).toEqual(tokenValue);
              async.done();
            });
          }));
      it(
          "should support providers with an anonymous function",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            var token = () => true;
            var tokenValue = 1;
            createInjector(tcb, [provide(token, useValue: tokenValue)])
                .then((Injector injector) {
              expect(injector.get(token)).toEqual(tokenValue);
              async.done();
            });
          }));
      it(
          "should support providers with an OpaqueToken that has a StringMap as value",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            var token1 = new OpaqueToken("someToken");
            var token2 = new OpaqueToken("someToken");
            var tokenValue1 = {"a": 1};
            var tokenValue2 = {"a": 1};
            createInjector(tcb, [
              provide(token1, useValue: tokenValue1),
              provide(token2, useValue: tokenValue2)
            ]).then((Injector injector) {
              expect(injector.get(token1)).toEqual(tokenValue1);
              expect(injector.get(token2)).toEqual(tokenValue2);
              async.done();
            });
          }));
    });
    it(
        "should allow logging a previous elements class binding via interpolation",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideTemplate(MyComp,
                  '''<div [class.a]="true" #el>Class: {{el.className}}</div>''')
              .createAsync(MyComp)
              .then((fixture) {
            fixture.detectChanges();
            expect(fixture.nativeElement).toHaveText("Class: a");
            async.done();
          });
        }));
  });
}

@Component(selector: "my-comp", template: "")
class MyComp {
  Injector injector;
  MyComp(this.injector) {}
}

@Pipe(name: "somePipe", pure: true)
class PlatformPipe implements PipeTransform {
  dynamic transform(dynamic value) {
    return "somePlatformPipe";
  }
}

@Pipe(name: "somePipe", pure: true)
class CustomPipe implements PipeTransform {
  dynamic transform(dynamic value) {
    return "someCustomPipe";
  }
}
