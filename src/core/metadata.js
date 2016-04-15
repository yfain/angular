'use strict';/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */
"use strict";
var di_1 = require('./metadata/di');
exports.QueryMetadata = di_1.QueryMetadata;
exports.ContentChildrenMetadata = di_1.ContentChildrenMetadata;
exports.ContentChildMetadata = di_1.ContentChildMetadata;
exports.ViewChildrenMetadata = di_1.ViewChildrenMetadata;
exports.ViewQueryMetadata = di_1.ViewQueryMetadata;
exports.ViewChildMetadata = di_1.ViewChildMetadata;
exports.AttributeMetadata = di_1.AttributeMetadata;
var directives_1 = require('./metadata/directives');
exports.ComponentMetadata = directives_1.ComponentMetadata;
exports.DirectiveMetadata = directives_1.DirectiveMetadata;
exports.PipeMetadata = directives_1.PipeMetadata;
exports.InputMetadata = directives_1.InputMetadata;
exports.OutputMetadata = directives_1.OutputMetadata;
exports.HostBindingMetadata = directives_1.HostBindingMetadata;
exports.HostListenerMetadata = directives_1.HostListenerMetadata;
var view_1 = require('./metadata/view');
exports.ViewMetadata = view_1.ViewMetadata;
exports.ViewEncapsulation = view_1.ViewEncapsulation;
var di_2 = require('./metadata/di');
var directives_2 = require('./metadata/directives');
var view_2 = require('./metadata/view');
var decorators_1 = require('./util/decorators');
// TODO(alexeagle): remove the duplication of this doc. It is copied from ComponentMetadata.
/**
 * Declare reusable UI building blocks for an application.
 *
 * Each Angular component requires a single `@Component` annotation. The `@Component`
 * annotation specifies when a component is instantiated, and which properties and hostListeners it
 * binds to.
 *
 * When a component is instantiated, Angular
 * - creates a shadow DOM for the component.
 * - loads the selected template into the shadow DOM.
 * - creates all the injectable objects configured with `providers` and `viewProviders`.
 *
 * All template expressions and statements are then evaluated against the component instance.
 *
 * ## Lifecycle hooks
 *
 * When the component class implements some {@link angular2/lifecycle_hooks} the callbacks are
 * called by the change detection at defined points in time during the life of the component.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='component'}
 */
exports.Component = decorators_1.makeDecorator(directives_2.ComponentMetadata, function (fn) { return fn.View = View; });
// TODO(alexeagle): remove the duplication of this doc. It is copied from DirectiveMetadata.
/**
 * Directives allow you to attach behavior to elements in the DOM.
 *
 * {@link DirectiveMetadata}s with an embedded view are called {@link ComponentMetadata}s.
 *
 * A directive consists of a single directive annotation and a controller class. When the
 * directive's `selector` matches
 * elements in the DOM, the following steps occur:
 *
 * 1. For each directive, the `ElementInjector` attempts to resolve the directive's constructor
 * arguments.
 * 2. Angular instantiates directives for each matched element using `ElementInjector` in a
 * depth-first order,
 *    as declared in the HTML.
 *
 * ## Understanding How Injection Works
 *
 * There are three stages of injection resolution.
 * - *Pre-existing Injectors*:
 *   - The terminal {@link Injector} cannot resolve dependencies. It either throws an error or, if
 * the dependency was
 *     specified as `@Optional`, returns `null`.
 *   - The platform injector resolves browser singleton resources, such as: cookies, title,
 * location, and others.
 * - *Component Injectors*: Each component instance has its own {@link Injector}, and they follow
 * the same parent-child hierarchy
 *     as the component instances in the DOM.
 * - *Element Injectors*: Each component instance has a Shadow DOM. Within the Shadow DOM each
 * element has an `ElementInjector`
 *     which follow the same parent-child hierarchy as the DOM elements themselves.
 *
 * When a template is instantiated, it also must instantiate the corresponding directives in a
 * depth-first order. The
 * current `ElementInjector` resolves the constructor dependencies for each directive.
 *
 * Angular then resolves dependencies as follows, according to the order in which they appear in the
 * {@link ViewMetadata}:
 *
 * 1. Dependencies on the current element
 * 2. Dependencies on element injectors and their parents until it encounters a Shadow DOM boundary
 * 3. Dependencies on component injectors and their parents until it encounters the root component
 * 4. Dependencies on pre-existing injectors
 *
 *
 * The `ElementInjector` can inject other directives, element-specific special objects, or it can
 * delegate to the parent
 * injector.
 *
 * To inject other directives, declare the constructor parameter as:
 * - `directive:DirectiveType`: a directive on the current element only
 * - `@Host() directive:DirectiveType`: any directive that matches the type between the current
 * element and the
 *    Shadow DOM root.
 * - `@Query(DirectiveType) query:QueryList<DirectiveType>`: A live collection of direct child
 * directives.
 * - `@QueryDescendants(DirectiveType) query:QueryList<DirectiveType>`: A live collection of any
 * child directives.
 *
 * To inject element-specific special objects, declare the constructor parameter as:
 * - `element: ElementRef` to obtain a reference to logical element in the view.
 * - `viewContainer: ViewContainerRef` to control child template instantiation, for
 * {@link DirectiveMetadata} directives only
 * - `bindingPropagation: BindingPropagation` to control change detection in a more granular way.
 *
 * ### Example
 *
 * The following example demonstrates how dependency injection resolves constructor arguments in
 * practice.
 *
 *
 * Assume this HTML template:
 *
 * ```
 * <div dependency="1">
 *   <div dependency="2">
 *     <div dependency="3" my-directive>
 *       <div dependency="4">
 *         <div dependency="5"></div>
 *       </div>
 *       <div dependency="6"></div>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * With the following `dependency` decorator and `SomeService` injectable class.
 *
 * ```
 * @Injectable()
 * class SomeService {
 * }
 *
 * @Directive({
 *   selector: '[dependency]',
 *   inputs: [
 *     'id: dependency'
 *   ]
 * })
 * class Dependency {
 *   id:string;
 * }
 * ```
 *
 * Let's step through the different ways in which `MyDirective` could be declared...
 *
 *
 * ### No injection
 *
 * Here the constructor is declared with no arguments, therefore nothing is injected into
 * `MyDirective`.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor() {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with no dependencies.
 *
 *
 * ### Component-level injection
 *
 * Directives can inject any injectable instance from the closest component injector or any of its
 * parents.
 *
 * Here, the constructor declares a parameter, `someService`, and injects the `SomeService` type
 * from the parent
 * component's injector.
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(someService: SomeService) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a dependency on `SomeService`.
 *
 *
 * ### Injecting a directive from the current element
 *
 * Directives can inject other directives declared on the current element.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(dependency: Dependency) {
 *     expect(dependency.id).toEqual(3);
 *   }
 * }
 * ```
 * This directive would be instantiated with `Dependency` declared at the same element, in this case
 * `dependency="3"`.
 *
 * ### Injecting a directive from any ancestor elements
 *
 * Directives can inject other directives declared on any ancestor element (in the current Shadow
 * DOM), i.e. on the current element, the
 * parent element, or its parents.
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Host() dependency: Dependency) {
 *     expect(dependency.id).toEqual(2);
 *   }
 * }
 * ```
 *
 * `@Host` checks the current element, the parent, as well as its parents recursively. If
 * `dependency="2"` didn't
 * exist on the direct parent, this injection would
 * have returned
 * `dependency="1"`.
 *
 *
 * ### Injecting a live collection of direct child directives
 *
 *
 * A directive can also query for other child directives. Since parent directives are instantiated
 * before child directives, a directive can't simply inject the list of child directives. Instead,
 * the directive injects a {@link QueryList}, which updates its contents as children are added,
 * removed, or moved by a directive that uses a {@link ViewContainerRef} such as a `ngFor`, an
 * `ngIf`, or an `ngSwitch`.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Query(Dependency) dependencies:QueryList<Dependency>) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a {@link QueryList} which contains `Dependency` 4 and
 * 6. Here, `Dependency` 5 would not be included, because it is not a direct child.
 *
 * ### Injecting a live collection of descendant directives
 *
 * By passing the descendant flag to `@Query` above, we can include the children of the child
 * elements.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Query(Dependency, {descendants: true}) dependencies:QueryList<Dependency>) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a Query which would contain `Dependency` 4, 5 and 6.
 *
 * ### Optional injection
 *
 * The normal behavior of directives is to return an error when a specified dependency cannot be
 * resolved. If you
 * would like to inject `null` on unresolved dependency instead, you can annotate that dependency
 * with `@Optional()`.
 * This explicitly permits the author of a template to treat some of the surrounding directives as
 * optional.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Optional() dependency:Dependency) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a `Dependency` directive found on the current element.
 * If none can be
 * found, the injector supplies `null` instead of throwing an error.
 *
 * ### Example
 *
 * Here we use a decorator directive to simply define basic tool-tip behavior.
 *
 * ```
 * @Directive({
 *   selector: '[tooltip]',
 *   inputs: [
 *     'text: tooltip'
 *   ],
 *   host: {
 *     '(mouseenter)': 'onMouseEnter()',
 *     '(mouseleave)': 'onMouseLeave()'
 *   }
 * })
 * class Tooltip{
 *   text:string;
 *   overlay:Overlay; // NOT YET IMPLEMENTED
 *   overlayManager:OverlayManager; // NOT YET IMPLEMENTED
 *
 *   constructor(overlayManager:OverlayManager) {
 *     this.overlay = overlay;
 *   }
 *
 *   onMouseEnter() {
 *     // exact signature to be determined
 *     this.overlay = this.overlayManager.open(text, ...);
 *   }
 *
 *   onMouseLeave() {
 *     this.overlay.close();
 *     this.overlay = null;
 *   }
 * }
 * ```
 * In our HTML template, we can then add this behavior to a `<div>` or any other element with the
 * `tooltip` selector,
 * like so:
 *
 * ```
 * <div tooltip="some text here"></div>
 * ```
 *
 * Directives can also control the instantiation, destruction, and positioning of inline template
 * elements:
 *
 * A directive uses a {@link ViewContainerRef} to instantiate, insert, move, and destroy views at
 * runtime.
 * The {@link ViewContainerRef} is created as a result of `<template>` element, and represents a
 * location in the current view
 * where these actions are performed.
 *
 * Views are always created as children of the current {@link ViewMetadata}, and as siblings of the
 * `<template>` element. Thus a
 * directive in a child view cannot inject the directive that created it.
 *
 * Since directives that create views via ViewContainers are common in Angular, and using the full
 * `<template>` element syntax is wordy, Angular
 * also supports a shorthand notation: `<li *foo="bar">` and `<li template="foo: bar">` are
 * equivalent.
 *
 * Thus,
 *
 * ```
 * <ul>
 *   <li *foo="bar" title="text"></li>
 * </ul>
 * ```
 *
 * Expands in use to:
 *
 * ```
 * <ul>
 *   <template [foo]="bar">
 *     <li title="text"></li>
 *   </template>
 * </ul>
 * ```
 *
 * Notice that although the shorthand places `*foo="bar"` within the `<li>` element, the binding for
 * the directive
 * controller is correctly instantiated on the `<template>` element rather than the `<li>` element.
 *
 * ## Lifecycle hooks
 *
 * When the directive class implements some {@link angular2/lifecycle_hooks} the callbacks are
 * called by the change detection at defined points in time during the life of the directive.
 *
 * ### Example
 *
 * Let's suppose we want to implement the `unless` behavior, to conditionally include a template.
 *
 * Here is a simple directive that triggers on an `unless` selector:
 *
 * ```
 * @Directive({
 *   selector: '[unless]',
 *   inputs: ['unless']
 * })
 * export class Unless {
 *   viewContainer: ViewContainerRef;
 *   templateRef: TemplateRef;
 *   prevCondition: boolean;
 *
 *   constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef) {
 *     this.viewContainer = viewContainer;
 *     this.templateRef = templateRef;
 *     this.prevCondition = null;
 *   }
 *
 *   set unless(newCondition) {
 *     if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
 *       this.prevCondition = true;
 *       this.viewContainer.clear();
 *     } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
 *       this.prevCondition = false;
 *       this.viewContainer.create(this.templateRef);
 *     }
 *   }
 * }
 * ```
 *
 * We can then use this `unless` selector in a template:
 * ```
 * <ul>
 *   <li *unless="expr"></li>
 * </ul>
 * ```
 *
 * Once the directive instantiates the child view, the shorthand notation for the template expands
 * and the result is:
 *
 * ```
 * <ul>
 *   <template [unless]="exp">
 *     <li></li>
 *   </template>
 *   <li></li>
 * </ul>
 * ```
 *
 * Note also that although the `<li></li>` template still exists inside the `<template></template>`,
 * the instantiated
 * view occurs on the second `<li></li>` which is a sibling to the `<template>` element.
 */
exports.Directive = decorators_1.makeDecorator(directives_2.DirectiveMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewMetadata.
/**
 * Metadata properties available for configuring Views.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@View` annotation specifies the HTML template to use, and lists the directives that are active
 * within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and
 * the expressions and statements in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see {@link ComponentMetadata}.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'greet',
 *   template: 'Hello {{name}}!',
 *   directives: [GreetUser, Bold]
 * })
 * class Greet {
 *   name: string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 * ```
 */
var View = decorators_1.makeDecorator(view_2.ViewMetadata, function (fn) { return fn.View = View; });
/**
 * Specifies that a constant attribute value should be injected.
 *
 * The directive can inject constant string literals of host element attributes.
 *
 * ### Example
 *
 * Suppose we have an `<input>` element and want to know its `type`.
 *
 * ```html
 * <input type="text">
 * ```
 *
 * A decorator can inject string literal `text` like so:
 *
 * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
 */
exports.Attribute = decorators_1.makeParamDecorator(di_2.AttributeMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from QueryMetadata.
/**
 * Declares an injectable parameter to be a live list of directives or variable
 * bindings from the content children of a directive.
 *
 * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
 *
 * Assume that `<tabs>` component would like to get a list its children `<pane>`
 * components as shown in this example:
 *
 * ```html
 * <tabs>
 *   <pane title="Overview">...</pane>
 *   <pane *ngFor="#o of objects" [title]="o.title">{{o.text}}</pane>
 * </tabs>
 * ```
 *
 * The preferred solution is to query for `Pane` directives using this decorator.
 *
 * ```javascript
 * @Component({
 *   selector: 'pane',
 *   inputs: ['title']
 * })
 * class Pane {
 *   title:string;
 * }
 *
 * @Component({
 *  selector: 'tabs',
 *  template: `
 *    <ul>
 *      <li *ngFor="#pane of panes">{{pane.title}}</li>
 *    </ul>
 *    <ng-content></ng-content>
 *  `
 * })
 * class Tabs {
 *   panes: QueryList<Pane>;
 *   constructor(@Query(Pane) panes:QueryList<Pane>) {
 *     this.panes = panes;
 *   }
 * }
 * ```
 *
 * A query can look for variable bindings by passing in a string with desired binding symbol.
 *
 * ### Example ([live demo](http://plnkr.co/edit/sT2j25cH1dURAyBRCKx1?p=preview))
 * ```html
 * <seeker>
 *   <div #findme>...</div>
 * </seeker>
 *
 * @Component({ selector: 'seeker' })
 * class seeker {
 *   constructor(@Query('findme') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * In this case the object that is injected depend on the type of the variable
 * binding. It can be an ElementRef, a directive or a component.
 *
 * Passing in a comma separated list of variable bindings will query for all of them.
 *
 * ```html
 * <seeker>
 *   <div #findMe>...</div>
 *   <div #findMeToo>...</div>
 * </seeker>
 *
 *  @Component({
 *   selector: 'seeker'
 * })
 * class Seeker {
 *   constructor(@Query('findMe, findMeToo') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * Configure whether query looks for direct children or all descendants
 * of the querying element, by using the `descendants` parameter.
 * It is set to `false` by default.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wtGeB977bv7qvA5FTYl9?p=preview))
 * ```html
 * <container #first>
 *   <item>a</item>
 *   <item>b</item>
 *   <container #second>
 *     <item>c</item>
 *   </container>
 * </container>
 * ```
 *
 * When querying for items, the first container will see only `a` and `b` by default,
 * but with `Query(TextDirective, {descendants: true})` it will see `c` too.
 *
 * The queried directives are kept in a depth-first pre-order with respect to their
 * positions in the DOM.
 *
 * Query does not look deep into any subcomponent views.
 *
 * Query is updated as part of the change-detection cycle. Since change detection
 * happens after construction of a directive, QueryList will always be empty when observed in the
 * constructor.
 *
 * The injected object is an unmodifiable live list.
 * See {@link QueryList} for more details.
 */
exports.Query = decorators_1.makeParamDecorator(di_2.QueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildrenMetadata.
/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChildren(ChildDirective) contentChildren: QueryList<ChildDirective>;
 *
 *   ngAfterContentInit() {
 *     // contentChildren is set
 *   }
 * }
 * ```
 */
exports.ContentChildren = decorators_1.makePropDecorator(di_2.ContentChildrenMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildMetadata.
/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChild(ChildDirective) contentChild;
 *
 *   ngAfterContentInit() {
 *     // contentChild is set
 *   }
 * }
 * ```
 */
exports.ContentChild = decorators_1.makePropDecorator(di_2.ContentChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildrenMetadata.
/**
 * Declares a list of child element references.
 *
 * Angular automatically updates the list when the DOM is updated.
 *
 * `ViewChildren` takes a argument to select elements.
 *
 * - If the argument is a type, directives or components with the type will be bound.
 *
 * - If the argument is a string, the string is interpreted as a list of comma-separated selectors.
 * For each selector, an element containing the matching template variable (e.g. `#child`) will be
 * bound.
 *
 * View children are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * With type selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: `
 *     <child-cmp></child-cmp>
 *     <child-cmp></child-cmp>
 *     <child-cmp></child-cmp>
 *   `,
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChildren(ChildCmp) children:QueryList<ChildCmp>;
 *
 *   ngAfterViewInit() {
 *     // children are set
 *     this.children.toArray().forEach((child)=>child.doSomething());
 *   }
 * }
 * ```
 *
 * With string selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: `
 *     <child-cmp #child1></child-cmp>
 *     <child-cmp #child2></child-cmp>
 *     <child-cmp #child3></child-cmp>
 *   `,
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChildren('child1,child2,child3') children:QueryList<ChildCmp>;
 *
 *   ngAfterViewInit() {
 *     // children are set
 *     this.children.toArray().forEach((child)=>child.doSomething());
 *   }
 * }
 * ```
 *
 * See also: [ViewChildrenMetadata]
 */
exports.ViewChildren = decorators_1.makePropDecorator(di_2.ViewChildrenMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildMetadata.
/**
 * Declares a reference to a child element.
 *
 * `ViewChildren` takes a argument to select elements.
 *
 * - If the argument is a type, a directive or a component with the type will be bound.
 *
 * - If the argument is a string, the string is interpreted as a selector. An element containing the
 * matching template variable (e.g. `#child`) will be bound.
 *
 * In either case, `@ViewChild()` assigns the first (looking from above) element if there are
 * multiple matches.
 *
 * View child is set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * With type selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: '<child-cmp></child-cmp>',
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChild(ChildCmp) child:ChildCmp;
 *
 *   ngAfterViewInit() {
 *     // child is set
 *     this.child.doSomething();
 *   }
 * }
 * ```
 *
 * With string selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: '<child-cmp #child></child-cmp>',
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChild('child') child:ChildCmp;
 *
 *   ngAfterViewInit() {
 *     // child is set
 *     this.child.doSomething();
 *   }
 * }
 * ```
 * See also: [ViewChildMetadata]
 */
exports.ViewChild = decorators_1.makePropDecorator(di_2.ViewChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewQueryMetadata.
/**
 * Similar to {@link QueryMetadata}, but querying the component view, instead of
 * the content children.
 *
 * ### Example ([live demo](http://plnkr.co/edit/eNsFHDf7YjyM6IzKxM1j?p=preview))
 *
 * ```javascript
 * @Component({
 *   ...,
 *   template: `
 *     <item> a </item>
 *     <item> b </item>
 *     <item> c </item>
 *   `
 * })
 * class MyComponent {
 *   shown: boolean;
 *
 *   constructor(private @Query(Item) items:QueryList<Item>) {
 *     items.changes.subscribe(() => console.log(items.length));
 *   }
 * }
 * ```
 *
 * Supports the same querying parameters as {@link QueryMetadata}, except
 * `descendants`. This always queries the whole view.
 *
 * As `shown` is flipped between true and false, items will contain zero of one
 * items.
 *
 * Specifies that a {@link QueryList} should be injected.
 *
 * The injected object is an iterable and observable live list.
 * See {@link QueryList} for more details.
 */
exports.ViewQuery = decorators_1.makeParamDecorator(di_2.ViewQueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from PipeMetadata.
/**
 * Declare reusable pipe function.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='pipe'}
 */
exports.Pipe = decorators_1.makeDecorator(directives_2.PipeMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from InputMetadata.
/**
 * Declares a data-bound input property.
 *
 * Angular automatically updates data-bound properties during change detection.
 *
 * `InputMetadata` takes an optional parameter that specifies the name
 * used when instantiating a component in the template. When not provided,
 * the name of the decorated property is used.
 *
 * ### Example
 *
 * The following example creates a component with two input properties.
 *
 * ```typescript
 * @Component({
 *   selector: 'bank-account',
 *   template: `
 *     Bank Name: {{bankName}}
 *     Account Id: {{id}}
 *   `
 * })
 * class BankAccount {
 *   @Input() bankName: string;
 *   @Input('account-id') id: string;
 *
 *   // this property is not bound, and won't be automatically updated by Angular
 *   normalizedBankName: string;
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <bank-account bank-name="RBC" account-id="4747"></bank-account>
 *   `,
 *   directives: [BankAccount]
 * })
 * class App {}
 *
 * bootstrap(App);
 * ```
 */
exports.Input = decorators_1.makePropDecorator(directives_2.InputMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from OutputMetadata.
/**
 * Declares an event-bound output property.
 *
 * When an output property emits an event, an event handler attached to that event
 * the template is invoked.
 *
 * `OutputMetadata` takes an optional parameter that specifies the name
 * used when instantiating a component in the template. When not provided,
 * the name of the decorated property is used.
 *
 * ### Example
 *
 * ```typescript
 * @Directive({
 *   selector: 'interval-dir',
 * })
 * class IntervalDir {
 *   @Output() everySecond = new EventEmitter();
 *   @Output('everyFiveSeconds') five5Secs = new EventEmitter();
 *
 *   constructor() {
 *     setInterval(() => this.everySecond.emit("event"), 1000);
 *     setInterval(() => this.five5Secs.emit("event"), 5000);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <interval-dir (everySecond)="everySecond()" (everyFiveSeconds)="everyFiveSeconds()">
 *     </interval-dir>
 *   `,
 *   directives: [IntervalDir]
 * })
 * class App {
 *   everySecond() { console.log('second'); }
 *   everyFiveSeconds() { console.log('five seconds'); }
 * }
 * bootstrap(App);
 * ```
 */
exports.Output = decorators_1.makePropDecorator(directives_2.OutputMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from HostBindingMetadata.
/**
 * Declares a host property binding.
 *
 * Angular automatically checks host property bindings during change detection.
 * If a binding changes, it will update the host element of the directive.
 *
 * `HostBindingMetadata` takes an optional parameter that specifies the property
 * name of the host element that will be updated. When not provided,
 * the class property name is used.
 *
 * ### Example
 *
 * The following example creates a directive that sets the `valid` and `invalid` classes
 * on the DOM element that has ngModel directive on it.
 *
 * ```typescript
 * @Directive({selector: '[ngModel]'})
 * class NgModelStatus {
 *   constructor(public control:NgModel) {}
 *   @HostBinding('[class.valid]') get valid { return this.control.valid; }
 *   @HostBinding('[class.invalid]') get invalid { return this.control.invalid; }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<input [(ngModel)]="prop">`,
 *   directives: [FORM_DIRECTIVES, NgModelStatus]
 * })
 * class App {
 *   prop;
 * }
 *
 * bootstrap(App);
 * ```
 */
exports.HostBinding = decorators_1.makePropDecorator(directives_2.HostBindingMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from HostListenerMetadata.
/**
 * Declares a host listener.
 *
 * Angular will invoke the decorated method when the host element emits the specified event.
 *
 * If the decorated method returns `false`, then `preventDefault` is applied on the DOM
 * event.
 *
 * ### Example
 *
 * The following example declares a directive that attaches a click listener to the button and
 * counts clicks.
 *
 * ```typescript
 * @Directive({selector: 'button[counting]'})
 * class CountClicks {
 *   numberOfClicks = 0;
 *
 *   @HostListener('click', ['$event.target'])
 *   onClick(btn) {
 *     console.log("button", btn, "number of clicks:", this.numberOfClicks++);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<button counting>Increment</button>`,
 *   directives: [CountClicks]
 * })
 * class App {}
 *
 * bootstrap(App);
 * ```
 */
exports.HostListener = decorators_1.makePropDecorator(directives_2.HostListenerMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWloZ0x5Rjl3LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7O0FBRUgsbUJBUU8sZUFBZSxDQUFDO0FBUHJCLDJDQUFhO0FBQ2IsK0RBQXVCO0FBQ3ZCLHlEQUFvQjtBQUNwQix5REFBb0I7QUFDcEIsbURBQWlCO0FBQ2pCLG1EQUFpQjtBQUNqQixtREFDcUI7QUFFdkIsMkJBUU8sdUJBQXVCLENBQUM7QUFQN0IsMkRBQWlCO0FBQ2pCLDJEQUFpQjtBQUNqQixpREFBWTtBQUNaLG1EQUFhO0FBQ2IscURBQWM7QUFDZCwrREFBbUI7QUFDbkIsaUVBQzZCO0FBRS9CLHFCQUE4QyxpQkFBaUIsQ0FBQztBQUF4RCwyQ0FBWTtBQUFFLHFEQUEwQztBQWFoRSxtQkFRTyxlQUFlLENBQUMsQ0FBQTtBQUV2QiwyQkFRTyx1QkFBdUIsQ0FBQyxDQUFBO0FBRS9CLHFCQUE4QyxpQkFBaUIsQ0FBQyxDQUFBO0FBR2hFLDJCQU1PLG1CQUFtQixDQUFDLENBQUE7QUFzYTNCLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNRLGlCQUFTLEdBQ0UsMEJBQWEsQ0FBQyw4QkFBaUIsRUFBRSxVQUFDLEVBQU8sSUFBSyxPQUFBLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFkLENBQWMsQ0FBQyxDQUFDO0FBRXBGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5WEc7QUFDUSxpQkFBUyxHQUF1QywwQkFBYSxDQUFDLDhCQUFpQixDQUFDLENBQUM7QUFFNUYsdUZBQXVGO0FBQ3ZGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0gsSUFBSSxJQUFJLEdBQTZCLDBCQUFhLENBQUMsbUJBQVksRUFBRSxVQUFDLEVBQU8sSUFBSyxPQUFBLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFkLENBQWMsQ0FBQyxDQUFDO0FBRTlGOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ1EsaUJBQVMsR0FBcUIsK0JBQWtCLENBQUMsc0JBQWlCLENBQUMsQ0FBQztBQUUvRSx3RkFBd0Y7QUFDeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwR0c7QUFDUSxhQUFLLEdBQWlCLCtCQUFrQixDQUFDLGtCQUFhLENBQUMsQ0FBQztBQUVuRSxrR0FBa0c7QUFDbEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDUSx1QkFBZSxHQUEyQiw4QkFBaUIsQ0FBQyw0QkFBdUIsQ0FBQyxDQUFDO0FBRWhHLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNRLG9CQUFZLEdBQXdCLDhCQUFpQixDQUFDLHlCQUFvQixDQUFDLENBQUM7QUFFdkYsK0ZBQStGO0FBQy9GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4RUc7QUFDUSxvQkFBWSxHQUF3Qiw4QkFBaUIsQ0FBQyx5QkFBb0IsQ0FBQyxDQUFDO0FBRXZGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUVHO0FBQ1EsaUJBQVMsR0FBcUIsOEJBQWlCLENBQUMsc0JBQWlCLENBQUMsQ0FBQztBQUU5RSw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDUSxpQkFBUyxHQUFpQiwrQkFBa0IsQ0FBQyxzQkFBaUIsQ0FBQyxDQUFDO0FBRTNFLHVGQUF1RjtBQUN2Rjs7Ozs7O0dBTUc7QUFDUSxZQUFJLEdBQTZCLDBCQUFhLENBQUMseUJBQVksQ0FBQyxDQUFDO0FBRXhFLHdGQUF3RjtBQUN4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNRLGFBQUssR0FBaUIsOEJBQWlCLENBQUMsMEJBQWEsQ0FBQyxDQUFDO0FBRWxFLHlGQUF5RjtBQUN6Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNRLGNBQU0sR0FBa0IsOEJBQWlCLENBQUMsMkJBQWMsQ0FBQyxDQUFDO0FBRXJFLDhGQUE4RjtBQUM5Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtDRztBQUNRLG1CQUFXLEdBQXVCLDhCQUFpQixDQUFDLGdDQUFtQixDQUFDLENBQUM7QUFFcEYsK0ZBQStGO0FBQy9GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQ0c7QUFDUSxvQkFBWSxHQUF3Qiw4QkFBaUIsQ0FBQyxpQ0FBb0IsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGluZGlyZWN0aW9uIGlzIG5lZWRlZCB0byBmcmVlIHVwIENvbXBvbmVudCwgZXRjIHN5bWJvbHMgaW4gdGhlIHB1YmxpYyBBUElcbiAqIHRvIGJlIHVzZWQgYnkgdGhlIGRlY29yYXRvciB2ZXJzaW9ucyBvZiB0aGVzZSBhbm5vdGF0aW9ucy5cbiAqL1xuXG5leHBvcnQge1xuICBRdWVyeU1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSxcbiAgQ29udGVudENoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIEF0dHJpYnV0ZU1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGknO1xuXG5leHBvcnQge1xuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgRGlyZWN0aXZlTWV0YWRhdGEsXG4gIFBpcGVNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIEhvc3RCaW5kaW5nTWV0YWRhdGEsXG4gIEhvc3RMaXN0ZW5lck1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5cbmV4cG9ydCB7Vmlld01ldGFkYXRhLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi9tZXRhZGF0YS92aWV3JztcblxuZXhwb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQWZ0ZXJWaWV3Q2hlY2tlZCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgRG9DaGVja1xufSBmcm9tICcuL21ldGFkYXRhL2xpZmVjeWNsZV9ob29rcyc7XG5cbmltcG9ydCB7XG4gIFF1ZXJ5TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdDaGlsZE1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgQXR0cmlidXRlTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaSc7XG5cbmltcG9ydCB7XG4gIENvbXBvbmVudE1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgUGlwZU1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBPdXRwdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcblxuaW1wb3J0IHtWaWV3TWV0YWRhdGEsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcblxuaW1wb3J0IHtcbiAgbWFrZURlY29yYXRvcixcbiAgbWFrZVBhcmFtRGVjb3JhdG9yLFxuICBtYWtlUHJvcERlY29yYXRvcixcbiAgVHlwZURlY29yYXRvcixcbiAgQ2xhc3Ncbn0gZnJvbSAnLi91dGlsL2RlY29yYXRvcnMnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgRGlyZWN0aXZlRmFjdG9yeX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlRGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7fVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcG9uZW50RmFjdG9yeX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7XG4gIC8qKlxuICAgKiBDaGFpbiB7QGxpbmsgVmlld01ldGFkYXRhfSBhbm5vdGF0aW9uLlxuICAgKi9cbiAgVmlldyhvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcmVuZGVyZXI/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIHtAbGluayBWaWV3TWV0YWRhdGF9IGRlY29yYXRvciBmdW5jdGlvbi5cbiAqXG4gKiBTZWUge0BsaW5rIFZpZXdGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3RGVjb3JhdG9yIGV4dGVuZHMgVHlwZURlY29yYXRvciB7XG4gIC8qKlxuICAgKiBDaGFpbiB7QGxpbmsgVmlld01ldGFkYXRhfSBhbm5vdGF0aW9uLlxuICAgKi9cbiAgVmlldyhvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcmVuZGVyZXI/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xufVxuXG4vKipcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdkaXJlY3RpdmUnfVxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeURpcmVjdGl2ZSA9IG5nXG4gKiAgIC5EaXJlY3RpdmUoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeURpcmVjdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlEaXJlY3RpdmUuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5EaXJlY3RpdmUoey4uLn0pXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9XG4gIH0pOiBEaXJlY3RpdmVEZWNvcmF0b3I7XG4gIG5ldyAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX1cbiAgfSk6IERpcmVjdGl2ZU1ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdjb21wb25lbnQnfVxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgdmlld0JpbmRpbmdzPzogYW55W10sXG4gICAgdmlld1Byb3ZpZGVycz86IGFueVtdLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb25cbiAgfSk6IENvbXBvbmVudERlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAvKiBAZGVwcmVjYXRlZCAqL1xuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgdmlld0JpbmRpbmdzPzogYW55W10sXG4gICAgdmlld1Byb3ZpZGVycz86IGFueVtdLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb25cbiAgfSk6IENvbXBvbmVudE1ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBWaWV3TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIFZpZXd9IGZyb20gXCJhbmd1bGFyMi9jb3JlXCI7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5WaWV3KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KSxcbiAqICAgbmV3IG5nLlZpZXcoey4uLn0pXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3RmFjdG9yeSB7XG4gIChvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9KTogVmlld0RlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9KTogVmlld01ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBBdHRyaWJ1dGVNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdhdHRyaWJ1dGVGYWN0b3J5J31cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBbbmV3IG5nLkF0dHJpYnV0ZSgndGl0bGUnKSwgZnVuY3Rpb24odGl0bGUpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1dXG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24odGl0bGUpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogTXlDb21wb25lbnQucGFyYW1ldGVycyA9IFtcbiAqICAgW25ldyBuZy5BdHRyaWJ1dGUoJ3RpdGxlJyldXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVGYWN0b3J5IHtcbiAgKG5hbWU6IHN0cmluZyk6IFR5cGVEZWNvcmF0b3I7XG4gIG5ldyAobmFtZTogc3RyaW5nKTogQXR0cmlidXRlTWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtRdWVyeSwgUXVlcnlMaXN0LCBDb21wb25lbnR9IGZyb20gXCJhbmd1bGFyMi9jb3JlXCI7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KFNvbWVUeXBlKSBxdWVyeUxpc3Q6IFF1ZXJ5TGlzdDxTb21lVHlwZT4pIHtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogW25ldyBuZy5RdWVyeShTb21lVHlwZSksIGZ1bmN0aW9uKHF1ZXJ5TGlzdCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfV1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbihxdWVyeUxpc3QpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogTXlDb21wb25lbnQucGFyYW1ldGVycyA9IFtcbiAqICAgW25ldyBuZy5RdWVyeShTb21lVHlwZSldXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeUZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IFBhcmFtZXRlckRlY29yYXRvcjtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge2Rlc2NlbmRhbnRzfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW59KTogUXVlcnlNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgQ29udGVudENoaWxkcmVufS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50Q2hpbGRyZW5GYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHN9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0pOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhO1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIHtAbGluayBDb250ZW50Q2hpbGR9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRDaGlsZEZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBDb250ZW50Q2hpbGRGYWN0b3J5O1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIHtAbGluayBWaWV3Q2hpbGRyZW59LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdDaGlsZHJlbkZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBWaWV3Q2hpbGRyZW5NZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgVmlld0NoaWxkfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3Q2hpbGRGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogVmlld0NoaWxkRmFjdG9yeTtcbn1cblxuXG4vKipcbiAqIHtAbGluayBQaXBlTWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J3BpcGUnfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBpcGVGYWN0b3J5IHtcbiAgKG9iajoge25hbWU6IHN0cmluZywgcHVyZT86IGJvb2xlYW59KTogYW55O1xuICBuZXcgKG9iajoge25hbWU6IHN0cmluZywgcHVyZT86IGJvb2xlYW59KTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBJbnB1dE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBkZWNvcmF0b3JzLlxuICpcbiAqIFNlZSB7QGxpbmsgSW5wdXRNZXRhZGF0YX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5wdXRGYWN0b3J5IHtcbiAgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgT3V0cHV0TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBPdXRwdXRNZXRhZGF0YX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3V0cHV0RmFjdG9yeSB7XG4gIChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xuICBuZXcgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIEhvc3RCaW5kaW5nTWV0YWRhdGF9IGZhY3RvcnkgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdEJpbmRpbmdGYWN0b3J5IHtcbiAgKGhvc3RQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoaG9zdFByb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgSG9zdExpc3RlbmVyTWV0YWRhdGF9IGZhY3RvcnkgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdExpc3RlbmVyRmFjdG9yeSB7XG4gIChldmVudE5hbWU6IHN0cmluZywgYXJncz86IHN0cmluZ1tdKTogYW55O1xuICBuZXcgKGV2ZW50TmFtZTogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pOiBhbnk7XG59XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29tcG9uZW50TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgVUkgYnVpbGRpbmcgYmxvY2tzIGZvciBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBFYWNoIEFuZ3VsYXIgY29tcG9uZW50IHJlcXVpcmVzIGEgc2luZ2xlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLiBUaGUgYEBDb21wb25lbnRgXG4gKiBhbm5vdGF0aW9uIHNwZWNpZmllcyB3aGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgYW5kIHdoaWNoIHByb3BlcnRpZXMgYW5kIGhvc3RMaXN0ZW5lcnMgaXRcbiAqIGJpbmRzIHRvLlxuICpcbiAqIFdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCBBbmd1bGFyXG4gKiAtIGNyZWF0ZXMgYSBzaGFkb3cgRE9NIGZvciB0aGUgY29tcG9uZW50LlxuICogLSBsb2FkcyB0aGUgc2VsZWN0ZWQgdGVtcGxhdGUgaW50byB0aGUgc2hhZG93IERPTS5cbiAqIC0gY3JlYXRlcyBhbGwgdGhlIGluamVjdGFibGUgb2JqZWN0cyBjb25maWd1cmVkIHdpdGggYHByb3ZpZGVyc2AgYW5kIGB2aWV3UHJvdmlkZXJzYC5cbiAqXG4gKiBBbGwgdGVtcGxhdGUgZXhwcmVzc2lvbnMgYW5kIHN0YXRlbWVudHMgYXJlIHRoZW4gZXZhbHVhdGVkIGFnYWluc3QgdGhlIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBjb21wb25lbnQgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayBhbmd1bGFyMi9saWZlY3ljbGVfaG9va3N9IHRoZSBjYWxsYmFja3MgYXJlXG4gKiBjYWxsZWQgYnkgdGhlIGNoYW5nZSBkZXRlY3Rpb24gYXQgZGVmaW5lZCBwb2ludHMgaW4gdGltZSBkdXJpbmcgdGhlIGxpZmUgb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nY29tcG9uZW50J31cbiAqL1xuZXhwb3J0IHZhciBDb21wb25lbnQ6IENvbXBvbmVudEZhY3RvcnkgPVxuICAgIDxDb21wb25lbnRGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoQ29tcG9uZW50TWV0YWRhdGEsIChmbjogYW55KSA9PiBmbi5WaWV3ID0gVmlldyk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gRGlyZWN0aXZlTWV0YWRhdGEuXG4vKipcbiAqIERpcmVjdGl2ZXMgYWxsb3cgeW91IHRvIGF0dGFjaCBiZWhhdmlvciB0byBlbGVtZW50cyBpbiB0aGUgRE9NLlxuICpcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX1zIHdpdGggYW4gZW1iZWRkZWQgdmlldyBhcmUgY2FsbGVkIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX1zLlxuICpcbiAqIEEgZGlyZWN0aXZlIGNvbnNpc3RzIG9mIGEgc2luZ2xlIGRpcmVjdGl2ZSBhbm5vdGF0aW9uIGFuZCBhIGNvbnRyb2xsZXIgY2xhc3MuIFdoZW4gdGhlXG4gKiBkaXJlY3RpdmUncyBgc2VsZWN0b3JgIG1hdGNoZXNcbiAqIGVsZW1lbnRzIGluIHRoZSBET00sIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2NjdXI6XG4gKlxuICogMS4gRm9yIGVhY2ggZGlyZWN0aXZlLCB0aGUgYEVsZW1lbnRJbmplY3RvcmAgYXR0ZW1wdHMgdG8gcmVzb2x2ZSB0aGUgZGlyZWN0aXZlJ3MgY29uc3RydWN0b3JcbiAqIGFyZ3VtZW50cy5cbiAqIDIuIEFuZ3VsYXIgaW5zdGFudGlhdGVzIGRpcmVjdGl2ZXMgZm9yIGVhY2ggbWF0Y2hlZCBlbGVtZW50IHVzaW5nIGBFbGVtZW50SW5qZWN0b3JgIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLFxuICogICAgYXMgZGVjbGFyZWQgaW4gdGhlIEhUTUwuXG4gKlxuICogIyMgVW5kZXJzdGFuZGluZyBIb3cgSW5qZWN0aW9uIFdvcmtzXG4gKlxuICogVGhlcmUgYXJlIHRocmVlIHN0YWdlcyBvZiBpbmplY3Rpb24gcmVzb2x1dGlvbi5cbiAqIC0gKlByZS1leGlzdGluZyBJbmplY3RvcnMqOlxuICogICAtIFRoZSB0ZXJtaW5hbCB7QGxpbmsgSW5qZWN0b3J9IGNhbm5vdCByZXNvbHZlIGRlcGVuZGVuY2llcy4gSXQgZWl0aGVyIHRocm93cyBhbiBlcnJvciBvciwgaWZcbiAqIHRoZSBkZXBlbmRlbmN5IHdhc1xuICogICAgIHNwZWNpZmllZCBhcyBgQE9wdGlvbmFsYCwgcmV0dXJucyBgbnVsbGAuXG4gKiAgIC0gVGhlIHBsYXRmb3JtIGluamVjdG9yIHJlc29sdmVzIGJyb3dzZXIgc2luZ2xldG9uIHJlc291cmNlcywgc3VjaCBhczogY29va2llcywgdGl0bGUsXG4gKiBsb2NhdGlvbiwgYW5kIG90aGVycy5cbiAqIC0gKkNvbXBvbmVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgaXRzIG93biB7QGxpbmsgSW5qZWN0b3J9LCBhbmQgdGhleSBmb2xsb3dcbiAqIHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHlcbiAqICAgICBhcyB0aGUgY29tcG9uZW50IGluc3RhbmNlcyBpbiB0aGUgRE9NLlxuICogLSAqRWxlbWVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgYSBTaGFkb3cgRE9NLiBXaXRoaW4gdGhlIFNoYWRvdyBET00gZWFjaFxuICogZWxlbWVudCBoYXMgYW4gYEVsZW1lbnRJbmplY3RvcmBcbiAqICAgICB3aGljaCBmb2xsb3cgdGhlIHNhbWUgcGFyZW50LWNoaWxkIGhpZXJhcmNoeSBhcyB0aGUgRE9NIGVsZW1lbnRzIHRoZW1zZWx2ZXMuXG4gKlxuICogV2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZCwgaXQgYWxzbyBtdXN0IGluc3RhbnRpYXRlIHRoZSBjb3JyZXNwb25kaW5nIGRpcmVjdGl2ZXMgaW4gYVxuICogZGVwdGgtZmlyc3Qgb3JkZXIuIFRoZVxuICogY3VycmVudCBgRWxlbWVudEluamVjdG9yYCByZXNvbHZlcyB0aGUgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzIGZvciBlYWNoIGRpcmVjdGl2ZS5cbiAqXG4gKiBBbmd1bGFyIHRoZW4gcmVzb2x2ZXMgZGVwZW5kZW5jaWVzIGFzIGZvbGxvd3MsIGFjY29yZGluZyB0byB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBhcHBlYXIgaW4gdGhlXG4gKiB7QGxpbmsgVmlld01ldGFkYXRhfTpcbiAqXG4gKiAxLiBEZXBlbmRlbmNpZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudFxuICogMi4gRGVwZW5kZW5jaWVzIG9uIGVsZW1lbnQgaW5qZWN0b3JzIGFuZCB0aGVpciBwYXJlbnRzIHVudGlsIGl0IGVuY291bnRlcnMgYSBTaGFkb3cgRE9NIGJvdW5kYXJ5XG4gKiAzLiBEZXBlbmRlbmNpZXMgb24gY29tcG9uZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIHRoZSByb290IGNvbXBvbmVudFxuICogNC4gRGVwZW5kZW5jaWVzIG9uIHByZS1leGlzdGluZyBpbmplY3RvcnNcbiAqXG4gKlxuICogVGhlIGBFbGVtZW50SW5qZWN0b3JgIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcywgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIG9yIGl0IGNhblxuICogZGVsZWdhdGUgdG8gdGhlIHBhcmVudFxuICogaW5qZWN0b3IuXG4gKlxuICogVG8gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYSBkaXJlY3RpdmUgb24gdGhlIGN1cnJlbnQgZWxlbWVudCBvbmx5XG4gKiAtIGBASG9zdCgpIGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYW55IGRpcmVjdGl2ZSB0aGF0IG1hdGNoZXMgdGhlIHR5cGUgYmV0d2VlbiB0aGUgY3VycmVudFxuICogZWxlbWVudCBhbmQgdGhlXG4gKiAgICBTaGFkb3cgRE9NIHJvb3QuXG4gKiAtIGBAUXVlcnkoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgZGlyZWN0IGNoaWxkXG4gKiBkaXJlY3RpdmVzLlxuICogLSBgQFF1ZXJ5RGVzY2VuZGFudHMoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgYW55XG4gKiBjaGlsZCBkaXJlY3RpdmVzLlxuICpcbiAqIFRvIGluamVjdCBlbGVtZW50LXNwZWNpZmljIHNwZWNpYWwgb2JqZWN0cywgZGVjbGFyZSB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVyIGFzOlxuICogLSBgZWxlbWVudDogRWxlbWVudFJlZmAgdG8gb2J0YWluIGEgcmVmZXJlbmNlIHRvIGxvZ2ljYWwgZWxlbWVudCBpbiB0aGUgdmlldy5cbiAqIC0gYHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWZgIHRvIGNvbnRyb2wgY2hpbGQgdGVtcGxhdGUgaW5zdGFudGlhdGlvbiwgZm9yXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9IGRpcmVjdGl2ZXMgb25seVxuICogLSBgYmluZGluZ1Byb3BhZ2F0aW9uOiBCaW5kaW5nUHJvcGFnYXRpb25gIHRvIGNvbnRyb2wgY2hhbmdlIGRldGVjdGlvbiBpbiBhIG1vcmUgZ3JhbnVsYXIgd2F5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlbW9uc3RyYXRlcyBob3cgZGVwZW5kZW5jeSBpbmplY3Rpb24gcmVzb2x2ZXMgY29uc3RydWN0b3IgYXJndW1lbnRzIGluXG4gKiBwcmFjdGljZS5cbiAqXG4gKlxuICogQXNzdW1lIHRoaXMgSFRNTCB0ZW1wbGF0ZTpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgZGVwZW5kZW5jeT1cIjFcIj5cbiAqICAgPGRpdiBkZXBlbmRlbmN5PVwiMlwiPlxuICogICAgIDxkaXYgZGVwZW5kZW5jeT1cIjNcIiBteS1kaXJlY3RpdmU+XG4gKiAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI0XCI+XG4gKiAgICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjVcIj48L2Rpdj5cbiAqICAgICAgIDwvZGl2PlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNlwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogV2l0aCB0aGUgZm9sbG93aW5nIGBkZXBlbmRlbmN5YCBkZWNvcmF0b3IgYW5kIGBTb21lU2VydmljZWAgaW5qZWN0YWJsZSBjbGFzcy5cbiAqXG4gKiBgYGBcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIFNvbWVTZXJ2aWNlIHtcbiAqIH1cbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbZGVwZW5kZW5jeV0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAnaWQ6IGRlcGVuZGVuY3knXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBEZXBlbmRlbmN5IHtcbiAqICAgaWQ6c3RyaW5nO1xuICogfVxuICogYGBgXG4gKlxuICogTGV0J3Mgc3RlcCB0aHJvdWdoIHRoZSBkaWZmZXJlbnQgd2F5cyBpbiB3aGljaCBgTXlEaXJlY3RpdmVgIGNvdWxkIGJlIGRlY2xhcmVkLi4uXG4gKlxuICpcbiAqICMjIyBObyBpbmplY3Rpb25cbiAqXG4gKiBIZXJlIHRoZSBjb25zdHJ1Y3RvciBpcyBkZWNsYXJlZCB3aXRoIG5vIGFyZ3VtZW50cywgdGhlcmVmb3JlIG5vdGhpbmcgaXMgaW5qZWN0ZWQgaW50b1xuICogYE15RGlyZWN0aXZlYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggbm8gZGVwZW5kZW5jaWVzLlxuICpcbiAqXG4gKiAjIyMgQ29tcG9uZW50LWxldmVsIGluamVjdGlvblxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBhbnkgaW5qZWN0YWJsZSBpbnN0YW5jZSBmcm9tIHRoZSBjbG9zZXN0IGNvbXBvbmVudCBpbmplY3RvciBvciBhbnkgb2YgaXRzXG4gKiBwYXJlbnRzLlxuICpcbiAqIEhlcmUsIHRoZSBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHBhcmFtZXRlciwgYHNvbWVTZXJ2aWNlYCwgYW5kIGluamVjdHMgdGhlIGBTb21lU2VydmljZWAgdHlwZVxuICogZnJvbSB0aGUgcGFyZW50XG4gKiBjb21wb25lbnQncyBpbmplY3Rvci5cbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKHNvbWVTZXJ2aWNlOiBTb21lU2VydmljZSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGRlcGVuZGVuY3kgb24gYFNvbWVTZXJ2aWNlYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiB0aGUgY3VycmVudCBlbGVtZW50LlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgzKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBgRGVwZW5kZW5jeWAgZGVjbGFyZWQgYXQgdGhlIHNhbWUgZWxlbWVudCwgaW4gdGhpcyBjYXNlXG4gKiBgZGVwZW5kZW5jeT1cIjNcImAuXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIGFueSBhbmNlc3RvciBlbGVtZW50c1xuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzIGRlY2xhcmVkIG9uIGFueSBhbmNlc3RvciBlbGVtZW50IChpbiB0aGUgY3VycmVudCBTaGFkb3dcbiAqIERPTSksIGkuZS4gb24gdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlXG4gKiBwYXJlbnQgZWxlbWVudCwgb3IgaXRzIHBhcmVudHMuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihASG9zdCgpIGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogYEBIb3N0YCBjaGVja3MgdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlIHBhcmVudCwgYXMgd2VsbCBhcyBpdHMgcGFyZW50cyByZWN1cnNpdmVseS4gSWZcbiAqIGBkZXBlbmRlbmN5PVwiMlwiYCBkaWRuJ3RcbiAqIGV4aXN0IG9uIHRoZSBkaXJlY3QgcGFyZW50LCB0aGlzIGluamVjdGlvbiB3b3VsZFxuICogaGF2ZSByZXR1cm5lZFxuICogYGRlcGVuZGVuY3k9XCIxXCJgLlxuICpcbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZCBkaXJlY3RpdmVzXG4gKlxuICpcbiAqIEEgZGlyZWN0aXZlIGNhbiBhbHNvIHF1ZXJ5IGZvciBvdGhlciBjaGlsZCBkaXJlY3RpdmVzLiBTaW5jZSBwYXJlbnQgZGlyZWN0aXZlcyBhcmUgaW5zdGFudGlhdGVkXG4gKiBiZWZvcmUgY2hpbGQgZGlyZWN0aXZlcywgYSBkaXJlY3RpdmUgY2FuJ3Qgc2ltcGx5IGluamVjdCB0aGUgbGlzdCBvZiBjaGlsZCBkaXJlY3RpdmVzLiBJbnN0ZWFkLFxuICogdGhlIGRpcmVjdGl2ZSBpbmplY3RzIGEge0BsaW5rIFF1ZXJ5TGlzdH0sIHdoaWNoIHVwZGF0ZXMgaXRzIGNvbnRlbnRzIGFzIGNoaWxkcmVuIGFyZSBhZGRlZCxcbiAqIHJlbW92ZWQsIG9yIG1vdmVkIGJ5IGEgZGlyZWN0aXZlIHRoYXQgdXNlcyBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBzdWNoIGFzIGEgYG5nRm9yYCwgYW5cbiAqIGBuZ0lmYCwgb3IgYW4gYG5nU3dpdGNoYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIHtAbGluayBRdWVyeUxpc3R9IHdoaWNoIGNvbnRhaW5zIGBEZXBlbmRlbmN5YCA0IGFuZFxuICogNi4gSGVyZSwgYERlcGVuZGVuY3lgIDUgd291bGQgbm90IGJlIGluY2x1ZGVkLCBiZWNhdXNlIGl0IGlzIG5vdCBhIGRpcmVjdCBjaGlsZC5cbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRlc2NlbmRhbnQgZGlyZWN0aXZlc1xuICpcbiAqIEJ5IHBhc3NpbmcgdGhlIGRlc2NlbmRhbnQgZmxhZyB0byBgQFF1ZXJ5YCBhYm92ZSwgd2UgY2FuIGluY2x1ZGUgdGhlIGNoaWxkcmVuIG9mIHRoZSBjaGlsZFxuICogZWxlbWVudHMuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3ksIHtkZXNjZW5kYW50czogdHJ1ZX0pIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBRdWVyeSB3aGljaCB3b3VsZCBjb250YWluIGBEZXBlbmRlbmN5YCA0LCA1IGFuZCA2LlxuICpcbiAqICMjIyBPcHRpb25hbCBpbmplY3Rpb25cbiAqXG4gKiBUaGUgbm9ybWFsIGJlaGF2aW9yIG9mIGRpcmVjdGl2ZXMgaXMgdG8gcmV0dXJuIGFuIGVycm9yIHdoZW4gYSBzcGVjaWZpZWQgZGVwZW5kZW5jeSBjYW5ub3QgYmVcbiAqIHJlc29sdmVkLiBJZiB5b3VcbiAqIHdvdWxkIGxpa2UgdG8gaW5qZWN0IGBudWxsYCBvbiB1bnJlc29sdmVkIGRlcGVuZGVuY3kgaW5zdGVhZCwgeW91IGNhbiBhbm5vdGF0ZSB0aGF0IGRlcGVuZGVuY3lcbiAqIHdpdGggYEBPcHRpb25hbCgpYC5cbiAqIFRoaXMgZXhwbGljaXRseSBwZXJtaXRzIHRoZSBhdXRob3Igb2YgYSB0ZW1wbGF0ZSB0byB0cmVhdCBzb21lIG9mIHRoZSBzdXJyb3VuZGluZyBkaXJlY3RpdmVzIGFzXG4gKiBvcHRpb25hbC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBkZXBlbmRlbmN5OkRlcGVuZGVuY3kpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBgRGVwZW5kZW5jeWAgZGlyZWN0aXZlIGZvdW5kIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKiBJZiBub25lIGNhbiBiZVxuICogZm91bmQsIHRoZSBpbmplY3RvciBzdXBwbGllcyBgbnVsbGAgaW5zdGVhZCBvZiB0aHJvd2luZyBhbiBlcnJvci5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIEhlcmUgd2UgdXNlIGEgZGVjb3JhdG9yIGRpcmVjdGl2ZSB0byBzaW1wbHkgZGVmaW5lIGJhc2ljIHRvb2wtdGlwIGJlaGF2aW9yLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW3Rvb2x0aXBdJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ3RleHQ6IHRvb2x0aXAnXG4gKiAgIF0sXG4gKiAgIGhvc3Q6IHtcbiAqICAgICAnKG1vdXNlZW50ZXIpJzogJ29uTW91c2VFbnRlcigpJyxcbiAqICAgICAnKG1vdXNlbGVhdmUpJzogJ29uTW91c2VMZWF2ZSgpJ1xuICogICB9XG4gKiB9KVxuICogY2xhc3MgVG9vbHRpcHtcbiAqICAgdGV4dDpzdHJpbmc7XG4gKiAgIG92ZXJsYXk6T3ZlcmxheTsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICogICBvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcjsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICpcbiAqICAgY29uc3RydWN0b3Iob3ZlcmxheU1hbmFnZXI6T3ZlcmxheU1hbmFnZXIpIHtcbiAqICAgICB0aGlzLm92ZXJsYXkgPSBvdmVybGF5O1xuICogICB9XG4gKlxuICogICBvbk1vdXNlRW50ZXIoKSB7XG4gKiAgICAgLy8gZXhhY3Qgc2lnbmF0dXJlIHRvIGJlIGRldGVybWluZWRcbiAqICAgICB0aGlzLm92ZXJsYXkgPSB0aGlzLm92ZXJsYXlNYW5hZ2VyLm9wZW4odGV4dCwgLi4uKTtcbiAqICAgfVxuICpcbiAqICAgb25Nb3VzZUxlYXZlKCkge1xuICogICAgIHRoaXMub3ZlcmxheS5jbG9zZSgpO1xuICogICAgIHRoaXMub3ZlcmxheSA9IG51bGw7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogSW4gb3VyIEhUTUwgdGVtcGxhdGUsIHdlIGNhbiB0aGVuIGFkZCB0aGlzIGJlaGF2aW9yIHRvIGEgYDxkaXY+YCBvciBhbnkgb3RoZXIgZWxlbWVudCB3aXRoIHRoZVxuICogYHRvb2x0aXBgIHNlbGVjdG9yLFxuICogbGlrZSBzbzpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgdG9vbHRpcD1cInNvbWUgdGV4dCBoZXJlXCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBhbHNvIGNvbnRyb2wgdGhlIGluc3RhbnRpYXRpb24sIGRlc3RydWN0aW9uLCBhbmQgcG9zaXRpb25pbmcgb2YgaW5saW5lIHRlbXBsYXRlXG4gKiBlbGVtZW50czpcbiAqXG4gKiBBIGRpcmVjdGl2ZSB1c2VzIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IHRvIGluc3RhbnRpYXRlLCBpbnNlcnQsIG1vdmUsIGFuZCBkZXN0cm95IHZpZXdzIGF0XG4gKiBydW50aW1lLlxuICogVGhlIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBpcyBjcmVhdGVkIGFzIGEgcmVzdWx0IG9mIGA8dGVtcGxhdGU+YCBlbGVtZW50LCBhbmQgcmVwcmVzZW50cyBhXG4gKiBsb2NhdGlvbiBpbiB0aGUgY3VycmVudCB2aWV3XG4gKiB3aGVyZSB0aGVzZSBhY3Rpb25zIGFyZSBwZXJmb3JtZWQuXG4gKlxuICogVmlld3MgYXJlIGFsd2F5cyBjcmVhdGVkIGFzIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LCBhbmQgYXMgc2libGluZ3Mgb2YgdGhlXG4gKiBgPHRlbXBsYXRlPmAgZWxlbWVudC4gVGh1cyBhXG4gKiBkaXJlY3RpdmUgaW4gYSBjaGlsZCB2aWV3IGNhbm5vdCBpbmplY3QgdGhlIGRpcmVjdGl2ZSB0aGF0IGNyZWF0ZWQgaXQuXG4gKlxuICogU2luY2UgZGlyZWN0aXZlcyB0aGF0IGNyZWF0ZSB2aWV3cyB2aWEgVmlld0NvbnRhaW5lcnMgYXJlIGNvbW1vbiBpbiBBbmd1bGFyLCBhbmQgdXNpbmcgdGhlIGZ1bGxcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50IHN5bnRheCBpcyB3b3JkeSwgQW5ndWxhclxuICogYWxzbyBzdXBwb3J0cyBhIHNob3J0aGFuZCBub3RhdGlvbjogYDxsaSAqZm9vPVwiYmFyXCI+YCBhbmQgYDxsaSB0ZW1wbGF0ZT1cImZvbzogYmFyXCI+YCBhcmVcbiAqIGVxdWl2YWxlbnQuXG4gKlxuICogVGh1cyxcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICpmb289XCJiYXJcIiB0aXRsZT1cInRleHRcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIEV4cGFuZHMgaW4gdXNlIHRvOlxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8dGVtcGxhdGUgW2Zvb109XCJiYXJcIj5cbiAqICAgICA8bGkgdGl0bGU9XCJ0ZXh0XCI+PC9saT5cbiAqICAgPC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCBhbHRob3VnaCB0aGUgc2hvcnRoYW5kIHBsYWNlcyBgKmZvbz1cImJhclwiYCB3aXRoaW4gdGhlIGA8bGk+YCBlbGVtZW50LCB0aGUgYmluZGluZyBmb3JcbiAqIHRoZSBkaXJlY3RpdmVcbiAqIGNvbnRyb2xsZXIgaXMgY29ycmVjdGx5IGluc3RhbnRpYXRlZCBvbiB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgcmF0aGVyIHRoYW4gdGhlIGA8bGk+YCBlbGVtZW50LlxuICpcbiAqICMjIExpZmVjeWNsZSBob29rc1xuICpcbiAqIFdoZW4gdGhlIGRpcmVjdGl2ZSBjbGFzcyBpbXBsZW1lbnRzIHNvbWUge0BsaW5rIGFuZ3VsYXIyL2xpZmVjeWNsZV9ob29rc30gdGhlIGNhbGxiYWNrcyBhcmVcbiAqIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogTGV0J3Mgc3VwcG9zZSB3ZSB3YW50IHRvIGltcGxlbWVudCB0aGUgYHVubGVzc2AgYmVoYXZpb3IsIHRvIGNvbmRpdGlvbmFsbHkgaW5jbHVkZSBhIHRlbXBsYXRlLlxuICpcbiAqIEhlcmUgaXMgYSBzaW1wbGUgZGlyZWN0aXZlIHRoYXQgdHJpZ2dlcnMgb24gYW4gYHVubGVzc2Agc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdW5sZXNzXScsXG4gKiAgIGlucHV0czogWyd1bmxlc3MnXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBVbmxlc3Mge1xuICogICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xuICogICB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY7XG4gKiAgIHByZXZDb25kaXRpb246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHtcbiAqICAgICB0aGlzLnZpZXdDb250YWluZXIgPSB2aWV3Q29udGFpbmVyO1xuICogICAgIHRoaXMudGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAqICAgICB0aGlzLnByZXZDb25kaXRpb24gPSBudWxsO1xuICogICB9XG4gKlxuICogICBzZXQgdW5sZXNzKG5ld0NvbmRpdGlvbikge1xuICogICAgIGlmIChuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5wcmV2Q29uZGl0aW9uKSB8fCAhdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gdHJ1ZTtcbiAqICAgICAgIHRoaXMudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICogICAgIH0gZWxzZSBpZiAoIW5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8IHRoaXMucHJldkNvbmRpdGlvbikpIHtcbiAqICAgICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IGZhbHNlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZSh0aGlzLnRlbXBsYXRlUmVmKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdlIGNhbiB0aGVuIHVzZSB0aGlzIGB1bmxlc3NgIHNlbGVjdG9yIGluIGEgdGVtcGxhdGU6XG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICp1bmxlc3M9XCJleHByXCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBPbmNlIHRoZSBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIHRoZSBjaGlsZCB2aWV3LCB0aGUgc2hvcnRoYW5kIG5vdGF0aW9uIGZvciB0aGUgdGVtcGxhdGUgZXhwYW5kc1xuICogYW5kIHRoZSByZXN1bHQgaXM6XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbdW5sZXNzXT1cImV4cFwiPlxuICogICAgIDxsaT48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogICA8bGk+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RlIGFsc28gdGhhdCBhbHRob3VnaCB0aGUgYDxsaT48L2xpPmAgdGVtcGxhdGUgc3RpbGwgZXhpc3RzIGluc2lkZSB0aGUgYDx0ZW1wbGF0ZT48L3RlbXBsYXRlPmAsXG4gKiB0aGUgaW5zdGFudGlhdGVkXG4gKiB2aWV3IG9jY3VycyBvbiB0aGUgc2Vjb25kIGA8bGk+PC9saT5gIHdoaWNoIGlzIGEgc2libGluZyB0byB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCB2YXIgRGlyZWN0aXZlOiBEaXJlY3RpdmVGYWN0b3J5ID0gPERpcmVjdGl2ZUZhY3Rvcnk+bWFrZURlY29yYXRvcihEaXJlY3RpdmVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld01ldGFkYXRhLlxuLyoqXG4gKiBNZXRhZGF0YSBwcm9wZXJ0aWVzIGF2YWlsYWJsZSBmb3IgY29uZmlndXJpbmcgVmlld3MuXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5kIGF0IGxlYXN0IG9uZSBgQFZpZXdgIGFubm90YXRpb24uIFRoZVxuICogYEBWaWV3YCBhbm5vdGF0aW9uIHNwZWNpZmllcyB0aGUgSFRNTCB0ZW1wbGF0ZSB0byB1c2UsIGFuZCBsaXN0cyB0aGUgZGlyZWN0aXZlcyB0aGF0IGFyZSBhY3RpdmVcbiAqIHdpdGhpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIHRoZSB0ZW1wbGF0ZSBpcyBsb2FkZWQgaW50byB0aGUgY29tcG9uZW50J3Mgc2hhZG93IHJvb3QsIGFuZFxuICogdGhlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGluIHRoZSB0ZW1wbGF0ZSBhcmUgZXZhbHVhdGVkIGFnYWluc3QgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiBGb3IgZGV0YWlscyBvbiB0aGUgYEBDb21wb25lbnRgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gKiAgIHRlbXBsYXRlOiAnSGVsbG8ge3tuYW1lfX0hJyxcbiAqICAgZGlyZWN0aXZlczogW0dyZWV0VXNlciwgQm9sZF1cbiAqIH0pXG4gKiBjbGFzcyBHcmVldCB7XG4gKiAgIG5hbWU6IHN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHRoaXMubmFtZSA9ICdXb3JsZCc7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG52YXIgVmlldzogVmlld0ZhY3RvcnkgPSA8Vmlld0ZhY3Rvcnk+bWFrZURlY29yYXRvcihWaWV3TWV0YWRhdGEsIChmbjogYW55KSA9PiBmbi5WaWV3ID0gVmlldyk7XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYSBjb25zdGFudCBhdHRyaWJ1dGUgdmFsdWUgc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgY2FuIGluamVjdCBjb25zdGFudCBzdHJpbmcgbGl0ZXJhbHMgb2YgaG9zdCBlbGVtZW50IGF0dHJpYnV0ZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTdXBwb3NlIHdlIGhhdmUgYW4gYDxpbnB1dD5gIGVsZW1lbnQgYW5kIHdhbnQgdG8ga25vdyBpdHMgYHR5cGVgLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxuICogYGBgXG4gKlxuICogQSBkZWNvcmF0b3IgY2FuIGluamVjdCBzdHJpbmcgbGl0ZXJhbCBgdGV4dGAgbGlrZSBzbzpcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2F0dHJpYnV0ZU1ldGFkYXRhJ31cbiAqL1xuZXhwb3J0IHZhciBBdHRyaWJ1dGU6IEF0dHJpYnV0ZUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoQXR0cmlidXRlTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFF1ZXJ5TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGFuIGluamVjdGFibGUgcGFyYW1ldGVyIHRvIGJlIGEgbGl2ZSBsaXN0IG9mIGRpcmVjdGl2ZXMgb3IgdmFyaWFibGVcbiAqIGJpbmRpbmdzIGZyb20gdGhlIGNvbnRlbnQgY2hpbGRyZW4gb2YgYSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2xZOW04SEx5N3owNnZEb1VhU04yP3A9cHJldmlldykpXG4gKlxuICogQXNzdW1lIHRoYXQgYDx0YWJzPmAgY29tcG9uZW50IHdvdWxkIGxpa2UgdG8gZ2V0IGEgbGlzdCBpdHMgY2hpbGRyZW4gYDxwYW5lPmBcbiAqIGNvbXBvbmVudHMgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDx0YWJzPlxuICogICA8cGFuZSB0aXRsZT1cIk92ZXJ2aWV3XCI+Li4uPC9wYW5lPlxuICogICA8cGFuZSAqbmdGb3I9XCIjbyBvZiBvYmplY3RzXCIgW3RpdGxlXT1cIm8udGl0bGVcIj57e28udGV4dH19PC9wYW5lPlxuICogPC90YWJzPlxuICogYGBgXG4gKlxuICogVGhlIHByZWZlcnJlZCBzb2x1dGlvbiBpcyB0byBxdWVyeSBmb3IgYFBhbmVgIGRpcmVjdGl2ZXMgdXNpbmcgdGhpcyBkZWNvcmF0b3IuXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFuZScsXG4gKiAgIGlucHV0czogWyd0aXRsZSddXG4gKiB9KVxuICogY2xhc3MgUGFuZSB7XG4gKiAgIHRpdGxlOnN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ3RhYnMnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8dWw+XG4gKiAgICAgIDxsaSAqbmdGb3I9XCIjcGFuZSBvZiBwYW5lc1wiPnt7cGFuZS50aXRsZX19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gKiAgYFxuICogfSlcbiAqIGNsYXNzIFRhYnMge1xuICogICBwYW5lczogUXVlcnlMaXN0PFBhbmU+O1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoUGFuZSkgcGFuZXM6UXVlcnlMaXN0PFBhbmU+KSB7XG4gKiAgICAgdGhpcy5wYW5lcyA9IHBhbmVzO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIHF1ZXJ5IGNhbiBsb29rIGZvciB2YXJpYWJsZSBiaW5kaW5ncyBieSBwYXNzaW5nIGluIGEgc3RyaW5nIHdpdGggZGVzaXJlZCBiaW5kaW5nIHN5bWJvbC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc1QyajI1Y0gxZFVSQXlCUkNLeDE/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRtZT4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqIEBDb21wb25lbnQoeyBzZWxlY3RvcjogJ3NlZWtlcicgfSlcbiAqIGNsYXNzIHNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZG1lJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGNhc2UgdGhlIG9iamVjdCB0aGF0IGlzIGluamVjdGVkIGRlcGVuZCBvbiB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGVcbiAqIGJpbmRpbmcuIEl0IGNhbiBiZSBhbiBFbGVtZW50UmVmLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudC5cbiAqXG4gKiBQYXNzaW5nIGluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3Mgd2lsbCBxdWVyeSBmb3IgYWxsIG9mIHRoZW0uXG4gKlxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZE1lPi4uLjwvZGl2PlxuICogICA8ZGl2ICNmaW5kTWVUb28+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiAgQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc2Vla2VyJ1xuICogfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZE1lLCBmaW5kTWVUb28nKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIENvbmZpZ3VyZSB3aGV0aGVyIHF1ZXJ5IGxvb2tzIGZvciBkaXJlY3QgY2hpbGRyZW4gb3IgYWxsIGRlc2NlbmRhbnRzXG4gKiBvZiB0aGUgcXVlcnlpbmcgZWxlbWVudCwgYnkgdXNpbmcgdGhlIGBkZXNjZW5kYW50c2AgcGFyYW1ldGVyLlxuICogSXQgaXMgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvd3RHZUI5NzdidjdxdkE1RlRZbDk/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxjb250YWluZXIgI2ZpcnN0PlxuICogICA8aXRlbT5hPC9pdGVtPlxuICogICA8aXRlbT5iPC9pdGVtPlxuICogICA8Y29udGFpbmVyICNzZWNvbmQ+XG4gKiAgICAgPGl0ZW0+YzwvaXRlbT5cbiAqICAgPC9jb250YWluZXI+XG4gKiA8L2NvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFdoZW4gcXVlcnlpbmcgZm9yIGl0ZW1zLCB0aGUgZmlyc3QgY29udGFpbmVyIHdpbGwgc2VlIG9ubHkgYGFgIGFuZCBgYmAgYnkgZGVmYXVsdCxcbiAqIGJ1dCB3aXRoIGBRdWVyeShUZXh0RGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KWAgaXQgd2lsbCBzZWUgYGNgIHRvby5cbiAqXG4gKiBUaGUgcXVlcmllZCBkaXJlY3RpdmVzIGFyZSBrZXB0IGluIGEgZGVwdGgtZmlyc3QgcHJlLW9yZGVyIHdpdGggcmVzcGVjdCB0byB0aGVpclxuICogcG9zaXRpb25zIGluIHRoZSBET00uXG4gKlxuICogUXVlcnkgZG9lcyBub3QgbG9vayBkZWVwIGludG8gYW55IHN1YmNvbXBvbmVudCB2aWV3cy5cbiAqXG4gKiBRdWVyeSBpcyB1cGRhdGVkIGFzIHBhcnQgb2YgdGhlIGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUuIFNpbmNlIGNoYW5nZSBkZXRlY3Rpb25cbiAqIGhhcHBlbnMgYWZ0ZXIgY29uc3RydWN0aW9uIG9mIGEgZGlyZWN0aXZlLCBRdWVyeUxpc3Qgd2lsbCBhbHdheXMgYmUgZW1wdHkgd2hlbiBvYnNlcnZlZCBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gdW5tb2RpZmlhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgdmFyIFF1ZXJ5OiBRdWVyeUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoUXVlcnlNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29udGVudENoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBDb250ZW50Q2hpbGRyZW46IENvbnRlbnRDaGlsZHJlbkZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29udGVudENoaWxkTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGQ7XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBDb250ZW50Q2hpbGQ6IENvbnRlbnRDaGlsZEZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihDb250ZW50Q2hpbGRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld0NoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgbGlzdCBvZiBjaGlsZCBlbGVtZW50IHJlZmVyZW5jZXMuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgdGhlIGxpc3Qgd2hlbiB0aGUgRE9NIGlzIHVwZGF0ZWQuXG4gKlxuICogYFZpZXdDaGlsZHJlbmAgdGFrZXMgYSBhcmd1bWVudCB0byBzZWxlY3QgZWxlbWVudHMuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSB0eXBlLCBkaXJlY3RpdmVzIG9yIGNvbXBvbmVudHMgd2l0aCB0aGUgdHlwZSB3aWxsIGJlIGJvdW5kLlxuICpcbiAqIC0gSWYgdGhlIGFyZ3VtZW50IGlzIGEgc3RyaW5nLCB0aGUgc3RyaW5nIGlzIGludGVycHJldGVkIGFzIGEgbGlzdCBvZiBjb21tYS1zZXBhcmF0ZWQgc2VsZWN0b3JzLlxuICogRm9yIGVhY2ggc2VsZWN0b3IsIGFuIGVsZW1lbnQgY29udGFpbmluZyB0aGUgbWF0Y2hpbmcgdGVtcGxhdGUgdmFyaWFibGUgKGUuZy4gYCNjaGlsZGApIHdpbGwgYmVcbiAqIGJvdW5kLlxuICpcbiAqIFZpZXcgY2hpbGRyZW4gYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFdpdGggdHlwZSBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Y2hpbGQtY21wPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+XG4gKiAgICAgPGNoaWxkLWNtcD48L2NoaWxkLWNtcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkcmVuKENoaWxkQ21wKSBjaGlsZHJlbjpRdWVyeUxpc3Q8Q2hpbGRDbXA+O1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkcmVuIGFyZSBzZXRcbiAqICAgICB0aGlzLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKChjaGlsZCk9PmNoaWxkLmRvU29tZXRoaW5nKCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaXRoIHN0cmluZyBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Y2hpbGQtY21wICNjaGlsZDE+PC9jaGlsZC1jbXA+XG4gKiAgICAgPGNoaWxkLWNtcCAjY2hpbGQyPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXAgI2NoaWxkMz48L2NoaWxkLWNtcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkcmVuKCdjaGlsZDEsY2hpbGQyLGNoaWxkMycpIGNoaWxkcmVuOlF1ZXJ5TGlzdDxDaGlsZENtcD47XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gY2hpbGRyZW4gYXJlIHNldFxuICogICAgIHRoaXMuY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goKGNoaWxkKT0+Y2hpbGQuZG9Tb21ldGhpbmcoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFNlZSBhbHNvOiBbVmlld0NoaWxkcmVuTWV0YWRhdGFdXG4gKi9cbmV4cG9ydCB2YXIgVmlld0NoaWxkcmVuOiBWaWV3Q2hpbGRyZW5GYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoVmlld0NoaWxkcmVuTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdDaGlsZE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIHJlZmVyZW5jZSB0byBhIGNoaWxkIGVsZW1lbnQuXG4gKlxuICogYFZpZXdDaGlsZHJlbmAgdGFrZXMgYSBhcmd1bWVudCB0byBzZWxlY3QgZWxlbWVudHMuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSB0eXBlLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudCB3aXRoIHRoZSB0eXBlIHdpbGwgYmUgYm91bmQuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSBzdHJpbmcsIHRoZSBzdHJpbmcgaXMgaW50ZXJwcmV0ZWQgYXMgYSBzZWxlY3Rvci4gQW4gZWxlbWVudCBjb250YWluaW5nIHRoZVxuICogbWF0Y2hpbmcgdGVtcGxhdGUgdmFyaWFibGUgKGUuZy4gYCNjaGlsZGApIHdpbGwgYmUgYm91bmQuXG4gKlxuICogSW4gZWl0aGVyIGNhc2UsIGBAVmlld0NoaWxkKClgIGFzc2lnbnMgdGhlIGZpcnN0IChsb29raW5nIGZyb20gYWJvdmUpIGVsZW1lbnQgaWYgdGhlcmUgYXJlXG4gKiBtdWx0aXBsZSBtYXRjaGVzLlxuICpcbiAqIFZpZXcgY2hpbGQgaXMgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJWaWV3SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogV2l0aCB0eXBlIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8cD5jaGlsZDwvcD4nXG4gKiB9KVxuICogY2xhc3MgQ2hpbGRDbXAge1xuICogICBkb1NvbWV0aGluZygpIHt9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZS1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+JyxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkKENoaWxkQ21wKSBjaGlsZDpDaGlsZENtcDtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZCBpcyBzZXRcbiAqICAgICB0aGlzLmNoaWxkLmRvU29tZXRoaW5nKCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdpdGggc3RyaW5nIHNlbGVjdG9yOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtY21wJyxcbiAqICAgdGVtcGxhdGU6ICc8cD5jaGlsZDwvcD4nXG4gKiB9KVxuICogY2xhc3MgQ2hpbGRDbXAge1xuICogICBkb1NvbWV0aGluZygpIHt9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZS1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxjaGlsZC1jbXAgI2NoaWxkPjwvY2hpbGQtY21wPicsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZENtcF1cbiAqIH0pXG4gKiBjbGFzcyBTb21lQ21wIHtcbiAqICAgQFZpZXdDaGlsZCgnY2hpbGQnKSBjaGlsZDpDaGlsZENtcDtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyBjaGlsZCBpcyBzZXRcbiAqICAgICB0aGlzLmNoaWxkLmRvU29tZXRoaW5nKCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogU2VlIGFsc286IFtWaWV3Q2hpbGRNZXRhZGF0YV1cbiAqL1xuZXhwb3J0IHZhciBWaWV3Q2hpbGQ6IFZpZXdDaGlsZEZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihWaWV3Q2hpbGRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld1F1ZXJ5TWV0YWRhdGEuXG4vKipcbiAqIFNpbWlsYXIgdG8ge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LCBidXQgcXVlcnlpbmcgdGhlIGNvbXBvbmVudCB2aWV3LCBpbnN0ZWFkIG9mXG4gKiB0aGUgY29udGVudCBjaGlsZHJlbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZU5zRkhEZjdZanlNNkl6S3hNMWo/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgLi4uLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxpdGVtPiBhIDwvaXRlbT5cbiAqICAgICA8aXRlbT4gYiA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGMgPC9pdGVtPlxuICogICBgXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBzaG93bjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgQFF1ZXJ5KEl0ZW0pIGl0ZW1zOlF1ZXJ5TGlzdDxJdGVtPikge1xuICogICAgIGl0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IGNvbnNvbGUubG9nKGl0ZW1zLmxlbmd0aCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBTdXBwb3J0cyB0aGUgc2FtZSBxdWVyeWluZyBwYXJhbWV0ZXJzIGFzIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgZXhjZXB0XG4gKiBgZGVzY2VuZGFudHNgLiBUaGlzIGFsd2F5cyBxdWVyaWVzIHRoZSB3aG9sZSB2aWV3LlxuICpcbiAqIEFzIGBzaG93bmAgaXMgZmxpcHBlZCBiZXR3ZWVuIHRydWUgYW5kIGZhbHNlLCBpdGVtcyB3aWxsIGNvbnRhaW4gemVybyBvZiBvbmVcbiAqIGl0ZW1zLlxuICpcbiAqIFNwZWNpZmllcyB0aGF0IGEge0BsaW5rIFF1ZXJ5TGlzdH0gc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gaXRlcmFibGUgYW5kIG9ic2VydmFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmV4cG9ydCB2YXIgVmlld1F1ZXJ5OiBRdWVyeUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoVmlld1F1ZXJ5TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFBpcGVNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZSByZXVzYWJsZSBwaXBlIGZ1bmN0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdwaXBlJ31cbiAqL1xuZXhwb3J0IHZhciBQaXBlOiBQaXBlRmFjdG9yeSA9IDxQaXBlRmFjdG9yeT5tYWtlRGVjb3JhdG9yKFBpcGVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gSW5wdXRNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBkYXRhLWJvdW5kIGlucHV0IHByb3BlcnR5LlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSB1cGRhdGVzIGRhdGEtYm91bmQgcHJvcGVydGllcyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqXG4gKiBgSW5wdXRNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lXG4gKiB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIG5hbWUgb2YgdGhlIGRlY29yYXRlZCBwcm9wZXJ0eSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBjb21wb25lbnQgd2l0aCB0d28gaW5wdXQgcHJvcGVydGllcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdiYW5rLWFjY291bnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIEJhbmsgTmFtZToge3tiYW5rTmFtZX19XG4gKiAgICAgQWNjb3VudCBJZDoge3tpZH19XG4gKiAgIGBcbiAqIH0pXG4gKiBjbGFzcyBCYW5rQWNjb3VudCB7XG4gKiAgIEBJbnB1dCgpIGJhbmtOYW1lOiBzdHJpbmc7XG4gKiAgIEBJbnB1dCgnYWNjb3VudC1pZCcpIGlkOiBzdHJpbmc7XG4gKlxuICogICAvLyB0aGlzIHByb3BlcnR5IGlzIG5vdCBib3VuZCwgYW5kIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCBieSBBbmd1bGFyXG4gKiAgIG5vcm1hbGl6ZWRCYW5rTmFtZTogc3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGJhbmstYWNjb3VudCBiYW5rLW5hbWU9XCJSQkNcIiBhY2NvdW50LWlkPVwiNDc0N1wiPjwvYmFuay1hY2NvdW50PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbQmFua0FjY291bnRdXG4gKiB9KVxuICogY2xhc3MgQXBwIHt9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBJbnB1dDogSW5wdXRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSW5wdXRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gT3V0cHV0TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGFuIGV2ZW50LWJvdW5kIG91dHB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBXaGVuIGFuIG91dHB1dCBwcm9wZXJ0eSBlbWl0cyBhbiBldmVudCwgYW4gZXZlbnQgaGFuZGxlciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50XG4gKiB0aGUgdGVtcGxhdGUgaXMgaW52b2tlZC5cbiAqXG4gKiBgT3V0cHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ2ludGVydmFsLWRpcicsXG4gKiB9KVxuICogY2xhc3MgSW50ZXJ2YWxEaXIge1xuICogICBAT3V0cHV0KCkgZXZlcnlTZWNvbmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKiAgIEBPdXRwdXQoJ2V2ZXJ5Rml2ZVNlY29uZHMnKSBmaXZlNVNlY3MgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmV2ZXJ5U2Vjb25kLmVtaXQoXCJldmVudFwiKSwgMTAwMCk7XG4gKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5maXZlNVNlY3MuZW1pdChcImV2ZW50XCIpLCA1MDAwKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGludGVydmFsLWRpciAoZXZlcnlTZWNvbmQpPVwiZXZlcnlTZWNvbmQoKVwiIChldmVyeUZpdmVTZWNvbmRzKT1cImV2ZXJ5Rml2ZVNlY29uZHMoKVwiPlxuICogICAgIDwvaW50ZXJ2YWwtZGlyPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbSW50ZXJ2YWxEaXJdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgZXZlcnlTZWNvbmQoKSB7IGNvbnNvbGUubG9nKCdzZWNvbmQnKTsgfVxuICogICBldmVyeUZpdmVTZWNvbmRzKCkgeyBjb25zb2xlLmxvZygnZml2ZSBzZWNvbmRzJyk7IH1cbiAqIH1cbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgT3V0cHV0OiBPdXRwdXRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoT3V0cHV0TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIEhvc3RCaW5kaW5nTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBwcm9wZXJ0eSBiaW5kaW5nLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBjaGVja3MgaG9zdCBwcm9wZXJ0eSBiaW5kaW5ncyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqIElmIGEgYmluZGluZyBjaGFuZ2VzLCBpdCB3aWxsIHVwZGF0ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogYEhvc3RCaW5kaW5nTWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgcHJvcGVydHlcbiAqIG5hbWUgb2YgdGhlIGhvc3QgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBkYXRlZC4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgY2xhc3MgcHJvcGVydHkgbmFtZSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBkaXJlY3RpdmUgdGhhdCBzZXRzIHRoZSBgdmFsaWRgIGFuZCBgaW52YWxpZGAgY2xhc3Nlc1xuICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nTW9kZWwgZGlyZWN0aXZlIG9uIGl0LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nTW9kZWxdJ30pXG4gKiBjbGFzcyBOZ01vZGVsU3RhdHVzIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIGNvbnRyb2w6TmdNb2RlbCkge31cbiAqICAgQEhvc3RCaW5kaW5nKCdbY2xhc3MudmFsaWRdJykgZ2V0IHZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC52YWxpZDsgfVxuICogICBASG9zdEJpbmRpbmcoJ1tjbGFzcy5pbnZhbGlkXScpIGdldCBpbnZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC5pbnZhbGlkOyB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8aW5wdXQgWyhuZ01vZGVsKV09XCJwcm9wXCI+YCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFUywgTmdNb2RlbFN0YXR1c11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBwcm9wO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSG9zdEJpbmRpbmc6IEhvc3RCaW5kaW5nRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKEhvc3RCaW5kaW5nTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIEhvc3RMaXN0ZW5lck1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGhvc3QgbGlzdGVuZXIuXG4gKlxuICogQW5ndWxhciB3aWxsIGludm9rZSB0aGUgZGVjb3JhdGVkIG1ldGhvZCB3aGVuIHRoZSBob3N0IGVsZW1lbnQgZW1pdHMgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBJZiB0aGUgZGVjb3JhdGVkIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAsIHRoZW4gYHByZXZlbnREZWZhdWx0YCBpcyBhcHBsaWVkIG9uIHRoZSBET01cbiAqIGV2ZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlY2xhcmVzIGEgZGlyZWN0aXZlIHRoYXQgYXR0YWNoZXMgYSBjbGljayBsaXN0ZW5lciB0byB0aGUgYnV0dG9uIGFuZFxuICogY291bnRzIGNsaWNrcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2J1dHRvbltjb3VudGluZ10nfSlcbiAqIGNsYXNzIENvdW50Q2xpY2tzIHtcbiAqICAgbnVtYmVyT2ZDbGlja3MgPSAwO1xuICpcbiAqICAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudC50YXJnZXQnXSlcbiAqICAgb25DbGljayhidG4pIHtcbiAqICAgICBjb25zb2xlLmxvZyhcImJ1dHRvblwiLCBidG4sIFwibnVtYmVyIG9mIGNsaWNrczpcIiwgdGhpcy5udW1iZXJPZkNsaWNrcysrKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjb3VudGluZz5JbmNyZW1lbnQ8L2J1dHRvbj5gLFxuICogICBkaXJlY3RpdmVzOiBbQ291bnRDbGlja3NdXG4gKiB9KVxuICogY2xhc3MgQXBwIHt9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBIb3N0TGlzdGVuZXI6IEhvc3RMaXN0ZW5lckZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihIb3N0TGlzdGVuZXJNZXRhZGF0YSk7XG4iXX0=