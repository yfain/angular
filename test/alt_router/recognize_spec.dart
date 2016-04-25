library angular2.test.alt_router.recognize_spec;

import "package:angular2/testing_internal.dart"
    show
        ComponentFixture,
        AsyncTestCompleter,
        TestComponentBuilder,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit;
import "package:angular2/src/alt_router/recognize.dart" show recognize;
import "package:angular2/alt_router.dart" show Routes, Route;
import "package:angular2/core.dart" show provide, Component, ComponentResolver;
import "package:angular2/src/alt_router/segments.dart" show UrlSegment, Tree;

main() {
  describe("recognize", () {
    it(
        "should handle position args",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree(["b", "paramB", "c", "paramC"]))
              .then((r) {
            var b = r.root;
            expect(stringifyUrl(b.urlSegments)).toEqual(["b", "paramB"]);
            expect(b.type).toBe(ComponentB);
            var c = r.firstChild(r.root);
            expect(stringifyUrl(c.urlSegments)).toEqual(["c", "paramC"]);
            expect(c.type).toBe(ComponentC);
            async.done();
          });
        }));
    it(
        "should error when no matching routes",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree(["invalid"])).catchError((e) {
            expect(e.message).toEqual("Cannot match any routes");
            async.done();
          });
        }));
    it(
        "should error when a component doesn't have @Routes",
        inject([AsyncTestCompleter, ComponentResolver], (async, resolver) {
          recognize(resolver, ComponentA, tree(["d", "invalid"]))
              .catchError((e) {
            expect(e.message).toEqual(
                "Component 'ComponentD' does not have route configuration");
            async.done();
          });
        }));
  });
}

tree(List<String> nodes) {
  return new Tree<UrlSegment>(
      nodes.map((v) => new UrlSegment(v, {}, "")).toList());
}

List<String> stringifyUrl(List<UrlSegment> segments) {
  return segments.map((s) => s.segment).toList();
}

@Component(selector: "c", template: "t")
class ComponentC {}

@Component(selector: "d", template: "t")
class ComponentD {}

@Component(selector: "b", template: "t")
@Routes(const [const Route(path: "c/:c", component: ComponentC)])
class ComponentB {}

@Component(selector: "a", template: "t")
@Routes(const [
  const Route(path: "b/:b", component: ComponentB),
  const Route(path: "d", component: ComponentD)
])
class ComponentA {}
