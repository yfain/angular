library angular2.src.alt_router.recognize;

import "dart:async";
import "segments.dart" show RouteSegment, UrlSegment, Tree;
import "metadata/metadata.dart" show RoutesMetadata, RouteMetadata;
import "package:angular2/src/facade/lang.dart" show Type, isPresent, stringify;
import "package:angular2/src/facade/promise.dart" show PromiseWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/core.dart" show ComponentResolver;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;

Future<Tree<RouteSegment>> recognize(
    ComponentResolver componentResolver, Type type, Tree<UrlSegment> url) {
  return _recognize(componentResolver, type, url, url.root)
      .then((nodes) => new Tree<RouteSegment>(nodes));
}

Future<List<RouteSegment>> _recognize(ComponentResolver componentResolver,
    Type type, Tree<UrlSegment> url, UrlSegment current) {
  var metadata = _readMetadata(type);
  var matched;
  try {
    matched = _match(metadata, url, current);
  } catch (e, e_stack) {
    return PromiseWrapper.reject(e, null);
  }
  return componentResolver
      .resolveComponent(matched.route.component)
      .then((factory) {
    var segment = new RouteSegment(matched.consumedUrlSegments,
        matched.parameters, "", matched.route.component, factory);
    if (isPresent(matched.leftOver)) {
      return _recognize(
              componentResolver, matched.route.component, url, matched.leftOver)
          .then((children) => (new List.from([segment])..addAll(children)));
    } else {
      return [segment];
    }
  });
}

_MatchingResult _match(
    RoutesMetadata metadata, Tree<UrlSegment> url, UrlSegment current) {
  for (var r in metadata.routes) {
    var matchingResult = _matchWithParts(r, url, current);
    if (isPresent(matchingResult)) {
      return matchingResult;
    }
  }
  throw new BaseException("Cannot match any routes");
}

_MatchingResult _matchWithParts(
    RouteMetadata route, Tree<UrlSegment> url, UrlSegment current) {
  var parts = route.path.split("/");
  var parameters = {};
  var consumedUrlSegments = [];
  var u = current;
  for (var i = 0; i < parts.length; ++i) {
    consumedUrlSegments.add(u);
    var p = parts[i];
    if (p.startsWith(":")) {
      var segment = u.segment;
      parameters[p.substring(1)] = segment;
    } else if (p != u.segment) {
      return null;
    }
    u = url.firstChild(u);
  }
  return new _MatchingResult(route, consumedUrlSegments, parameters, u);
}

class _MatchingResult {
  RouteMetadata route;
  List<UrlSegment> consumedUrlSegments;
  Map<String, String> parameters;
  UrlSegment leftOver;
  _MatchingResult(
      this.route, this.consumedUrlSegments, this.parameters, this.leftOver) {}
}

_readMetadata(Type componentType) {
  var metadata = reflector
      .annotations(componentType)
      .where((f) => f is RoutesMetadata)
      .toList();
  if (identical(metadata.length, 0)) {
    throw new BaseException(
        '''Component \'${ stringify ( componentType )}\' does not have route configuration''');
  }
  return metadata[0];
}
