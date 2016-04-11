'use strict';var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var browser_1 = require('angular2/platform/browser');
var metadata_1 = require('./metadata');
var util_1 = require('./util');
var constants_1 = require('./constants');
var downgrade_ng2_adapter_1 = require('./downgrade_ng2_adapter');
var upgrade_ng1_adapter_1 = require('./upgrade_ng1_adapter');
var angular = require('./angular_js');
var upgradeCount = 0;
/**
 * Use `UpgradeAdapter` to allow AngularJS v1 and Angular v2 to coexist in a single application.
 *
 * The `UpgradeAdapter` allows:
 * 1. creation of Angular v2 component from AngularJS v1 component directive
 *    (See [UpgradeAdapter#upgradeNg1Component()])
 * 2. creation of AngularJS v1 directive from Angular v2 component.
 *    (See [UpgradeAdapter#downgradeNg2Component()])
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * ## Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. AngularJS v1 directives always execute inside AngularJS v1 framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular v2 components always execute inside Angular v2 framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS v1 component can be upgraded to an Angular v2 component. This creates an
 *    Angular v2 directive, which bootstraps the AngularJS v1 component directive in that location.
 * 6. An Angular v2 component can be downgraded to an AngularJS v1 component directive. This creates
 *    an AngularJS v1 directive, which bootstraps the Angular v2 component in that location.
 * 7. Whenever an adapter component is instantiated the host element is owned by the framework
 *    doing the instantiation. The other framework then instantiates and owns the view for that
 *    component. This implies that component bindings will always follow the semantics of the
 *    instantiation framework. The syntax is always that of Angular v2 syntax.
 * 8. AngularJS v1 is always bootstrapped first and owns the bottom most view.
 * 9. The new application is running in Angular v2 zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### Example
 *
 * ```
 * var adapter = new UpgradeAdapter();
 * var module = angular.module('myExample', []);
 * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
 *
 * module.directive('ng1', function() {
 *   return {
 *      scope: { title: '=' },
 *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
 *   };
 * });
 *
 *
 * @Component({
 *   selector: 'ng2',
 *   inputs: ['name'],
 *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)',
 *   directives: [adapter.upgradeNg1Component('ng1')]
 * })
 * class Ng2 {
 * }
 *
 * document.body.innerHTML = '<ng2 name="World">project</ng2>';
 *
 * adapter.bootstrap(document.body, ['myExample']).ready(function() {
 *   expect(document.body.textContent).toEqual(
 *       "ng2[ng1[Hello World!](transclude)](project)");
 * });
 * ```
 */
var UpgradeAdapter = (function () {
    function UpgradeAdapter() {
        /* @internal */
        this.idPrefix = "NG2_UPGRADE_" + upgradeCount++ + "_";
        /* @internal */
        this.upgradedComponents = [];
        /* @internal */
        this.downgradedComponents = {};
        /* @internal */
        this.providers = [];
    }
    /**
     * Allows Angular v2 Component to be used from AngularJS v1.
     *
     * Use `downgradeNg2Component` to create an AngularJS v1 Directive Definition Factory from
     * Angular v2 Component. The adapter will bootstrap Angular v2 component from within the
     * AngularJS v1 template.
     *
     * ## Mental Model
     *
     * 1. The component is instantiated by being listed in AngularJS v1 template. This means that the
     *    host element is controlled by AngularJS v1, but the component's view will be controlled by
     *    Angular v2.
     * 2. Even thought the component is instantiated in AngularJS v1, it will be using Angular v2
     *    syntax. This has to be done, this way because we must follow Angular v2 components do not
     *    declare how the attributes should be interpreted.
     *
     * ## Supported Features
     *
     * - Bindings:
     *   - Attribute: `<comp name="World">`
     *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
     *   - Expression:  `<comp [name]="username">`
     *   - Event:  `<comp (close)="doSomething()">`
     * - Content projection: yes
     *
     * ### Example
     *
     * ```
     * var adapter = new UpgradeAdapter();
     * var module = angular.module('myExample', []);
     * module.directive('greet', adapter.downgradeNg2Component(Greeter));
     *
     * @Component({
     *   selector: 'greet',
     *   template: '{{salutation}} {{name}}! - <ng-content></ng-content>'
     * })
     * class Greeter {
     *   @Input() salutation: string;
     *   @Input() name: string;
     * }
     *
     * document.body.innerHTML =
     *   'ng1 template: <greet salutation="Hello" [name]="world">text</greet>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng1 template: Hello world! - text");
     * });
     * ```
     */
    UpgradeAdapter.prototype.downgradeNg2Component = function (type) {
        this.upgradedComponents.push(type);
        var info = metadata_1.getComponentInfo(type);
        return ng1ComponentDirective(info, "" + this.idPrefix + info.selector + "_c");
    };
    /**
     * Allows AngularJS v1 Component to be used from Angular v2.
     *
     * Use `upgradeNg1Component` to create an Angular v2 component from AngularJS v1 Component
     * directive. The adapter will bootstrap AngularJS v1 component from within the Angular v2
     * template.
     *
     * ## Mental Model
     *
     * 1. The component is instantiated by being listed in Angular v2 template. This means that the
     *    host element is controlled by Angular v2, but the component's view will be controlled by
     *    AngularJS v1.
     *
     * ## Supported Features
     *
     * - Bindings:
     *   - Attribute: `<comp name="World">`
     *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
     *   - Expression:  `<comp [name]="username">`
     *   - Event:  `<comp (close)="doSomething()">`
     * - Transclusion: yes
     * - Only some of the features of
     *   [Directive Definition Object](https://docs.angularjs.org/api/ng/service/$compile) are
     *   supported:
     *   - `compile`: not supported because the host element is owned by Angular v2, which does
     *     not allow modifying DOM structure during compilation.
     *   - `controller`: supported. (NOTE: injection of `$attrs` and `$transclude` is not supported.)
     *   - `controllerAs': supported.
     *   - `bindToController': supported.
     *   - `link': supported. (NOTE: only pre-link function is supported.)
     *   - `name': supported.
     *   - `priority': ignored.
     *   - `replace': not supported.
     *   - `require`: supported.
     *   - `restrict`: must be set to 'E'.
     *   - `scope`: supported.
     *   - `template`: supported.
     *   - `templateUrl`: supported.
     *   - `terminal`: ignored.
     *   - `transclude`: supported.
     *
     *
     * ### Example
     *
     * ```
     * var adapter = new UpgradeAdapter();
     * var module = angular.module('myExample', []);
     *
     * module.directive('greet', function() {
     *   return {
     *     scope: {salutation: '=', name: '=' },
     *     template: '{{salutation}} {{name}}! - <span ng-transclude></span>'
     *   };
     * });
     *
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
     *
     * @Component({
     *   selector: 'ng2',
     *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
     *   directives: [adapter.upgradeNg1Component('greet')]
     * })
     * class Ng2 {
     * }
     *
     * document.body.innerHTML = '<ng2></ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng2 template: Hello world! - text");
     * });
     * ```
     */
    UpgradeAdapter.prototype.upgradeNg1Component = function (name) {
        if (this.downgradedComponents.hasOwnProperty(name)) {
            return this.downgradedComponents[name].type;
        }
        else {
            return (this.downgradedComponents[name] = new upgrade_ng1_adapter_1.UpgradeNg1ComponentAdapterBuilder(name)).type;
        }
    };
    /**
     * Bootstrap a hybrid AngularJS v1 / Angular v2 application.
     *
     * This `bootstrap` method is a direct replacement (takes same arguments) for AngularJS v1
     * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
     * AngularJS v1, this bootstrap is asynchronous.
     *
     * ### Example
     *
     * ```
     * var adapter = new UpgradeAdapter();
     * var module = angular.module('myExample', []);
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
     *
     * module.directive('ng1', function() {
     *   return {
     *      scope: { title: '=' },
     *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
     *   };
     * });
     *
     *
     * @Component({
     *   selector: 'ng2',
     *   inputs: ['name'],
     *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)',
     *   directives: [adapter.upgradeNg1Component('ng1')]
     * })
     * class Ng2 {
     * }
     *
     * document.body.innerHTML = '<ng2 name="World">project</ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual(
     *       "ng2[ng1[Hello World!](transclude)](project)");
     * });
     * ```
     */
    UpgradeAdapter.prototype.bootstrap = function (element, modules, config) {
        var _this = this;
        var upgrade = new UpgradeAdapterRef();
        var ng1Injector = null;
        var platformRef = core_1.platform(browser_1.BROWSER_PROVIDERS);
        var applicationRef = platformRef.application([
            browser_1.BROWSER_APP_PROVIDERS, core_1.provide(constants_1.NG1_INJECTOR, { useFactory: function () { return ng1Injector; } }),
            core_1.provide(constants_1.NG1_COMPILE, { useFactory: function () { return ng1Injector.get(constants_1.NG1_COMPILE); } }), this.providers
        ]);
        var injector = applicationRef.injector;
        var ngZone = injector.get(core_1.NgZone);
        var compiler = injector.get(core_1.Compiler);
        var delayApplyExps = [];
        var original$applyFn;
        var rootScopePrototype;
        var rootScope;
        var hostViewFactoryRefMap = {};
        var ng1Module = angular.module(this.idPrefix, modules);
        var ng1BootstrapPromise = null;
        var ng1compilePromise = null;
        ng1Module.value(constants_1.NG2_INJECTOR, injector)
            .value(constants_1.NG2_ZONE, ngZone)
            .value(constants_1.NG2_COMPILER, compiler)
            .value(constants_1.NG2_HOST_VIEW_FACTORY_REF_MAP, hostViewFactoryRefMap)
            .value(constants_1.NG2_APP_VIEW_MANAGER, injector.get(core_1.AppViewManager))
            .config([
            '$provide',
            function (provide) {
                provide.decorator(constants_1.NG1_ROOT_SCOPE, [
                    '$delegate',
                    function (rootScopeDelegate) {
                        rootScopePrototype = rootScopeDelegate.constructor.prototype;
                        if (rootScopePrototype.hasOwnProperty('$apply')) {
                            original$applyFn = rootScopePrototype.$apply;
                            rootScopePrototype.$apply = function (exp) { return delayApplyExps.push(exp); };
                        }
                        else {
                            throw new Error('Failed to find \'$apply\' on \'$rootScope\'!');
                        }
                        return rootScope = rootScopeDelegate;
                    }
                ]);
                provide.decorator(constants_1.NG1_TESTABILITY, [
                    '$delegate',
                    function (testabilityDelegate) {
                        var _this = this;
                        var ng2Testability = injector.get(core_1.Testability);
                        var origonalWhenStable = testabilityDelegate.whenStable;
                        var newWhenStable = function (callback) {
                            var whenStableContext = _this;
                            origonalWhenStable.call(_this, function () {
                                if (ng2Testability.isStable()) {
                                    callback.apply(this, arguments);
                                }
                                else {
                                    ng2Testability.whenStable(newWhenStable.bind(whenStableContext, callback));
                                }
                            });
                        };
                        testabilityDelegate.whenStable = newWhenStable;
                        return testabilityDelegate;
                    }
                ]);
            }
        ]);
        ng1compilePromise = new Promise(function (resolve, reject) {
            ng1Module.run([
                '$injector', '$rootScope',
                function (injector, rootScope) {
                    ng1Injector = injector;
                    async_1.ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, function (_) { return ngZone.runOutsideAngular(function () { return rootScope.$apply(); }); });
                    upgrade_ng1_adapter_1.UpgradeNg1ComponentAdapterBuilder.resolve(_this.downgradedComponents, injector)
                        .then(resolve, reject);
                }
            ]);
        });
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        var windowAngular = lang_1.global.angular;
        windowAngular.resumeBootstrap = undefined;
        angular.element(element).data(util_1.controllerKey(constants_1.NG2_INJECTOR), injector);
        ngZone.run(function () { angular.bootstrap(element, [_this.idPrefix], config); });
        ng1BootstrapPromise = new Promise(function (resolve, reject) {
            if (windowAngular.resumeBootstrap) {
                var originalResumeBootstrap = windowAngular.resumeBootstrap;
                windowAngular.resumeBootstrap = function () {
                    windowAngular.resumeBootstrap = originalResumeBootstrap;
                    windowAngular.resumeBootstrap.apply(this, arguments);
                    resolve();
                };
            }
            else {
                resolve();
            }
        });
        Promise
            .all([
            this.compileNg2Components(compiler, hostViewFactoryRefMap), ng1BootstrapPromise,
            ng1compilePromise
        ])
            .then(function () {
            ngZone.run(function () {
                if (rootScopePrototype) {
                    rootScopePrototype.$apply = original$applyFn; // restore original $apply
                    while (delayApplyExps.length) {
                        rootScope.$apply(delayApplyExps.shift());
                    }
                    upgrade._bootstrapDone(applicationRef, ng1Injector);
                    rootScopePrototype = null;
                }
            });
        }, util_1.onError);
        return upgrade;
    };
    /**
     * Adds a provider to the top level environment of a hybrid AngularJS v1 / Angular v2 application.
     *
     * In hybrid AngularJS v1 / Angular v2 application, there is no one root Angular v2 component,
     * for this reason we provide an application global way of registering providers which is
     * consistent with single global injection in AngularJS v1.
     *
     * ### Example
     *
     * ```
     * class Greeter {
     *   greet(name) {
     *     alert('Hello ' + name + '!');
     *   }
     * }
     *
     * @Component({
     *   selector: 'app',
     *   template: ''
     * })
     * class App {
     *   constructor(greeter: Greeter) {
     *     this.greeter('World');
     *   }
     * }
     *
     * var adapter = new UpgradeAdapter();
     * adapter.addProvider(Greeter);
     *
     * var module = angular.module('myExample', []);
     * module.directive('app', adapter.downgradeNg2Component(App));
     *
     * document.body.innerHTML = '<app></app>'
     * adapter.bootstrap(document.body, ['myExample']);
     *```
     */
    UpgradeAdapter.prototype.addProvider = function (provider) { this.providers.push(provider); };
    /**
     * Allows AngularJS v1 service to be accessible from Angular v2.
     *
     *
     * ### Example
     *
     * ```
     * class Login { ... }
     * class Server { ... }
     *
     * @Injectable()
     * class Example {
     *   constructor(@Inject('server') server, login: Login) {
     *     ...
     *   }
     * }
     *
     * var module = angular.module('myExample', []);
     * module.service('server', Server);
     * module.service('login', Login);
     *
     * var adapter = new UpgradeAdapter();
     * adapter.upgradeNg1Provider('server');
     * adapter.upgradeNg1Provider('login', {asToken: Login});
     * adapter.addProvider(Example);
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   var example: Example = ref.ng2Injector.get(Example);
     * });
     *
     * ```
     */
    UpgradeAdapter.prototype.upgradeNg1Provider = function (name, options) {
        var token = options && options.asToken || name;
        this.providers.push(core_1.provide(token, {
            useFactory: function (ng1Injector) { return ng1Injector.get(name); },
            deps: [constants_1.NG1_INJECTOR]
        }));
    };
    /**
     * Allows Angular v2 service to be accessible from AngularJS v1.
     *
     *
     * ### Example
     *
     * ```
     * class Example {
     * }
     *
     * var adapter = new UpgradeAdapter();
     * adapter.addProvider(Example);
     *
     * var module = angular.module('myExample', []);
     * module.factory('example', adapter.downgradeNg2Provider(Example));
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   var example: Example = ref.ng1Injector.get('example');
     * });
     *
     * ```
     */
    UpgradeAdapter.prototype.downgradeNg2Provider = function (token) {
        var factory = function (injector) { return injector.get(token); };
        factory.$inject = [constants_1.NG2_INJECTOR];
        return factory;
    };
    /* @internal */
    UpgradeAdapter.prototype.compileNg2Components = function (compiler, hostViewFactoryRefMap) {
        var _this = this;
        var promises = [];
        var types = this.upgradedComponents;
        for (var i = 0; i < types.length; i++) {
            promises.push(compiler.compileInHost(types[i]));
        }
        return Promise.all(promises).then(function (hostViewFactories) {
            var types = _this.upgradedComponents;
            for (var i = 0; i < hostViewFactories.length; i++) {
                hostViewFactoryRefMap[metadata_1.getComponentInfo(types[i]).selector] = hostViewFactories[i];
            }
            return hostViewFactoryRefMap;
        }, util_1.onError);
    };
    return UpgradeAdapter;
})();
exports.UpgradeAdapter = UpgradeAdapter;
function ng1ComponentDirective(info, idPrefix) {
    directiveFactory.$inject =
        [constants_1.NG2_HOST_VIEW_FACTORY_REF_MAP, constants_1.NG2_APP_VIEW_MANAGER, constants_1.NG1_PARSE];
    function directiveFactory(hostViewFactoryRefMap, viewManager, parse) {
        var hostViewFactory = hostViewFactoryRefMap[info.selector];
        if (!hostViewFactory)
            throw new Error('Expecting HostViewFactoryRef for: ' + info.selector);
        var idCount = 0;
        return {
            restrict: 'E',
            require: constants_1.REQUIRE_INJECTOR,
            link: {
                post: function (scope, element, attrs, parentInjector, transclude) {
                    var domElement = element[0];
                    var facade = new downgrade_ng2_adapter_1.DowngradeNg2ComponentAdapter(idPrefix + (idCount++), info, element, attrs, scope, parentInjector, parse, viewManager, hostViewFactory);
                    facade.setupInputs();
                    facade.bootstrapNg2();
                    facade.projectContent();
                    facade.setupOutputs();
                    facade.registerCleanup();
                }
            }
        };
    }
    return directiveFactory;
}
/**
 * Use `UgradeAdapterRef` to control a hybrid AngularJS v1 / Angular v2 application.
 */
var UpgradeAdapterRef = (function () {
    function UpgradeAdapterRef() {
        /* @internal */
        this._readyFn = null;
        this.ng1RootScope = null;
        this.ng1Injector = null;
        this.ng2ApplicationRef = null;
        this.ng2Injector = null;
    }
    /* @internal */
    UpgradeAdapterRef.prototype._bootstrapDone = function (applicationRef, ng1Injector) {
        this.ng2ApplicationRef = applicationRef;
        this.ng2Injector = applicationRef.injector;
        this.ng1Injector = ng1Injector;
        this.ng1RootScope = ng1Injector.get(constants_1.NG1_ROOT_SCOPE);
        this._readyFn && this._readyFn(this);
    };
    /**
     * Register a callback function which is notified upon successful hybrid AngularJS v1 / Angular v2
     * application has been bootstrapped.
     *
     * The `ready` callback function is invoked inside the Angular v2 zone, therefore it does not
     * require a call to `$apply()`.
     */
    UpgradeAdapterRef.prototype.ready = function (fn) { this._readyFn = fn; };
    /**
     * Dispose of running hybrid AngularJS v1 / Angular v2 application.
     */
    UpgradeAdapterRef.prototype.dispose = function () {
        this.ng1Injector.get(constants_1.NG1_ROOT_SCOPE).$destroy();
        this.ng2ApplicationRef.dispose();
    };
    return UpgradeAdapterRef;
})();
exports.UpgradeAdapterRef = UpgradeAdapterRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC0xNGY2cGxOeC50bXAvYW5ndWxhcjIvc3JjL3VwZ3JhZGUvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIlVwZ3JhZGVBZGFwdGVyIiwiVXBncmFkZUFkYXB0ZXIuY29uc3RydWN0b3IiLCJVcGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQiLCJVcGdyYWRlQWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50IiwiVXBncmFkZUFkYXB0ZXIuYm9vdHN0cmFwIiwiVXBncmFkZUFkYXB0ZXIuYWRkUHJvdmlkZXIiLCJVcGdyYWRlQWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIiLCJVcGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJQcm92aWRlciIsIlVwZ3JhZGVBZGFwdGVyLmNvbXBpbGVOZzJDb21wb25lbnRzIiwibmcxQ29tcG9uZW50RGlyZWN0aXZlIiwibmcxQ29tcG9uZW50RGlyZWN0aXZlLmRpcmVjdGl2ZUZhY3RvcnkiLCJVcGdyYWRlQWRhcHRlclJlZiIsIlVwZ3JhZGVBZGFwdGVyUmVmLmNvbnN0cnVjdG9yIiwiVXBncmFkZUFkYXB0ZXJSZWYuX2Jvb3RzdHJhcERvbmUiLCJVcGdyYWRlQWRhcHRlclJlZi5yZWFkeSIsIlVwZ3JhZGVBZGFwdGVyUmVmLmRpc3Bvc2UiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUF3TCxlQUFlLENBQUMsQ0FBQTtBQUN4TSxxQkFBcUIsMEJBQTBCLENBQUMsQ0FBQTtBQUNoRCxzQkFBZ0MsMkJBQTJCLENBQUMsQ0FBQTtBQUM1RCx3QkFBdUQsMkJBQTJCLENBQUMsQ0FBQTtBQUVuRix5QkFBOEMsWUFBWSxDQUFDLENBQUE7QUFDM0QscUJBQXFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLDBCQUE0TSxhQUFhLENBQUMsQ0FBQTtBQUMxTixzQ0FBMkMseUJBQXlCLENB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LENBQUNBLFdBQVdBLEdBQUdBLGNBQWNBLENBQUNBLFFBQVFBLENBQUNBO1FBQzNDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxXQUFXQSxDQUFDQTtRQUMvQkEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsMEJBQWNBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxDQUFDQSxRQUFRQSxJQUFJQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7SUFFREY7Ozs7OztPQU1HQTtJQUNJQSxpQ0FBS0EsR0FBWkEsVUFBYUEsRUFBbURBLElBQUlHLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXpGSDs7T0FFR0E7SUFDSUEsbUNBQU9BLEdBQWRBO1FBQ0VJLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLDBCQUFjQSxDQUFDQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQTtRQUNoREEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7SUFDSEosd0JBQUNBO0FBQURBLENBQUNBLEFBbENELElBa0NDO0FBbENZLHlCQUFpQixvQkFrQzdCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Byb3ZpZGUsIHBsYXRmb3JtLCBBcHBsaWNhdGlvblJlZiwgQXBwVmlld01hbmFnZXIsIENvbXBpbGVyLCBJbmplY3RvciwgTmdab25lLCBQbGF0Zm9ybVJlZiwgSG9zdFZpZXdGYWN0b3J5UmVmLCBQcm92aWRlciwgVHlwZSwgVGVzdGFiaWxpdHksIEFQUExJQ0FUSU9OX0NPTU1PTl9QUk9WSURFUlN9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtnbG9iYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7QlJPV1NFUl9QUk9WSURFUlMsIEJST1dTRVJfQVBQX1BST1ZJREVSU30gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbmltcG9ydCB7Z2V0Q29tcG9uZW50SW5mbywgQ29tcG9uZW50SW5mb30gZnJvbSAnLi9tZXRhZGF0YSc7XG5pbXBvcnQge29uRXJyb3IsIGNvbnRyb2xsZXJLZXl9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge05HMV9DT01QSUxFLCBORzFfSU5KRUNUT1IsIE5HMV9QQVJTRSwgTkcxX1JPT1RfU0NPUEUsIE5HMV9TQ09QRSwgTkcxX1RFU1RBQklMSVRZLCBORzJfQVBQX1ZJRVdfTUFOQUdFUiwgTkcyX0NPTVBJTEVSLCBORzJfSU5KRUNUT1IsIE5HMl9IT1NUX1ZJRVdfRkFDVE9SWV9SRUZfTUFQLCBORzJfWk9ORSwgUkVRVUlSRV9JTkpFQ1RPUn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtEb3duZ3JhZGVOZzJDb21wb25lbnRBZGFwdGVyfSBmcm9tICcuL2Rvd25ncmFkZV9uZzJfYWRhcHRlcic7XG5pbXBvcnQge1VwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0gZnJvbSAnLi91cGdyYWRlX25nMV9hZGFwdGVyJztcbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyX2pzJztcblxudmFyIHVwZ3JhZGVDb3VudDogbnVtYmVyID0gMDtcblxuLyoqXG4gKiBVc2UgYFVwZ3JhZGVBZGFwdGVyYCB0byBhbGxvdyBBbmd1bGFySlMgdjEgYW5kIEFuZ3VsYXIgdjIgdG8gY29leGlzdCBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBUaGUgYFVwZ3JhZGVBZGFwdGVyYCBhbGxvd3M6XG4gKiAxLiBjcmVhdGlvbiBvZiBBbmd1bGFyIHYyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyB2MSBjb21wb25lbnQgZGlyZWN0aXZlXG4gKiAgICAoU2VlIFtVcGdyYWRlQWRhcHRlciN1cGdyYWRlTmcxQ29tcG9uZW50KCldKVxuICogMi4gY3JlYXRpb24gb2YgQW5ndWxhckpTIHYxIGRpcmVjdGl2ZSBmcm9tIEFuZ3VsYXIgdjIgY29tcG9uZW50LlxuICogICAgKFNlZSBbVXBncmFkZUFkYXB0ZXIjZG93bmdyYWRlTmcyQ29tcG9uZW50KCldKVxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogIyMgTWVudGFsIE1vZGVsXG4gKlxuICogV2hlbiByZWFzb25pbmcgYWJvdXQgaG93IGEgaHlicmlkIGFwcGxpY2F0aW9uIHdvcmtzIGl0IGlzIHVzZWZ1bCB0byBoYXZlIGEgbWVudGFsIG1vZGVsIHdoaWNoXG4gKiBkZXNjcmliZXMgd2hhdCBpcyBoYXBwZW5pbmcgYW5kIGV4cGxhaW5zIHdoYXQgaXMgaGFwcGVuaW5nIGF0IHRoZSBsb3dlc3QgbGV2ZWwuXG4gKlxuICogMS4gVGhlcmUgYXJlIHR3byBpbmRlcGVuZGVudCBmcmFtZXdvcmtzIHJ1bm5pbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24sIGVhY2ggZnJhbWV3b3JrIHRyZWF0c1xuICogICAgdGhlIG90aGVyIGFzIGEgYmxhY2sgYm94LlxuICogMi4gRWFjaCBET00gZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBvd25lZCBleGFjdGx5IGJ5IG9uZSBmcmFtZXdvcmsuIFdoaWNoZXZlciBmcmFtZXdvcmtcbiAqICAgIGluc3RhbnRpYXRlZCB0aGUgZWxlbWVudCBpcyB0aGUgb3duZXIuIEVhY2ggZnJhbWV3b3JrIG9ubHkgdXBkYXRlcy9pbnRlcmFjdHMgd2l0aCBpdHMgb3duXG4gKiAgICBET00gZWxlbWVudHMgYW5kIGlnbm9yZXMgb3RoZXJzLlxuICogMy4gQW5ndWxhckpTIHYxIGRpcmVjdGl2ZXMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXJKUyB2MSBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciB2MiBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSBBbmd1bGFyIHYyIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA1LiBBbiBBbmd1bGFySlMgdjEgY29tcG9uZW50IGNhbiBiZSB1cGdyYWRlZCB0byBhbiBBbmd1bGFyIHYyIGNvbXBvbmVudC4gVGhpcyBjcmVhdGVzIGFuXG4gKiAgICBBbmd1bGFyIHYyIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhckpTIHYxIGNvbXBvbmVudCBkaXJlY3RpdmUgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDYuIEFuIEFuZ3VsYXIgdjIgY29tcG9uZW50IGNhbiBiZSBkb3duZ3JhZGVkIHRvIGFuIEFuZ3VsYXJKUyB2MSBjb21wb25lbnQgZGlyZWN0aXZlLiBUaGlzIGNyZWF0ZXNcbiAqICAgIGFuIEFuZ3VsYXJKUyB2MSBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXIgdjIgY29tcG9uZW50IGluIHRoYXQgbG9jYXRpb24uXG4gKiA3LiBXaGVuZXZlciBhbiBhZGFwdGVyIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieSB0aGUgZnJhbWV3b3JrXG4gKiAgICBkb2luZyB0aGUgaW5zdGFudGlhdGlvbi4gVGhlIG90aGVyIGZyYW1ld29yayB0aGVuIGluc3RhbnRpYXRlcyBhbmQgb3ducyB0aGUgdmlldyBmb3IgdGhhdFxuICogICAgY29tcG9uZW50LiBUaGlzIGltcGxpZXMgdGhhdCBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay4gVGhlIHN5bnRheCBpcyBhbHdheXMgdGhhdCBvZiBBbmd1bGFyIHYyIHN5bnRheC5cbiAqIDguIEFuZ3VsYXJKUyB2MSBpcyBhbHdheXMgYm9vdHN0cmFwcGVkIGZpcnN0IGFuZCBvd25zIHRoZSBib3R0b20gbW9zdCB2aWV3LlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIEFuZ3VsYXIgdjIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMikpO1xuICpcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMScsIGZ1bmN0aW9uKCkge1xuICogICByZXR1cm4ge1xuICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gKiAgIH07XG4gKiB9KTtcbiAqXG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAqICAgaW5wdXRzOiBbJ25hbWUnXSxcbiAqICAgdGVtcGxhdGU6ICduZzJbPG5nMSBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMT5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJyxcbiAqICAgZGlyZWN0aXZlczogW2FkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnbmcxJyldXG4gKiB9KVxuICogY2xhc3MgTmcyIHtcbiAqIH1cbiAqXG4gKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyIG5hbWU9XCJXb3JsZFwiPnByb2plY3Q8L25nMj4nO1xuICpcbiAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcbiAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQWRhcHRlciB7XG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIGlkUHJlZml4OiBzdHJpbmcgPSBgTkcyX1VQR1JBREVfJHt1cGdyYWRlQ291bnQrK31fYDtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgdXBncmFkZWRDb21wb25lbnRzOiBUeXBlW10gPSBbXTtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgZG93bmdyYWRlZENvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSA9IHt9O1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBwcm92aWRlcnM6IEFycmF5PFR5cGV8UHJvdmlkZXJ8YW55W10+ID0gW107XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIHYyIENvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTIHYxLlxuICAgKlxuICAgKiBVc2UgYGRvd25ncmFkZU5nMkNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXJKUyB2MSBEaXJlY3RpdmUgRGVmaW5pdGlvbiBGYWN0b3J5IGZyb21cbiAgICogQW5ndWxhciB2MiBDb21wb25lbnQuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXIgdjIgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZVxuICAgKiBBbmd1bGFySlMgdjEgdGVtcGxhdGUuXG4gICAqXG4gICAqICMjIE1lbnRhbCBNb2RlbFxuICAgKlxuICAgKiAxLiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBieSBiZWluZyBsaXN0ZWQgaW4gQW5ndWxhckpTIHYxIHRlbXBsYXRlLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqICAgIGhvc3QgZWxlbWVudCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXJKUyB2MSwgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFyIHYyLlxuICAgKiAyLiBFdmVuIHRob3VnaHQgdGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgaW4gQW5ndWxhckpTIHYxLCBpdCB3aWxsIGJlIHVzaW5nIEFuZ3VsYXIgdjJcbiAgICogICAgc3ludGF4LiBUaGlzIGhhcyB0byBiZSBkb25lLCB0aGlzIHdheSBiZWNhdXNlIHdlIG11c3QgZm9sbG93IEFuZ3VsYXIgdjIgY29tcG9uZW50cyBkbyBub3RcbiAgICogICAgZGVjbGFyZSBob3cgdGhlIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIGludGVycHJldGVkLlxuICAgKlxuICAgKiAjIyBTdXBwb3J0ZWQgRmVhdHVyZXNcbiAgICpcbiAgICogLSBCaW5kaW5nczpcbiAgICogICAtIEF0dHJpYnV0ZTogYDxjb21wIG5hbWU9XCJXb3JsZFwiPmBcbiAgICogICAtIEludGVycG9sYXRpb246ICBgPGNvbXAgZ3JlZXRpbmc9XCJIZWxsbyB7e25hbWV9fSFcIj5gXG4gICAqICAgLSBFeHByZXNzaW9uOiAgYDxjb21wIFtuYW1lXT1cInVzZXJuYW1lXCI+YFxuICAgKiAgIC0gRXZlbnQ6ICBgPGNvbXAgKGNsb3NlKT1cImRvU29tZXRoaW5nKClcIj5gXG4gICAqIC0gQ29udGVudCBwcm9qZWN0aW9uOiB5ZXNcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdncmVldCcsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KEdyZWV0ZXIpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gICAqICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8bmctY29udGVudD48L25nLWNvbnRlbnQ+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBHcmVldGVyIHtcbiAgICogICBASW5wdXQoKSBzYWx1dGF0aW9uOiBzdHJpbmc7XG4gICAqICAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuICAgKiB9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID1cbiAgICogICAnbmcxIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMSB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZG93bmdyYWRlTmcyQ29tcG9uZW50KHR5cGU6IFR5cGUpOiBGdW5jdGlvbiB7XG4gICAgdGhpcy51cGdyYWRlZENvbXBvbmVudHMucHVzaCh0eXBlKTtcbiAgICB2YXIgaW5mbzogQ29tcG9uZW50SW5mbyA9IGdldENvbXBvbmVudEluZm8odHlwZSk7XG4gICAgcmV0dXJuIG5nMUNvbXBvbmVudERpcmVjdGl2ZShpbmZvLCBgJHt0aGlzLmlkUHJlZml4fSR7aW5mby5zZWxlY3Rvcn1fY2ApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgdjEgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFyIHYyLlxuICAgKlxuICAgKiBVc2UgYHVwZ3JhZGVOZzFDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFyIHYyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyB2MSBDb21wb25lbnRcbiAgICogZGlyZWN0aXZlLiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFySlMgdjEgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZSBBbmd1bGFyIHYyXG4gICAqIHRlbXBsYXRlLlxuICAgKlxuICAgKiAjIyBNZW50YWwgTW9kZWxcbiAgICpcbiAgICogMS4gVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgYnkgYmVpbmcgbGlzdGVkIGluIEFuZ3VsYXIgdjIgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhciB2MiwgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFySlMgdjEuXG4gICAqXG4gICAqICMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogLSBUcmFuc2NsdXNpb246IHllc1xuICAgKiAtIE9ubHkgc29tZSBvZiB0aGUgZmVhdHVyZXMgb2ZcbiAgICogICBbRGlyZWN0aXZlIERlZmluaXRpb24gT2JqZWN0XShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZS8kY29tcGlsZSkgYXJlXG4gICAqICAgc3VwcG9ydGVkOlxuICAgKiAgIC0gYGNvbXBpbGVgOiBub3Qgc3VwcG9ydGVkIGJlY2F1c2UgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieSBBbmd1bGFyIHYyLCB3aGljaCBkb2VzXG4gICAqICAgICBub3QgYWxsb3cgbW9kaWZ5aW5nIERPTSBzdHJ1Y3R1cmUgZHVyaW5nIGNvbXBpbGF0aW9uLlxuICAgKiAgIC0gYGNvbnRyb2xsZXJgOiBzdXBwb3J0ZWQuIChOT1RFOiBpbmplY3Rpb24gb2YgYCRhdHRyc2AgYW5kIGAkdHJhbnNjbHVkZWAgaXMgbm90IHN1cHBvcnRlZC4pXG4gICAqICAgLSBgY29udHJvbGxlckFzJzogc3VwcG9ydGVkLlxuICAgKiAgIC0gYGJpbmRUb0NvbnRyb2xsZXInOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgbGluayc6IHN1cHBvcnRlZC4gKE5PVEU6IG9ubHkgcHJlLWxpbmsgZnVuY3Rpb24gaXMgc3VwcG9ydGVkLilcbiAgICogICAtIGBuYW1lJzogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHByaW9yaXR5JzogaWdub3JlZC5cbiAgICogICAtIGByZXBsYWNlJzogbm90IHN1cHBvcnRlZC5cbiAgICogICAtIGByZXF1aXJlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlc3RyaWN0YDogbXVzdCBiZSBzZXQgdG8gJ0UnLlxuICAgKiAgIC0gYHNjb3BlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlbXBsYXRlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlbXBsYXRlVXJsYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlcm1pbmFsYDogaWdub3JlZC5cbiAgICogICAtIGB0cmFuc2NsdWRlYDogc3VwcG9ydGVkLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoKTtcbiAgICogdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ2dyZWV0JywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgIHNjb3BlOiB7c2FsdXRhdGlvbjogJz0nLCBuYW1lOiAnPScgfSxcbiAgICogICAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+J1xuICAgKiAgIH07XG4gICAqIH0pO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzIpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIHRlbXBsYXRlOiAnbmcyIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nXG4gICAqICAgZGlyZWN0aXZlczogW2FkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnZ3JlZXQnKV1cbiAgICogfSlcbiAgICogY2xhc3MgTmcyIHtcbiAgICogfVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyPjwvbmcyPic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFwibmcyIHRlbXBsYXRlOiBIZWxsbyB3b3JsZCEgLSB0ZXh0XCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICB1cGdyYWRlTmcxQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFR5cGUge1xuICAgIGlmICgoPGFueT50aGlzLmRvd25ncmFkZWRDb21wb25lbnRzKS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHNbbmFtZV0udHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzW25hbWVdID0gbmV3IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcihuYW1lKSkudHlwZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQm9vdHN0cmFwIGEgaHlicmlkIEFuZ3VsYXJKUyB2MSAvIEFuZ3VsYXIgdjIgYXBwbGljYXRpb24uXG4gICAqXG4gICAqIFRoaXMgYGJvb3RzdHJhcGAgbWV0aG9kIGlzIGEgZGlyZWN0IHJlcGxhY2VtZW50ICh0YWtlcyBzYW1lIGFyZ3VtZW50cykgZm9yIEFuZ3VsYXJKUyB2MVxuICAgKiBbYGJvb3RzdHJhcGBdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9mdW5jdGlvbi9hbmd1bGFyLmJvb3RzdHJhcCkgbWV0aG9kLiBVbmxpa2VcbiAgICogQW5ndWxhckpTIHYxLCB0aGlzIGJvb3RzdHJhcCBpcyBhc3luY2hyb25vdXMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyKSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMScsIGZ1bmN0aW9uKCkge1xuICAgKiAgIHJldHVybiB7XG4gICAqICAgICAgc2NvcGU6IHsgdGl0bGU6ICc9JyB9LFxuICAgKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAgICogICBpbnB1dHM6IFsnbmFtZSddLFxuICAgKiAgIHRlbXBsYXRlOiAnbmcyWzxuZzEgW3RpdGxlXT1cIm5hbWVcIj50cmFuc2NsdWRlPC9uZzE+XSg8bmctY29udGVudD48L25nLWNvbnRlbnQ+KScsXG4gICAqICAgZGlyZWN0aXZlczogW2FkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnbmcxJyldXG4gICAqIH0pXG4gICAqIGNsYXNzIE5nMiB7XG4gICAqIH1cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMiBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gICAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgYm9vdHN0cmFwKGVsZW1lbnQ6IEVsZW1lbnQsIG1vZHVsZXM/OiBhbnlbXSwgY29uZmlnPzogYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyk6XG4gICAgICBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgdmFyIHVwZ3JhZGUgPSBuZXcgVXBncmFkZUFkYXB0ZXJSZWYoKTtcbiAgICB2YXIgbmcxSW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSA9IG51bGw7XG4gICAgdmFyIHBsYXRmb3JtUmVmOiBQbGF0Zm9ybVJlZiA9IHBsYXRmb3JtKEJST1dTRVJfUFJPVklERVJTKTtcbiAgICB2YXIgYXBwbGljYXRpb25SZWY6IEFwcGxpY2F0aW9uUmVmID0gcGxhdGZvcm1SZWYuYXBwbGljYXRpb24oW1xuICAgICAgQlJPV1NFUl9BUFBfUFJPVklERVJTLCBwcm92aWRlKE5HMV9JTkpFQ1RPUiwge3VzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yfSksXG4gICAgICBwcm92aWRlKE5HMV9DT01QSUxFLCB7dXNlRmFjdG9yeTogKCkgPT4gbmcxSW5qZWN0b3IuZ2V0KE5HMV9DT01QSUxFKX0pLCB0aGlzLnByb3ZpZGVyc1xuICAgIF0pO1xuICAgIHZhciBpbmplY3RvcjogSW5qZWN0b3IgPSBhcHBsaWNhdGlvblJlZi5pbmplY3RvcjtcbiAgICB2YXIgbmdab25lOiBOZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICB2YXIgY29tcGlsZXI6IENvbXBpbGVyID0gaW5qZWN0b3IuZ2V0KENvbXBpbGVyKTtcbiAgICB2YXIgZGVsYXlBcHBseUV4cHM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgICB2YXIgb3JpZ2luYWwkYXBwbHlGbjogRnVuY3Rpb247XG4gICAgdmFyIHJvb3RTY29wZVByb3RvdHlwZTogYW55O1xuICAgIHZhciByb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2U7XG4gICAgdmFyIGhvc3RWaWV3RmFjdG9yeVJlZk1hcDogSG9zdFZpZXdGYWN0b3J5UmVmTWFwID0ge307XG4gICAgdmFyIG5nMU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKHRoaXMuaWRQcmVmaXgsIG1vZHVsZXMpO1xuICAgIHZhciBuZzFCb290c3RyYXBQcm9taXNlOiBQcm9taXNlPGFueT4gPSBudWxsO1xuICAgIHZhciBuZzFjb21waWxlUHJvbWlzZTogUHJvbWlzZTxhbnk+ID0gbnVsbDtcbiAgICBuZzFNb2R1bGUudmFsdWUoTkcyX0lOSkVDVE9SLCBpbmplY3RvcilcbiAgICAgICAgLnZhbHVlKE5HMl9aT05FLCBuZ1pvbmUpXG4gICAgICAgIC52YWx1ZShORzJfQ09NUElMRVIsIGNvbXBpbGVyKVxuICAgICAgICAudmFsdWUoTkcyX0hPU1RfVklFV19GQUNUT1JZX1JFRl9NQVAsIGhvc3RWaWV3RmFjdG9yeVJlZk1hcClcbiAgICAgICAgLnZhbHVlKE5HMl9BUFBfVklFV19NQU5BR0VSLCBpbmplY3Rvci5nZXQoQXBwVmlld01hbmFnZXIpKVxuICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAnJHByb3ZpZGUnLFxuICAgICAgICAgIChwcm92aWRlKSA9PiB7XG4gICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcihORzFfUk9PVF9TQ09QRSwgW1xuICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocm9vdFNjb3BlRGVsZWdhdGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSByb290U2NvcGVEZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnJGFwcGx5JykpIHtcbiAgICAgICAgICAgICAgICAgIG9yaWdpbmFsJGFwcGx5Rm4gPSByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5O1xuICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IChleHApID0+IGRlbGF5QXBwbHlFeHBzLnB1c2goZXhwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmluZCBcXCckYXBwbHlcXCcgb24gXFwnJHJvb3RTY29wZVxcJyEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvb3RTY29wZSA9IHJvb3RTY29wZURlbGVnYXRlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHByb3ZpZGUuZGVjb3JhdG9yKE5HMV9URVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgZnVuY3Rpb24odGVzdGFiaWxpdHlEZWxlZ2F0ZTogYW5ndWxhci5JVGVzdGFiaWxpdHlTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5nMlRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSA9IGluamVjdG9yLmdldChUZXN0YWJpbGl0eSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3JpZ29uYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3V2hlblN0YWJsZSA9IChjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgIHZhciB3aGVuU3RhYmxlQ29udGV4dDogYW55ID0gdGhpcztcbiAgICAgICAgICAgICAgICAgIG9yaWdvbmFsV2hlblN0YWJsZS5jYWxsKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShuZXdXaGVuU3RhYmxlLmJpbmQod2hlblN0YWJsZUNvbnRleHQsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGUgPSBuZXdXaGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuXG4gICAgbmcxY29tcGlsZVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBuZzFNb2R1bGUucnVuKFtcbiAgICAgICAgJyRpbmplY3RvcicsICckcm9vdFNjb3BlJyxcbiAgICAgICAgKGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSkgPT4ge1xuICAgICAgICAgIG5nMUluamVjdG9yID0gaW5qZWN0b3I7XG4gICAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKFxuICAgICAgICAgICAgICBuZ1pvbmUub25NaWNyb3Rhc2tFbXB0eSwgKF8pID0+IG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiByb290U2NvcGUuJGFwcGx5KCkpKTtcbiAgICAgICAgICBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIucmVzb2x2ZSh0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzLCBpbmplY3RvcilcbiAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgcmVzdW1lQm9vdHN0cmFwKCkgb25seSBleGlzdHMgaWYgdGhlIGN1cnJlbnQgYm9vdHN0cmFwIGlzIGRlZmVycmVkXG4gICAgdmFyIHdpbmRvd0FuZ3VsYXIgPSAoPGFueT5nbG9iYWwpLmFuZ3VsYXI7XG4gICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSB1bmRlZmluZWQ7XG5cbiAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZGF0YShjb250cm9sbGVyS2V5KE5HMl9JTkpFQ1RPUiksIGluamVjdG9yKTtcbiAgICBuZ1pvbmUucnVuKCgpID0+IHsgYW5ndWxhci5ib290c3RyYXAoZWxlbWVudCwgW3RoaXMuaWRQcmVmaXhdLCBjb25maWcpOyB9KTtcbiAgICBuZzFCb290c3RyYXBQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwKSB7XG4gICAgICAgIHZhciBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gb3JpZ2luYWxSZXN1bWVCb290c3RyYXA7XG4gICAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBQcm9taXNlXG4gICAgICAgIC5hbGwoW1xuICAgICAgICAgIHRoaXMuY29tcGlsZU5nMkNvbXBvbmVudHMoY29tcGlsZXIsIGhvc3RWaWV3RmFjdG9yeVJlZk1hcCksIG5nMUJvb3RzdHJhcFByb21pc2UsXG4gICAgICAgICAgbmcxY29tcGlsZVByb21pc2VcbiAgICAgICAgXSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIG5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZSkge1xuICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5ID0gb3JpZ2luYWwkYXBwbHlGbjsgIC8vIHJlc3RvcmUgb3JpZ2luYWwgJGFwcGx5XG4gICAgICAgICAgICAgIHdoaWxlIChkZWxheUFwcGx5RXhwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByb290U2NvcGUuJGFwcGx5KGRlbGF5QXBwbHlFeHBzLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICg8YW55PnVwZ3JhZGUpLl9ib290c3RyYXBEb25lKGFwcGxpY2F0aW9uUmVmLCBuZzFJbmplY3Rvcik7XG4gICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIG9uRXJyb3IpO1xuICAgIHJldHVybiB1cGdyYWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBwcm92aWRlciB0byB0aGUgdG9wIGxldmVsIGVudmlyb25tZW50IG9mIGEgaHlicmlkIEFuZ3VsYXJKUyB2MSAvIEFuZ3VsYXIgdjIgYXBwbGljYXRpb24uXG4gICAqXG4gICAqIEluIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyIGFwcGxpY2F0aW9uLCB0aGVyZSBpcyBubyBvbmUgcm9vdCBBbmd1bGFyIHYyIGNvbXBvbmVudCxcbiAgICogZm9yIHRoaXMgcmVhc29uIHdlIHByb3ZpZGUgYW4gYXBwbGljYXRpb24gZ2xvYmFsIHdheSBvZiByZWdpc3RlcmluZyBwcm92aWRlcnMgd2hpY2ggaXNcbiAgICogY29uc2lzdGVudCB3aXRoIHNpbmdsZSBnbG9iYWwgaW5qZWN0aW9uIGluIEFuZ3VsYXJKUyB2MS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEdyZWV0ZXIge1xuICAgKiAgIGdyZWV0KG5hbWUpIHtcbiAgICogICAgIGFsZXJ0KCdIZWxsbyAnICsgbmFtZSArICchJyk7XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAgICogICB0ZW1wbGF0ZTogJydcbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHtcbiAgICogICBjb25zdHJ1Y3RvcihncmVldGVyOiBHcmVldGVyKSB7XG4gICAqICAgICB0aGlzLmdyZWV0ZXIoJ1dvcmxkJyk7XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKCk7XG4gICAqIGFkYXB0ZXIuYWRkUHJvdmlkZXIoR3JlZXRlcik7XG4gICAqXG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdhcHAnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChBcHApKTtcbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPGFwcD48L2FwcD4nXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pO1xuICAgKmBgYFxuICAgKi9cbiAgcHVibGljIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBUeXBlfFByb3ZpZGVyfGFueVtdKTogdm9pZCB7IHRoaXMucHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpOyB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgdjEgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhciB2Mi5cbiAgICpcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIExvZ2luIHsgLi4uIH1cbiAgICogY2xhc3MgU2VydmVyIHsgLi4uIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogICBjb25zdHJ1Y3RvcihASW5qZWN0KCdzZXJ2ZXInKSBzZXJ2ZXIsIGxvZ2luOiBMb2dpbikge1xuICAgKiAgICAgLi4uXG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuc2VydmljZSgnc2VydmVyJywgU2VydmVyKTtcbiAgICogbW9kdWxlLnNlcnZpY2UoJ2xvZ2luJywgTG9naW4pO1xuICAgKlxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiBhZGFwdGVyLnVwZ3JhZGVOZzFQcm92aWRlcignc2VydmVyJyk7XG4gICAqIGFkYXB0ZXIudXBncmFkZU5nMVByb3ZpZGVyKCdsb2dpbicsIHthc1Rva2VuOiBMb2dpbn0pO1xuICAgKiBhZGFwdGVyLmFkZFByb3ZpZGVyKEV4YW1wbGUpO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeSgocmVmKSA9PiB7XG4gICAqICAgdmFyIGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcySW5qZWN0b3IuZ2V0KEV4YW1wbGUpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgdXBncmFkZU5nMVByb3ZpZGVyKG5hbWU6IHN0cmluZywgb3B0aW9ucz86IHthc1Rva2VuOiBhbnl9KSB7XG4gICAgdmFyIHRva2VuID0gb3B0aW9ucyAmJiBvcHRpb25zLmFzVG9rZW4gfHwgbmFtZTtcbiAgICB0aGlzLnByb3ZpZGVycy5wdXNoKHByb3ZpZGUodG9rZW4sIHtcbiAgICAgIHVzZUZhY3Rvcnk6IChuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiBuZzFJbmplY3Rvci5nZXQobmFtZSksXG4gICAgICBkZXBzOiBbTkcxX0lOSkVDVE9SXVxuICAgIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciB2MiBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMgdjEuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogfVxuICAgKlxuICAgKiB2YXIgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcigpO1xuICAgKiBhZGFwdGVyLmFkZFByb3ZpZGVyKEV4YW1wbGUpO1xuICAgKlxuICAgKiB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmZhY3RvcnkoJ2V4YW1wbGUnLCBhZGFwdGVyLmRvd25ncmFkZU5nMlByb3ZpZGVyKEV4YW1wbGUpKTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIHZhciBleGFtcGxlOiBFeGFtcGxlID0gcmVmLm5nMUluamVjdG9yLmdldCgnZXhhbXBsZScpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBwdWJsaWMgZG93bmdyYWRlTmcyUHJvdmlkZXIodG9rZW46IGFueSk6IEZ1bmN0aW9uIHtcbiAgICB2YXIgZmFjdG9yeSA9IGZ1bmN0aW9uKGluamVjdG9yOiBJbmplY3RvcikgeyByZXR1cm4gaW5qZWN0b3IuZ2V0KHRva2VuKTsgfTtcbiAgICAoPGFueT5mYWN0b3J5KS4kaW5qZWN0ID0gW05HMl9JTkpFQ1RPUl07XG4gICAgcmV0dXJuIGZhY3Rvcnk7XG4gIH1cblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBjb21waWxlTmcyQ29tcG9uZW50cyhjb21waWxlcjogQ29tcGlsZXIsIGhvc3RWaWV3RmFjdG9yeVJlZk1hcDogSG9zdFZpZXdGYWN0b3J5UmVmTWFwKTpcbiAgICAgIFByb21pc2U8SG9zdFZpZXdGYWN0b3J5UmVmTWFwPiB7XG4gICAgdmFyIHByb21pc2VzOiBBcnJheTxQcm9taXNlPEhvc3RWaWV3RmFjdG9yeVJlZj4+ID0gW107XG4gICAgdmFyIHR5cGVzID0gdGhpcy51cGdyYWRlZENvbXBvbmVudHM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcHJvbWlzZXMucHVzaChjb21waWxlci5jb21waWxlSW5Ib3N0KHR5cGVzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigoaG9zdFZpZXdGYWN0b3JpZXM6IEFycmF5PEhvc3RWaWV3RmFjdG9yeVJlZj4pID0+IHtcbiAgICAgIHZhciB0eXBlcyA9IHRoaXMudXBncmFkZWRDb21wb25lbnRzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3N0Vmlld0ZhY3Rvcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBob3N0Vmlld0ZhY3RvcnlSZWZNYXBbZ2V0Q29tcG9uZW50SW5mbyh0eXBlc1tpXSkuc2VsZWN0b3JdID0gaG9zdFZpZXdGYWN0b3JpZXNbaV07XG4gICAgICB9XG4gICAgICByZXR1cm4gaG9zdFZpZXdGYWN0b3J5UmVmTWFwO1xuICAgIH0sIG9uRXJyb3IpO1xuICB9XG59XG5cbmludGVyZmFjZSBIb3N0Vmlld0ZhY3RvcnlSZWZNYXAge1xuICBbc2VsZWN0b3I6IHN0cmluZ106IEhvc3RWaWV3RmFjdG9yeVJlZjtcbn1cblxuZnVuY3Rpb24gbmcxQ29tcG9uZW50RGlyZWN0aXZlKGluZm86IENvbXBvbmVudEluZm8sIGlkUHJlZml4OiBzdHJpbmcpOiBGdW5jdGlvbiB7XG4gICg8YW55PmRpcmVjdGl2ZUZhY3RvcnkpLiRpbmplY3QgPVxuICAgICAgW05HMl9IT1NUX1ZJRVdfRkFDVE9SWV9SRUZfTUFQLCBORzJfQVBQX1ZJRVdfTUFOQUdFUiwgTkcxX1BBUlNFXTtcbiAgZnVuY3Rpb24gZGlyZWN0aXZlRmFjdG9yeShcbiAgICAgIGhvc3RWaWV3RmFjdG9yeVJlZk1hcDogSG9zdFZpZXdGYWN0b3J5UmVmTWFwLCB2aWV3TWFuYWdlcjogQXBwVmlld01hbmFnZXIsXG4gICAgICBwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlKTogYW5ndWxhci5JRGlyZWN0aXZlIHtcbiAgICB2YXIgaG9zdFZpZXdGYWN0b3J5OiBIb3N0Vmlld0ZhY3RvcnlSZWYgPSBob3N0Vmlld0ZhY3RvcnlSZWZNYXBbaW5mby5zZWxlY3Rvcl07XG4gICAgaWYgKCFob3N0Vmlld0ZhY3RvcnkpIHRocm93IG5ldyBFcnJvcignRXhwZWN0aW5nIEhvc3RWaWV3RmFjdG9yeVJlZiBmb3I6ICcgKyBpbmZvLnNlbGVjdG9yKTtcbiAgICB2YXIgaWRDb3VudCA9IDA7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXF1aXJlOiBSRVFVSVJFX0lOSkVDVE9SLFxuICAgICAgbGluazoge1xuICAgICAgICBwb3N0OiAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgcGFyZW50SW5qZWN0b3I6IGFueSwgdHJhbnNjbHVkZTogYW5ndWxhci5JVHJhbnNjbHVkZUZ1bmN0aW9uKTogdm9pZCA9PiB7XG4gICAgICAgICAgdmFyIGRvbUVsZW1lbnQgPSA8YW55PmVsZW1lbnRbMF07XG4gICAgICAgICAgdmFyIGZhY2FkZSA9IG5ldyBEb3duZ3JhZGVOZzJDb21wb25lbnRBZGFwdGVyKFxuICAgICAgICAgICAgICBpZFByZWZpeCArIChpZENvdW50KyspLCBpbmZvLCBlbGVtZW50LCBhdHRycywgc2NvcGUsIDxJbmplY3Rvcj5wYXJlbnRJbmplY3RvciwgcGFyc2UsXG4gICAgICAgICAgICAgIHZpZXdNYW5hZ2VyLCBob3N0Vmlld0ZhY3RvcnkpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cElucHV0cygpO1xuICAgICAgICAgIGZhY2FkZS5ib290c3RyYXBOZzIoKTtcbiAgICAgICAgICBmYWNhZGUucHJvamVjdENvbnRlbnQoKTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBPdXRwdXRzKCk7XG4gICAgICAgICAgZmFjYWRlLnJlZ2lzdGVyQ2xlYW51cCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBVc2UgYFVncmFkZUFkYXB0ZXJSZWZgIHRvIGNvbnRyb2wgYSBoeWJyaWQgQW5ndWxhckpTIHYxIC8gQW5ndWxhciB2MiBhcHBsaWNhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX3JlYWR5Rm46ICh1cGdyYWRlQWRhcHRlclJlZj86IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkID0gbnVsbDtcblxuICBwdWJsaWMgbmcxUm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlID0gbnVsbDtcbiAgcHVibGljIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UgPSBudWxsO1xuICBwdWJsaWMgbmcyQXBwbGljYXRpb25SZWY6IEFwcGxpY2F0aW9uUmVmID0gbnVsbDtcbiAgcHVibGljIG5nMkluamVjdG9yOiBJbmplY3RvciA9IG51bGw7XG5cbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcERvbmUoYXBwbGljYXRpb25SZWY6IEFwcGxpY2F0aW9uUmVmLCBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gICAgdGhpcy5uZzJBcHBsaWNhdGlvblJlZiA9IGFwcGxpY2F0aW9uUmVmO1xuICAgIHRoaXMubmcySW5qZWN0b3IgPSBhcHBsaWNhdGlvblJlZi5pbmplY3RvcjtcbiAgICB0aGlzLm5nMUluamVjdG9yID0gbmcxSW5qZWN0b3I7XG4gICAgdGhpcy5uZzFSb290U2NvcGUgPSBuZzFJbmplY3Rvci5nZXQoTkcxX1JPT1RfU0NPUEUpO1xuICAgIHRoaXMuX3JlYWR5Rm4gJiYgdGhpcy5fcmVhZHlGbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIGlzIG5vdGlmaWVkIHVwb24gc3VjY2Vzc2Z1bCBoeWJyaWQgQW5ndWxhckpTIHYxIC8gQW5ndWxhciB2MlxuICAgKiBhcHBsaWNhdGlvbiBoYXMgYmVlbiBib290c3RyYXBwZWQuXG4gICAqXG4gICAqIFRoZSBgcmVhZHlgIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGludm9rZWQgaW5zaWRlIHRoZSBBbmd1bGFyIHYyIHpvbmUsIHRoZXJlZm9yZSBpdCBkb2VzIG5vdFxuICAgKiByZXF1aXJlIGEgY2FsbCB0byBgJGFwcGx5KClgLlxuICAgKi9cbiAgcHVibGljIHJlYWR5KGZuOiAodXBncmFkZUFkYXB0ZXJSZWY/OiBVcGdyYWRlQWRhcHRlclJlZikgPT4gdm9pZCkgeyB0aGlzLl9yZWFkeUZuID0gZm47IH1cblxuICAvKipcbiAgICogRGlzcG9zZSBvZiBydW5uaW5nIGh5YnJpZCBBbmd1bGFySlMgdjEgLyBBbmd1bGFyIHYyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5uZzFJbmplY3Rvci5nZXQoTkcxX1JPT1RfU0NPUEUpLiRkZXN0cm95KCk7XG4gICAgdGhpcy5uZzJBcHBsaWNhdGlvblJlZi5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==