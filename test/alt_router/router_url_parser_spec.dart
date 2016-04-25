library angular2.test.alt_router.router_url_parser_spec;

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
import "package:angular2/src/alt_router/router_url_parser.dart"
    show DefaultRouterUrlParser;
import "package:angular2/src/alt_router/segments.dart" show UrlSegment;

main() {
  describe("url parsing", () {
    var parser = new DefaultRouterUrlParser();
    it("should throw on an empty urls", () {
      expect(() => parser.parse("")).toThrow();
    });
    it("should parse the root url", () {
      var tree = parser.parse("/");
      expect(tree.root).toEqual(new UrlSegment("/", {}, ""));
    });
    it("should parse non-empty urls", () {
      var tree = parser.parse("one/two/three");
      expect(tree.root).toEqual(new UrlSegment("one", {}, ""));
      expect(tree.firstChild(tree.root)).toEqual(new UrlSegment("two", {}, ""));
      expect(tree.firstChild(tree.firstChild(tree.root)))
          .toEqual(new UrlSegment("three", {}, ""));
    });
    it("should parse non-empty absolute urls", () {
      var tree = parser.parse("/one/two");
      expect(tree.root).toEqual(new UrlSegment("/one", {}, ""));
      expect(tree.firstChild(tree.root)).toEqual(new UrlSegment("two", {}, ""));
    });
  });
}
