library angular2.src.alt_router.directives.router_outlet;

import "package:angular2/core.dart"
    show
        ResolvedReflectiveProvider,
        Directive,
        DynamicComponentLoader,
        ViewContainerRef,
        Input,
        ComponentRef,
        ComponentFactory,
        ReflectiveInjector;
import "../router.dart" show RouterOutletMap;
import "package:angular2/src/facade/lang.dart" show isPresent;

@Directive(selector: "router-outlet")
class RouterOutlet {
  ViewContainerRef _location;
  ComponentRef _loaded;
  RouterOutletMap outletMap;
  @Input()
  String name = "";
  RouterOutlet(RouterOutletMap parentOutletMap, this._location) {
    parentOutletMap.registerOutlet("", this);
  }
  ComponentRef load(ComponentFactory factory,
      List<ResolvedReflectiveProvider> providers, RouterOutletMap outletMap) {
    if (isPresent(this._loaded)) {
      this._loaded.destroy();
    }
    this.outletMap = outletMap;
    var inj = ReflectiveInjector.fromResolvedProviders(
        providers, this._location.parentInjector);
    this._loaded =
        this._location.createComponent(factory, this._location.length, inj, []);
    return this._loaded;
  }
}
