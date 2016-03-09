library angular2.test.router.integration.async_route_spec;

import "util.dart"
    show
        describeRouter,
        ddescribeRouter,
        describeWith,
        describeWithout,
        describeWithAndWithout,
        itShouldRoute,
        TEST_ROUTER_PROVIDERS;
import "package:angular2/testing_internal.dart"
    show beforeEachProviders, describe;
import "impl/async_route_spec_impl.dart" show registerSpecs;

main() {
  describe("async route spec", () {
    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);
    registerSpecs();
    describeRouter("async routes", () {
      describeWithout("children", () {
        describeWith("route data", itShouldRoute);
        describeWithAndWithout("params", itShouldRoute);
      });
      describeWith("sync children", () {
        describeWithAndWithout("default routes", itShouldRoute);
      });
      describeWith("async children", () {
        describeWithAndWithout("params", () {
          describeWithout("default routes", itShouldRoute);
        });
      });
    });
  });
}
