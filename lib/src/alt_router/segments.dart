library angular2.src.alt_router.segments;

import "package:angular2/core.dart" show ComponentFactory;
import "package:angular2/src/facade/collection.dart"
    show StringMapWrapper, ListWrapper;
import "package:angular2/src/facade/lang.dart" show Type, isBlank;

class Tree<T> {
  List<T> _nodes;
  Tree(this._nodes) {}
  T get root {
    return this._nodes[0];
  }

  T parent(T t) {
    var index = this._nodes.indexOf(t);
    return index > 0 ? this._nodes[index - 1] : null;
  }

  List<T> children(T t) {
    var index = this._nodes.indexOf(t);
    return index > -1 && index < this._nodes.length - 1
        ? [this._nodes[index + 1]]
        : [];
  }

  T firstChild(T t) {
    var index = this._nodes.indexOf(t);
    return index > -1 && index < this._nodes.length - 1
        ? this._nodes[index + 1]
        : null;
  }

  List<T> pathToRoot(T t) {
    var index = this._nodes.indexOf(t);
    return index > -1 ? ListWrapper.slice(this._nodes, 0, index + 1) : null;
  }
}

class UrlSegment {
  String segment;
  Map<String, String> parameters;
  String outlet;
  UrlSegment(this.segment, this.parameters, this.outlet) {}
}

class RouteSegment {
  List<UrlSegment> urlSegments;
  String outlet;
  /** @internal */
  Type _type;
  /** @internal */
  ComponentFactory _componentFactory;
  /** @internal */
  Map<String, String> _parameters;
  RouteSegment(this.urlSegments, Map<String, String> parameters, this.outlet,
      Type type, ComponentFactory componentFactory) {
    this._type = type;
    this._componentFactory = componentFactory;
    this._parameters = parameters;
  }
  String getParam(String param) {
    return this._parameters[param];
  }

  Type get type {
    return this._type;
  }
}

bool equalSegments(RouteSegment a, RouteSegment b) {
  if (isBlank(a) && !isBlank(b)) return false;
  if (!isBlank(a) && isBlank(b)) return false;
  return identical(a._type, b._type) &&
      StringMapWrapper.equals(a._parameters, b._parameters);
}

ComponentFactory routeSegmentComponentFactory(RouteSegment a) {
  return a._componentFactory;
}
