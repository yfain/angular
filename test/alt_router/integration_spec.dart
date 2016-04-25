library angular2.test.alt_router.integration_spec;

import "dart:async";
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
import "package:angular2/core.dart" show provide, Component, ComponentResolver;
import "package:angular2/alt_router.dart"
    show
        Router,
        RouterOutletMap,
        RouteSegment,
        Route,
        ROUTER_DIRECTIVES,
        Routes,
        RouterUrlParser,
        DefaultRouterUrlParser,
        OnActivate;

main() {
  describe("navigation", () {
    beforeEachProviders(() => [
          provide(RouterUrlParser, useClass: DefaultRouterUrlParser),
          RouterOutletMap,
          provide(Router,
              useFactory: (resolver, urlParser, outletMap) =>
                  new Router(RootCmp, resolver, urlParser, outletMap),
              deps: [ComponentResolver, RouterUrlParser, RouterOutletMap])
        ]);
    it(
        "should support nested routes",
        inject([AsyncTestCompleter, Router, TestComponentBuilder],
            (async, router, tcb) {
          var fixture;
          compileRoot(tcb)
              .then((rtc) {
                fixture = rtc;
              })
              .then((_) => router.navigateByUrl("/team/22/user/victor"))
              .then((_) {
                fixture.detectChanges();
                expect(fixture.debugElement.nativeElement)
                    .toHaveText("team 22 { hello victor }");
                async.done();
              });
        }));
    it(
        "should update nested routes when url changes",
        inject([AsyncTestCompleter, Router, TestComponentBuilder],
            (async, router, tcb) {
          var fixture;
          var team1;
          var team2;
          compileRoot(tcb)
              .then((rtc) {
                fixture = rtc;
              })
              .then((_) => router.navigateByUrl("/team/22/user/victor"))
              .then((_) {
                team1 = fixture.debugElement.children[1].componentInstance;
              })
              .then((_) => router.navigateByUrl("/team/22/user/fedor"))
              .then((_) {
                team2 = fixture.debugElement.children[1].componentInstance;
              })
              .then((_) {
                fixture.detectChanges();
                expect(team1).toBe(team2);
                expect(fixture.debugElement.nativeElement)
                    .toHaveText("team 22 { hello fedor }");
                async.done();
              });
        }));
  });
}

Future<ComponentFixture> compileRoot(TestComponentBuilder tcb) {
  return tcb.createAsync(RootCmp);
}

@Component(selector: "user-cmp", template: '''hello {{user}}''')
class UserCmp implements OnActivate {
  String user;
  routerOnActivate(RouteSegment s, [a, b, c]) {
    this.user = s.getParam("name");
  }
}

@Component(
    selector: "team-cmp",
    template: '''team {{id}} { <router-outlet></router-outlet> }''',
    directives: const [ROUTER_DIRECTIVES])
@Routes(const [const Route(path: "user/:name", component: UserCmp)])
class TeamCmp implements OnActivate {
  String id;
  routerOnActivate(RouteSegment s, [a, b, c]) {
    this.id = s.getParam("id");
  }
}

@Component(
    selector: "root-cmp",
    template: '''<router-outlet></router-outlet>''',
    directives: const [ROUTER_DIRECTIVES])
@Routes(const [const Route(path: "team/:id", component: TeamCmp)])
class RootCmp {}
