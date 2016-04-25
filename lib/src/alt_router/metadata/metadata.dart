library angular2.src.alt_router.metadata.metadata;

import "package:angular2/src/facade/lang.dart" show Type, stringify;

abstract class RouteMetadata {
  String get path;
  Type get component;
}

class Route implements RouteMetadata {
  final String path;
  final Type component;
  const Route({path, component})
      : path = path,
        component = component;
  String toString() {
    return '''@Route(${ this . path}, ${ stringify ( this . component )})''';
  }
}

class RoutesMetadata {
  final List<RouteMetadata> routes;
  const RoutesMetadata(this.routes);
  String toString() {
    return '''@Routes(${ this . routes})''';
  }
}
