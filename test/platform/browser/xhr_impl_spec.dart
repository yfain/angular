library angular2.test.platform.browser.xhr_impl_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xit;
import "package:angular2/src/platform/browser/xhr_impl.dart" show XHRImpl;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;
import "package:angular2/src/facade/lang.dart" show IS_DART;

main() {
  describe("XHRImpl", () {
    XHRImpl xhr;
    // TODO(juliemr): This file currently won't work with dart unit tests run using

    // exclusive it or describe (iit or ddescribe). This is because when

    // pub run test is executed against this specific file the relative paths

    // will be relative to here, so url200 should look like

    // static_assets/200.html.

    // We currently have no way of detecting this.
    var urlBase = IS_DART ? "" : "/base/modules/angular2/";
    var url200 = urlBase + "test/platform/browser/static_assets/200.html";
    var url404 = "/bad/path/404.html";
    beforeEach(() {
      xhr = new XHRImpl();
    });
    it(
        "should resolve the Promise with the file content on success",
        inject([AsyncTestCompleter], (async) {
          xhr.get(url200).then((text) {
            expect(text.trim()).toEqual("<p>hey</p>");
            async.done();
          });
        }),
        10000);
    it(
        "should reject the Promise on failure",
        inject([AsyncTestCompleter], (async) {
          PromiseWrapper.catchError(xhr.get(url404), (e) {
            expect(e).toEqual('''Failed to load ${ url404}''');
            async.done();
            return null;
          });
        }),
        10000);
  });
}
