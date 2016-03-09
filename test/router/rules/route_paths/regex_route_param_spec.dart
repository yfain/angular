library angular2.test.router.rules.route_paths.regex_route_param_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        describe,
        it,
        iit,
        ddescribe,
        expect,
        inject,
        beforeEach,
        SpyObject;
import "package:angular2/src/router/rules/route_paths/route_path.dart"
    show GeneratedUrl;
import "package:angular2/src/router/rules/route_paths/regex_route_path.dart"
    show RegexRoutePath;
import "package:angular2/src/router/url_parser.dart" show parser, Url;

emptySerializer(params) {
  return new GeneratedUrl("", {});
}

main() {
  describe("RegexRoutePath", () {
    it("should throw when given an invalid regex", () {
      expect(() => new RegexRoutePath("[abc", emptySerializer)).toThrowError();
    });
    it("should parse a single param using capture groups", () {
      var rec = new RegexRoutePath("^(.+)\$", emptySerializer);
      var url = parser.parse("hello");
      var match = rec.matchUrl(url);
      expect(match.allParams).toEqual({"0": "hello", "1": "hello"});
    });
    it("should parse multiple params using capture groups", () {
      var rec = new RegexRoutePath("^(.+)\\.(.+)\$", emptySerializer);
      var url = parser.parse("hello.goodbye");
      var match = rec.matchUrl(url);
      expect(match.allParams)
          .toEqual({"0": "hello.goodbye", "1": "hello", "2": "goodbye"});
    });
    it("should generate a url by calling the provided serializer", () {
      serializer(params) {
        return new GeneratedUrl(
            '''/a/${ params [ "a" ]}/b/${ params [ "b" ]}''', {});
      }
      var rec = new RegexRoutePath("/a/(.+)/b/(.+)\$", serializer);
      var params = {"a": "one", "b": "two"};
      var url = rec.generateUrl(params);
      expect(url.urlPath).toEqual("/a/one/b/two");
    });
  });
}
