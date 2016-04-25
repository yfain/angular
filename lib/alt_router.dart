/**
 * 
 * 
 * Alternative implementation of the router. Experimental.
 */
library angular2.alt_router;

export "src/alt_router/router.dart" show Router, RouterOutletMap;
export "src/alt_router/segments.dart" show RouteSegment;
export "src/alt_router/metadata/decorators.dart" show Routes;
export "src/alt_router/metadata/metadata.dart" show Route;
export "src/alt_router/router_url_parser.dart"
    show RouterUrlParser, DefaultRouterUrlParser;
export "src/alt_router/interfaces.dart" show OnActivate;
import "src/alt_router/directives/router_outlet.dart" show RouterOutlet;

const List<dynamic> ROUTER_DIRECTIVES = const [RouterOutlet];
