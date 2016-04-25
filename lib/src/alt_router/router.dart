library angular2.src.alt_router.router;

import "dart:async";
import "package:angular2/core.dart"
    show provide, ReflectiveInjector, ComponentResolver;
import "directives/router_outlet.dart" show RouterOutlet;
import "package:angular2/src/facade/lang.dart" show Type, isBlank, isPresent;
import "router_url_parser.dart" show RouterUrlParser;
import "recognize.dart" show recognize;
import "segments.dart"
    show equalSegments, routeSegmentComponentFactory, RouteSegment, Tree;
import "lifecycle_reflector.dart" show hasLifecycleHook;

class RouterOutletMap {
  /** @internal */
  Map<String, RouterOutlet> _outlets = {};
  void registerOutlet(String name, RouterOutlet outlet) {
    this._outlets[name] = outlet;
  }
}

class Router {
  Type _componentType;
  ComponentResolver _componentResolver;
  RouterUrlParser _urlParser;
  RouterOutletMap _routerOutletMap;
  Tree<RouteSegment> prevTree;
  Router(this._componentType, this._componentResolver, this._urlParser,
      this._routerOutletMap) {}
  Future navigateByUrl(String url) {
    var urlSegmentTree = this._urlParser.parse(url.substring(1));
    return recognize(
            this._componentResolver, this._componentType, urlSegmentTree)
        .then((currTree) {
      var prevRoot = isPresent(this.prevTree) ? this.prevTree.root : null;
      _loadSegments(currTree, currTree.root, this.prevTree, prevRoot, this,
          this._routerOutletMap);
      this.prevTree = currTree;
    });
  }
}

void _loadSegments(
    Tree<RouteSegment> currTree,
    RouteSegment curr,
    Tree<RouteSegment> prevTree,
    RouteSegment prev,
    Router router,
    RouterOutletMap parentOutletMap) {
  var outlet = parentOutletMap._outlets[curr.outlet];
  var outletMap;
  if (equalSegments(curr, prev)) {
    outletMap = outlet.outletMap;
  } else {
    outletMap = new RouterOutletMap();
    var resolved = ReflectiveInjector.resolve([
      provide(RouterOutletMap, useValue: outletMap),
      provide(RouteSegment, useValue: curr)
    ]);
    var ref =
        outlet.load(routeSegmentComponentFactory(curr), resolved, outletMap);
    if (hasLifecycleHook("routerOnActivate", ref.instance)) {
      ref.instance.routerOnActivate(curr, prev, currTree, prevTree);
    }
  }
  if (isPresent(currTree.firstChild(curr))) {
    var cc = currTree.firstChild(curr);
    var pc = isBlank(prevTree) ? null : prevTree.firstChild(prev);
    _loadSegments(currTree, cc, prevTree, pc, router, outletMap);
  }
}
