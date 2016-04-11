import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { isArray, isPresent, isPrimitive } from 'angular2/src/facade/lang';
import { AttributeMetadata, DirectiveMetadata, ComponentMetadata, ContentChildrenMetadata, ContentChildMetadata, InputMetadata, HostBindingMetadata, HostListenerMetadata, OutputMetadata, PipeMetadata, ViewMetadata, ViewChildMetadata, ViewChildrenMetadata, ViewQueryMetadata, QueryMetadata } from 'angular2/src/core/metadata';
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
export class StaticType {
    constructor(moduleId, name) {
        this.moduleId = moduleId;
        this.name = name;
    }
}
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
export class StaticReflector {
    constructor(host) {
        this.host = host;
        this.typeCache = new Map();
        this.annotationCache = new Map();
        this.propertyCache = new Map();
        this.parameterCache = new Map();
        this.metadataCache = new Map();
        this.conversionMap = new Map();
        this.initializeConversionMap();
    }
    /**
     * getStatictype produces a Type whose metadata is known but whose implementation is not loaded.
     * All types passed to the StaticResolver should be pseudo-types returned by this method.
     *
     * @param moduleId the module identifier as would be passed to an import statement.
     * @param name the name of the type.
     */
    getStaticType(moduleId, name) {
        let key = `"${moduleId}".${name}`;
        let result = this.typeCache.get(key);
        if (!isPresent(result)) {
            result = new StaticType(moduleId, name);
            this.typeCache.set(key, result);
        }
        return result;
    }
    annotations(type) {
        let annotations = this.annotationCache.get(type);
        if (!isPresent(annotations)) {
            let classMetadata = this.getTypeMetadata(type);
            if (isPresent(classMetadata['decorators'])) {
                annotations = classMetadata['decorators']
                    .map(decorator => this.convertKnownDecorator(type.moduleId, decorator))
                    .filter(decorator => isPresent(decorator));
            }
            this.annotationCache.set(type, annotations);
        }
        return annotations;
    }
    propMetadata(type) {
        let propMetadata = this.propertyCache.get(type);
        if (!isPresent(propMetadata)) {
            let classMetadata = this.getTypeMetadata(type);
            propMetadata = this.getPropertyMetadata(type.moduleId, classMetadata['members']);
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    }
    parameters(type) {
        let parameters = this.parameterCache.get(type);
        if (!isPresent(parameters)) {
            let classMetadata = this.getTypeMetadata(type);
            let ctorData = classMetadata['members']['__ctor__'];
            if (isPresent(ctorData)) {
                let ctor = ctorData.find(a => a['__symbolic'] === 'constructor');
                parameters = this.simplify(type.moduleId, ctor['parameters']);
                this.parameterCache.set(type, parameters);
            }
        }
        return parameters;
    }
    initializeConversionMap() {
        let core_metadata = 'angular2/src/core/metadata';
        let conversionMap = this.conversionMap;
        conversionMap.set(this.getStaticType(core_metadata, 'Directive'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            if (!isPresent(p0)) {
                p0 = {};
            }
            return new DirectiveMetadata({
                selector: p0['selector'],
                inputs: p0['inputs'],
                outputs: p0['outputs'],
                events: p0['events'],
                host: p0['host'],
                bindings: p0['bindings'],
                providers: p0['providers'],
                exportAs: p0['exportAs'],
                queries: p0['queries'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Component'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            if (!isPresent(p0)) {
                p0 = {};
            }
            return new ComponentMetadata({
                selector: p0['selector'],
                inputs: p0['inputs'],
                outputs: p0['outputs'],
                properties: p0['properties'],
                events: p0['events'],
                host: p0['host'],
                exportAs: p0['exportAs'],
                moduleId: p0['moduleId'],
                bindings: p0['bindings'],
                providers: p0['providers'],
                viewBindings: p0['viewBindings'],
                viewProviders: p0['viewProviders'],
                changeDetection: p0['changeDetection'],
                queries: p0['queries'],
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                styleUrls: p0['styleUrls'],
                styles: p0['styles'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation']
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Input'), (moduleContext, expression) => new InputMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'Output'), (moduleContext, expression) => new OutputMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'View'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            if (!isPresent(p0)) {
                p0 = {};
            }
            return new ViewMetadata({
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation'],
                styles: p0['styles'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Attribute'), (moduleContext, expression) => new AttributeMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'Query'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            let p1 = this.getDecoratorParameter(moduleContext, expression, 1);
            if (!isPresent(p1)) {
                p1 = {};
            }
            return new QueryMetadata(p0, { descendants: p1.descendants, first: p1.first });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChildren'), (moduleContext, expression) => new ContentChildrenMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChild'), (moduleContext, expression) => new ContentChildMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChildren'), (moduleContext, expression) => new ViewChildrenMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChild'), (moduleContext, expression) => new ViewChildMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'ViewQuery'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            let p1 = this.getDecoratorParameter(moduleContext, expression, 1);
            if (!isPresent(p1)) {
                p1 = {};
            }
            return new ViewQueryMetadata(p0, {
                descendants: p1['descendants'],
                first: p1['first'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Pipe'), (moduleContext, expression) => {
            let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
            if (!isPresent(p0)) {
                p0 = {};
            }
            return new PipeMetadata({
                name: p0['name'],
                pure: p0['pure'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'HostBinding'), (moduleContext, expression) => new HostBindingMetadata(this.getDecoratorParameter(moduleContext, expression, 0)));
        conversionMap.set(this.getStaticType(core_metadata, 'HostListener'), (moduleContext, expression) => new HostListenerMetadata(this.getDecoratorParameter(moduleContext, expression, 0), this.getDecoratorParameter(moduleContext, expression, 1)));
        return null;
    }
    convertKnownDecorator(moduleContext, expression) {
        let converter = this.conversionMap.get(this.getDecoratorType(moduleContext, expression));
        if (isPresent(converter))
            return converter(moduleContext, expression);
        return null;
    }
    getDecoratorType(moduleContext, expression) {
        if (isMetadataSymbolicCallExpression(expression)) {
            let target = expression['expression'];
            if (isMetadataSymbolicReferenceExpression(target)) {
                let moduleId = this.normalizeModuleName(moduleContext, target['module']);
                return this.getStaticType(moduleId, target['name']);
            }
        }
        return null;
    }
    getDecoratorParameter(moduleContext, expression, index) {
        if (isMetadataSymbolicCallExpression(expression) && isPresent(expression['arguments']) &&
            expression['arguments'].length <= index + 1) {
            return this.simplify(moduleContext, expression['arguments'][index]);
        }
        return null;
    }
    getPropertyMetadata(moduleContext, value) {
        if (isPresent(value)) {
            let result = {};
            StringMapWrapper.forEach(value, (value, name) => {
                let data = this.getMemberData(moduleContext, value);
                if (isPresent(data)) {
                    let propertyData = data.filter(d => d['kind'] == "property")
                        .map(d => d['directives'])
                        .reduce((p, c) => p.concat(c), []);
                    if (propertyData.length != 0) {
                        StringMapWrapper.set(result, name, propertyData);
                    }
                }
            });
            return result;
        }
        return null;
    }
    // clang-format off
    getMemberData(moduleContext, member) {
        // clang-format on
        let result = [];
        if (isPresent(member)) {
            for (let item of member) {
                result.push({
                    kind: item['__symbolic'],
                    directives: isPresent(item['decorators']) ?
                        item['decorators']
                            .map(decorator => this.convertKnownDecorator(moduleContext, decorator))
                            .filter(d => isPresent(d)) :
                        null
                });
            }
        }
        return result;
    }
    /** @internal */
    simplify(moduleContext, value) {
        let _this = this;
        function simplify(expression) {
            if (isPrimitive(expression)) {
                return expression;
            }
            if (isArray(expression)) {
                let result = [];
                for (let item of expression) {
                    result.push(simplify(item));
                }
                return result;
            }
            if (isPresent(expression)) {
                if (isPresent(expression['__symbolic'])) {
                    switch (expression['__symbolic']) {
                        case "binop":
                            let left = simplify(expression['left']);
                            let right = simplify(expression['right']);
                            switch (expression['operator']) {
                                case '&&':
                                    return left && right;
                                case '||':
                                    return left || right;
                                case '|':
                                    return left | right;
                                case '^':
                                    return left ^ right;
                                case '&':
                                    return left & right;
                                case '==':
                                    return left == right;
                                case '!=':
                                    return left != right;
                                case '===':
                                    return left === right;
                                case '!==':
                                    return left !== right;
                                case '<':
                                    return left < right;
                                case '>':
                                    return left > right;
                                case '<=':
                                    return left <= right;
                                case '>=':
                                    return left >= right;
                                case '<<':
                                    return left << right;
                                case '>>':
                                    return left >> right;
                                case '+':
                                    return left + right;
                                case '-':
                                    return left - right;
                                case '*':
                                    return left * right;
                                case '/':
                                    return left / right;
                                case '%':
                                    return left % right;
                            }
                            return null;
                        case "pre":
                            let operand = simplify(expression['operand']);
                            switch (expression['operator']) {
                                case '+':
                                    return operand;
                                case '-':
                                    return -operand;
                                case '!':
                                    return !operand;
                                case '~':
                                    return ~operand;
                            }
                            return null;
                        case "index":
                            let indexTarget = simplify(expression['expression']);
                            let index = simplify(expression['index']);
                            if (isPresent(indexTarget) && isPrimitive(index))
                                return indexTarget[index];
                            return null;
                        case "select":
                            let selectTarget = simplify(expression['expression']);
                            let member = simplify(expression['member']);
                            if (isPresent(selectTarget) && isPrimitive(member))
                                return selectTarget[member];
                            return null;
                        case "reference":
                            let referenceModuleName = _this.normalizeModuleName(moduleContext, expression['module']);
                            let referenceModule = _this.getModuleMetadata(referenceModuleName);
                            let referenceValue = referenceModule['metadata'][expression['name']];
                            if (isClassMetadata(referenceValue)) {
                                // Convert to a pseudo type
                                return _this.getStaticType(referenceModuleName, expression['name']);
                            }
                            return _this.simplify(referenceModuleName, referenceValue);
                        case "call":
                            return null;
                    }
                    return null;
                }
                let result = {};
                StringMapWrapper.forEach(expression, (value, name) => { result[name] = simplify(value); });
                return result;
            }
            return null;
        }
        return simplify(value);
    }
    getModuleMetadata(module) {
        let moduleMetadata = this.metadataCache.get(module);
        if (!isPresent(moduleMetadata)) {
            moduleMetadata = this.host.getMetadataFor(module);
            if (!isPresent(moduleMetadata)) {
                moduleMetadata = { __symbolic: "module", module: module, metadata: {} };
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    }
    getTypeMetadata(type) {
        let moduleMetadata = this.getModuleMetadata(type.moduleId);
        let result = moduleMetadata['metadata'][type.name];
        if (!isPresent(result)) {
            result = { __symbolic: "class" };
        }
        return result;
    }
    normalizeModuleName(from, to) {
        if (to.startsWith('.')) {
            return pathTo(from, to);
        }
        return to;
    }
}
function isMetadataSymbolicCallExpression(expression) {
    return !isPrimitive(expression) && !isArray(expression) && expression['__symbolic'] == 'call';
}
function isMetadataSymbolicReferenceExpression(expression) {
    return !isPrimitive(expression) && !isArray(expression) &&
        expression['__symbolic'] == 'reference';
}
function isClassMetadata(expression) {
    return !isPrimitive(expression) && !isArray(expression) && expression['__symbolic'] == 'class';
}
function splitPath(path) {
    return path.split(/\/|\\/g);
}
function resolvePath(pathParts) {
    let result = [];
    ListWrapper.forEachWithIndex(pathParts, (part, index) => {
        switch (part) {
            case '':
            case '.':
                if (index > 0)
                    return;
                break;
            case '..':
                if (index > 0 && result.length != 0)
                    result.pop();
                return;
        }
        result.push(part);
    });
    return result.join('/');
}
function pathTo(from, to) {
    let result = to;
    if (to.startsWith('.')) {
        let fromParts = splitPath(from);
        fromParts.pop(); // remove the file name.
        let toParts = splitPath(to);
        result = resolvePath(fromParts.concat(toParts));
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtd1hJbk4wNjYudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY1R5cGUiLCJTdGF0aWNUeXBlLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldFN0YXRpY1R5cGUiLCJTdGF0aWNSZWZsZWN0b3IuYW5ub3RhdGlvbnMiLCJTdGF0aWNSZWZsZWN0b3IucHJvcE1ldGFkYXRhIiwiU3RhdGljUmVmbGVjdG9yLnBhcmFtZXRlcnMiLCJTdGF0aWNSZWZsZWN0b3IuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAiLCJTdGF0aWNSZWZsZWN0b3IuY29udmVydEtub3duRGVjb3JhdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldERlY29yYXRvclR5cGUiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyIiwiU3RhdGljUmVmbGVjdG9yLmdldFByb3BlcnR5TWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0TWVtYmVyRGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeS5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRNb2R1bGVNZXRhZGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRUeXBlTWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3Iubm9ybWFsaXplTW9kdWxlTmFtZSIsImlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uIiwiaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiIsImlzQ2xhc3NNZXRhZGF0YSIsInNwbGl0UGF0aCIsInJlc29sdmVQYXRoIiwicGF0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Q0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQzFDQSxNQUFNQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDL0JBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEtBQUtBO29DQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQTtnQ0FDeEJBLEtBQUtBLEtBQUtBO29DQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQTtnQ0FDeEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTs0QkFDeEJBLENBQUNBOzRCQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTt3QkFDZEEsS0FBS0EsS0FBS0E7NEJBQ1JBLElBQUlBLE9BQU9BLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBOzRCQUM5Q0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQy9CQSxLQUFLQSxHQUFHQTtvQ0FDTkEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0NBQ2pCQSxLQUFLQSxHQUFHQTtvQ0FDTkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0NBQ2xCQSxLQUFLQSxHQUFHQTtvQ0FDTkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0NBQ2xCQSxLQUFLQSxHQUFHQTtvQ0FDTkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7NEJBQ3BCQSxDQUFDQTs0QkFD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LENBQUNBLE1BQU1BLENBQUNBO0FBQ2hCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBpc0FycmF5LFxuICBpc0JsYW5rLFxuICBpc051bWJlcixcbiAgaXNQcmVzZW50LFxuICBpc1ByaW1pdGl2ZSxcbiAgaXNTdHJpbmcsXG4gIFR5cGVcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7XG4gIEF0dHJpYnV0ZU1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcG9uZW50TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGEsXG4gIE91dHB1dE1ldGFkYXRhLFxuICBQaXBlTWV0YWRhdGEsXG4gIFZpZXdNZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgUXVlcnlNZXRhZGF0YSxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuXG4vKipcbiAqIFRoZSBob3N0IG9mIHRoZSBzdGF0aWMgcmVzb2x2ZXIgaXMgZXhwZWN0ZWQgdG8gYmUgYWJsZSB0byBwcm92aWRlIG1vZHVsZSBtZXRhZGF0YSBpbiB0aGUgZm9ybSBvZlxuICogTW9kdWxlTWV0YWRhdGEuIEFuZ3VsYXIgMiBDTEkgd2lsbCBwcm9kdWNlIHRoaXMgbWV0YWRhdGEgZm9yIGEgbW9kdWxlIHdoZW5ldmVyIGEgLmQudHMgZmlsZXMgaXNcbiAqIHByb2R1Y2VkIGFuZCB0aGUgbW9kdWxlIGhhcyBleHBvcnRlZCB2YXJpYWJsZXMgb3IgY2xhc3NlcyB3aXRoIGRlY29yYXRvcnMuIE1vZHVsZSBtZXRhZGF0YSBjYW5cbiAqIGFsc28gYmUgcHJvZHVjZWQgZGlyZWN0bHkgZnJvbSBUeXBlU2NyaXB0IHNvdXJjZXMgYnkgdXNpbmcgTWV0YWRhdGFDb2xsZWN0b3IgaW4gdG9vbHMvbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGljUmVmbGVjdG9ySG9zdCB7XG4gIC8qKlxuICAgKiAgUmV0dXJuIGEgTW9kdWxlTWV0YWRhdGEgZm9yIHRoZSBnaXZlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZUlkIGlzIGEgc3RyaW5nIGlkZW50aWZpZXIgZm9yIGEgbW9kdWxlIGluIHRoZSBmb3JtIHRoYXQgd291bGQgZXhwZWN0ZWQgaW4gYVxuICAgKiAgICAgICAgICAgICAgICAgbW9kdWxlIGltcG9ydCBvZiBhbiBpbXBvcnQgc3RhdGVtZW50LlxuICAgKiBAcmV0dXJucyB0aGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlbiBtb2R1bGUuXG4gICAqL1xuICBnZXRNZXRhZGF0YUZvcihtb2R1bGVJZDogc3RyaW5nKToge1trZXk6IHN0cmluZ106IGFueX07XG59XG5cbi8qKlxuICogQSB0b2tlbiByZXByZXNlbnRpbmcgdGhlIGEgcmVmZXJlbmNlIHRvIGEgc3RhdGljIHR5cGUuXG4gKlxuICogVGhpcyB0b2tlbiBpcyB1bmlxdWUgZm9yIGEgbW9kdWxlSWQgYW5kIG5hbWUgYW5kIGNhbiBiZSB1c2VkIGFzIGEgaGFzaCB0YWJsZSBrZXkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNUeXBlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZUlkOiBzdHJpbmcsIHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogQSBzdGF0aWMgcmVmbGVjdG9yIGltcGxlbWVudHMgZW5vdWdoIG9mIHRoZSBSZWZsZWN0b3IgQVBJIHRoYXQgaXMgbmVjZXNzYXJ5IHRvIGNvbXBpbGVcbiAqIHRlbXBsYXRlcyBzdGF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgU3RhdGljUmVmbGVjdG9yIHtcbiAgcHJpdmF0ZSB0eXBlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgU3RhdGljVHlwZT4oKTtcbiAgcHJpdmF0ZSBhbm5vdGF0aW9uQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIGFueVtdPigpO1xuICBwcml2YXRlIHByb3BlcnR5Q2FjaGUgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIHtba2V5OiBzdHJpbmddOiBhbnl9PigpO1xuICBwcml2YXRlIHBhcmFtZXRlckNhY2hlID0gbmV3IE1hcDxTdGF0aWNUeXBlLCBhbnlbXT4oKTtcbiAgcHJpdmF0ZSBtZXRhZGF0YUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHtba2V5OiBzdHJpbmddOiBhbnl9PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogU3RhdGljUmVmbGVjdG9ySG9zdCkgeyB0aGlzLmluaXRpYWxpemVDb252ZXJzaW9uTWFwKCk7IH1cblxuICAvKipcbiAgICogZ2V0U3RhdGljdHlwZSBwcm9kdWNlcyBhIFR5cGUgd2hvc2UgbWV0YWRhdGEgaXMga25vd24gYnV0IHdob3NlIGltcGxlbWVudGF0aW9uIGlzIG5vdCBsb2FkZWQuXG4gICAqIEFsbCB0eXBlcyBwYXNzZWQgdG8gdGhlIFN0YXRpY1Jlc29sdmVyIHNob3VsZCBiZSBwc2V1ZG8tdHlwZXMgcmV0dXJuZWQgYnkgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVJZCB0aGUgbW9kdWxlIGlkZW50aWZpZXIgYXMgd291bGQgYmUgcGFzc2VkIHRvIGFuIGltcG9ydCBzdGF0ZW1lbnQuXG4gICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgcHVibGljIGdldFN0YXRpY1R5cGUobW9kdWxlSWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKTogU3RhdGljVHlwZSB7XG4gICAgbGV0IGtleSA9IGBcIiR7bW9kdWxlSWR9XCIuJHtuYW1lfWA7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMudHlwZUNhY2hlLmdldChrZXkpO1xuICAgIGlmICghaXNQcmVzZW50KHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBTdGF0aWNUeXBlKG1vZHVsZUlkLCBuYW1lKTtcbiAgICAgIHRoaXMudHlwZUNhY2hlLnNldChrZXksIHJlc3VsdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwdWJsaWMgYW5ub3RhdGlvbnModHlwZTogU3RhdGljVHlwZSk6IGFueVtdIHtcbiAgICBsZXQgYW5ub3RhdGlvbnMgPSB0aGlzLmFubm90YXRpb25DYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChjbGFzc01ldGFkYXRhWydkZWNvcmF0b3JzJ10pKSB7XG4gICAgICAgIGFubm90YXRpb25zID0gKDxhbnlbXT5jbGFzc01ldGFkYXRhWydkZWNvcmF0b3JzJ10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHRoaXMuY29udmVydEtub3duRGVjb3JhdG9yKHR5cGUubW9kdWxlSWQsIGRlY29yYXRvcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZGVjb3JhdG9yID0+IGlzUHJlc2VudChkZWNvcmF0b3IpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYW5ub3RhdGlvbkNhY2hlLnNldCh0eXBlLCBhbm5vdGF0aW9ucyk7XG4gICAgfVxuICAgIHJldHVybiBhbm5vdGF0aW9ucztcbiAgfVxuXG4gIHB1YmxpYyBwcm9wTWV0YWRhdGEodHlwZTogU3RhdGljVHlwZSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgcHJvcE1ldGFkYXRhID0gdGhpcy5wcm9wZXJ0eUNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChwcm9wTWV0YWRhdGEpKSB7XG4gICAgICBsZXQgY2xhc3NNZXRhZGF0YSA9IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHR5cGUpO1xuICAgICAgcHJvcE1ldGFkYXRhID0gdGhpcy5nZXRQcm9wZXJ0eU1ldGFkYXRhKHR5cGUubW9kdWxlSWQsIGNsYXNzTWV0YWRhdGFbJ21lbWJlcnMnXSk7XG4gICAgICB0aGlzLnByb3BlcnR5Q2FjaGUuc2V0KHR5cGUsIHByb3BNZXRhZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wTWV0YWRhdGE7XG4gIH1cblxuICBwdWJsaWMgcGFyYW1ldGVycyh0eXBlOiBTdGF0aWNUeXBlKTogYW55W10ge1xuICAgIGxldCBwYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJDYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQocGFyYW1ldGVycykpIHtcbiAgICAgIGxldCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBsZXQgY3RvckRhdGEgPSBjbGFzc01ldGFkYXRhWydtZW1iZXJzJ11bJ19fY3Rvcl9fJ107XG4gICAgICBpZiAoaXNQcmVzZW50KGN0b3JEYXRhKSkge1xuICAgICAgICBsZXQgY3RvciA9ICg8YW55W10+Y3RvckRhdGEpLmZpbmQoYSA9PiBhWydfX3N5bWJvbGljJ10gPT09ICdjb25zdHJ1Y3RvcicpO1xuICAgICAgICBwYXJhbWV0ZXJzID0gdGhpcy5zaW1wbGlmeSh0eXBlLm1vZHVsZUlkLCBjdG9yWydwYXJhbWV0ZXJzJ10pO1xuICAgICAgICB0aGlzLnBhcmFtZXRlckNhY2hlLnNldCh0eXBlLCBwYXJhbWV0ZXJzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnNpb25NYXAgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIChtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IGFueSkgPT4gYW55PigpO1xuICBwcml2YXRlIGluaXRpYWxpemVDb252ZXJzaW9uTWFwKCk6IGFueSB7XG4gICAgbGV0IGNvcmVfbWV0YWRhdGEgPSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuICAgIGxldCBjb252ZXJzaW9uTWFwID0gdGhpcy5jb252ZXJzaW9uTWFwO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnRGlyZWN0aXZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHAwID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHAwWydzZWxlY3RvciddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHAwWydpbnB1dHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogcDBbJ291dHB1dHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiBwMFsnZXZlbnRzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHAwWydob3N0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzOiBwMFsnYmluZGluZ3MnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBwMFsncHJvdmlkZXJzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzOiBwMFsnZXhwb3J0QXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcmllczogcDBbJ3F1ZXJpZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQ29tcG9uZW50JyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHAwID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudE1ldGFkYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHAwWydzZWxlY3RvciddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHAwWydpbnB1dHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogcDBbJ291dHB1dHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogcDBbJ3Byb3BlcnRpZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiBwMFsnZXZlbnRzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHAwWydob3N0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzOiBwMFsnZXhwb3J0QXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSWQ6IHAwWydtb2R1bGVJZCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nczogcDBbJ2JpbmRpbmdzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogcDBbJ3Byb3ZpZGVycyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3QmluZGluZ3M6IHAwWyd2aWV3QmluZGluZ3MnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld1Byb3ZpZGVyczogcDBbJ3ZpZXdQcm92aWRlcnMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBwMFsnY2hhbmdlRGV0ZWN0aW9uJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJpZXM6IHAwWydxdWVyaWVzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBwMFsndGVtcGxhdGVVcmwnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHAwWyd0ZW1wbGF0ZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZVVybHM6IHAwWydzdHlsZVVybHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiBwMFsnc3R5bGVzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IHAwWydkaXJlY3RpdmVzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGVzOiBwMFsncGlwZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jYXBzdWxhdGlvbjogcDBbJ2VuY2Fwc3VsYXRpb24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdJbnB1dCcpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgSW5wdXRNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ091dHB1dCcpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgT3V0cHV0TWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApKSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3JyksIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgIGlmICghaXNQcmVzZW50KHAwKSkge1xuICAgICAgICBwMCA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBWaWV3TWV0YWRhdGEoe1xuICAgICAgICB0ZW1wbGF0ZVVybDogcDBbJ3RlbXBsYXRlVXJsJ10sXG4gICAgICAgIHRlbXBsYXRlOiBwMFsndGVtcGxhdGUnXSxcbiAgICAgICAgZGlyZWN0aXZlczogcDBbJ2RpcmVjdGl2ZXMnXSxcbiAgICAgICAgcGlwZXM6IHAwWydwaXBlcyddLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiBwMFsnZW5jYXBzdWxhdGlvbiddLFxuICAgICAgICBzdHlsZXM6IHAwWydzdHlsZXMnXSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQXR0cmlidXRlJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBBdHRyaWJ1dGVNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1F1ZXJ5JyksIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgIGxldCBwMSA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDEpKSB7XG4gICAgICAgIHAxID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWV0YWRhdGEocDAsIHtkZXNjZW5kYW50czogcDEuZGVzY2VuZGFudHMsIGZpcnN0OiBwMS5maXJzdH0pO1xuICAgIH0pO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQ29udGVudENoaWxkcmVuJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0NvbnRlbnRDaGlsZCcpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgQ29udGVudENoaWxkTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApKSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3Q2hpbGRyZW4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IFZpZXdDaGlsZHJlbk1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnVmlld0NoaWxkJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBWaWV3Q2hpbGRNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXdRdWVyeScpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwMSA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ByZXNlbnQocDEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHAxID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFZpZXdRdWVyeU1ldGFkYXRhKHAwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NlbmRhbnRzOiBwMVsnZGVzY2VuZGFudHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3Q6IHAxWydmaXJzdCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdQaXBlJyksIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgICBsZXQgcDAgPSB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKTtcbiAgICAgIGlmICghaXNQcmVzZW50KHAwKSkge1xuICAgICAgICBwMCA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBQaXBlTWV0YWRhdGEoe1xuICAgICAgICBuYW1lOiBwMFsnbmFtZSddLFxuICAgICAgICBwdXJlOiBwMFsncHVyZSddLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdIb3N0QmluZGluZycpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgSG9zdEJpbmRpbmdNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0hvc3RMaXN0ZW5lcicpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgSG9zdExpc3RlbmVyTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAxKSkpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0S25vd25EZWNvcmF0b3IobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiB7W2tleTogc3RyaW5nXTogYW55fSk6IGFueSB7XG4gICAgbGV0IGNvbnZlcnRlciA9IHRoaXMuY29udmVyc2lvbk1hcC5nZXQodGhpcy5nZXREZWNvcmF0b3JUeXBlKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pKTtcbiAgICBpZiAoaXNQcmVzZW50KGNvbnZlcnRlcikpIHJldHVybiBjb252ZXJ0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldERlY29yYXRvclR5cGUobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiB7W2tleTogc3RyaW5nXTogYW55fSk6IFN0YXRpY1R5cGUge1xuICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuICAgICAgbGV0IHRhcmdldCA9IGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXTtcbiAgICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKHRhcmdldCkpIHtcbiAgICAgICAgbGV0IG1vZHVsZUlkID0gdGhpcy5ub3JtYWxpemVNb2R1bGVOYW1lKG1vZHVsZUNvbnRleHQsIHRhcmdldFsnbW9kdWxlJ10pO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0aWNUeXBlKG1vZHVsZUlkLCB0YXJnZXRbJ25hbWUnXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dDogc3RyaW5nLCBleHByZXNzaW9uOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb24pICYmIGlzUHJlc2VudChleHByZXNzaW9uWydhcmd1bWVudHMnXSkgJiZcbiAgICAgICAgKDxhbnlbXT5leHByZXNzaW9uWydhcmd1bWVudHMnXSkubGVuZ3RoIDw9IGluZGV4ICsgMSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2ltcGxpZnkobW9kdWxlQ29udGV4dCwgKDxhbnlbXT5leHByZXNzaW9uWydhcmd1bWVudHMnXSlbaW5kZXhdKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldFByb3BlcnR5TWV0YWRhdGEobW9kdWxlQ29udGV4dDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtba2V5OiBzdHJpbmddOiBhbnl9KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICBsZXQgcmVzdWx0ID0ge307XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godmFsdWUsICh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuZ2V0TWVtYmVyRGF0YShtb2R1bGVDb250ZXh0LCB2YWx1ZSk7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZGF0YSkpIHtcbiAgICAgICAgICBsZXQgcHJvcGVydHlEYXRhID0gZGF0YS5maWx0ZXIoZCA9PiBkWydraW5kJ10gPT0gXCJwcm9wZXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChkID0+IGRbJ2RpcmVjdGl2ZXMnXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKHAsIGMpID0+ICg8YW55W10+cCkuY29uY2F0KDxhbnlbXT5jKSwgW10pO1xuICAgICAgICAgIGlmIChwcm9wZXJ0eURhdGEubGVuZ3RoICE9IDApIHtcbiAgICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJlc3VsdCwgbmFtZSwgcHJvcGVydHlEYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIHByaXZhdGUgZ2V0TWVtYmVyRGF0YShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIG1lbWJlcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfVtdKTogeyBba2V5OiBzdHJpbmddOiBhbnkgfVtdIHtcbiAgICAvLyBjbGFuZy1mb3JtYXQgb25cbiAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgaWYgKGlzUHJlc2VudChtZW1iZXIpKSB7XG4gICAgICBmb3IgKGxldCBpdGVtIG9mIG1lbWJlcikge1xuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAga2luZDogaXRlbVsnX19zeW1ib2xpYyddLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6XG4gICAgICAgICAgICAgIGlzUHJlc2VudChpdGVtWydkZWNvcmF0b3JzJ10pID9cbiAgICAgICAgICAgICAgICAgICg8YW55W10+aXRlbVsnZGVjb3JhdG9ycyddKVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHRoaXMuY29udmVydEtub3duRGVjb3JhdG9yKG1vZHVsZUNvbnRleHQsIGRlY29yYXRvcikpXG4gICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihkID0+IGlzUHJlc2VudChkKSkgOlxuICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIHNpbXBsaWZ5KG1vZHVsZUNvbnRleHQ6IHN0cmluZywgdmFsdWU6IGFueSk6IGFueSB7XG4gICAgbGV0IF90aGlzID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHNpbXBsaWZ5KGV4cHJlc3Npb246IGFueSk6IGFueSB7XG4gICAgICBpZiAoaXNQcmltaXRpdmUoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgICB9XG4gICAgICBpZiAoaXNBcnJheShleHByZXNzaW9uKSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YoPGFueT5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHNpbXBsaWZ5KGl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChleHByZXNzaW9uKSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkpIHtcbiAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSkge1xuICAgICAgICAgICAgY2FzZSBcImJpbm9wXCI6XG4gICAgICAgICAgICAgIGxldCBsZWZ0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnbGVmdCddKTtcbiAgICAgICAgICAgICAgbGV0IHJpZ2h0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsncmlnaHQnXSk7XG4gICAgICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnb3BlcmF0b3InXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyYmJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICYmIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IHx8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgfCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IF4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAmIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyE9JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID49IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzw8JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IDw8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJz4+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID4+IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgKyByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0IC0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAqIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgLyByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICUgcmlnaHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIFwicHJlXCI6XG4gICAgICAgICAgICAgIGxldCBvcGVyYW5kID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnb3BlcmFuZCddKTtcbiAgICAgICAgICAgICAgc3dpdGNoIChleHByZXNzaW9uWydvcGVyYXRvciddKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiAtb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiAhb3BlcmFuZDtcbiAgICAgICAgICAgICAgICBjYXNlICd+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiB+b3BlcmFuZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJpbmRleFwiOlxuICAgICAgICAgICAgICBsZXQgaW5kZXhUYXJnZXQgPSBzaW1wbGlmeShleHByZXNzaW9uWydleHByZXNzaW9uJ10pO1xuICAgICAgICAgICAgICBsZXQgaW5kZXggPSBzaW1wbGlmeShleHByZXNzaW9uWydpbmRleCddKTtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChpbmRleFRhcmdldCkgJiYgaXNQcmltaXRpdmUoaW5kZXgpKSByZXR1cm4gaW5kZXhUYXJnZXRbaW5kZXhdO1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJzZWxlY3RcIjpcbiAgICAgICAgICAgICAgbGV0IHNlbGVjdFRhcmdldCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGxldCBtZW1iZXIgPSBzaW1wbGlmeShleHByZXNzaW9uWydtZW1iZXInXSk7XG4gICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoc2VsZWN0VGFyZ2V0KSAmJiBpc1ByaW1pdGl2ZShtZW1iZXIpKSByZXR1cm4gc2VsZWN0VGFyZ2V0W21lbWJlcl07XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcInJlZmVyZW5jZVwiOlxuICAgICAgICAgICAgICBsZXQgcmVmZXJlbmNlTW9kdWxlTmFtZSA9XG4gICAgICAgICAgICAgICAgICBfdGhpcy5ub3JtYWxpemVNb2R1bGVOYW1lKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb25bJ21vZHVsZSddKTtcbiAgICAgICAgICAgICAgbGV0IHJlZmVyZW5jZU1vZHVsZSA9IF90aGlzLmdldE1vZHVsZU1ldGFkYXRhKHJlZmVyZW5jZU1vZHVsZU5hbWUpO1xuICAgICAgICAgICAgICBsZXQgcmVmZXJlbmNlVmFsdWUgPSByZWZlcmVuY2VNb2R1bGVbJ21ldGFkYXRhJ11bZXhwcmVzc2lvblsnbmFtZSddXTtcbiAgICAgICAgICAgICAgaWYgKGlzQ2xhc3NNZXRhZGF0YShyZWZlcmVuY2VWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGEgcHNldWRvIHR5cGVcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZ2V0U3RhdGljVHlwZShyZWZlcmVuY2VNb2R1bGVOYW1lLCBleHByZXNzaW9uWyduYW1lJ10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy5zaW1wbGlmeShyZWZlcmVuY2VNb2R1bGVOYW1lLCByZWZlcmVuY2VWYWx1ZSk7XG4gICAgICAgICAgICBjYXNlIFwiY2FsbFwiOlxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZXhwcmVzc2lvbiwgKHZhbHVlLCBuYW1lKSA9PiB7IHJlc3VsdFtuYW1lXSA9IHNpbXBsaWZ5KHZhbHVlKTsgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2ltcGxpZnkodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2R1bGVNZXRhZGF0YShtb2R1bGU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KG1vZHVsZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuaG9zdC5nZXRNZXRhZGF0YUZvcihtb2R1bGUpO1xuICAgICAgaWYgKCFpc1ByZXNlbnQobW9kdWxlTWV0YWRhdGEpKSB7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhID0ge19fc3ltYm9saWM6IFwibW9kdWxlXCIsIG1vZHVsZTogbW9kdWxlLCBtZXRhZGF0YToge319O1xuICAgICAgfVxuICAgICAgdGhpcy5tZXRhZGF0YUNhY2hlLnNldChtb2R1bGUsIG1vZHVsZU1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZHVsZU1ldGFkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUeXBlTWV0YWRhdGEodHlwZTogU3RhdGljVHlwZSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLmdldE1vZHVsZU1ldGFkYXRhKHR5cGUubW9kdWxlSWQpO1xuICAgIGxldCByZXN1bHQgPSBtb2R1bGVNZXRhZGF0YVsnbWV0YWRhdGEnXVt0eXBlLm5hbWVdO1xuICAgIGlmICghaXNQcmVzZW50KHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IHtfX3N5bWJvbGljOiBcImNsYXNzXCJ9O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBub3JtYWxpemVNb2R1bGVOYW1lKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRvLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgcmV0dXJuIHBhdGhUbyhmcm9tLCB0byk7XG4gICAgfVxuICAgIHJldHVybiB0bztcbiAgfVxufVxuXG5mdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1ByaW1pdGl2ZShleHByZXNzaW9uKSAmJiAhaXNBcnJheShleHByZXNzaW9uKSAmJiBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ2NhbGwnO1xufVxuXG5mdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmXG4gICAgICAgICBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ3JlZmVyZW5jZSc7XG59XG5cbmZ1bmN0aW9uIGlzQ2xhc3NNZXRhZGF0YShleHByZXNzaW9uOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1ByaW1pdGl2ZShleHByZXNzaW9uKSAmJiAhaXNBcnJheShleHByZXNzaW9uKSAmJiBleHByZXNzaW9uWydfX3N5bWJvbGljJ10gPT0gJ2NsYXNzJztcbn1cblxuZnVuY3Rpb24gc3BsaXRQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHBhdGguc3BsaXQoL1xcL3xcXFxcL2cpO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGF0aChwYXRoUGFydHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9IFtdO1xuICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KHBhdGhQYXJ0cywgKHBhcnQsIGluZGV4KSA9PiB7XG4gICAgc3dpdGNoIChwYXJ0KSB7XG4gICAgICBjYXNlICcnOlxuICAgICAgY2FzZSAnLic6XG4gICAgICAgIGlmIChpbmRleCA+IDApIHJldHVybjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcuLic6XG4gICAgICAgIGlmIChpbmRleCA+IDAgJiYgcmVzdWx0Lmxlbmd0aCAhPSAwKSByZXN1bHQucG9wKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzdWx0LnB1c2gocGFydCk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0LmpvaW4oJy8nKTtcbn1cblxuZnVuY3Rpb24gcGF0aFRvKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCByZXN1bHQgPSB0bztcbiAgaWYgKHRvLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgIGxldCBmcm9tUGFydHMgPSBzcGxpdFBhdGgoZnJvbSk7XG4gICAgZnJvbVBhcnRzLnBvcCgpOyAgLy8gcmVtb3ZlIHRoZSBmaWxlIG5hbWUuXG4gICAgbGV0IHRvUGFydHMgPSBzcGxpdFBhdGgodG8pO1xuICAgIHJlc3VsdCA9IHJlc29sdmVQYXRoKGZyb21QYXJ0cy5jb25jYXQodG9QYXJ0cykpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=