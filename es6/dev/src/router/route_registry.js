var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ListWrapper, Map, StringMapWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { isPresent, isArray, isBlank, isType, isString, isStringMap, Type, StringWrapper, Math, getTypeNameForDebugging, CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Injectable, Inject, OpaqueToken } from 'angular2/core';
import { RouteConfig, Route, AuxRoute } from './route_config/route_config_impl';
import { PathMatch, RedirectMatch } from './rules/rules';
import { RuleSet } from './rules/rule_set';
import { ResolvedInstruction, RedirectInstruction, UnresolvedInstruction, DefaultInstruction } from './instruction';
import { normalizeRouteConfig, assertComponentExists } from './route_config/route_config_normalizer';
import { parser, convertUrlParamsToArray } from './url_parser';
var _resolveToNull = PromiseWrapper.resolve(null);
// A LinkItemArray is an array, which describes a set of routes
// The items in the array are found in groups:
// - the first item is the name of the route
// - the next items are:
//   - an object containing parameters
//   - or an array describing an aux route
// export type LinkRouteItem = string | Object;
// export type LinkItem = LinkRouteItem | Array<LinkRouteItem>;
// export type LinkItemArray = Array<LinkItem>;
/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
export const ROUTER_PRIMARY_COMPONENT = CONST_EXPR(new OpaqueToken('RouterPrimaryComponent'));
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
export let RouteRegistry = class {
    constructor(_rootComponent) {
        this._rootComponent = _rootComponent;
        this._rules = new Map();
    }
    /**
     * Given a component and a configuration object, add the route to this registry
     */
    config(parentComponent, config) {
        config = normalizeRouteConfig(config, this);
        // this is here because Dart type guard reasons
        if (config instanceof Route) {
            assertComponentExists(config.component, config.path);
        }
        else if (config instanceof AuxRoute) {
            assertComponentExists(config.component, config.path);
        }
        var rules = this._rules.get(parentComponent);
        if (isBlank(rules)) {
            rules = new RuleSet();
            this._rules.set(parentComponent, rules);
        }
        var terminal = rules.config(config);
        if (config instanceof Route) {
            if (terminal) {
                assertTerminalComponent(config.component, config.path);
            }
            else {
                this.configFromComponent(config.component);
            }
        }
    }
    /**
     * Reads the annotations of a component and configures the registry based on them
     */
    configFromComponent(component) {
        if (!isType(component)) {
            return;
        }
        // Don't read the annotations from a type more than once –
        // this prevents an infinite loop if a component routes recursively.
        if (this._rules.has(component)) {
            return;
        }
        var annotations = reflector.annotations(component);
        if (isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof RouteConfig) {
                    let routeCfgs = annotation.configs;
                    routeCfgs.forEach(config => this.config(component, config));
                }
            }
        }
    }
    /**
     * Given a URL and a parent component, return the most specific instruction for navigating
     * the application into the state specified by the url
     */
    recognize(url, ancestorInstructions) {
        var parsedUrl = parser.parse(url);
        return this._recognize(parsedUrl, []);
    }
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    _recognize(parsedUrl, ancestorInstructions, _aux = false) {
        var parentInstruction = ListWrapper.last(ancestorInstructions);
        var parentComponent = isPresent(parentInstruction) ? parentInstruction.component.componentType :
            this._rootComponent;
        var rules = this._rules.get(parentComponent);
        if (isBlank(rules)) {
            return _resolveToNull;
        }
        // Matches some beginning part of the given URL
        var possibleMatches = _aux ? rules.recognizeAuxiliary(parsedUrl) : rules.recognize(parsedUrl);
        var matchPromises = possibleMatches.map((candidate) => candidate.then((candidate) => {
            if (candidate instanceof PathMatch) {
                var auxParentInstructions = ancestorInstructions.length > 0 ? [ListWrapper.last(ancestorInstructions)] : [];
                var auxInstructions = this._auxRoutesToUnresolved(candidate.remainingAux, auxParentInstructions);
                var instruction = new ResolvedInstruction(candidate.instruction, null, auxInstructions);
                if (isBlank(candidate.instruction) || candidate.instruction.terminal) {
                    return instruction;
                }
                var newAncestorInstructions = ancestorInstructions.concat([instruction]);
                return this._recognize(candidate.remaining, newAncestorInstructions)
                    .then((childInstruction) => {
                    if (isBlank(childInstruction)) {
                        return null;
                    }
                    // redirect instructions are already absolute
                    if (childInstruction instanceof RedirectInstruction) {
                        return childInstruction;
                    }
                    instruction.child = childInstruction;
                    return instruction;
                });
            }
            if (candidate instanceof RedirectMatch) {
                var instruction = this.generate(candidate.redirectTo, ancestorInstructions.concat([null]));
                return new RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction, candidate.specificity);
            }
        }));
        if ((isBlank(parsedUrl) || parsedUrl.path == '') && possibleMatches.length == 0) {
            return PromiseWrapper.resolve(this.generateDefault(parentComponent));
        }
        return PromiseWrapper.all(matchPromises).then(mostSpecific);
    }
    _auxRoutesToUnresolved(auxRoutes, parentInstructions) {
        var unresolvedAuxInstructions = {};
        auxRoutes.forEach((auxUrl) => {
            unresolvedAuxInstructions[auxUrl.path] = new UnresolvedInstruction(() => { return this._recognize(auxUrl, parentInstructions, true); });
        });
        return unresolvedAuxInstructions;
    }
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     *
     * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
     * route boundary.
     */
    generate(linkParams, ancestorInstructions, _aux = false) {
        var params = splitAndFlattenLinkParams(linkParams);
        var prevInstruction;
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (ListWrapper.first(params) == '') {
            params.shift();
            prevInstruction = ListWrapper.first(ancestorInstructions);
            ancestorInstructions = [];
        }
        else {
            prevInstruction = ancestorInstructions.length > 0 ? ancestorInstructions.pop() : null;
            if (ListWrapper.first(params) == '.') {
                params.shift();
            }
            else if (ListWrapper.first(params) == '..') {
                while (ListWrapper.first(params) == '..') {
                    if (ancestorInstructions.length <= 0) {
                        throw new BaseException(`Link "${ListWrapper.toJSON(linkParams)}" has too many "../" segments.`);
                    }
                    prevInstruction = ancestorInstructions.pop();
                    params = ListWrapper.slice(params, 1);
                }
            }
            else {
                // we must only peak at the link param, and not consume it
                let routeName = ListWrapper.first(params);
                let parentComponentType = this._rootComponent;
                let grandparentComponentType = null;
                if (ancestorInstructions.length > 1) {
                    let parentComponentInstruction = ancestorInstructions[ancestorInstructions.length - 1];
                    let grandComponentInstruction = ancestorInstructions[ancestorInstructions.length - 2];
                    parentComponentType = parentComponentInstruction.component.componentType;
                    grandparentComponentType = grandComponentInstruction.component.componentType;
                }
                else if (ancestorInstructions.length == 1) {
                    parentComponentType = ancestorInstructions[0].component.componentType;
                    grandparentComponentType = this._rootComponent;
                }
                // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.
                // If both exist, we throw. Otherwise, we prefer whichever exists.
                var childRouteExists = this.hasRoute(routeName, parentComponentType);
                var parentRouteExists = isPresent(grandparentComponentType) &&
                    this.hasRoute(routeName, grandparentComponentType);
                if (parentRouteExists && childRouteExists) {
                    let msg = `Link "${ListWrapper.toJSON(linkParams)}" is ambiguous, use "./" or "../" to disambiguate.`;
                    throw new BaseException(msg);
                }
                if (parentRouteExists) {
                    prevInstruction = ancestorInstructions.pop();
                }
            }
        }
        if (params[params.length - 1] == '') {
            params.pop();
        }
        if (params.length > 0 && params[0] == '') {
            params.shift();
        }
        if (params.length < 1) {
            let msg = `Link "${ListWrapper.toJSON(linkParams)}" must include a route name.`;
            throw new BaseException(msg);
        }
        var generatedInstruction = this._generate(params, ancestorInstructions, prevInstruction, _aux, linkParams);
        // we don't clone the first (root) element
        for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
            let ancestorInstruction = ancestorInstructions[i];
            if (isBlank(ancestorInstruction)) {
                break;
            }
            generatedInstruction = ancestorInstruction.replaceChild(generatedInstruction);
        }
        return generatedInstruction;
    }
    /*
     * Internal helper that does not make any assertions about the beginning of the link DSL.
     * `ancestorInstructions` are parents that will be cloned.
     * `prevInstruction` is the existing instruction that would be replaced, but which might have
     * aux routes that need to be cloned.
     */
    _generate(linkParams, ancestorInstructions, prevInstruction, _aux = false, _originalLink) {
        let parentComponentType = this._rootComponent;
        let componentInstruction = null;
        let auxInstructions = {};
        let parentInstruction = ListWrapper.last(ancestorInstructions);
        if (isPresent(parentInstruction) && isPresent(parentInstruction.component)) {
            parentComponentType = parentInstruction.component.componentType;
        }
        if (linkParams.length == 0) {
            let defaultInstruction = this.generateDefault(parentComponentType);
            if (isBlank(defaultInstruction)) {
                throw new BaseException(`Link "${ListWrapper.toJSON(_originalLink)}" does not resolve to a terminal instruction.`);
            }
            return defaultInstruction;
        }
        // for non-aux routes, we want to reuse the predecessor's existing primary and aux routes
        // and only override routes for which the given link DSL provides
        if (isPresent(prevInstruction) && !_aux) {
            auxInstructions = StringMapWrapper.merge(prevInstruction.auxInstruction, auxInstructions);
            componentInstruction = prevInstruction.component;
        }
        var rules = this._rules.get(parentComponentType);
        if (isBlank(rules)) {
            throw new BaseException(`Component "${getTypeNameForDebugging(parentComponentType)}" has no route config.`);
        }
        let linkParamIndex = 0;
        let routeParams = {};
        // first, recognize the primary route if one is provided
        if (linkParamIndex < linkParams.length && isString(linkParams[linkParamIndex])) {
            let routeName = linkParams[linkParamIndex];
            if (routeName == '' || routeName == '.' || routeName == '..') {
                throw new BaseException(`"${routeName}/" is only allowed at the beginning of a link DSL.`);
            }
            linkParamIndex += 1;
            if (linkParamIndex < linkParams.length) {
                let linkParam = linkParams[linkParamIndex];
                if (isStringMap(linkParam) && !isArray(linkParam)) {
                    routeParams = linkParam;
                    linkParamIndex += 1;
                }
            }
            var routeRecognizer = (_aux ? rules.auxRulesByName : rules.rulesByName).get(routeName);
            if (isBlank(routeRecognizer)) {
                throw new BaseException(`Component "${getTypeNameForDebugging(parentComponentType)}" has no route named "${routeName}".`);
            }
            // Create an "unresolved instruction" for async routes
            // we'll figure out the rest of the route when we resolve the instruction and
            // perform a navigation
            if (isBlank(routeRecognizer.handler.componentType)) {
                var generatedUrl = routeRecognizer.generateComponentPathValues(routeParams);
                return new UnresolvedInstruction(() => {
                    return routeRecognizer.handler.resolveComponentType().then((_) => {
                        return this._generate(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink);
                    });
                }, generatedUrl.urlPath, convertUrlParamsToArray(generatedUrl.urlParams));
            }
            componentInstruction = _aux ? rules.generateAuxiliary(routeName, routeParams) :
                rules.generate(routeName, routeParams);
        }
        // Next, recognize auxiliary instructions.
        // If we have an ancestor instruction, we preserve whatever aux routes are active from it.
        while (linkParamIndex < linkParams.length && isArray(linkParams[linkParamIndex])) {
            let auxParentInstruction = [parentInstruction];
            let auxInstruction = this._generate(linkParams[linkParamIndex], auxParentInstruction, null, true, _originalLink);
            // TODO: this will not work for aux routes with parameters or multiple segments
            auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
            linkParamIndex += 1;
        }
        var instruction = new ResolvedInstruction(componentInstruction, null, auxInstructions);
        // If the component is sync, we can generate resolved child route instructions
        // If not, we'll resolve the instructions at navigation time
        if (isPresent(componentInstruction) && isPresent(componentInstruction.componentType)) {
            let childInstruction = null;
            if (componentInstruction.terminal) {
                if (linkParamIndex >= linkParams.length) {
                }
            }
            else {
                let childAncestorComponents = ancestorInstructions.concat([instruction]);
                let remainingLinkParams = linkParams.slice(linkParamIndex);
                childInstruction = this._generate(remainingLinkParams, childAncestorComponents, null, false, _originalLink);
            }
            instruction.child = childInstruction;
        }
        return instruction;
    }
    hasRoute(name, parentComponent) {
        var rules = this._rules.get(parentComponent);
        if (isBlank(rules)) {
            return false;
        }
        return rules.hasRoute(name);
    }
    generateDefault(componentCursor) {
        if (isBlank(componentCursor)) {
            return null;
        }
        var rules = this._rules.get(componentCursor);
        if (isBlank(rules) || isBlank(rules.defaultRule)) {
            return null;
        }
        var defaultChild = null;
        if (isPresent(rules.defaultRule.handler.componentType)) {
            var componentInstruction = rules.defaultRule.generate({});
            if (!rules.defaultRule.terminal) {
                defaultChild = this.generateDefault(rules.defaultRule.handler.componentType);
            }
            return new DefaultInstruction(componentInstruction, defaultChild);
        }
        return new UnresolvedInstruction(() => {
            return rules.defaultRule.handler.resolveComponentType().then((_) => this.generateDefault(componentCursor));
        });
    }
};
RouteRegistry = __decorate([
    Injectable(),
    __param(0, Inject(ROUTER_PRIMARY_COMPONENT)), 
    __metadata('design:paramtypes', [Type])
], RouteRegistry);
/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
function splitAndFlattenLinkParams(linkParams) {
    var accumulation = [];
    linkParams.forEach(function (item) {
        if (isString(item)) {
            var strItem = item;
            accumulation = accumulation.concat(strItem.split('/'));
        }
        else {
            accumulation.push(item);
        }
    });
    return accumulation;
}
/*
 * Given a list of instructions, returns the most specific instruction
 */
function mostSpecific(instructions) {
    instructions = instructions.filter((instruction) => isPresent(instruction));
    if (instructions.length == 0) {
        return null;
    }
    if (instructions.length == 1) {
        return instructions[0];
    }
    var first = instructions[0];
    var rest = instructions.slice(1);
    return rest.reduce((instruction, contender) => {
        if (compareSpecificityStrings(contender.specificity, instruction.specificity) == -1) {
            return contender;
        }
        return instruction;
    }, first);
}
/*
 * Expects strings to be in the form of "[0-2]+"
 * Returns -1 if string A should be sorted above string B, 1 if it should be sorted after,
 * or 0 if they are the same.
 */
function compareSpecificityStrings(a, b) {
    var l = Math.min(a.length, b.length);
    for (var i = 0; i < l; i += 1) {
        var ai = StringWrapper.charCodeAt(a, i);
        var bi = StringWrapper.charCodeAt(b, i);
        var difference = bi - ai;
        if (difference != 0) {
            return difference;
        }
    }
    return a.length - b.length;
}
function assertTerminalComponent(component, path) {
    if (!isType(component)) {
        return;
    }
    var annotations = reflector.annotations(component);
    if (isPresent(annotations)) {
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof RouteConfig) {
                throw new BaseException(`Child routes are not allowed for "${path}". Use "..." on the parent's route path.`);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVZ2aXBDQlVQLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbIlJvdXRlUmVnaXN0cnkiLCJSb3V0ZVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUm91dGVSZWdpc3RyeS5jb25maWciLCJSb3V0ZVJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQiLCJSb3V0ZVJlZ2lzdHJ5LnJlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX3JlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZCIsIlJvdXRlUmVnaXN0cnkuZ2VuZXJhdGUiLCJSb3V0ZVJlZ2lzdHJ5Ll9nZW5lcmF0ZSIsIlJvdXRlUmVnaXN0cnkuaGFzUm91dGUiLCJSb3V0ZVJlZ2lzdHJ5LmdlbmVyYXRlRGVmYXVsdCIsInNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMiLCJtb3N0U3BlY2lmaWMiLCJjb21wYXJlU3BlY2lmaWNpdHlTdHJpbmdzIiwiYXNzZXJ0VGVybWluYWxDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsV0FBVyxFQUFFLEdBQUcsRUFBYyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUN0RixFQUFDLGNBQWMsRUFBQyxNQUFNLDJCQUEyQjtPQUNqRCxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1SixFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxTQUFTLEVBQUMsTUFBTSx5Q0FBeUM7T0FDMUQsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWU7T0FFdEQsRUFBQyxXQUFXLEVBQWMsS0FBSyxFQUFFLFFBQVEsRUFBNEIsTUFBTSxrQ0FBa0M7T0FDN0csRUFBQyxTQUFTLEVBQUUsYUFBYSxFQUFhLE1BQU0sZUFBZTtPQUMzRCxFQUFDLE9BQU8sRUFBQyxNQUFNLGtCQUFrQjtPQUNqQyxFQUFjLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sZUFBZTtPQUV2SCxFQUFDLG9CQUFvQixFQUFFLHFCQUFxQixFQUFDLE1BQU0sd0NBQXdDO09BQzNGLEVBQUMsTUFBTSxFQUFPLHVCQUF1QixFQUFvQixNQUFNLGNBQWM7QUFHcEYsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBYyxJQUFJLENBQUMsQ0FBQztBQUUvRCwrREFBK0Q7QUFDL0QsOENBQThDO0FBQzlDLDRDQUE0QztBQUM1Qyx3QkFBd0I7QUFDeEIsc0NBQXNDO0FBQ3RDLDBDQUEwQztBQUMxQywrQ0FBK0M7QUFDL0MsK0RBQStEO0FBQy9ELCtDQUErQztBQUUvQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0JHO0FBQ0gsYUFBYSx3QkFBd0IsR0FDakMsVUFBVSxDQUFDLElBQUksV0FBVyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQztBQUcxRDs7OztHQUlHO0FBQ0g7SUFJRUEsWUFBc0RBLGNBQW9CQTtRQUFwQkMsbUJBQWNBLEdBQWRBLGNBQWNBLENBQU1BO1FBRmxFQSxXQUFNQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFnQkEsQ0FBQ0E7SUFFb0NBLENBQUNBO0lBRTlFRDs7T0FFR0E7SUFDSEEsTUFBTUEsQ0FBQ0EsZUFBb0JBLEVBQUVBLE1BQXVCQTtRQUNsREUsTUFBTUEsR0FBR0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUU1Q0EsK0NBQStDQTtRQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsWUFBWUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLHFCQUFxQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLFlBQVlBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxxQkFBcUJBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3ZEQSxDQUFDQTtRQUVEQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUU3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLEtBQUtBLEdBQUdBLElBQUlBLE9BQU9BLEVBQUVBLENBQUNBO1lBQ3RCQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxlQUFlQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMxQ0EsQ0FBQ0E7UUFFREEsSUFBSUEsUUFBUUEsR0FBR0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFcENBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLFlBQVlBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDYkEsdUJBQXVCQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUN6REEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDN0NBLENBQUNB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QUFDQSxDQUFDQSxnQkFBZ0JBLFlBQVlBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3BEQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBO29CQUMxQkEsQ0FBQ0E7b0JBQ0RBLFdBQVdBLENBQUNBLEtBQUtBLEdBQUdBLGdCQUFnQkEsQ0FBQ0E7b0JBQ3JDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtnQkFDckJBLENBQUNBLENBQUNBLENBQUNBO1lBQ1RBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO2dCQUN2Q0EsSUFBSUEsV0FBV0EsR0FDWEEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsRUFBRUEsb0JBQW9CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0VBLE1BQU1BLENBQUNBLElBQUlBLG1CQUFtQkEsQ0FDMUJBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLGNBQWNBLEVBQ3BFQSxTQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUM3QkEsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFUkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEZBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3ZFQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFjQSxhQUFhQSxD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bnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNBcnJheSwgaXNCbGFuaywgaXNUeXBlLCBpc1N0cmluZywgaXNTdHJpbmdNYXAsIFR5cGUsIFN0cmluZ1dyYXBwZXIsIE1hdGgsIGdldFR5cGVOYW1lRm9yRGVidWdnaW5nLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1JvdXRlQ29uZmlnLCBBc3luY1JvdXRlLCBSb3V0ZSwgQXV4Um91dGUsIFJlZGlyZWN0LCBSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfY29uZmlnL3JvdXRlX2NvbmZpZ19pbXBsJztcbmltcG9ydCB7UGF0aE1hdGNoLCBSZWRpcmVjdE1hdGNoLCBSb3V0ZU1hdGNofSBmcm9tICcuL3J1bGVzL3J1bGVzJztcbmltcG9ydCB7UnVsZVNldH0gZnJvbSAnLi9ydWxlcy9ydWxlX3NldCc7XG5pbXBvcnQge0luc3RydWN0aW9uLCBSZXNvbHZlZEluc3RydWN0aW9uLCBSZWRpcmVjdEluc3RydWN0aW9uLCBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24sIERlZmF1bHRJbnN0cnVjdGlvbn0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5cbmltcG9ydCB7bm9ybWFsaXplUm91dGVDb25maWcsIGFzc2VydENvbXBvbmVudEV4aXN0c30gZnJvbSAnLi9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtwYXJzZXIsIFVybCwgY29udmVydFVybFBhcmFtc1RvQXJyYXksIHBhdGhTZWdtZW50c1RvVXJsfSBmcm9tICcuL3VybF9wYXJzZXInO1xuaW1wb3J0IHtHZW5lcmF0ZWRVcmx9IGZyb20gJy4vcnVsZXMvcm91dGVfcGF0aHMvcm91dGVfcGF0aCc7XG5cbnZhciBfcmVzb2x2ZVRvTnVsbCA9IFByb21pc2VXcmFwcGVyLnJlc29sdmU8SW5zdHJ1Y3Rpb24+KG51bGwpO1xuXG4vLyBBIExpbmtJdGVtQXJyYXkgaXMgYW4gYXJyYXksIHdoaWNoIGRlc2NyaWJlcyBhIHNldCBvZiByb3V0ZXNcbi8vIFRoZSBpdGVtcyBpbiB0aGUgYXJyYXkgYXJlIGZvdW5kIGluIGdyb3Vwczpcbi8vIC0gdGhlIGZpcnN0IGl0ZW0gaXMgdGhlIG5hbWUgb2YgdGhlIHJvdXRlXG4vLyAtIHRoZSBuZXh0IGl0ZW1zIGFyZTpcbi8vICAgLSBhbiBvYmplY3QgY29udGFpbmluZyBwYXJhbWV0ZXJzXG4vLyAgIC0gb3IgYW4gYXJyYXkgZGVzY3JpYmluZyBhbiBhdXggcm91dGVcbi8vIGV4cG9ydCB0eXBlIExpbmtSb3V0ZUl0ZW0gPSBzdHJpbmcgfCBPYmplY3Q7XG4vLyBleHBvcnQgdHlwZSBMaW5rSXRlbSA9IExpbmtSb3V0ZUl0ZW0gfCBBcnJheTxMaW5rUm91dGVJdGVtPjtcbi8vIGV4cG9ydCB0eXBlIExpbmtJdGVtQXJyYXkgPSBBcnJheTxMaW5rSXRlbT47XG5cbi8qKlxuICogVG9rZW4gdXNlZCB0byBiaW5kIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgdG9wLWxldmVsIHtAbGluayBSb3V0ZUNvbmZpZ31zIGZvciB0aGVcbiAqIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWdcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UOiBPcGFxdWVUb2tlbiA9XG4gICAgQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oJ1JvdXRlclByaW1hcnlDb21wb25lbnQnKSk7XG5cblxuLyoqXG4gKiBUaGUgUm91dGVSZWdpc3RyeSBob2xkcyByb3V0ZSBjb25maWd1cmF0aW9ucyBmb3IgZWFjaCBjb21wb25lbnQgaW4gYW4gQW5ndWxhciBhcHAuXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgSW5zdHJ1Y3Rpb25zIGZyb20gVVJMcywgYW5kIGdlbmVyYXRpbmcgVVJMcyBiYXNlZCBvbiByb3V0ZSBhbmRcbiAqIHBhcmFtZXRlcnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfcnVsZXMgPSBuZXcgTWFwPGFueSwgUnVsZVNldD4oKTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpdmF0ZSBfcm9vdENvbXBvbmVudDogVHlwZSkge31cblxuICAvKipcbiAgICogR2l2ZW4gYSBjb21wb25lbnQgYW5kIGEgY29uZmlndXJhdGlvbiBvYmplY3QsIGFkZCB0aGUgcm91dGUgdG8gdGhpcyByZWdpc3RyeVxuICAgKi9cbiAgY29uZmlnKHBhcmVudENvbXBvbmVudDogYW55LCBjb25maWc6IFJvdXRlRGVmaW5pdGlvbik6IHZvaWQge1xuICAgIGNvbmZpZyA9IG5vcm1hbGl6ZVJvdXRlQ29uZmlnKGNvbmZpZywgdGhpcyk7XG5cbiAgICAvLyB0aGlzIGlzIGhlcmUgYmVjYXVzZSBEYXJ0IHR5cGUgZ3VhcmQgcmVhc29uc1xuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgYXNzZXJ0Q29tcG9uZW50RXhpc3RzKGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEF1eFJvdXRlKSB7XG4gICAgICBhc3NlcnRDb21wb25lbnRFeGlzdHMoY29uZmlnLmNvbXBvbmVudCwgY29uZmlnLnBhdGgpO1xuICAgIH1cblxuICAgIHZhciBydWxlcyA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICBydWxlcyA9IG5ldyBSdWxlU2V0KCk7XG4gICAgICB0aGlzLl9ydWxlcy5zZXQocGFyZW50Q29tcG9uZW50LCBydWxlcyk7XG4gICAgfVxuXG4gICAgdmFyIHRlcm1pbmFsID0gcnVsZXMuY29uZmlnKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGlmICh0ZXJtaW5hbCkge1xuICAgICAgICBhc3NlcnRUZXJtaW5hbENvbXBvbmVudChjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbmZpZ0Zyb21Db21wb25lbnQoY29uZmlnLmNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBhbm5vdGF0aW9ucyBvZiBhIGNvbXBvbmVudCBhbmQgY29uZmlndXJlcyB0aGUgcmVnaXN0cnkgYmFzZWQgb24gdGhlbVxuICAgKi9cbiAgY29uZmlnRnJvbUNvbXBvbmVudChjb21wb25lbnQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghaXNUeXBlKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEb24ndCByZWFkIHRoZSBhbm5vdGF0aW9ucyBmcm9tIGEgdHlwZSBtb3JlIHRoYW4gb25jZSDigJNcbiAgICAvLyB0aGlzIHByZXZlbnRzIGFuIGluZmluaXRlIGxvb3AgaWYgYSBjb21wb25lbnQgcm91dGVzIHJlY3Vyc2l2ZWx5LlxuICAgIGlmICh0aGlzLl9ydWxlcy5oYXMoY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYW5ub3RhdGlvbnMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KGFubm90YXRpb25zKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYW5ub3RhdGlvbiA9IGFubm90YXRpb25zW2ldO1xuXG4gICAgICAgIGlmIChhbm5vdGF0aW9uIGluc3RhbmNlb2YgUm91dGVDb25maWcpIHtcbiAgICAgICAgICBsZXQgcm91dGVDZmdzOiBSb3V0ZURlZmluaXRpb25bXSA9IGFubm90YXRpb24uY29uZmlncztcbiAgICAgICAgICByb3V0ZUNmZ3MuZm9yRWFjaChjb25maWcgPT4gdGhpcy5jb25maWcoY29tcG9uZW50LCBjb25maWcpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgVVJMIGFuZCBhIHBhcmVudCBjb21wb25lbnQsIHJldHVybiB0aGUgbW9zdCBzcGVjaWZpYyBpbnN0cnVjdGlvbiBmb3IgbmF2aWdhdGluZ1xuICAgKiB0aGUgYXBwbGljYXRpb24gaW50byB0aGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSB1cmxcbiAgICovXG4gIHJlY29nbml6ZSh1cmw6IHN0cmluZywgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBQcm9taXNlPEluc3RydWN0aW9uPiB7XG4gICAgdmFyIHBhcnNlZFVybCA9IHBhcnNlci5wYXJzZSh1cmwpO1xuICAgIHJldHVybiB0aGlzLl9yZWNvZ25pemUocGFyc2VkVXJsLCBbXSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWNvZ25pemVzIGFsbCBwYXJlbnQtY2hpbGQgcm91dGVzLCBidXQgY3JlYXRlcyB1bnJlc29sdmVkIGF1eGlsaWFyeSByb3V0ZXNcbiAgICovXG4gIHByaXZhdGUgX3JlY29nbml6ZShwYXJzZWRVcmw6IFVybCwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sIF9hdXggPSBmYWxzZSk6XG4gICAgICBQcm9taXNlPEluc3RydWN0aW9uPiB7XG4gICAgdmFyIHBhcmVudEluc3RydWN0aW9uID0gTGlzdFdyYXBwZXIubGFzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgdmFyIHBhcmVudENvbXBvbmVudCA9IGlzUHJlc2VudChwYXJlbnRJbnN0cnVjdGlvbikgPyBwYXJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yb290Q29tcG9uZW50O1xuXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb051bGw7XG4gICAgfVxuXG4gICAgLy8gTWF0Y2hlcyBzb21lIGJlZ2lubmluZyBwYXJ0IG9mIHRoZSBnaXZlbiBVUkxcbiAgICB2YXIgcG9zc2libGVNYXRjaGVzOiBQcm9taXNlPFJvdXRlTWF0Y2g+W10gPVxuICAgICAgICBfYXV4ID8gcnVsZXMucmVjb2duaXplQXV4aWxpYXJ5KHBhcnNlZFVybCkgOiBydWxlcy5yZWNvZ25pemUocGFyc2VkVXJsKTtcblxuICAgIHZhciBtYXRjaFByb21pc2VzOiBQcm9taXNlPEluc3RydWN0aW9uPltdID0gcG9zc2libGVNYXRjaGVzLm1hcChcbiAgICAgICAgKGNhbmRpZGF0ZTogUHJvbWlzZTxSb3V0ZU1hdGNoPikgPT4gY2FuZGlkYXRlLnRoZW4oKGNhbmRpZGF0ZTogUm91dGVNYXRjaCkgPT4ge1xuXG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFBhdGhNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGF1eFBhcmVudEluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSA9XG4gICAgICAgICAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/IFtMaXN0V3JhcHBlci5sYXN0KGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKV0gOiBbXTtcbiAgICAgICAgICAgIHZhciBhdXhJbnN0cnVjdGlvbnMgPVxuICAgICAgICAgICAgICAgIHRoaXMuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZChjYW5kaWRhdGUucmVtYWluaW5nQXV4LCBhdXhQYXJlbnRJbnN0cnVjdGlvbnMpO1xuXG4gICAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbihjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24sIG51bGwsIGF1eEluc3RydWN0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmIChpc0JsYW5rKGNhbmRpZGF0ZS5pbnN0cnVjdGlvbikgfHwgY2FuZGlkYXRlLmluc3RydWN0aW9uLnRlcm1pbmFsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5ld0FuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtpbnN0cnVjdGlvbl0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVjb2duaXplKGNhbmRpZGF0ZS5yZW1haW5pbmcsIG5ld0FuY2VzdG9ySW5zdHJ1Y3Rpb25zKVxuICAgICAgICAgICAgICAgIC50aGVuKChjaGlsZEluc3RydWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNCbGFuayhjaGlsZEluc3RydWN0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gcmVkaXJlY3QgaW5zdHJ1Y3Rpb25zIGFyZSBhbHJlYWR5IGFic29sdXRlXG4gICAgICAgICAgICAgICAgICBpZiAoY2hpbGRJbnN0cnVjdGlvbiBpbnN0YW5jZW9mIFJlZGlyZWN0SW5zdHJ1Y3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbi5jaGlsZCA9IGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFJlZGlyZWN0TWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBpbnN0cnVjdGlvbiA9XG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZShjYW5kaWRhdGUucmVkaXJlY3RUbywgYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtudWxsXSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWRpcmVjdEluc3RydWN0aW9uKFxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9uLmNvbXBvbmVudCwgaW5zdHJ1Y3Rpb24uY2hpbGQsIGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZS5zcGVjaWZpY2l0eSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICBpZiAoKGlzQmxhbmsocGFyc2VkVXJsKSB8fCBwYXJzZWRVcmwucGF0aCA9PSAnJykgJiYgcG9zc2libGVNYXRjaGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmdlbmVyYXRlRGVmYXVsdChwYXJlbnRDb21wb25lbnQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsPEluc3RydWN0aW9uPihtYXRjaFByb21pc2VzKS50aGVuKG1vc3RTcGVjaWZpYyk7XG4gIH1cblxuICBwcml2YXRlIF9hdXhSb3V0ZXNUb1VucmVzb2x2ZWQoYXV4Um91dGVzOiBVcmxbXSwgcGFyZW50SW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdKTpcbiAgICAgIHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0ge1xuICAgIHZhciB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG5cbiAgICBhdXhSb3V0ZXMuZm9yRWFjaCgoYXV4VXJsOiBVcmwpID0+IHtcbiAgICAgIHVucmVzb2x2ZWRBdXhJbnN0cnVjdGlvbnNbYXV4VXJsLnBhdGhdID0gbmV3IFVucmVzb2x2ZWRJbnN0cnVjdGlvbihcbiAgICAgICAgICAoKSA9PiB7IHJldHVybiB0aGlzLl9yZWNvZ25pemUoYXV4VXJsLCBwYXJlbnRJbnN0cnVjdGlvbnMsIHRydWUpOyB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBub3JtYWxpemVkIGxpc3Qgd2l0aCBjb21wb25lbnQgbmFtZXMgYW5kIHBhcmFtcyBsaWtlOiBgWyd1c2VyJywge2lkOiAzIH1dYFxuICAgKiBnZW5lcmF0ZXMgYSB1cmwgd2l0aCBhIGxlYWRpbmcgc2xhc2ggcmVsYXRpdmUgdG8gdGhlIHByb3ZpZGVkIGBwYXJlbnRDb21wb25lbnRgLlxuICAgKlxuICAgKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW0gYF9hdXhgIGlzIGB0cnVlYCwgdGhlbiB3ZSBnZW5lcmF0ZSBzdGFydGluZyBhdCBhbiBhdXhpbGlhcnlcbiAgICogcm91dGUgYm91bmRhcnkuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sIF9hdXggPSBmYWxzZSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgcGFyYW1zID0gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zKTtcbiAgICB2YXIgcHJldkluc3RydWN0aW9uO1xuXG4gICAgLy8gVGhlIGZpcnN0IHNlZ21lbnQgc2hvdWxkIGJlIGVpdGhlciAnLicgKGdlbmVyYXRlIGZyb20gcGFyZW50KSBvciAnJyAoZ2VuZXJhdGUgZnJvbSByb290KS5cbiAgICAvLyBXaGVuIHdlIG5vcm1hbGl6ZSBhYm92ZSwgd2Ugc3RyaXAgYWxsIHRoZSBzbGFzaGVzLCAnLi8nIGJlY29tZXMgJy4nIGFuZCAnLycgYmVjb21lcyAnJy5cbiAgICBpZiAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnJykge1xuICAgICAgcGFyYW1zLnNoaWZ0KCk7XG4gICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBMaXN0V3JhcHBlci5maXJzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgICBhbmNlc3Rvckluc3RydWN0aW9ucyA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID8gYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCkgOiBudWxsO1xuXG4gICAgICBpZiAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnLicpIHtcbiAgICAgICAgcGFyYW1zLnNoaWZ0KCk7XG4gICAgICB9IGVsc2UgaWYgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJy4uJykge1xuICAgICAgICB3aGlsZSAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnLi4nKSB7XG4gICAgICAgICAgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIGhhcyB0b28gbWFueSBcIi4uL1wiIHNlZ21lbnRzLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKTtcbiAgICAgICAgICBwYXJhbXMgPSBMaXN0V3JhcHBlci5zbGljZShwYXJhbXMsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UncmUgb24gdG8gaW1wbGljaXQgY2hpbGQvc2libGluZyByb3V0ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2UgbXVzdCBvbmx5IHBlYWsgYXQgdGhlIGxpbmsgcGFyYW0sIGFuZCBub3QgY29uc3VtZSBpdFxuICAgICAgICBsZXQgcm91dGVOYW1lID0gTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKTtcbiAgICAgICAgbGV0IHBhcmVudENvbXBvbmVudFR5cGUgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgICAgICBsZXQgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlID0gbnVsbDtcblxuICAgICAgICBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGxldCBwYXJlbnRDb21wb25lbnRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgIGxldCBncmFuZENvbXBvbmVudEluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMl07XG5cbiAgICAgICAgICBwYXJlbnRDb21wb25lbnRUeXBlID0gcGFyZW50Q29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgICAgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlID0gZ3JhbmRDb21wb25lbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgfSBlbHNlIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIHBhcmVudENvbXBvbmVudFR5cGUgPSBhbmNlc3Rvckluc3RydWN0aW9uc1swXS5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgICBncmFuZHBhcmVudENvbXBvbmVudFR5cGUgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9yIGEgbGluayB3aXRoIG5vIGxlYWRpbmcgYC4vYCwgYC9gLCBvciBgLi4vYCwgd2UgbG9vayBmb3IgYSBzaWJsaW5nIGFuZCBjaGlsZC5cbiAgICAgICAgLy8gSWYgYm90aCBleGlzdCwgd2UgdGhyb3cuIE90aGVyd2lzZSwgd2UgcHJlZmVyIHdoaWNoZXZlciBleGlzdHMuXG4gICAgICAgIHZhciBjaGlsZFJvdXRlRXhpc3RzID0gdGhpcy5oYXNSb3V0ZShyb3V0ZU5hbWUsIHBhcmVudENvbXBvbmVudFR5cGUpO1xuICAgICAgICB2YXIgcGFyZW50Um91dGVFeGlzdHMgPSBpc1ByZXNlbnQoZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlKSAmJlxuICAgICAgICAgICAgdGhpcy5oYXNSb3V0ZShyb3V0ZU5hbWUsIGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSk7XG5cbiAgICAgICAgaWYgKHBhcmVudFJvdXRlRXhpc3RzICYmIGNoaWxkUm91dGVFeGlzdHMpIHtcbiAgICAgICAgICBsZXQgbXNnID1cbiAgICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBpcyBhbWJpZ3VvdXMsIHVzZSBcIi4vXCIgb3IgXCIuLi9cIiB0byBkaXNhbWJpZ3VhdGUuYDtcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihtc2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmVudFJvdXRlRXhpc3RzKSB7XG4gICAgICAgICAgcHJldkluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFyYW1zW3BhcmFtcy5sZW5ndGggLSAxXSA9PSAnJykge1xuICAgICAgcGFyYW1zLnBvcCgpO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMubGVuZ3RoID4gMCAmJiBwYXJhbXNbMF0gPT0gJycpIHtcbiAgICAgIHBhcmFtcy5zaGlmdCgpO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMSkge1xuICAgICAgbGV0IG1zZyA9IGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgbXVzdCBpbmNsdWRlIGEgcm91dGUgbmFtZS5gO1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24obXNnKTtcbiAgICB9XG5cbiAgICB2YXIgZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24gPVxuICAgICAgICB0aGlzLl9nZW5lcmF0ZShwYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLCBwcmV2SW5zdHJ1Y3Rpb24sIF9hdXgsIGxpbmtQYXJhbXMpO1xuXG4gICAgLy8gd2UgZG9uJ3QgY2xvbmUgdGhlIGZpcnN0IChyb290KSBlbGVtZW50XG4gICAgZm9yICh2YXIgaSA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBsZXQgYW5jZXN0b3JJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2ldO1xuICAgICAgaWYgKGlzQmxhbmsoYW5jZXN0b3JJbnN0cnVjdGlvbikpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBnZW5lcmF0ZWRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkKGdlbmVyYXRlZEluc3RydWN0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2VuZXJhdGVkSW5zdHJ1Y3Rpb247XG4gIH1cblxuXG4gIC8qXG4gICAqIEludGVybmFsIGhlbHBlciB0aGF0IGRvZXMgbm90IG1ha2UgYW55IGFzc2VydGlvbnMgYWJvdXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluayBEU0wuXG4gICAqIGBhbmNlc3Rvckluc3RydWN0aW9uc2AgYXJlIHBhcmVudHMgdGhhdCB3aWxsIGJlIGNsb25lZC5cbiAgICogYHByZXZJbnN0cnVjdGlvbmAgaXMgdGhlIGV4aXN0aW5nIGluc3RydWN0aW9uIHRoYXQgd291bGQgYmUgcmVwbGFjZWQsIGJ1dCB3aGljaCBtaWdodCBoYXZlXG4gICAqIGF1eCByb3V0ZXMgdGhhdCBuZWVkIHRvIGJlIGNsb25lZC5cbiAgICovXG4gIHByaXZhdGUgX2dlbmVyYXRlKFxuICAgICAgbGlua1BhcmFtczogYW55W10sIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLCBwcmV2SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgX2F1eCA9IGZhbHNlLCBfb3JpZ2luYWxMaW5rOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICBsZXQgcGFyZW50Q29tcG9uZW50VHlwZSA9IHRoaXMuX3Jvb3RDb21wb25lbnQ7XG4gICAgbGV0IGNvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBsZXQgYXV4SW5zdHJ1Y3Rpb25zOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG5cbiAgICBsZXQgcGFyZW50SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gTGlzdFdyYXBwZXIubGFzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnRJbnN0cnVjdGlvbikgJiYgaXNQcmVzZW50KHBhcmVudEluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgIHBhcmVudENvbXBvbmVudFR5cGUgPSBwYXJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICB9XG5cbiAgICBpZiAobGlua1BhcmFtcy5sZW5ndGggPT0gMCkge1xuICAgICAgbGV0IGRlZmF1bHRJbnN0cnVjdGlvbiA9IHRoaXMuZ2VuZXJhdGVEZWZhdWx0KHBhcmVudENvbXBvbmVudFR5cGUpO1xuICAgICAgaWYgKGlzQmxhbmsoZGVmYXVsdEluc3RydWN0aW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04oX29yaWdpbmFsTGluayl9XCIgZG9lcyBub3QgcmVzb2x2ZSB0byBhIHRlcm1pbmFsIGluc3RydWN0aW9uLmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmF1bHRJbnN0cnVjdGlvbjtcbiAgICB9XG5cbiAgICAvLyBmb3Igbm9uLWF1eCByb3V0ZXMsIHdlIHdhbnQgdG8gcmV1c2UgdGhlIHByZWRlY2Vzc29yJ3MgZXhpc3RpbmcgcHJpbWFyeSBhbmQgYXV4IHJvdXRlc1xuICAgIC8vIGFuZCBvbmx5IG92ZXJyaWRlIHJvdXRlcyBmb3Igd2hpY2ggdGhlIGdpdmVuIGxpbmsgRFNMIHByb3ZpZGVzXG4gICAgaWYgKGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pICYmICFfYXV4KSB7XG4gICAgICBhdXhJbnN0cnVjdGlvbnMgPSBTdHJpbmdNYXBXcmFwcGVyLm1lcmdlKHByZXZJbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbiwgYXV4SW5zdHJ1Y3Rpb25zKTtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gcHJldkluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICB9XG5cbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50VHlwZSk7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgQ29tcG9uZW50IFwiJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyhwYXJlbnRDb21wb25lbnRUeXBlKX1cIiBoYXMgbm8gcm91dGUgY29uZmlnLmApO1xuICAgIH1cblxuICAgIGxldCBsaW5rUGFyYW1JbmRleCA9IDA7XG4gICAgbGV0IHJvdXRlUGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gICAgLy8gZmlyc3QsIHJlY29nbml6ZSB0aGUgcHJpbWFyeSByb3V0ZSBpZiBvbmUgaXMgcHJvdmlkZWRcbiAgICBpZiAobGlua1BhcmFtSW5kZXggPCBsaW5rUGFyYW1zLmxlbmd0aCAmJiBpc1N0cmluZyhsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XSkpIHtcbiAgICAgIGxldCByb3V0ZU5hbWUgPSBsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XTtcbiAgICAgIGlmIChyb3V0ZU5hbWUgPT0gJycgfHwgcm91dGVOYW1lID09ICcuJyB8fCByb3V0ZU5hbWUgPT0gJy4uJykge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgXCIke3JvdXRlTmFtZX0vXCIgaXMgb25seSBhbGxvd2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5rIERTTC5gKTtcbiAgICAgIH1cbiAgICAgIGxpbmtQYXJhbUluZGV4ICs9IDE7XG4gICAgICBpZiAobGlua1BhcmFtSW5kZXggPCBsaW5rUGFyYW1zLmxlbmd0aCkge1xuICAgICAgICBsZXQgbGlua1BhcmFtID0gbGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF07XG4gICAgICAgIGlmIChpc1N0cmluZ01hcChsaW5rUGFyYW0pICYmICFpc0FycmF5KGxpbmtQYXJhbSkpIHtcbiAgICAgICAgICByb3V0ZVBhcmFtcyA9IGxpbmtQYXJhbTtcbiAgICAgICAgICBsaW5rUGFyYW1JbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgcm91dGVSZWNvZ25pemVyID0gKF9hdXggPyBydWxlcy5hdXhSdWxlc0J5TmFtZSA6IHJ1bGVzLnJ1bGVzQnlOYW1lKS5nZXQocm91dGVOYW1lKTtcblxuICAgICAgaWYgKGlzQmxhbmsocm91dGVSZWNvZ25pemVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb21wb25lbnQgXCIke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHBhcmVudENvbXBvbmVudFR5cGUpfVwiIGhhcyBubyByb3V0ZSBuYW1lZCBcIiR7cm91dGVOYW1lfVwiLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYW4gXCJ1bnJlc29sdmVkIGluc3RydWN0aW9uXCIgZm9yIGFzeW5jIHJvdXRlc1xuICAgICAgLy8gd2UnbGwgZmlndXJlIG91dCB0aGUgcmVzdCBvZiB0aGUgcm91dGUgd2hlbiB3ZSByZXNvbHZlIHRoZSBpbnN0cnVjdGlvbiBhbmRcbiAgICAgIC8vIHBlcmZvcm0gYSBuYXZpZ2F0aW9uXG4gICAgICBpZiAoaXNCbGFuayhyb3V0ZVJlY29nbml6ZXIuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgICB2YXIgZ2VuZXJhdGVkVXJsOiBHZW5lcmF0ZWRVcmwgPSByb3V0ZVJlY29nbml6ZXIuZ2VuZXJhdGVDb21wb25lbnRQYXRoVmFsdWVzKHJvdXRlUGFyYW1zKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiByb3V0ZVJlY29nbml6ZXIuaGFuZGxlci5yZXNvbHZlQ29tcG9uZW50VHlwZSgpLnRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZW5lcmF0ZShcbiAgICAgICAgICAgICAgICBsaW5rUGFyYW1zLCBhbmNlc3Rvckluc3RydWN0aW9ucywgcHJldkluc3RydWN0aW9uLCBfYXV4LCBfb3JpZ2luYWxMaW5rKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZ2VuZXJhdGVkVXJsLnVybFBhdGgsIGNvbnZlcnRVcmxQYXJhbXNUb0FycmF5KGdlbmVyYXRlZFVybC51cmxQYXJhbXMpKTtcbiAgICAgIH1cblxuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBfYXV4ID8gcnVsZXMuZ2VuZXJhdGVBdXhpbGlhcnkocm91dGVOYW1lLCByb3V0ZVBhcmFtcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXMuZ2VuZXJhdGUocm91dGVOYW1lLCByb3V0ZVBhcmFtcyk7XG4gICAgfVxuXG4gICAgLy8gTmV4dCwgcmVjb2duaXplIGF1eGlsaWFyeSBpbnN0cnVjdGlvbnMuXG4gICAgLy8gSWYgd2UgaGF2ZSBhbiBhbmNlc3RvciBpbnN0cnVjdGlvbiwgd2UgcHJlc2VydmUgd2hhdGV2ZXIgYXV4IHJvdXRlcyBhcmUgYWN0aXZlIGZyb20gaXQuXG4gICAgd2hpbGUgKGxpbmtQYXJhbUluZGV4IDwgbGlua1BhcmFtcy5sZW5ndGggJiYgaXNBcnJheShsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XSkpIHtcbiAgICAgIGxldCBhdXhQYXJlbnRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb25bXSA9IFtwYXJlbnRJbnN0cnVjdGlvbl07XG4gICAgICBsZXQgYXV4SW5zdHJ1Y3Rpb24gPSB0aGlzLl9nZW5lcmF0ZShcbiAgICAgICAgICBsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XSwgYXV4UGFyZW50SW5zdHJ1Y3Rpb24sIG51bGwsIHRydWUsIF9vcmlnaW5hbExpbmspO1xuXG4gICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgbm90IHdvcmsgZm9yIGF1eCByb3V0ZXMgd2l0aCBwYXJhbWV0ZXJzIG9yIG11bHRpcGxlIHNlZ21lbnRzXG4gICAgICBhdXhJbnN0cnVjdGlvbnNbYXV4SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnVybFBhdGhdID0gYXV4SW5zdHJ1Y3Rpb247XG4gICAgICBsaW5rUGFyYW1JbmRleCArPSAxO1xuICAgIH1cblxuICAgIHZhciBpbnN0cnVjdGlvbiA9IG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKGNvbXBvbmVudEluc3RydWN0aW9uLCBudWxsLCBhdXhJbnN0cnVjdGlvbnMpO1xuXG4gICAgLy8gSWYgdGhlIGNvbXBvbmVudCBpcyBzeW5jLCB3ZSBjYW4gZ2VuZXJhdGUgcmVzb2x2ZWQgY2hpbGQgcm91dGUgaW5zdHJ1Y3Rpb25zXG4gICAgLy8gSWYgbm90LCB3ZSdsbCByZXNvbHZlIHRoZSBpbnN0cnVjdGlvbnMgYXQgbmF2aWdhdGlvbiB0aW1lXG4gICAgaWYgKGlzUHJlc2VudChjb21wb25lbnRJbnN0cnVjdGlvbikgJiYgaXNQcmVzZW50KGNvbXBvbmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBsZXQgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgICAgaWYgKGNvbXBvbmVudEluc3RydWN0aW9uLnRlcm1pbmFsKSB7XG4gICAgICAgIGlmIChsaW5rUGFyYW1JbmRleCA+PSBsaW5rUGFyYW1zLmxlbmd0aCkge1xuICAgICAgICAgIC8vIFRPRE86IHRocm93IHRoYXQgdGhlcmUgYXJlIGV4dHJhIGxpbmsgcGFyYW1zIGJleW9uZCB0aGUgdGVybWluYWwgY29tcG9uZW50XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBjaGlsZEFuY2VzdG9yQ29tcG9uZW50czogSW5zdHJ1Y3Rpb25bXSA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmNvbmNhdChbaW5zdHJ1Y3Rpb25dKTtcbiAgICAgICAgbGV0IHJlbWFpbmluZ0xpbmtQYXJhbXMgPSBsaW5rUGFyYW1zLnNsaWNlKGxpbmtQYXJhbUluZGV4KTtcbiAgICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IHRoaXMuX2dlbmVyYXRlKFxuICAgICAgICAgICAgcmVtYWluaW5nTGlua1BhcmFtcywgY2hpbGRBbmNlc3RvckNvbXBvbmVudHMsIG51bGwsIGZhbHNlLCBfb3JpZ2luYWxMaW5rKTtcbiAgICAgIH1cbiAgICAgIGluc3RydWN0aW9uLmNoaWxkID0gY2hpbGRJbnN0cnVjdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gIH1cblxuICBwdWJsaWMgaGFzUm91dGUobmFtZTogc3RyaW5nLCBwYXJlbnRDb21wb25lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIHZhciBydWxlcyA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuICAgIGlmIChpc0JsYW5rKHJ1bGVzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gcnVsZXMuaGFzUm91dGUobmFtZSk7XG4gIH1cblxuICBwdWJsaWMgZ2VuZXJhdGVEZWZhdWx0KGNvbXBvbmVudEN1cnNvcjogVHlwZSk6IEluc3RydWN0aW9uIHtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRDdXJzb3IpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQoY29tcG9uZW50Q3Vyc29yKTtcbiAgICBpZiAoaXNCbGFuayhydWxlcykgfHwgaXNCbGFuayhydWxlcy5kZWZhdWx0UnVsZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0Q2hpbGQgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQocnVsZXMuZGVmYXVsdFJ1bGUuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gcnVsZXMuZGVmYXVsdFJ1bGUuZ2VuZXJhdGUoe30pO1xuICAgICAgaWYgKCFydWxlcy5kZWZhdWx0UnVsZS50ZXJtaW5hbCkge1xuICAgICAgICBkZWZhdWx0Q2hpbGQgPSB0aGlzLmdlbmVyYXRlRGVmYXVsdChydWxlcy5kZWZhdWx0UnVsZS5oYW5kbGVyLmNvbXBvbmVudFR5cGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0SW5zdHJ1Y3Rpb24oY29tcG9uZW50SW5zdHJ1Y3Rpb24sIGRlZmF1bHRDaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgcmV0dXJuIHJ1bGVzLmRlZmF1bHRSdWxlLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKS50aGVuKFxuICAgICAgICAgIChfKSA9PiB0aGlzLmdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRDdXJzb3IpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKlxuICogR2l2ZW46IFsnL2EvYicsIHtjOiAyfV1cbiAqIFJldHVybnM6IFsnJywgJ2EnLCAnYicsIHtjOiAyfV1cbiAqL1xuZnVuY3Rpb24gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zOiBhbnlbXSk6IGFueVtdIHtcbiAgdmFyIGFjY3VtdWxhdGlvbiA9IFtdO1xuICBsaW5rUGFyYW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbTogYW55KSB7XG4gICAgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICB2YXIgc3RySXRlbTogc3RyaW5nID0gPHN0cmluZz5pdGVtO1xuICAgICAgYWNjdW11bGF0aW9uID0gYWNjdW11bGF0aW9uLmNvbmNhdChzdHJJdGVtLnNwbGl0KCcvJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhY2N1bXVsYXRpb24ucHVzaChpdGVtKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYWNjdW11bGF0aW9uO1xufVxuXG5cbi8qXG4gKiBHaXZlbiBhIGxpc3Qgb2YgaW5zdHJ1Y3Rpb25zLCByZXR1cm5zIHRoZSBtb3N0IHNwZWNpZmljIGluc3RydWN0aW9uXG4gKi9cbmZ1bmN0aW9uIG1vc3RTcGVjaWZpYyhpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBJbnN0cnVjdGlvbiB7XG4gIGluc3RydWN0aW9ucyA9IGluc3RydWN0aW9ucy5maWx0ZXIoKGluc3RydWN0aW9uKSA9PiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKTtcbiAgaWYgKGluc3RydWN0aW9ucy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChpbnN0cnVjdGlvbnMubGVuZ3RoID09IDEpIHtcbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zWzBdO1xuICB9XG4gIHZhciBmaXJzdCA9IGluc3RydWN0aW9uc1swXTtcbiAgdmFyIHJlc3QgPSBpbnN0cnVjdGlvbnMuc2xpY2UoMSk7XG4gIHJldHVybiByZXN0LnJlZHVjZSgoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBjb250ZW5kZXI6IEluc3RydWN0aW9uKSA9PiB7XG4gICAgaWYgKGNvbXBhcmVTcGVjaWZpY2l0eVN0cmluZ3MoY29udGVuZGVyLnNwZWNpZmljaXR5LCBpbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSkgPT0gLTEpIHtcbiAgICAgIHJldHVybiBjb250ZW5kZXI7XG4gICAgfVxuICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgfSwgZmlyc3QpO1xufVxuXG4vKlxuICogRXhwZWN0cyBzdHJpbmdzIHRvIGJlIGluIHRoZSBmb3JtIG9mIFwiWzAtMl0rXCJcbiAqIFJldHVybnMgLTEgaWYgc3RyaW5nIEEgc2hvdWxkIGJlIHNvcnRlZCBhYm92ZSBzdHJpbmcgQiwgMSBpZiBpdCBzaG91bGQgYmUgc29ydGVkIGFmdGVyLFxuICogb3IgMCBpZiB0aGV5IGFyZSB0aGUgc2FtZS5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZVNwZWNpZmljaXR5U3RyaW5ncyhhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gIHZhciBsID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcbiAgICB2YXIgYWkgPSBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoYSwgaSk7XG4gICAgdmFyIGJpID0gU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGIsIGkpO1xuICAgIHZhciBkaWZmZXJlbmNlID0gYmkgLSBhaTtcbiAgICBpZiAoZGlmZmVyZW5jZSAhPSAwKSB7XG4gICAgICByZXR1cm4gZGlmZmVyZW5jZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFRlcm1pbmFsQ29tcG9uZW50KGNvbXBvbmVudCwgcGF0aCkge1xuICBpZiAoIWlzVHlwZShjb21wb25lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGFubm90YXRpb25zID0gcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudCk7XG4gIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGFubm90YXRpb24gPSBhbm5vdGF0aW9uc1tpXTtcblxuICAgICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBSb3V0ZUNvbmZpZykge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDaGlsZCByb3V0ZXMgYXJlIG5vdCBhbGxvd2VkIGZvciBcIiR7cGF0aH1cIi4gVXNlIFwiLi4uXCIgb24gdGhlIHBhcmVudCdzIHJvdXRlIHBhdGguYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=