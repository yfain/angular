library angular2.src.alt_router.interfaces;

import "segments.dart" show RouteSegment, Tree;

abstract class OnActivate {
  void routerOnActivate(RouteSegment curr,
      [RouteSegment prev,
      Tree<RouteSegment> currTree,
      Tree<RouteSegment> prevTree]);
}
