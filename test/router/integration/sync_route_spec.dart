library angular2.test.router.integration.sync_route_spec;

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
    show beforeEachProviders, describe, ddescribe;
import "impl/sync_route_spec_impl.dart" show registerSpecs;

main() {
  describe("sync route spec", () {
    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);
    registerSpecs();
    describeRouter("sync routes", () {
      describeWithout("children", () {
        describeWithAndWithout("params", itShouldRoute);
      });
      describeWith("sync children", () {
        describeWithout("default routes", () {
          describeWithAndWithout("params", itShouldRoute);
        });
        describeWith("default routes", () {
          describeWithout("params", itShouldRoute);
        });
      });
      describeWith("dynamic components", itShouldRoute);
    });
  });
}
