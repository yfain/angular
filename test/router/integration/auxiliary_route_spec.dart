library angular2.test.router.integration.auxiliary_route_spec;

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
import "impl/aux_route_spec_impl.dart" show registerSpecs;

main() {
  describe("auxiliary route spec", () {
    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);
    registerSpecs();
    describeRouter("aux routes", () {
      itShouldRoute();
      describeWith("a primary route", itShouldRoute);
    });
  });
}
