library angular2.test.common.directives.ng_plural_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        TestComponentBuilder,
        beforeEachProviders,
        beforeEach,
        ddescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        it,
        xit;
import "package:angular2/core.dart" show Component, View, Injectable, provide;
import "package:angular2/common.dart"
    show NgPlural, NgPluralCase, NgLocalization;

main() {
  describe("switch", () {
    beforeEachProviders(
        () => [provide(NgLocalization, useClass: TestLocalizationMap)]);
    it(
        "should display the template according to the exact value",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template = "<div>" +
              "<ul [ngPlural]=\"switchValue\">" +
              "<template ngPluralCase=\"=0\"><li>you have no messages.</li></template>" +
              "<template ngPluralCase=\"=1\"><li>you have one message.</li></template>" +
              "</ul></div>";
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.debugElement.componentInstance.switchValue = 0;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("you have no messages.");
            fixture.debugElement.componentInstance.switchValue = 1;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("you have one message.");
            async.done();
          });
        }));
    it(
        "should display the template according to the category",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template = "<div>" +
              "<ul [ngPlural]=\"switchValue\">" +
              "<template ngPluralCase=\"few\"><li>you have a few messages.</li></template>" +
              "<template ngPluralCase=\"many\"><li>you have many messages.</li></template>" +
              "</ul></div>";
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.debugElement.componentInstance.switchValue = 2;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("you have a few messages.");
            fixture.debugElement.componentInstance.switchValue = 8;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("you have many messages.");
            async.done();
          });
        }));
    it(
        "should default to other when no matches are found",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template = "<div>" +
              "<ul [ngPlural]=\"switchValue\">" +
              "<template ngPluralCase=\"few\"><li>you have a few messages.</li></template>" +
              "<template ngPluralCase=\"other\"><li>default message.</li></template>" +
              "</ul></div>";
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.debugElement.componentInstance.switchValue = 100;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("default message.");
            async.done();
          });
        }));
    it(
        "should prioritize value matches over category matches",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template = "<div>" +
              "<ul [ngPlural]=\"switchValue\">" +
              "<template ngPluralCase=\"few\"><li>you have a few messages.</li></template>" +
              "<template ngPluralCase=\"=2\">you have two messages.</template>" +
              "</ul></div>";
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.debugElement.componentInstance.switchValue = 2;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("you have two messages.");
            fixture.debugElement.componentInstance.switchValue = 3;
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("you have a few messages.");
            async.done();
          });
        }));
  });
}

@Injectable()
class TestLocalizationMap extends NgLocalization {
  String getPluralCategory(num value) {
    if (value > 1 && value < 4) {
      return "few";
    } else if (value >= 4 && value < 10) {
      return "many";
    } else {
      return "other";
    }
  }
}

@Component(selector: "test-cmp")
@View(directives: const [NgPlural, NgPluralCase])
class TestComponent {
  num switchValue;
  TestComponent() {
    this.switchValue = null;
  }
}
