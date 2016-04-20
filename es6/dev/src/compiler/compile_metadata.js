import { isPresent, isBlank, isNumber, isBoolean, normalizeBool, normalizeBlank, serializeEnum, isString, RegExpWrapper, isArray } from 'angular2/src/facade/lang';
import { unimplemented, BaseException } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation, VIEW_ENCAPSULATION_VALUES } from 'angular2/src/core/metadata/view';
import { CssSelector } from 'angular2/src/compiler/selector';
import { splitAtColon } from './util';
import { LIFECYCLE_HOOKS_VALUES } from 'angular2/src/core/metadata/lifecycle_hooks';
import { getUrlScheme } from './url_resolver';
// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$/g;
export class CompileMetadataWithIdentifier {
    get identifier() { return unimplemented(); }
}
export class CompileMetadataWithType extends CompileMetadataWithIdentifier {
    get type() { return unimplemented(); }
    get identifier() { return unimplemented(); }
}
export function metadataFromJson(data) {
    return _COMPILE_METADATA_FROM_JSON[data['class']](data);
}
export class CompileIdentifierMetadata {
    constructor({ runtime, name, moduleUrl, prefix, value } = {}) {
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.value = value;
    }
    static fromJson(data) {
        let value = isArray(data['value']) ? _arrayFromJson(data['value'], metadataFromJson) :
            _objFromJson(data['value'], metadataFromJson);
        return new CompileIdentifierMetadata({ name: data['name'], prefix: data['prefix'], moduleUrl: data['moduleUrl'], value: value });
    }
    toJson() {
        let value = isArray(this.value) ? _arrayToJson(this.value) : _objToJson(this.value);
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Identifier',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'value': value
        };
    }
    get identifier() { return this; }
}
export class CompileDiDependencyMetadata {
    constructor({ isAttribute, isSelf, isHost, isSkipSelf, isOptional, isValue, query, viewQuery, token, value } = {}) {
        this.isAttribute = normalizeBool(isAttribute);
        this.isSelf = normalizeBool(isSelf);
        this.isHost = normalizeBool(isHost);
        this.isSkipSelf = normalizeBool(isSkipSelf);
        this.isOptional = normalizeBool(isOptional);
        this.isValue = normalizeBool(isValue);
        this.query = query;
        this.viewQuery = viewQuery;
        this.token = token;
        this.value = value;
    }
    static fromJson(data) {
        return new CompileDiDependencyMetadata({
            token: _objFromJson(data['token'], CompileTokenMetadata.fromJson),
            query: _objFromJson(data['query'], CompileQueryMetadata.fromJson),
            viewQuery: _objFromJson(data['viewQuery'], CompileQueryMetadata.fromJson),
            value: data['value'],
            isAttribute: data['isAttribute'],
            isSelf: data['isSelf'],
            isHost: data['isHost'],
            isSkipSelf: data['isSkipSelf'],
            isOptional: data['isOptional'],
            isValue: data['isValue']
        });
    }
    toJson() {
        return {
            'token': _objToJson(this.token),
            'query': _objToJson(this.query),
            'viewQuery': _objToJson(this.viewQuery),
            'value': this.value,
            'isAttribute': this.isAttribute,
            'isSelf': this.isSelf,
            'isHost': this.isHost,
            'isSkipSelf': this.isSkipSelf,
            'isOptional': this.isOptional,
            'isValue': this.isValue
        };
    }
}
export class CompileProviderMetadata {
    constructor({ token, useClass, useValue, useExisting, useFactory, deps, multi }) {
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.deps = normalizeBlank(deps);
        this.multi = normalizeBool(multi);
    }
    static fromJson(data) {
        return new CompileProviderMetadata({
            token: _objFromJson(data['token'], CompileTokenMetadata.fromJson),
            useClass: _objFromJson(data['useClass'], CompileTypeMetadata.fromJson),
            useExisting: _objFromJson(data['useExisting'], CompileTokenMetadata.fromJson),
            useValue: _objFromJson(data['useValue'], CompileIdentifierMetadata.fromJson),
            useFactory: _objFromJson(data['useFactory'], CompileFactoryMetadata.fromJson),
            multi: data['multi'],
            deps: _arrayFromJson(data['deps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    toJson() {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Provider',
            'token': _objToJson(this.token),
            'useClass': _objToJson(this.useClass),
            'useExisting': _objToJson(this.useExisting),
            'useValue': _objToJson(this.useValue),
            'useFactory': _objToJson(this.useFactory),
            'multi': this.multi,
            'deps': _arrayToJson(this.deps)
        };
    }
}
export class CompileFactoryMetadata {
    constructor({ runtime, name, moduleUrl, prefix, diDeps, value }) {
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.diDeps = _normalizeArray(diDeps);
        this.value = value;
    }
    get identifier() { return this; }
    static fromJson(data) {
        return new CompileFactoryMetadata({
            name: data['name'],
            prefix: data['prefix'],
            moduleUrl: data['moduleUrl'],
            value: data['value'],
            diDeps: _arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'class': 'Factory',
            'name': this.name,
            'prefix': this.prefix,
            'moduleUrl': this.moduleUrl,
            'value': this.value,
            'diDeps': _arrayToJson(this.diDeps)
        };
    }
}
export class CompileTokenMetadata {
    constructor({ value, identifier, identifierIsInstance }) {
        this.value = value;
        this.identifier = identifier;
        this.identifierIsInstance = normalizeBool(identifierIsInstance);
    }
    static fromJson(data) {
        return new CompileTokenMetadata({
            value: data['value'],
            identifier: _objFromJson(data['identifier'], CompileIdentifierMetadata.fromJson),
            identifierIsInstance: data['identifierIsInstance']
        });
    }
    toJson() {
        return {
            'value': this.value,
            'identifier': _objToJson(this.identifier),
            'identifierIsInstance': this.identifierIsInstance
        };
    }
    get runtimeCacheKey() {
        if (isPresent(this.identifier)) {
            return this.identifier.runtime;
        }
        else {
            return this.value;
        }
    }
    get assetCacheKey() {
        if (isPresent(this.identifier)) {
            return isPresent(this.identifier.moduleUrl) &&
                isPresent(getUrlScheme(this.identifier.moduleUrl)) ?
                `${this.identifier.name}|${this.identifier.moduleUrl}|${this.identifierIsInstance}` :
                null;
        }
        else {
            return this.value;
        }
    }
    equalsTo(token2) {
        var rk = this.runtimeCacheKey;
        var ak = this.assetCacheKey;
        return (isPresent(rk) && rk == token2.runtimeCacheKey) ||
            (isPresent(ak) && ak == token2.assetCacheKey);
    }
    get name() { return isPresent(this.value) ? this.value : this.identifier.name; }
}
export class CompileTokenMap {
    constructor() {
        this._valueMap = new Map();
        this._values = [];
    }
    add(token, value) {
        var existing = this.get(token);
        if (isPresent(existing)) {
            throw new BaseException(`Can only add to a TokenMap! Token: ${token.name}`);
        }
        this._values.push(value);
        var rk = token.runtimeCacheKey;
        if (isPresent(rk)) {
            this._valueMap.set(rk, value);
        }
        var ak = token.assetCacheKey;
        if (isPresent(ak)) {
            this._valueMap.set(ak, value);
        }
    }
    get(token) {
        var rk = token.runtimeCacheKey;
        var ak = token.assetCacheKey;
        var result;
        if (isPresent(rk)) {
            result = this._valueMap.get(rk);
        }
        if (isBlank(result) && isPresent(ak)) {
            result = this._valueMap.get(ak);
        }
        return result;
    }
    values() { return this._values; }
    get size() { return this._values.length; }
}
/**
 * Metadata regarding compilation of a type.
 */
export class CompileTypeMetadata {
    constructor({ runtime, name, moduleUrl, prefix, isHost, value, diDeps } = {}) {
        this.runtime = runtime;
        this.name = name;
        this.moduleUrl = moduleUrl;
        this.prefix = prefix;
        this.isHost = normalizeBool(isHost);
        this.value = value;
        this.diDeps = _normalizeArray(diDeps);
    }
    static fromJson(data) {
        return new CompileTypeMetadata({
            name: data['name'],
            moduleUrl: data['moduleUrl'],
            prefix: data['prefix'],
            isHost: data['isHost'],
            value: data['value'],
            diDeps: _arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    }
    get identifier() { return this; }
    get type() { return this; }
    toJson() {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Type',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'isHost': this.isHost,
            'value': this.value,
            'diDeps': _arrayToJson(this.diDeps)
        };
    }
}
export class CompileQueryMetadata {
    constructor({ selectors, descendants, first, propertyName, read } = {}) {
        this.selectors = selectors;
        this.descendants = normalizeBool(descendants);
        this.first = normalizeBool(first);
        this.propertyName = propertyName;
        this.read = read;
    }
    static fromJson(data) {
        return new CompileQueryMetadata({
            selectors: _arrayFromJson(data['selectors'], CompileTokenMetadata.fromJson),
            descendants: data['descendants'],
            first: data['first'],
            propertyName: data['propertyName'],
            read: _objFromJson(data['read'], CompileTokenMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'selectors': _arrayToJson(this.selectors),
            'descendants': this.descendants,
            'first': this.first,
            'propertyName': this.propertyName,
            'read': _objToJson(this.read)
        };
    }
}
/**
 * Metadata regarding compilation of a template.
 */
export class CompileTemplateMetadata {
    constructor({ encapsulation, template, templateUrl, styles, styleUrls, ngContentSelectors } = {}) {
        this.encapsulation = isPresent(encapsulation) ? encapsulation : ViewEncapsulation.Emulated;
        this.template = template;
        this.templateUrl = templateUrl;
        this.styles = isPresent(styles) ? styles : [];
        this.styleUrls = isPresent(styleUrls) ? styleUrls : [];
        this.ngContentSelectors = isPresent(ngContentSelectors) ? ngContentSelectors : [];
    }
    static fromJson(data) {
        return new CompileTemplateMetadata({
            encapsulation: isPresent(data['encapsulation']) ?
                VIEW_ENCAPSULATION_VALUES[data['encapsulation']] :
                data['encapsulation'],
            template: data['template'],
            templateUrl: data['templateUrl'],
            styles: data['styles'],
            styleUrls: data['styleUrls'],
            ngContentSelectors: data['ngContentSelectors']
        });
    }
    toJson() {
        return {
            'encapsulation': isPresent(this.encapsulation) ? serializeEnum(this.encapsulation) : this.encapsulation,
            'template': this.template,
            'templateUrl': this.templateUrl,
            'styles': this.styles,
            'styleUrls': this.styleUrls,
            'ngContentSelectors': this.ngContentSelectors
        };
    }
}
/**
 * Metadata regarding compilation of a directive.
 */
export class CompileDirectiveMetadata {
    constructor({ type, isComponent, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
        this.type = type;
        this.isComponent = isComponent;
        this.selector = selector;
        this.exportAs = exportAs;
        this.changeDetection = changeDetection;
        this.inputs = inputs;
        this.outputs = outputs;
        this.hostListeners = hostListeners;
        this.hostProperties = hostProperties;
        this.hostAttributes = hostAttributes;
        this.lifecycleHooks = _normalizeArray(lifecycleHooks);
        this.providers = _normalizeArray(providers);
        this.viewProviders = _normalizeArray(viewProviders);
        this.queries = _normalizeArray(queries);
        this.viewQueries = _normalizeArray(viewQueries);
        this.template = template;
    }
    static create({ type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host, lifecycleHooks, providers, viewProviders, queries, viewQueries, template } = {}) {
        var hostListeners = {};
        var hostProperties = {};
        var hostAttributes = {};
        if (isPresent(host)) {
            StringMapWrapper.forEach(host, (value, key) => {
                var matches = RegExpWrapper.firstMatch(HOST_REG_EXP, key);
                if (isBlank(matches)) {
                    hostAttributes[key] = value;
                }
                else if (isPresent(matches[1])) {
                    hostProperties[matches[1]] = value;
                }
                else if (isPresent(matches[2])) {
                    hostListeners[matches[2]] = value;
                }
            });
        }
        var inputsMap = {};
        if (isPresent(inputs)) {
            inputs.forEach((bindConfig) => {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                inputsMap[parts[0]] = parts[1];
            });
        }
        var outputsMap = {};
        if (isPresent(outputs)) {
            outputs.forEach((bindConfig) => {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                outputsMap[parts[0]] = parts[1];
            });
        }
        return new CompileDirectiveMetadata({
            type: type,
            isComponent: normalizeBool(isComponent),
            selector: selector,
            exportAs: exportAs,
            changeDetection: changeDetection,
            inputs: inputsMap,
            outputs: outputsMap,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            lifecycleHooks: isPresent(lifecycleHooks) ? lifecycleHooks : [],
            providers: providers,
            viewProviders: viewProviders,
            queries: queries,
            viewQueries: viewQueries,
            template: template
        });
    }
    get identifier() { return this.type; }
    static fromJson(data) {
        return new CompileDirectiveMetadata({
            isComponent: data['isComponent'],
            selector: data['selector'],
            exportAs: data['exportAs'],
            type: isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            changeDetection: isPresent(data['changeDetection']) ?
                CHANGE_DETECTION_STRATEGY_VALUES[data['changeDetection']] :
                data['changeDetection'],
            inputs: data['inputs'],
            outputs: data['outputs'],
            hostListeners: data['hostListeners'],
            hostProperties: data['hostProperties'],
            hostAttributes: data['hostAttributes'],
            lifecycleHooks: data['lifecycleHooks'].map(hookValue => LIFECYCLE_HOOKS_VALUES[hookValue]),
            template: isPresent(data['template']) ? CompileTemplateMetadata.fromJson(data['template']) :
                data['template'],
            providers: _arrayFromJson(data['providers'], metadataFromJson),
            viewProviders: _arrayFromJson(data['viewProviders'], metadataFromJson),
            queries: _arrayFromJson(data['queries'], CompileQueryMetadata.fromJson),
            viewQueries: _arrayFromJson(data['viewQueries'], CompileQueryMetadata.fromJson)
        });
    }
    toJson() {
        return {
            'class': 'Directive',
            'isComponent': this.isComponent,
            'selector': this.selector,
            'exportAs': this.exportAs,
            'type': isPresent(this.type) ? this.type.toJson() : this.type,
            'changeDetection': isPresent(this.changeDetection) ? serializeEnum(this.changeDetection) :
                this.changeDetection,
            'inputs': this.inputs,
            'outputs': this.outputs,
            'hostListeners': this.hostListeners,
            'hostProperties': this.hostProperties,
            'hostAttributes': this.hostAttributes,
            'lifecycleHooks': this.lifecycleHooks.map(hook => serializeEnum(hook)),
            'template': isPresent(this.template) ? this.template.toJson() : this.template,
            'providers': _arrayToJson(this.providers),
            'viewProviders': _arrayToJson(this.viewProviders),
            'queries': _arrayToJson(this.queries),
            'viewQueries': _arrayToJson(this.viewQueries)
        };
    }
}
/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export function createHostComponentMeta(componentType, componentSelector) {
    var template = CssSelector.parse(componentSelector)[0].getMatchingElementTemplate();
    return CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({
            runtime: Object,
            name: `${componentType.name}_Host`,
            moduleUrl: componentType.moduleUrl,
            isHost: true
        }),
        template: new CompileTemplateMetadata({ template: template, templateUrl: '', styles: [], styleUrls: [], ngContentSelectors: [] }),
        changeDetection: ChangeDetectionStrategy.Default,
        inputs: [],
        outputs: [],
        host: {},
        lifecycleHooks: [],
        isComponent: true,
        selector: '*',
        providers: [],
        viewProviders: [],
        queries: [],
        viewQueries: []
    });
}
export class CompilePipeMetadata {
    constructor({ type, name, pure, lifecycleHooks } = {}) {
        this.type = type;
        this.name = name;
        this.pure = normalizeBool(pure);
        this.lifecycleHooks = _normalizeArray(lifecycleHooks);
    }
    get identifier() { return this.type; }
    static fromJson(data) {
        return new CompilePipeMetadata({
            type: isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            name: data['name'],
            pure: data['pure']
        });
    }
    toJson() {
        return {
            'class': 'Pipe',
            'type': isPresent(this.type) ? this.type.toJson() : null,
            'name': this.name,
            'pure': this.pure
        };
    }
}
var _COMPILE_METADATA_FROM_JSON = {
    'Directive': CompileDirectiveMetadata.fromJson,
    'Pipe': CompilePipeMetadata.fromJson,
    'Type': CompileTypeMetadata.fromJson,
    'Provider': CompileProviderMetadata.fromJson,
    'Identifier': CompileIdentifierMetadata.fromJson,
    'Factory': CompileFactoryMetadata.fromJson
};
function _arrayFromJson(obj, fn) {
    return isBlank(obj) ? null : obj.map(o => _objFromJson(o, fn));
}
function _arrayToJson(obj) {
    return isBlank(obj) ? null : obj.map(_objToJson);
}
function _objFromJson(obj, fn) {
    if (isArray(obj))
        return _arrayFromJson(obj, fn);
    if (isString(obj) || isBlank(obj) || isBoolean(obj) || isNumber(obj))
        return obj;
    return fn(obj);
}
function _objToJson(obj) {
    if (isArray(obj))
        return _arrayToJson(obj);
    if (isString(obj) || isBlank(obj) || isBoolean(obj) || isNumber(obj))
        return obj;
    return obj.toJson();
}
function _normalizeArray(obj) {
    return isPresent(obj) ? obj : [];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtWVdRNGhHbXoudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9jb21waWxlX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFDUCxRQUFRLEVBQ1IsU0FBUyxFQUNULGFBQWEsRUFDYixjQUFjLEVBQ2QsYUFBYSxFQUViLFFBQVEsRUFDUixhQUFhLEVBRWIsT0FBTyxFQUNSLE1BQU0sMEJBQTBCO09BQzFCLEVBQUMsYUFBYSxFQUFFLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNwRSxFQUNMLGdCQUFnQixFQUlqQixNQUFNLGdDQUFnQztPQUNoQyxFQUNMLHVCQUF1QixFQUN2QixnQ0FBZ0MsRUFDakMsTUFBTSxxREFBcUQ7T0FDckQsRUFBQyxpQkFBaUIsRUFBRSx5QkFBeUIsRUFBQyxNQUFNLGlDQUFpQztPQUNyRixFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNuRCxFQUFDLFlBQVksRUFBQyxNQUFNLFFBQVE7T0FDNUIsRUFBaUIsc0JBQXNCLEVBQUMsTUFBTSw0Q0FBNEM7T0FDMUYsRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0I7QUFFM0Msd0NBQXdDO0FBQ3hDLGtDQUFrQztBQUNsQyxJQUFJLFlBQVksR0FBRywwQ0FBMEMsQ0FBQztBQUU5RDtJQUdFLElBQUksVUFBVSxLQUFnQyxNQUFNLENBQTRCLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwRyxDQUFDO0FBRUQsNkNBQXNELDZCQUE2QjtJQUdqRixJQUFJLElBQUksS0FBMEIsTUFBTSxDQUFzQixhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFaEYsSUFBSSxVQUFVLEtBQWdDLE1BQU0sQ0FBNEIsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BHLENBQUM7QUFFRCxp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RyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRUQsc0JBQXNCLEdBQVEsRUFBRSxFQUFvQztJQUNsRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2pGLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakIsQ0FBQztBQUVELG9CQUFvQixHQUFRO0lBQzFCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNqRixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCLENBQUM7QUFFRCx5QkFBeUIsR0FBVTtJQUNqQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgaXNOdW1iZXIsXG4gIGlzQm9vbGVhbixcbiAgbm9ybWFsaXplQm9vbCxcbiAgbm9ybWFsaXplQmxhbmssXG4gIHNlcmlhbGl6ZUVudW0sXG4gIFR5cGUsXG4gIGlzU3RyaW5nLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyLFxuICBpc0FycmF5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWQsIEJhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1xuICBTdHJpbmdNYXBXcmFwcGVyLFxuICBNYXBXcmFwcGVyLFxuICBTZXRXcmFwcGVyLFxuICBMaXN0V3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENIQU5HRV9ERVRFQ1RJT05fU1RSQVRFR1lfVkFMVUVTXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9uLCBWSUVXX0VOQ0FQU1VMQVRJT05fVkFMVUVTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7Q3NzU2VsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9zZWxlY3Rvcic7XG5pbXBvcnQge3NwbGl0QXRDb2xvbn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3MsIExJRkVDWUNMRV9IT09LU19WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQge2dldFVybFNjaGVtZX0gZnJvbSAnLi91cmxfcmVzb2x2ZXInO1xuXG4vLyBncm91cCAxOiBcInByb3BlcnR5XCIgZnJvbSBcIltwcm9wZXJ0eV1cIlxuLy8gZ3JvdXAgMjogXCJldmVudFwiIGZyb20gXCIoZXZlbnQpXCJcbnZhciBIT1NUX1JFR19FWFAgPSAvXig/Oig/OlxcWyhbXlxcXV0rKVxcXSl8KD86XFwoKFteXFwpXSspXFwpKSkkL2c7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIGFic3RyYWN0IHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUgZXh0ZW5kcyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIGFic3RyYWN0IHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBnZXQgdHlwZSgpOiBDb21waWxlVHlwZU1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlVHlwZU1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gPENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGE+dW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXRhZGF0YUZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYW55IHtcbiAgcmV0dXJuIF9DT01QSUxFX01FVEFEQVRBX0ZST01fSlNPTltkYXRhWydjbGFzcyddXShkYXRhKTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIHJ1bnRpbWU6IGFueTtcbiAgbmFtZTogc3RyaW5nO1xuICBwcmVmaXg6IHN0cmluZztcbiAgbW9kdWxlVXJsOiBzdHJpbmc7XG4gIHZhbHVlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICB7cnVudGltZSwgbmFtZSwgbW9kdWxlVXJsLCBwcmVmaXgsIHZhbHVlfTpcbiAgICAgICAgICB7cnVudGltZT86IGFueSwgbmFtZT86IHN0cmluZywgbW9kdWxlVXJsPzogc3RyaW5nLCBwcmVmaXg/OiBzdHJpbmcsIHZhbHVlPzogYW55fSA9IHt9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICAgIGxldCB2YWx1ZSA9IGlzQXJyYXkoZGF0YVsndmFsdWUnXSkgPyBfYXJyYXlGcm9tSnNvbihkYXRhWyd2YWx1ZSddLCBtZXRhZGF0YUZyb21Kc29uKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9vYmpGcm9tSnNvbihkYXRhWyd2YWx1ZSddLCBtZXRhZGF0YUZyb21Kc29uKTtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoXG4gICAgICAgIHtuYW1lOiBkYXRhWyduYW1lJ10sIHByZWZpeDogZGF0YVsncHJlZml4J10sIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sIHZhbHVlOiB2YWx1ZX0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgdmFsdWUgPSBpc0FycmF5KHRoaXMudmFsdWUpID8gX2FycmF5VG9Kc29uKHRoaXMudmFsdWUpIDogX29ialRvSnNvbih0aGlzLnZhbHVlKTtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICdjbGFzcyc6ICdJZGVudGlmaWVyJyxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ21vZHVsZVVybCc6IHRoaXMubW9kdWxlVXJsLFxuICAgICAgJ3ByZWZpeCc6IHRoaXMucHJlZml4LFxuICAgICAgJ3ZhbHVlJzogdmFsdWVcbiAgICB9O1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBpc0F0dHJpYnV0ZTogYm9vbGVhbjtcbiAgaXNTZWxmOiBib29sZWFuO1xuICBpc0hvc3Q6IGJvb2xlYW47XG4gIGlzU2tpcFNlbGY6IGJvb2xlYW47XG4gIGlzT3B0aW9uYWw6IGJvb2xlYW47XG4gIGlzVmFsdWU6IGJvb2xlYW47XG4gIHF1ZXJ5OiBDb21waWxlUXVlcnlNZXRhZGF0YTtcbiAgdmlld1F1ZXJ5OiBDb21waWxlUXVlcnlNZXRhZGF0YTtcbiAgdG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB2YWx1ZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHtpc0F0dHJpYnV0ZSwgaXNTZWxmLCBpc0hvc3QsIGlzU2tpcFNlbGYsIGlzT3B0aW9uYWwsIGlzVmFsdWUsIHF1ZXJ5LCB2aWV3UXVlcnksXG4gICAgICAgICAgICAgICB0b2tlbiwgdmFsdWV9OiB7XG4gICAgaXNBdHRyaWJ1dGU/OiBib29sZWFuLFxuICAgIGlzU2VsZj86IGJvb2xlYW4sXG4gICAgaXNIb3N0PzogYm9vbGVhbixcbiAgICBpc1NraXBTZWxmPzogYm9vbGVhbixcbiAgICBpc09wdGlvbmFsPzogYm9vbGVhbixcbiAgICBpc1ZhbHVlPzogYm9vbGVhbixcbiAgICBxdWVyeT86IENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICAgIHZpZXdRdWVyeT86IENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICAgIHRva2VuPzogQ29tcGlsZVRva2VuTWV0YWRhdGEsXG4gICAgdmFsdWU/OiBhbnlcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5pc0F0dHJpYnV0ZSA9IG5vcm1hbGl6ZUJvb2woaXNBdHRyaWJ1dGUpO1xuICAgIHRoaXMuaXNTZWxmID0gbm9ybWFsaXplQm9vbChpc1NlbGYpO1xuICAgIHRoaXMuaXNIb3N0ID0gbm9ybWFsaXplQm9vbChpc0hvc3QpO1xuICAgIHRoaXMuaXNTa2lwU2VsZiA9IG5vcm1hbGl6ZUJvb2woaXNTa2lwU2VsZik7XG4gICAgdGhpcy5pc09wdGlvbmFsID0gbm9ybWFsaXplQm9vbChpc09wdGlvbmFsKTtcbiAgICB0aGlzLmlzVmFsdWUgPSBub3JtYWxpemVCb29sKGlzVmFsdWUpO1xuICAgIHRoaXMucXVlcnkgPSBxdWVyeTtcbiAgICB0aGlzLnZpZXdRdWVyeSA9IHZpZXdRdWVyeTtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7XG4gICAgICB0b2tlbjogX29iakZyb21Kc29uKGRhdGFbJ3Rva2VuJ10sIENvbXBpbGVUb2tlbk1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHF1ZXJ5OiBfb2JqRnJvbUpzb24oZGF0YVsncXVlcnknXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdmlld1F1ZXJ5OiBfb2JqRnJvbUpzb24oZGF0YVsndmlld1F1ZXJ5J10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgaXNBdHRyaWJ1dGU6IGRhdGFbJ2lzQXR0cmlidXRlJ10sXG4gICAgICBpc1NlbGY6IGRhdGFbJ2lzU2VsZiddLFxuICAgICAgaXNIb3N0OiBkYXRhWydpc0hvc3QnXSxcbiAgICAgIGlzU2tpcFNlbGY6IGRhdGFbJ2lzU2tpcFNlbGYnXSxcbiAgICAgIGlzT3B0aW9uYWw6IGRhdGFbJ2lzT3B0aW9uYWwnXSxcbiAgICAgIGlzVmFsdWU6IGRhdGFbJ2lzVmFsdWUnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3Rva2VuJzogX29ialRvSnNvbih0aGlzLnRva2VuKSxcbiAgICAgICdxdWVyeSc6IF9vYmpUb0pzb24odGhpcy5xdWVyeSksXG4gICAgICAndmlld1F1ZXJ5JzogX29ialRvSnNvbih0aGlzLnZpZXdRdWVyeSksXG4gICAgICAndmFsdWUnOiB0aGlzLnZhbHVlLFxuICAgICAgJ2lzQXR0cmlidXRlJzogdGhpcy5pc0F0dHJpYnV0ZSxcbiAgICAgICdpc1NlbGYnOiB0aGlzLmlzU2VsZixcbiAgICAgICdpc0hvc3QnOiB0aGlzLmlzSG9zdCxcbiAgICAgICdpc1NraXBTZWxmJzogdGhpcy5pc1NraXBTZWxmLFxuICAgICAgJ2lzT3B0aW9uYWwnOiB0aGlzLmlzT3B0aW9uYWwsXG4gICAgICAnaXNWYWx1ZSc6IHRoaXMuaXNWYWx1ZVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgdG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB1c2VDbGFzczogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgdXNlVmFsdWU6IGFueTtcbiAgdXNlRXhpc3Rpbmc6IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB1c2VGYWN0b3J5OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhO1xuICBkZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe3Rva2VuLCB1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b2tlbj86IENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICAgIHVzZUNsYXNzPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICB1c2VWYWx1ZT86IGFueSxcbiAgICB1c2VFeGlzdGluZz86IENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICAgIHVzZUZhY3Rvcnk/OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhLFxuICAgIGRlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3M7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5O1xuICAgIHRoaXMuZGVwcyA9IG5vcm1hbGl6ZUJsYW5rKGRlcHMpO1xuICAgIHRoaXMubXVsdGkgPSBub3JtYWxpemVCb29sKG11bHRpKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVQcm92aWRlck1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiBfb2JqRnJvbUpzb24oZGF0YVsndG9rZW4nXSwgQ29tcGlsZVRva2VuTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlQ2xhc3M6IF9vYmpGcm9tSnNvbihkYXRhWyd1c2VDbGFzcyddLCBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUV4aXN0aW5nOiBfb2JqRnJvbUpzb24oZGF0YVsndXNlRXhpc3RpbmcnXSwgQ29tcGlsZVRva2VuTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgdXNlVmFsdWU6IF9vYmpGcm9tSnNvbihkYXRhWyd1c2VWYWx1ZSddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUZhY3Rvcnk6IF9vYmpGcm9tSnNvbihkYXRhWyd1c2VGYWN0b3J5J10sIENvbXBpbGVGYWN0b3J5TWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgbXVsdGk6IGRhdGFbJ211bHRpJ10sXG4gICAgICBkZXBzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydkZXBzJ10sIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnY2xhc3MnOiAnUHJvdmlkZXInLFxuICAgICAgJ3Rva2VuJzogX29ialRvSnNvbih0aGlzLnRva2VuKSxcbiAgICAgICd1c2VDbGFzcyc6IF9vYmpUb0pzb24odGhpcy51c2VDbGFzcyksXG4gICAgICAndXNlRXhpc3RpbmcnOiBfb2JqVG9Kc29uKHRoaXMudXNlRXhpc3RpbmcpLFxuICAgICAgJ3VzZVZhbHVlJzogX29ialRvSnNvbih0aGlzLnVzZVZhbHVlKSxcbiAgICAgICd1c2VGYWN0b3J5JzogX29ialRvSnNvbih0aGlzLnVzZUZhY3RvcnkpLFxuICAgICAgJ211bHRpJzogdGhpcy5tdWx0aSxcbiAgICAgICdkZXBzJzogX2FycmF5VG9Kc29uKHRoaXMuZGVwcylcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlRmFjdG9yeU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgICBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIHJ1bnRpbWU6IEZ1bmN0aW9uO1xuICBuYW1lOiBzdHJpbmc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgdmFsdWU6IGFueTtcbiAgZGlEZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcblxuICBjb25zdHJ1Y3Rvcih7cnVudGltZSwgbmFtZSwgbW9kdWxlVXJsLCBwcmVmaXgsIGRpRGVwcywgdmFsdWV9OiB7XG4gICAgcnVudGltZT86IEZ1bmN0aW9uLFxuICAgIG5hbWU/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIG1vZHVsZVVybD86IHN0cmluZyxcbiAgICB2YWx1ZT86IGJvb2xlYW4sXG4gICAgZGlEZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW11cbiAgfSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLmRpRGVwcyA9IF9ub3JtYWxpemVBcnJheShkaURlcHMpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVGYWN0b3J5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSh7XG4gICAgICBuYW1lOiBkYXRhWyduYW1lJ10sXG4gICAgICBwcmVmaXg6IGRhdGFbJ3ByZWZpeCddLFxuICAgICAgbW9kdWxlVXJsOiBkYXRhWydtb2R1bGVVcmwnXSxcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgZGlEZXBzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydkaURlcHMnXSwgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2NsYXNzJzogJ0ZhY3RvcnknLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAndmFsdWUnOiB0aGlzLnZhbHVlLFxuICAgICAgJ2RpRGVwcyc6IF9hcnJheVRvSnNvbih0aGlzLmRpRGVwcylcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlVG9rZW5NZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgdmFsdWU6IGFueTtcbiAgaWRlbnRpZmllcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YTtcbiAgaWRlbnRpZmllcklzSW5zdGFuY2U6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe3ZhbHVlLCBpZGVudGlmaWVyLCBpZGVudGlmaWVySXNJbnN0YW5jZX06IHtcbiAgICB2YWx1ZT86IGFueSxcbiAgICBpZGVudGlmaWVyPzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgICBpZGVudGlmaWVySXNJbnN0YW5jZT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmlkZW50aWZpZXIgPSBpZGVudGlmaWVyO1xuICAgIHRoaXMuaWRlbnRpZmllcklzSW5zdGFuY2UgPSBub3JtYWxpemVCb29sKGlkZW50aWZpZXJJc0luc3RhbmNlKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVUb2tlbk1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVUb2tlbk1ldGFkYXRhKHtcbiAgICAgIHZhbHVlOiBkYXRhWyd2YWx1ZSddLFxuICAgICAgaWRlbnRpZmllcjogX29iakZyb21Kc29uKGRhdGFbJ2lkZW50aWZpZXInXSwgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBpZGVudGlmaWVySXNJbnN0YW5jZTogZGF0YVsnaWRlbnRpZmllcklzSW5zdGFuY2UnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3ZhbHVlJzogdGhpcy52YWx1ZSxcbiAgICAgICdpZGVudGlmaWVyJzogX29ialRvSnNvbih0aGlzLmlkZW50aWZpZXIpLFxuICAgICAgJ2lkZW50aWZpZXJJc0luc3RhbmNlJzogdGhpcy5pZGVudGlmaWVySXNJbnN0YW5jZVxuICAgIH07XG4gIH1cblxuICBnZXQgcnVudGltZUNhY2hlS2V5KCk6IGFueSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmlkZW50aWZpZXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5pZGVudGlmaWVyLnJ1bnRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGdldCBhc3NldENhY2hlS2V5KCk6IGFueSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmlkZW50aWZpZXIpKSB7XG4gICAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuaWRlbnRpZmllci5tb2R1bGVVcmwpICYmXG4gICAgICAgICAgICAgICAgICAgICBpc1ByZXNlbnQoZ2V0VXJsU2NoZW1lKHRoaXMuaWRlbnRpZmllci5tb2R1bGVVcmwpKSA/XG4gICAgICAgICAgICAgICAgIGAke3RoaXMuaWRlbnRpZmllci5uYW1lfXwke3RoaXMuaWRlbnRpZmllci5tb2R1bGVVcmx9fCR7dGhpcy5pZGVudGlmaWVySXNJbnN0YW5jZX1gIDpcbiAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzVG8odG9rZW4yOiBDb21waWxlVG9rZW5NZXRhZGF0YSk6IGJvb2xlYW4ge1xuICAgIHZhciByayA9IHRoaXMucnVudGltZUNhY2hlS2V5O1xuICAgIHZhciBhayA9IHRoaXMuYXNzZXRDYWNoZUtleTtcbiAgICByZXR1cm4gKGlzUHJlc2VudChyaykgJiYgcmsgPT0gdG9rZW4yLnJ1bnRpbWVDYWNoZUtleSkgfHxcbiAgICAgICAgICAgKGlzUHJlc2VudChhaykgJiYgYWsgPT0gdG9rZW4yLmFzc2V0Q2FjaGVLZXkpO1xuICB9XG5cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLnZhbHVlKSA/IHRoaXMudmFsdWUgOiB0aGlzLmlkZW50aWZpZXIubmFtZTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVRva2VuTWFwPFZBTFVFPiB7XG4gIHByaXZhdGUgX3ZhbHVlTWFwID0gbmV3IE1hcDxhbnksIFZBTFVFPigpO1xuICBwcml2YXRlIF92YWx1ZXM6IFZBTFVFW10gPSBbXTtcblxuICBhZGQodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhLCB2YWx1ZTogVkFMVUUpIHtcbiAgICB2YXIgZXhpc3RpbmcgPSB0aGlzLmdldCh0b2tlbik7XG4gICAgaWYgKGlzUHJlc2VudChleGlzdGluZykpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW4gb25seSBhZGQgdG8gYSBUb2tlbk1hcCEgVG9rZW46ICR7dG9rZW4ubmFtZX1gKTtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWVzLnB1c2godmFsdWUpO1xuICAgIHZhciByayA9IHRva2VuLnJ1bnRpbWVDYWNoZUtleTtcbiAgICBpZiAoaXNQcmVzZW50KHJrKSkge1xuICAgICAgdGhpcy5fdmFsdWVNYXAuc2V0KHJrLCB2YWx1ZSk7XG4gICAgfVxuICAgIHZhciBhayA9IHRva2VuLmFzc2V0Q2FjaGVLZXk7XG4gICAgaWYgKGlzUHJlc2VudChhaykpIHtcbiAgICAgIHRoaXMuX3ZhbHVlTWFwLnNldChhaywgdmFsdWUpO1xuICAgIH1cbiAgfVxuICBnZXQodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhKTogVkFMVUUge1xuICAgIHZhciByayA9IHRva2VuLnJ1bnRpbWVDYWNoZUtleTtcbiAgICB2YXIgYWsgPSB0b2tlbi5hc3NldENhY2hlS2V5O1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYgKGlzUHJlc2VudChyaykpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX3ZhbHVlTWFwLmdldChyayk7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgaXNQcmVzZW50KGFrKSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fdmFsdWVNYXAuZ2V0KGFrKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICB2YWx1ZXMoKTogVkFMVUVbXSB7IHJldHVybiB0aGlzLl92YWx1ZXM7IH1cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3ZhbHVlcy5sZW5ndGg7IH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0eXBlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZVR5cGVNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlIHtcbiAgcnVudGltZTogVHlwZTtcbiAgbmFtZTogc3RyaW5nO1xuICBwcmVmaXg6IHN0cmluZztcbiAgbW9kdWxlVXJsOiBzdHJpbmc7XG4gIGlzSG9zdDogYm9vbGVhbjtcbiAgdmFsdWU6IGFueTtcbiAgZGlEZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcblxuICBjb25zdHJ1Y3Rvcih7cnVudGltZSwgbmFtZSwgbW9kdWxlVXJsLCBwcmVmaXgsIGlzSG9zdCwgdmFsdWUsIGRpRGVwc306IHtcbiAgICBydW50aW1lPzogVHlwZSxcbiAgICBuYW1lPzogc3RyaW5nLFxuICAgIG1vZHVsZVVybD86IHN0cmluZyxcbiAgICBwcmVmaXg/OiBzdHJpbmcsXG4gICAgaXNIb3N0PzogYm9vbGVhbixcbiAgICB2YWx1ZT86IGFueSxcbiAgICBkaURlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXVxuICB9ID0ge30pIHtcbiAgICB0aGlzLnJ1bnRpbWUgPSBydW50aW1lO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5tb2R1bGVVcmwgPSBtb2R1bGVVcmw7XG4gICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XG4gICAgdGhpcy5pc0hvc3QgPSBub3JtYWxpemVCb29sKGlzSG9zdCk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuZGlEZXBzID0gX25vcm1hbGl6ZUFycmF5KGRpRGVwcyk7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlVHlwZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVUeXBlTWV0YWRhdGEoe1xuICAgICAgbmFtZTogZGF0YVsnbmFtZSddLFxuICAgICAgbW9kdWxlVXJsOiBkYXRhWydtb2R1bGVVcmwnXSxcbiAgICAgIHByZWZpeDogZGF0YVsncHJlZml4J10sXG4gICAgICBpc0hvc3Q6IGRhdGFbJ2lzSG9zdCddLFxuICAgICAgdmFsdWU6IGRhdGFbJ3ZhbHVlJ10sXG4gICAgICBkaURlcHM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ2RpRGVwcyddLCBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEuZnJvbUpzb24pXG4gICAgfSk7XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cbiAgZ2V0IHR5cGUoKTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICdjbGFzcyc6ICdUeXBlJyxcbiAgICAgICduYW1lJzogdGhpcy5uYW1lLFxuICAgICAgJ21vZHVsZVVybCc6IHRoaXMubW9kdWxlVXJsLFxuICAgICAgJ3ByZWZpeCc6IHRoaXMucHJlZml4LFxuICAgICAgJ2lzSG9zdCc6IHRoaXMuaXNIb3N0LFxuICAgICAgJ3ZhbHVlJzogdGhpcy52YWx1ZSxcbiAgICAgICdkaURlcHMnOiBfYXJyYXlUb0pzb24odGhpcy5kaURlcHMpXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEge1xuICBzZWxlY3RvcnM6IEFycmF5PENvbXBpbGVUb2tlbk1ldGFkYXRhPjtcbiAgZGVzY2VuZGFudHM6IGJvb2xlYW47XG4gIGZpcnN0OiBib29sZWFuO1xuICBwcm9wZXJ0eU5hbWU6IHN0cmluZztcbiAgcmVhZDogQ29tcGlsZVRva2VuTWV0YWRhdGE7XG5cbiAgY29uc3RydWN0b3Ioe3NlbGVjdG9ycywgZGVzY2VuZGFudHMsIGZpcnN0LCBwcm9wZXJ0eU5hbWUsIHJlYWR9OiB7XG4gICAgc2VsZWN0b3JzPzogQXJyYXk8Q29tcGlsZVRva2VuTWV0YWRhdGE+LFxuICAgIGRlc2NlbmRhbnRzPzogYm9vbGVhbixcbiAgICBmaXJzdD86IGJvb2xlYW4sXG4gICAgcHJvcGVydHlOYW1lPzogc3RyaW5nLFxuICAgIHJlYWQ/OiBDb21waWxlVG9rZW5NZXRhZGF0YVxuICB9ID0ge30pIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICB0aGlzLmRlc2NlbmRhbnRzID0gbm9ybWFsaXplQm9vbChkZXNjZW5kYW50cyk7XG4gICAgdGhpcy5maXJzdCA9IG5vcm1hbGl6ZUJvb2woZmlyc3QpO1xuICAgIHRoaXMucHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lO1xuICAgIHRoaXMucmVhZCA9IHJlYWQ7XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUXVlcnlNZXRhZGF0YSh7XG4gICAgICBzZWxlY3RvcnM6IF9hcnJheUZyb21Kc29uKGRhdGFbJ3NlbGVjdG9ycyddLCBDb21waWxlVG9rZW5NZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICBkZXNjZW5kYW50czogZGF0YVsnZGVzY2VuZGFudHMnXSxcbiAgICAgIGZpcnN0OiBkYXRhWydmaXJzdCddLFxuICAgICAgcHJvcGVydHlOYW1lOiBkYXRhWydwcm9wZXJ0eU5hbWUnXSxcbiAgICAgIHJlYWQ6IF9vYmpGcm9tSnNvbihkYXRhWydyZWFkJ10sIENvbXBpbGVUb2tlbk1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3NlbGVjdG9ycyc6IF9hcnJheVRvSnNvbih0aGlzLnNlbGVjdG9ycyksXG4gICAgICAnZGVzY2VuZGFudHMnOiB0aGlzLmRlc2NlbmRhbnRzLFxuICAgICAgJ2ZpcnN0JzogdGhpcy5maXJzdCxcbiAgICAgICdwcm9wZXJ0eU5hbWUnOiB0aGlzLnByb3BlcnR5TmFtZSxcbiAgICAgICdyZWFkJzogX29ialRvSnNvbih0aGlzLnJlYWQpXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEge1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbjtcbiAgdGVtcGxhdGU6IHN0cmluZztcbiAgdGVtcGxhdGVVcmw6IHN0cmluZztcbiAgc3R5bGVzOiBzdHJpbmdbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXTtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgY29uc3RydWN0b3Ioe2VuY2Fwc3VsYXRpb24sIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCwgc3R5bGVzLCBzdHlsZVVybHMsIG5nQ29udGVudFNlbGVjdG9yc306IHtcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgbmdDb250ZW50U2VsZWN0b3JzPzogc3RyaW5nW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gaXNQcmVzZW50KGVuY2Fwc3VsYXRpb24pID8gZW5jYXBzdWxhdGlvbiA6IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlVXJsID0gdGVtcGxhdGVVcmw7XG4gICAgdGhpcy5zdHlsZXMgPSBpc1ByZXNlbnQoc3R5bGVzKSA/IHN0eWxlcyA6IFtdO1xuICAgIHRoaXMuc3R5bGVVcmxzID0gaXNQcmVzZW50KHN0eWxlVXJscykgPyBzdHlsZVVybHMgOiBbXTtcbiAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycyA9IGlzUHJlc2VudChuZ0NvbnRlbnRTZWxlY3RvcnMpID8gbmdDb250ZW50U2VsZWN0b3JzIDogW107XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSh7XG4gICAgICBlbmNhcHN1bGF0aW9uOiBpc1ByZXNlbnQoZGF0YVsnZW5jYXBzdWxhdGlvbiddKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFU1tkYXRhWydlbmNhcHN1bGF0aW9uJ11dIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWydlbmNhcHN1bGF0aW9uJ10sXG4gICAgICB0ZW1wbGF0ZTogZGF0YVsndGVtcGxhdGUnXSxcbiAgICAgIHRlbXBsYXRlVXJsOiBkYXRhWyd0ZW1wbGF0ZVVybCddLFxuICAgICAgc3R5bGVzOiBkYXRhWydzdHlsZXMnXSxcbiAgICAgIHN0eWxlVXJsczogZGF0YVsnc3R5bGVVcmxzJ10sXG4gICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IGRhdGFbJ25nQ29udGVudFNlbGVjdG9ycyddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnZW5jYXBzdWxhdGlvbic6XG4gICAgICAgICAgaXNQcmVzZW50KHRoaXMuZW5jYXBzdWxhdGlvbikgPyBzZXJpYWxpemVFbnVtKHRoaXMuZW5jYXBzdWxhdGlvbikgOiB0aGlzLmVuY2Fwc3VsYXRpb24sXG4gICAgICAndGVtcGxhdGUnOiB0aGlzLnRlbXBsYXRlLFxuICAgICAgJ3RlbXBsYXRlVXJsJzogdGhpcy50ZW1wbGF0ZVVybCxcbiAgICAgICdzdHlsZXMnOiB0aGlzLnN0eWxlcyxcbiAgICAgICdzdHlsZVVybHMnOiB0aGlzLnN0eWxlVXJscyxcbiAgICAgICduZ0NvbnRlbnRTZWxlY3RvcnMnOiB0aGlzLm5nQ29udGVudFNlbGVjdG9yc1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSBkaXJlY3RpdmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHN0YXRpYyBjcmVhdGUoe3R5cGUsIGlzQ29tcG9uZW50LCBzZWxlY3RvciwgZXhwb3J0QXMsIGNoYW5nZURldGVjdGlvbiwgaW5wdXRzLCBvdXRwdXRzLCBob3N0LFxuICAgICAgICAgICAgICAgICBsaWZlY3ljbGVIb29rcywgcHJvdmlkZXJzLCB2aWV3UHJvdmlkZXJzLCBxdWVyaWVzLCB2aWV3UXVlcmllcywgdGVtcGxhdGV9OiB7XG4gICAgdHlwZT86IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgaXNDb21wb25lbnQ/OiBib29sZWFuLFxuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgbGlmZWN5Y2xlSG9va3M/OiBMaWZlY3ljbGVIb29rc1tdLFxuICAgIHByb3ZpZGVycz86XG4gICAgICAgIEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgdmlld1Byb3ZpZGVycz86XG4gICAgICAgIEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgcXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdmlld1F1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIHRlbXBsYXRlPzogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGFcbiAgfSA9IHt9KTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgdmFyIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdCkpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChob3N0LCAodmFsdWU6IHN0cmluZywga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goSE9TVF9SRUdfRVhQLCBrZXkpO1xuICAgICAgICBpZiAoaXNCbGFuayhtYXRjaGVzKSkge1xuICAgICAgICAgIGhvc3RBdHRyaWJ1dGVzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQobWF0Y2hlc1sxXSkpIHtcbiAgICAgICAgICBob3N0UHJvcGVydGllc1ttYXRjaGVzWzFdXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChtYXRjaGVzWzJdKSkge1xuICAgICAgICAgIGhvc3RMaXN0ZW5lcnNbbWF0Y2hlc1syXV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBpbnB1dHNNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlzUHJlc2VudChpbnB1dHMpKSB7XG4gICAgICBpbnB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgdmFyIHBhcnRzID0gc3BsaXRBdENvbG9uKGJpbmRDb25maWcsIFtiaW5kQ29uZmlnLCBiaW5kQ29uZmlnXSk7XG4gICAgICAgIGlucHV0c01hcFtwYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgb3V0cHV0c01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaXNQcmVzZW50KG91dHB1dHMpKSB7XG4gICAgICBvdXRwdXRzLmZvckVhY2goKGJpbmRDb25maWc6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBjYW5vbmljYWwgc3ludGF4OiBgZGlyUHJvcDogZWxQcm9wYFxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBgOmAsIHVzZSBkaXJQcm9wID0gZWxQcm9wXG4gICAgICAgIHZhciBwYXJ0cyA9IHNwbGl0QXRDb2xvbihiaW5kQ29uZmlnLCBbYmluZENvbmZpZywgYmluZENvbmZpZ10pO1xuICAgICAgICBvdXRwdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGlzQ29tcG9uZW50OiBub3JtYWxpemVCb29sKGlzQ29tcG9uZW50KSxcbiAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzOiBleHBvcnRBcyxcbiAgICAgIGNoYW5nZURldGVjdGlvbjogY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgaW5wdXRzOiBpbnB1dHNNYXAsXG4gICAgICBvdXRwdXRzOiBvdXRwdXRzTWFwLFxuICAgICAgaG9zdExpc3RlbmVyczogaG9zdExpc3RlbmVycyxcbiAgICAgIGhvc3RQcm9wZXJ0aWVzOiBob3N0UHJvcGVydGllcyxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzOiBob3N0QXR0cmlidXRlcyxcbiAgICAgIGxpZmVjeWNsZUhvb2tzOiBpc1ByZXNlbnQobGlmZWN5Y2xlSG9va3MpID8gbGlmZWN5Y2xlSG9va3MgOiBbXSxcbiAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgdmlld1Byb3ZpZGVyczogdmlld1Byb3ZpZGVycyxcbiAgICAgIHF1ZXJpZXM6IHF1ZXJpZXMsXG4gICAgICB2aWV3UXVlcmllczogdmlld1F1ZXJpZXMsXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgICB9KTtcbiAgfVxuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBpc0NvbXBvbmVudDogYm9vbGVhbjtcbiAgc2VsZWN0b3I6IHN0cmluZztcbiAgZXhwb3J0QXM6IHN0cmluZztcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbiAgaW5wdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgbGlmZWN5Y2xlSG9va3M6IExpZmVjeWNsZUhvb2tzW107XG4gIHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcbiAgdmlld1Byb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcbiAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgdmlld1F1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG5cbiAgdGVtcGxhdGU6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhO1xuICBjb25zdHJ1Y3Rvcih7dHlwZSwgaXNDb21wb25lbnQsIHNlbGVjdG9yLCBleHBvcnRBcywgY2hhbmdlRGV0ZWN0aW9uLCBpbnB1dHMsIG91dHB1dHMsXG4gICAgICAgICAgICAgICBob3N0TGlzdGVuZXJzLCBob3N0UHJvcGVydGllcywgaG9zdEF0dHJpYnV0ZXMsIGxpZmVjeWNsZUhvb2tzLCBwcm92aWRlcnMsXG4gICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzLCBxdWVyaWVzLCB2aWV3UXVlcmllcywgdGVtcGxhdGV9OiB7XG4gICAgdHlwZT86IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgaXNDb21wb25lbnQ/OiBib29sZWFuLFxuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIGlucHV0cz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIG91dHB1dHM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBob3N0TGlzdGVuZXJzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdFByb3BlcnRpZXM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBob3N0QXR0cmlidXRlcz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGxpZmVjeWNsZUhvb2tzPzogTGlmZWN5Y2xlSG9va3NbXSxcbiAgICBwcm92aWRlcnM/OlxuICAgICAgICBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgYW55W10+LFxuICAgIHZpZXdQcm92aWRlcnM/OlxuICAgICAgICBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgYW55W10+LFxuICAgIHF1ZXJpZXM/OiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIHZpZXdRdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB0ZW1wbGF0ZT86IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhXG4gIH0gPSB7fSkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5pc0NvbXBvbmVudCA9IGlzQ29tcG9uZW50O1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB0aGlzLmV4cG9ydEFzID0gZXhwb3J0QXM7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb24gPSBjaGFuZ2VEZXRlY3Rpb247XG4gICAgdGhpcy5pbnB1dHMgPSBpbnB1dHM7XG4gICAgdGhpcy5vdXRwdXRzID0gb3V0cHV0cztcbiAgICB0aGlzLmhvc3RMaXN0ZW5lcnMgPSBob3N0TGlzdGVuZXJzO1xuICAgIHRoaXMuaG9zdFByb3BlcnRpZXMgPSBob3N0UHJvcGVydGllcztcbiAgICB0aGlzLmhvc3RBdHRyaWJ1dGVzID0gaG9zdEF0dHJpYnV0ZXM7XG4gICAgdGhpcy5saWZlY3ljbGVIb29rcyA9IF9ub3JtYWxpemVBcnJheShsaWZlY3ljbGVIb29rcyk7XG4gICAgdGhpcy5wcm92aWRlcnMgPSBfbm9ybWFsaXplQXJyYXkocHJvdmlkZXJzKTtcbiAgICB0aGlzLnZpZXdQcm92aWRlcnMgPSBfbm9ybWFsaXplQXJyYXkodmlld1Byb3ZpZGVycyk7XG4gICAgdGhpcy5xdWVyaWVzID0gX25vcm1hbGl6ZUFycmF5KHF1ZXJpZXMpO1xuICAgIHRoaXMudmlld1F1ZXJpZXMgPSBfbm9ybWFsaXplQXJyYXkodmlld1F1ZXJpZXMpO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgfVxuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdGhpcy50eXBlOyB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICBpc0NvbXBvbmVudDogZGF0YVsnaXNDb21wb25lbnQnXSxcbiAgICAgIHNlbGVjdG9yOiBkYXRhWydzZWxlY3RvciddLFxuICAgICAgZXhwb3J0QXM6IGRhdGFbJ2V4cG9ydEFzJ10sXG4gICAgICB0eXBlOiBpc1ByZXNlbnQoZGF0YVsndHlwZSddKSA/IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndHlwZSddKSA6IGRhdGFbJ3R5cGUnXSxcbiAgICAgIGNoYW5nZURldGVjdGlvbjogaXNQcmVzZW50KGRhdGFbJ2NoYW5nZURldGVjdGlvbiddKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFU1tkYXRhWydjaGFuZ2VEZXRlY3Rpb24nXV0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVsnY2hhbmdlRGV0ZWN0aW9uJ10sXG4gICAgICBpbnB1dHM6IGRhdGFbJ2lucHV0cyddLFxuICAgICAgb3V0cHV0czogZGF0YVsnb3V0cHV0cyddLFxuICAgICAgaG9zdExpc3RlbmVyczogZGF0YVsnaG9zdExpc3RlbmVycyddLFxuICAgICAgaG9zdFByb3BlcnRpZXM6IGRhdGFbJ2hvc3RQcm9wZXJ0aWVzJ10sXG4gICAgICBob3N0QXR0cmlidXRlczogZGF0YVsnaG9zdEF0dHJpYnV0ZXMnXSxcbiAgICAgIGxpZmVjeWNsZUhvb2tzOlxuICAgICAgICAgICg8YW55W10+ZGF0YVsnbGlmZWN5Y2xlSG9va3MnXSkubWFwKGhvb2tWYWx1ZSA9PiBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTW2hvb2tWYWx1ZV0pLFxuICAgICAgdGVtcGxhdGU6IGlzUHJlc2VudChkYXRhWyd0ZW1wbGF0ZSddKSA/IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLmZyb21Kc29uKGRhdGFbJ3RlbXBsYXRlJ10pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWyd0ZW1wbGF0ZSddLFxuICAgICAgcHJvdmlkZXJzOiBfYXJyYXlGcm9tSnNvbihkYXRhWydwcm92aWRlcnMnXSwgbWV0YWRhdGFGcm9tSnNvbiksXG4gICAgICB2aWV3UHJvdmlkZXJzOiBfYXJyYXlGcm9tSnNvbihkYXRhWyd2aWV3UHJvdmlkZXJzJ10sIG1ldGFkYXRhRnJvbUpzb24pLFxuICAgICAgcXVlcmllczogX2FycmF5RnJvbUpzb24oZGF0YVsncXVlcmllcyddLCBDb21waWxlUXVlcnlNZXRhZGF0YS5mcm9tSnNvbiksXG4gICAgICB2aWV3UXVlcmllczogX2FycmF5RnJvbUpzb24oZGF0YVsndmlld1F1ZXJpZXMnXSwgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24pXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnY2xhc3MnOiAnRGlyZWN0aXZlJyxcbiAgICAgICdpc0NvbXBvbmVudCc6IHRoaXMuaXNDb21wb25lbnQsXG4gICAgICAnc2VsZWN0b3InOiB0aGlzLnNlbGVjdG9yLFxuICAgICAgJ2V4cG9ydEFzJzogdGhpcy5leHBvcnRBcyxcbiAgICAgICd0eXBlJzogaXNQcmVzZW50KHRoaXMudHlwZSkgPyB0aGlzLnR5cGUudG9Kc29uKCkgOiB0aGlzLnR5cGUsXG4gICAgICAnY2hhbmdlRGV0ZWN0aW9uJzogaXNQcmVzZW50KHRoaXMuY2hhbmdlRGV0ZWN0aW9uKSA/IHNlcmlhbGl6ZUVudW0odGhpcy5jaGFuZ2VEZXRlY3Rpb24pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAnaW5wdXRzJzogdGhpcy5pbnB1dHMsXG4gICAgICAnb3V0cHV0cyc6IHRoaXMub3V0cHV0cyxcbiAgICAgICdob3N0TGlzdGVuZXJzJzogdGhpcy5ob3N0TGlzdGVuZXJzLFxuICAgICAgJ2hvc3RQcm9wZXJ0aWVzJzogdGhpcy5ob3N0UHJvcGVydGllcyxcbiAgICAgICdob3N0QXR0cmlidXRlcyc6IHRoaXMuaG9zdEF0dHJpYnV0ZXMsXG4gICAgICAnbGlmZWN5Y2xlSG9va3MnOiB0aGlzLmxpZmVjeWNsZUhvb2tzLm1hcChob29rID0+IHNlcmlhbGl6ZUVudW0oaG9vaykpLFxuICAgICAgJ3RlbXBsYXRlJzogaXNQcmVzZW50KHRoaXMudGVtcGxhdGUpID8gdGhpcy50ZW1wbGF0ZS50b0pzb24oKSA6IHRoaXMudGVtcGxhdGUsXG4gICAgICAncHJvdmlkZXJzJzogX2FycmF5VG9Kc29uKHRoaXMucHJvdmlkZXJzKSxcbiAgICAgICd2aWV3UHJvdmlkZXJzJzogX2FycmF5VG9Kc29uKHRoaXMudmlld1Byb3ZpZGVycyksXG4gICAgICAncXVlcmllcyc6IF9hcnJheVRvSnNvbih0aGlzLnF1ZXJpZXMpLFxuICAgICAgJ3ZpZXdRdWVyaWVzJzogX2FycmF5VG9Kc29uKHRoaXMudmlld1F1ZXJpZXMpXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnN0cnVjdCB7QGxpbmsgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhfSBmcm9tIHtAbGluayBDb21wb25lbnRUeXBlTWV0YWRhdGF9IGFuZCBhIHNlbGVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSG9zdENvbXBvbmVudE1ldGEoY29tcG9uZW50VHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZWxlY3Rvcjogc3RyaW5nKTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgdmFyIHRlbXBsYXRlID0gQ3NzU2VsZWN0b3IucGFyc2UoY29tcG9uZW50U2VsZWN0b3IpWzBdLmdldE1hdGNoaW5nRWxlbWVudFRlbXBsYXRlKCk7XG4gIHJldHVybiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY3JlYXRlKHtcbiAgICB0eXBlOiBuZXcgQ29tcGlsZVR5cGVNZXRhZGF0YSh7XG4gICAgICBydW50aW1lOiBPYmplY3QsXG4gICAgICBuYW1lOiBgJHtjb21wb25lbnRUeXBlLm5hbWV9X0hvc3RgLFxuICAgICAgbW9kdWxlVXJsOiBjb21wb25lbnRUeXBlLm1vZHVsZVVybCxcbiAgICAgIGlzSG9zdDogdHJ1ZVxuICAgIH0pLFxuICAgIHRlbXBsYXRlOiBuZXcgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoXG4gICAgICAgIHt0ZW1wbGF0ZTogdGVtcGxhdGUsIHRlbXBsYXRlVXJsOiAnJywgc3R5bGVzOiBbXSwgc3R5bGVVcmxzOiBbXSwgbmdDb250ZW50U2VsZWN0b3JzOiBbXX0pLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgICBpbnB1dHM6IFtdLFxuICAgIG91dHB1dHM6IFtdLFxuICAgIGhvc3Q6IHt9LFxuICAgIGxpZmVjeWNsZUhvb2tzOiBbXSxcbiAgICBpc0NvbXBvbmVudDogdHJ1ZSxcbiAgICBzZWxlY3RvcjogJyonLFxuICAgIHByb3ZpZGVyczogW10sXG4gICAgdmlld1Byb3ZpZGVyczogW10sXG4gICAgcXVlcmllczogW10sXG4gICAgdmlld1F1ZXJpZXM6IFtdXG4gIH0pO1xufVxuXG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUGlwZU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBuYW1lOiBzdHJpbmc7XG4gIHB1cmU6IGJvb2xlYW47XG4gIGxpZmVjeWNsZUhvb2tzOiBMaWZlY3ljbGVIb29rc1tdO1xuXG4gIGNvbnN0cnVjdG9yKHt0eXBlLCBuYW1lLCBwdXJlLCBsaWZlY3ljbGVIb29rc306IHtcbiAgICB0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBuYW1lPzogc3RyaW5nLFxuICAgIHB1cmU/OiBib29sZWFuLFxuICAgIGxpZmVjeWNsZUhvb2tzPzogTGlmZWN5Y2xlSG9va3NbXVxuICB9ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wdXJlID0gbm9ybWFsaXplQm9vbChwdXJlKTtcbiAgICB0aGlzLmxpZmVjeWNsZUhvb2tzID0gX25vcm1hbGl6ZUFycmF5KGxpZmVjeWNsZUhvb2tzKTtcbiAgfVxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVQaXBlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVBpcGVNZXRhZGF0YSh7XG4gICAgICB0eXBlOiBpc1ByZXNlbnQoZGF0YVsndHlwZSddKSA/IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndHlwZSddKSA6IGRhdGFbJ3R5cGUnXSxcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIHB1cmU6IGRhdGFbJ3B1cmUnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2NsYXNzJzogJ1BpcGUnLFxuICAgICAgJ3R5cGUnOiBpc1ByZXNlbnQodGhpcy50eXBlKSA/IHRoaXMudHlwZS50b0pzb24oKSA6IG51bGwsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdwdXJlJzogdGhpcy5wdXJlXG4gICAgfTtcbiAgfVxufVxuXG52YXIgX0NPTVBJTEVfTUVUQURBVEFfRlJPTV9KU09OID0ge1xuICAnRGlyZWN0aXZlJzogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmZyb21Kc29uLFxuICAnUGlwZSc6IENvbXBpbGVQaXBlTWV0YWRhdGEuZnJvbUpzb24sXG4gICdUeXBlJzogQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ1Byb3ZpZGVyJzogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEuZnJvbUpzb24sXG4gICdJZGVudGlmaWVyJzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ0ZhY3RvcnknOiBDb21waWxlRmFjdG9yeU1ldGFkYXRhLmZyb21Kc29uXG59O1xuXG5mdW5jdGlvbiBfYXJyYXlGcm9tSnNvbihvYmo6IGFueVtdLCBmbjogKGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBhbnkpOiBhbnkge1xuICByZXR1cm4gaXNCbGFuayhvYmopID8gbnVsbCA6IG9iai5tYXAobyA9PiBfb2JqRnJvbUpzb24obywgZm4pKTtcbn1cblxuZnVuY3Rpb24gX2FycmF5VG9Kc29uKG9iajogYW55W10pOiBzdHJpbmcgfCB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIHJldHVybiBpc0JsYW5rKG9iaikgPyBudWxsIDogb2JqLm1hcChfb2JqVG9Kc29uKTtcbn1cblxuZnVuY3Rpb24gX29iakZyb21Kc29uKG9iajogYW55LCBmbjogKGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBhbnkpOiBhbnkge1xuICBpZiAoaXNBcnJheShvYmopKSByZXR1cm4gX2FycmF5RnJvbUpzb24ob2JqLCBmbik7XG4gIGlmIChpc1N0cmluZyhvYmopIHx8IGlzQmxhbmsob2JqKSB8fCBpc0Jvb2xlYW4ob2JqKSB8fCBpc051bWJlcihvYmopKSByZXR1cm4gb2JqO1xuICByZXR1cm4gZm4ob2JqKTtcbn1cblxuZnVuY3Rpb24gX29ialRvSnNvbihvYmo6IGFueSk6IHN0cmluZyB8IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgaWYgKGlzQXJyYXkob2JqKSkgcmV0dXJuIF9hcnJheVRvSnNvbihvYmopO1xuICBpZiAoaXNTdHJpbmcob2JqKSB8fCBpc0JsYW5rKG9iaikgfHwgaXNCb29sZWFuKG9iaikgfHwgaXNOdW1iZXIob2JqKSkgcmV0dXJuIG9iajtcbiAgcmV0dXJuIG9iai50b0pzb24oKTtcbn1cblxuZnVuY3Rpb24gX25vcm1hbGl6ZUFycmF5KG9iajogYW55W10pOiBhbnlbXSB7XG4gIHJldHVybiBpc1ByZXNlbnQob2JqKSA/IG9iaiA6IFtdO1xufVxuIl19