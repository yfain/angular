'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('angular2/src/core/metadata');
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
var StaticType = (function () {
    function StaticType(moduleId, name) {
        this.moduleId = moduleId;
        this.name = name;
    }
    return StaticType;
})();
exports.StaticType = StaticType;
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
var StaticReflector = (function () {
    function StaticReflector(host) {
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
    StaticReflector.prototype.getStaticType = function (moduleId, name) {
        var key = "\"" + moduleId + "\"." + name;
        var result = this.typeCache.get(key);
        if (!lang_1.isPresent(result)) {
            result = new StaticType(moduleId, name);
            this.typeCache.set(key, result);
        }
        return result;
    };
    StaticReflector.prototype.annotations = function (type) {
        var _this = this;
        var annotations = this.annotationCache.get(type);
        if (!lang_1.isPresent(annotations)) {
            var classMetadata = this.getTypeMetadata(type);
            if (lang_1.isPresent(classMetadata['decorators'])) {
                annotations = classMetadata['decorators']
                    .map(function (decorator) { return _this.convertKnownDecorator(type.moduleId, decorator); })
                    .filter(function (decorator) { return lang_1.isPresent(decorator); });
            }
            this.annotationCache.set(type, annotations);
        }
        return annotations;
    };
    StaticReflector.prototype.propMetadata = function (type) {
        var propMetadata = this.propertyCache.get(type);
        if (!lang_1.isPresent(propMetadata)) {
            var classMetadata = this.getTypeMetadata(type);
            propMetadata = this.getPropertyMetadata(type.moduleId, classMetadata['members']);
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    };
    StaticReflector.prototype.parameters = function (type) {
        var parameters = this.parameterCache.get(type);
        if (!lang_1.isPresent(parameters)) {
            var classMetadata = this.getTypeMetadata(type);
            var ctorData = classMetadata['members']['__ctor__'];
            if (lang_1.isPresent(ctorData)) {
                var ctor = ctorData.find(function (a) { return a['__symbolic'] === 'constructor'; });
                parameters = this.simplify(type.moduleId, ctor['parameters']);
                this.parameterCache.set(type, parameters);
            }
        }
        return parameters;
    };
    StaticReflector.prototype.initializeConversionMap = function () {
        var _this = this;
        var core_metadata = 'angular2/src/core/metadata';
        var conversionMap = this.conversionMap;
        conversionMap.set(this.getStaticType(core_metadata, 'Directive'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.DirectiveMetadata({
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
        conversionMap.set(this.getStaticType(core_metadata, 'Component'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.ComponentMetadata({
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
        conversionMap.set(this.getStaticType(core_metadata, 'Input'), function (moduleContext, expression) { return new metadata_1.InputMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'Output'), function (moduleContext, expression) { return new metadata_1.OutputMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'View'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.ViewMetadata({
                templateUrl: p0['templateUrl'],
                template: p0['template'],
                directives: p0['directives'],
                pipes: p0['pipes'],
                encapsulation: p0['encapsulation'],
                styles: p0['styles'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Attribute'), function (moduleContext, expression) { return new metadata_1.AttributeMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'Query'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            var p1 = _this.getDecoratorParameter(moduleContext, expression, 1);
            if (!lang_1.isPresent(p1)) {
                p1 = {};
            }
            return new metadata_1.QueryMetadata(p0, { descendants: p1.descendants, first: p1.first });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChildren'), function (moduleContext, expression) { return new metadata_1.ContentChildrenMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ContentChild'), function (moduleContext, expression) { return new metadata_1.ContentChildMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChildren'), function (moduleContext, expression) { return new metadata_1.ViewChildrenMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewChild'), function (moduleContext, expression) { return new metadata_1.ViewChildMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'ViewQuery'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            var p1 = _this.getDecoratorParameter(moduleContext, expression, 1);
            if (!lang_1.isPresent(p1)) {
                p1 = {};
            }
            return new metadata_1.ViewQueryMetadata(p0, {
                descendants: p1['descendants'],
                first: p1['first'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'Pipe'), function (moduleContext, expression) {
            var p0 = _this.getDecoratorParameter(moduleContext, expression, 0);
            if (!lang_1.isPresent(p0)) {
                p0 = {};
            }
            return new metadata_1.PipeMetadata({
                name: p0['name'],
                pure: p0['pure'],
            });
        });
        conversionMap.set(this.getStaticType(core_metadata, 'HostBinding'), function (moduleContext, expression) { return new metadata_1.HostBindingMetadata(_this.getDecoratorParameter(moduleContext, expression, 0)); });
        conversionMap.set(this.getStaticType(core_metadata, 'HostListener'), function (moduleContext, expression) { return new metadata_1.HostListenerMetadata(_this.getDecoratorParameter(moduleContext, expression, 0), _this.getDecoratorParameter(moduleContext, expression, 1)); });
        return null;
    };
    StaticReflector.prototype.convertKnownDecorator = function (moduleContext, expression) {
        var converter = this.conversionMap.get(this.getDecoratorType(moduleContext, expression));
        if (lang_1.isPresent(converter))
            return converter(moduleContext, expression);
        return null;
    };
    StaticReflector.prototype.getDecoratorType = function (moduleContext, expression) {
        if (isMetadataSymbolicCallExpression(expression)) {
            var target = expression['expression'];
            if (isMetadataSymbolicReferenceExpression(target)) {
                var moduleId = this.normalizeModuleName(moduleContext, target['module']);
                return this.getStaticType(moduleId, target['name']);
            }
        }
        return null;
    };
    StaticReflector.prototype.getDecoratorParameter = function (moduleContext, expression, index) {
        if (isMetadataSymbolicCallExpression(expression) && lang_1.isPresent(expression['arguments']) &&
            expression['arguments'].length <= index + 1) {
            return this.simplify(moduleContext, expression['arguments'][index]);
        }
        return null;
    };
    StaticReflector.prototype.getPropertyMetadata = function (moduleContext, value) {
        var _this = this;
        if (lang_1.isPresent(value)) {
            var result = {};
            collection_1.StringMapWrapper.forEach(value, function (value, name) {
                var data = _this.getMemberData(moduleContext, value);
                if (lang_1.isPresent(data)) {
                    var propertyData = data.filter(function (d) { return d['kind'] == "property"; })
                        .map(function (d) { return d['directives']; })
                        .reduce(function (p, c) { return p.concat(c); }, []);
                    if (propertyData.length != 0) {
                        collection_1.StringMapWrapper.set(result, name, propertyData);
                    }
                }
            });
            return result;
        }
        return null;
    };
    // clang-format off
    StaticReflector.prototype.getMemberData = function (moduleContext, member) {
        var _this = this;
        // clang-format on
        var result = [];
        if (lang_1.isPresent(member)) {
            for (var _i = 0; _i < member.length; _i++) {
                var item = member[_i];
                result.push({
                    kind: item['__symbolic'],
                    directives: lang_1.isPresent(item['decorators']) ?
                        item['decorators']
                            .map(function (decorator) { return _this.convertKnownDecorator(moduleContext, decorator); })
                            .filter(function (d) { return lang_1.isPresent(d); }) :
                        null
                });
            }
        }
        return result;
    };
    /** @internal */
    StaticReflector.prototype.simplify = function (moduleContext, value) {
        var _this = this;
        function simplify(expression) {
            if (lang_1.isPrimitive(expression)) {
                return expression;
            }
            if (lang_1.isArray(expression)) {
                var result = [];
                for (var _i = 0, _a = expression; _i < _a.length; _i++) {
                    var item = _a[_i];
                    result.push(simplify(item));
                }
                return result;
            }
            if (lang_1.isPresent(expression)) {
                if (lang_1.isPresent(expression['__symbolic'])) {
                    switch (expression['__symbolic']) {
                        case "binop":
                            var left = simplify(expression['left']);
                            var right = simplify(expression['right']);
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
                            var operand = simplify(expression['operand']);
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
                            var indexTarget = simplify(expression['expression']);
                            var index = simplify(expression['index']);
                            if (lang_1.isPresent(indexTarget) && lang_1.isPrimitive(index))
                                return indexTarget[index];
                            return null;
                        case "select":
                            var selectTarget = simplify(expression['expression']);
                            var member = simplify(expression['member']);
                            if (lang_1.isPresent(selectTarget) && lang_1.isPrimitive(member))
                                return selectTarget[member];
                            return null;
                        case "reference":
                            var referenceModuleName = _this.normalizeModuleName(moduleContext, expression['module']);
                            var referenceModule = _this.getModuleMetadata(referenceModuleName);
                            var referenceValue = referenceModule['metadata'][expression['name']];
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
                var result = {};
                collection_1.StringMapWrapper.forEach(expression, function (value, name) { result[name] = simplify(value); });
                return result;
            }
            return null;
        }
        return simplify(value);
    };
    StaticReflector.prototype.getModuleMetadata = function (module) {
        var moduleMetadata = this.metadataCache.get(module);
        if (!lang_1.isPresent(moduleMetadata)) {
            moduleMetadata = this.host.getMetadataFor(module);
            if (!lang_1.isPresent(moduleMetadata)) {
                moduleMetadata = { __symbolic: "module", module: module, metadata: {} };
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    };
    StaticReflector.prototype.getTypeMetadata = function (type) {
        var moduleMetadata = this.getModuleMetadata(type.moduleId);
        var result = moduleMetadata['metadata'][type.name];
        if (!lang_1.isPresent(result)) {
            result = { __symbolic: "class" };
        }
        return result;
    };
    StaticReflector.prototype.normalizeModuleName = function (from, to) {
        if (to.startsWith('.')) {
            return pathTo(from, to);
        }
        return to;
    };
    return StaticReflector;
})();
exports.StaticReflector = StaticReflector;
function isMetadataSymbolicCallExpression(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'call';
}
function isMetadataSymbolicReferenceExpression(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) &&
        expression['__symbolic'] == 'reference';
}
function isClassMetadata(expression) {
    return !lang_1.isPrimitive(expression) && !lang_1.isArray(expression) && expression['__symbolic'] == 'class';
}
function splitPath(path) {
    return path.split(/\/|\\/g);
}
function resolvePath(pathParts) {
    var result = [];
    collection_1.ListWrapper.forEachWithIndex(pathParts, function (part, index) {
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
    var result = to;
    if (to.startsWith('.')) {
        var fromParts = splitPath(from);
        fromParts.pop(); // remove the file name.
        var toParts = splitPath(to);
        result = resolvePath(fromParts.concat(toParts));
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcFVIbTRDbHMudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zdGF0aWNfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY1R5cGUiLCJTdGF0aWNUeXBlLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmNvbnN0cnVjdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldFN0YXRpY1R5cGUiLCJTdGF0aWNSZWZsZWN0b3IuYW5ub3RhdGlvbnMiLCJTdGF0aWNSZWZsZWN0b3IucHJvcE1ldGFkYXRhIiwiU3RhdGljUmVmbGVjdG9yLnBhcmFtZXRlcnMiLCJTdGF0aWNSZWZsZWN0b3IuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAiLCJTdGF0aWNSZWZsZWN0b3IuY29udmVydEtub3duRGVjb3JhdG9yIiwiU3RhdGljUmVmbGVjdG9yLmdldERlY29yYXRvclR5cGUiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyIiwiU3RhdGljUmVmbGVjdG9yLmdldFByb3BlcnR5TWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3IuZ2V0TWVtYmVyRGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5zaW1wbGlmeS5zaW1wbGlmeSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRNb2R1bGVNZXRhZGF0YSIsIlN0YXRpY1JlZmxlY3Rvci5nZXRUeXBlTWV0YWRhdGEiLCJTdGF0aWNSZWZsZWN0b3Iubm9ybWFsaXplTW9kdWxlTmFtZSIsImlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uIiwiaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiIsImlzQ2xhc3NNZXRhZGF0YSIsInNwbGl0UGF0aCIsInJlc29sdmVQYXRoIiwicGF0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QSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSx3QkFBYUEsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsQ0FBQ0EsV0FBV0EsRUFBRUEsS0FBS0EsRUFBRUEsRUFBRUEsQ0FBQ0EsS0FBS0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0VBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLGFBQWFBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGFBQWFBLEVBQUVBLGlCQUFpQkEsQ0FBQ0EsRUFDcERBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLElBQUtBLE9BQUFBLElBQUlBLGtDQUF1QkEsQ0FDdERBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFEOUJBLENBQzhCQSxDQUFDQSxDQUFDQTtRQUNqRkEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsY0FBY0EsQ0FBQ0EsRUFDakRBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLElBQUtBLE9BQUFBLElBQUlBLCtCQUFvQkEsQ0FDbkRBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFEOUJBLENBQzhCQSxDQUFDQSxDQUFDQTtRQUNqRkEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsY0FBY0EsQ0FBQ0EsRUFDakRBLFVBQUNBLGFBQWFBLEVBQUVBLFVBQVVBLElBQUtBLE9BQUFBLElBQUlBLCtCQUFvQkEsQ0FDbkRBLEtBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFEOUJBLENBQzhCQSxDQUFDQSxDQUFDQTtRQUNqRkEsYUFBYUEsQ0FB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SUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7aUJBQzdCQTtnQkFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUJBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDeENBLE1BQU1BLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO3dCQUNqQ0EsS0FBS0EsT0FBT0E7NEJBQ1ZBLElBQUlBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBOzRCQUN4Q0EsSUFBSUEsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQzFDQSxNQUFNQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDL0JBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEtBQUtBO29DQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQTtnQ0FDeEJBLEtBQUtBLEtBQUtBO29DQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxLQUFLQSxDQUFDQTtnQ0FDeEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLElBQUlBO29DQUNQQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxDQUFDQTtnQ0FDdkJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtnQ0FDdEJBLEtBQUtBLEdBQUdBO29DQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTs0QkFDeEJBLENB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QUlBLENBQUNBLENBQUNBO0lBQ3BCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNIQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUMxQkEsQ0FBQ0E7QUFFRCxnQkFBZ0IsSUFBWSxFQUFFLEVBQVU7SUFDdENDLElBQUlBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBO0lBQ2hCQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2QkEsSUFBSUEsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDaENBLFNBQVNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUVBLHdCQUF3QkE7UUFDMUNBLElBQUlBLE9BQU9BLEdBQUdBLFNBQVNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQzVCQSxNQUFNQSxHQUFHQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNsREEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7QUFDaEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIGlzQXJyYXksXG4gIGlzQmxhbmssXG4gIGlzTnVtYmVyLFxuICBpc1ByZXNlbnQsXG4gIGlzUHJpbWl0aXZlLFxuICBpc1N0cmluZyxcbiAgVHlwZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtcbiAgQXR0cmlidXRlTWV0YWRhdGEsXG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgQ29udGVudENoaWxkcmVuTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZE1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBIb3N0QmluZGluZ01ldGFkYXRhLFxuICBIb3N0TGlzdGVuZXJNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIFBpcGVNZXRhZGF0YSxcbiAgVmlld01ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBRdWVyeU1ldGFkYXRhLFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG5cbi8qKlxuICogVGhlIGhvc3Qgb2YgdGhlIHN0YXRpYyByZXNvbHZlciBpcyBleHBlY3RlZCB0byBiZSBhYmxlIHRvIHByb3ZpZGUgbW9kdWxlIG1ldGFkYXRhIGluIHRoZSBmb3JtIG9mXG4gKiBNb2R1bGVNZXRhZGF0YS4gQW5ndWxhciAyIENMSSB3aWxsIHByb2R1Y2UgdGhpcyBtZXRhZGF0YSBmb3IgYSBtb2R1bGUgd2hlbmV2ZXIgYSAuZC50cyBmaWxlcyBpc1xuICogcHJvZHVjZWQgYW5kIHRoZSBtb2R1bGUgaGFzIGV4cG9ydGVkIHZhcmlhYmxlcyBvciBjbGFzc2VzIHdpdGggZGVjb3JhdG9ycy4gTW9kdWxlIG1ldGFkYXRhIGNhblxuICogYWxzbyBiZSBwcm9kdWNlZCBkaXJlY3RseSBmcm9tIFR5cGVTY3JpcHQgc291cmNlcyBieSB1c2luZyBNZXRhZGF0YUNvbGxlY3RvciBpbiB0b29scy9tZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGF0aWNSZWZsZWN0b3JIb3N0IHtcbiAgLyoqXG4gICAqICBSZXR1cm4gYSBNb2R1bGVNZXRhZGF0YSBmb3IgdGhlIGdpdmUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlSWQgaXMgYSBzdHJpbmcgaWRlbnRpZmllciBmb3IgYSBtb2R1bGUgaW4gdGhlIGZvcm0gdGhhdCB3b3VsZCBleHBlY3RlZCBpbiBhXG4gICAqICAgICAgICAgICAgICAgICBtb2R1bGUgaW1wb3J0IG9mIGFuIGltcG9ydCBzdGF0ZW1lbnQuXG4gICAqIEByZXR1cm5zIHRoZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuIG1vZHVsZS5cbiAgICovXG4gIGdldE1ldGFkYXRhRm9yKG1vZHVsZUlkOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBBIHRva2VuIHJlcHJlc2VudGluZyB0aGUgYSByZWZlcmVuY2UgdG8gYSBzdGF0aWMgdHlwZS5cbiAqXG4gKiBUaGlzIHRva2VuIGlzIHVuaXF1ZSBmb3IgYSBtb2R1bGVJZCBhbmQgbmFtZSBhbmQgY2FuIGJlIHVzZWQgYXMgYSBoYXNoIHRhYmxlIGtleS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRpY1R5cGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbW9kdWxlSWQ6IHN0cmluZywgcHVibGljIG5hbWU6IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBBIHN0YXRpYyByZWZsZWN0b3IgaW1wbGVtZW50cyBlbm91Z2ggb2YgdGhlIFJlZmxlY3RvciBBUEkgdGhhdCBpcyBuZWNlc3NhcnkgdG8gY29tcGlsZVxuICogdGVtcGxhdGVzIHN0YXRpY2FsbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNSZWZsZWN0b3Ige1xuICBwcml2YXRlIHR5cGVDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBTdGF0aWNUeXBlPigpO1xuICBwcml2YXRlIGFubm90YXRpb25DYWNoZSA9IG5ldyBNYXA8U3RhdGljVHlwZSwgYW55W10+KCk7XG4gIHByaXZhdGUgcHJvcGVydHlDYWNoZSA9IG5ldyBNYXA8U3RhdGljVHlwZSwge1trZXk6IHN0cmluZ106IGFueX0+KCk7XG4gIHByaXZhdGUgcGFyYW1ldGVyQ2FjaGUgPSBuZXcgTWFwPFN0YXRpY1R5cGUsIGFueVtdPigpO1xuICBwcml2YXRlIG1ldGFkYXRhQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywge1trZXk6IHN0cmluZ106IGFueX0+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBTdGF0aWNSZWZsZWN0b3JIb3N0KSB7IHRoaXMuaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTsgfVxuXG4gIC8qKlxuICAgKiBnZXRTdGF0aWN0eXBlIHByb2R1Y2VzIGEgVHlwZSB3aG9zZSBtZXRhZGF0YSBpcyBrbm93biBidXQgd2hvc2UgaW1wbGVtZW50YXRpb24gaXMgbm90IGxvYWRlZC5cbiAgICogQWxsIHR5cGVzIHBhc3NlZCB0byB0aGUgU3RhdGljUmVzb2x2ZXIgc2hvdWxkIGJlIHBzZXVkby10eXBlcyByZXR1cm5lZCBieSB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZUlkIHRoZSBtb2R1bGUgaWRlbnRpZmllciBhcyB3b3VsZCBiZSBwYXNzZWQgdG8gYW4gaW1wb3J0IHN0YXRlbWVudC5cbiAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIHR5cGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RhdGljVHlwZShtb2R1bGVJZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBTdGF0aWNUeXBlIHtcbiAgICBsZXQga2V5ID0gYFwiJHttb2R1bGVJZH1cIi4ke25hbWV9YDtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy50eXBlQ2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKCFpc1ByZXNlbnQocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0gbmV3IFN0YXRpY1R5cGUobW9kdWxlSWQsIG5hbWUpO1xuICAgICAgdGhpcy50eXBlQ2FjaGUuc2V0KGtleSwgcmVzdWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHB1YmxpYyBhbm5vdGF0aW9ucyh0eXBlOiBTdGF0aWNUeXBlKTogYW55W10ge1xuICAgIGxldCBhbm5vdGF0aW9ucyA9IHRoaXMuYW5ub3RhdGlvbkNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChhbm5vdGF0aW9ucykpIHtcbiAgICAgIGxldCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNsYXNzTWV0YWRhdGFbJ2RlY29yYXRvcnMnXSkpIHtcbiAgICAgICAgYW5ub3RhdGlvbnMgPSAoPGFueVtdPmNsYXNzTWV0YWRhdGFbJ2RlY29yYXRvcnMnXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChkZWNvcmF0b3IgPT4gdGhpcy5jb252ZXJ0S25vd25EZWNvcmF0b3IodHlwZS5tb2R1bGVJZCwgZGVjb3JhdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihkZWNvcmF0b3IgPT4gaXNQcmVzZW50KGRlY29yYXRvcikpO1xuICAgICAgfVxuICAgICAgdGhpcy5hbm5vdGF0aW9uQ2FjaGUuc2V0KHR5cGUsIGFubm90YXRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGFubm90YXRpb25zO1xuICB9XG5cbiAgcHVibGljIHByb3BNZXRhZGF0YSh0eXBlOiBTdGF0aWNUeXBlKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBwcm9wTWV0YWRhdGEgPSB0aGlzLnByb3BlcnR5Q2FjaGUuZ2V0KHR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KHByb3BNZXRhZGF0YSkpIHtcbiAgICAgIGxldCBjbGFzc01ldGFkYXRhID0gdGhpcy5nZXRUeXBlTWV0YWRhdGEodHlwZSk7XG4gICAgICBwcm9wTWV0YWRhdGEgPSB0aGlzLmdldFByb3BlcnR5TWV0YWRhdGEodHlwZS5tb2R1bGVJZCwgY2xhc3NNZXRhZGF0YVsnbWVtYmVycyddKTtcbiAgICAgIHRoaXMucHJvcGVydHlDYWNoZS5zZXQodHlwZSwgcHJvcE1ldGFkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BNZXRhZGF0YTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJhbWV0ZXJzKHR5cGU6IFN0YXRpY1R5cGUpOiBhbnlbXSB7XG4gICAgbGV0IHBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlckNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChwYXJhbWV0ZXJzKSkge1xuICAgICAgbGV0IGNsYXNzTWV0YWRhdGEgPSB0aGlzLmdldFR5cGVNZXRhZGF0YSh0eXBlKTtcbiAgICAgIGxldCBjdG9yRGF0YSA9IGNsYXNzTWV0YWRhdGFbJ21lbWJlcnMnXVsnX19jdG9yX18nXTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY3RvckRhdGEpKSB7XG4gICAgICAgIGxldCBjdG9yID0gKDxhbnlbXT5jdG9yRGF0YSkuZmluZChhID0+IGFbJ19fc3ltYm9saWMnXSA9PT0gJ2NvbnN0cnVjdG9yJyk7XG4gICAgICAgIHBhcmFtZXRlcnMgPSB0aGlzLnNpbXBsaWZ5KHR5cGUubW9kdWxlSWQsIGN0b3JbJ3BhcmFtZXRlcnMnXSk7XG4gICAgICAgIHRoaXMucGFyYW1ldGVyQ2FjaGUuc2V0KHR5cGUsIHBhcmFtZXRlcnMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgfVxuXG4gIHByaXZhdGUgY29udmVyc2lvbk1hcCA9IG5ldyBNYXA8U3RhdGljVHlwZSwgKG1vZHVsZUNvbnRleHQ6IHN0cmluZywgZXhwcmVzc2lvbjogYW55KSA9PiBhbnk+KCk7XG4gIHByaXZhdGUgaW5pdGlhbGl6ZUNvbnZlcnNpb25NYXAoKTogYW55IHtcbiAgICBsZXQgY29yZV9tZXRhZGF0YSA9ICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG4gICAgbGV0IGNvbnZlcnNpb25NYXAgPSB0aGlzLmNvbnZlcnNpb25NYXA7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdEaXJlY3RpdmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAwID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcDAgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcDBbJ3NlbGVjdG9yJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogcDBbJ2lucHV0cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBwMFsnb3V0cHV0cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHM6IHAwWydldmVudHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdDogcDBbJ2hvc3QnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZ3M6IHAwWydiaW5kaW5ncyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHAwWydwcm92aWRlcnMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXM6IHAwWydleHBvcnRBcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyaWVzOiBwMFsncXVlcmllcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdDb21wb25lbnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAwID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcDAgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50TWV0YWRhdGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcDBbJ3NlbGVjdG9yJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogcDBbJ2lucHV0cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBwMFsnb3V0cHV0cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwMFsncHJvcGVydGllcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHM6IHAwWydldmVudHMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdDogcDBbJ2hvc3QnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXM6IHAwWydleHBvcnRBcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJZDogcDBbJ21vZHVsZUlkJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzOiBwMFsnYmluZGluZ3MnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBwMFsncHJvdmlkZXJzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdCaW5kaW5nczogcDBbJ3ZpZXdCaW5kaW5ncyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzOiBwMFsndmlld1Byb3ZpZGVycyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IHAwWydjaGFuZ2VEZXRlY3Rpb24nXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcmllczogcDBbJ3F1ZXJpZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHAwWyd0ZW1wbGF0ZVVybCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcDBbJ3RlbXBsYXRlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlVXJsczogcDBbJ3N0eWxlVXJscyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IHAwWydzdHlsZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlczogcDBbJ2RpcmVjdGl2ZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGlwZXM6IHAwWydwaXBlcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNhcHN1bGF0aW9uOiBwMFsnZW5jYXBzdWxhdGlvbiddXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0lucHV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBJbnB1dE1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnT3V0cHV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBPdXRwdXRNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXcnKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgIHAwID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFZpZXdNZXRhZGF0YSh7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBwMFsndGVtcGxhdGVVcmwnXSxcbiAgICAgICAgdGVtcGxhdGU6IHAwWyd0ZW1wbGF0ZSddLFxuICAgICAgICBkaXJlY3RpdmVzOiBwMFsnZGlyZWN0aXZlcyddLFxuICAgICAgICBwaXBlczogcDBbJ3BpcGVzJ10sXG4gICAgICAgIGVuY2Fwc3VsYXRpb246IHAwWydlbmNhcHN1bGF0aW9uJ10sXG4gICAgICAgIHN0eWxlczogcDBbJ3N0eWxlcyddLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdBdHRyaWJ1dGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IEF0dHJpYnV0ZU1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnUXVlcnknKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgbGV0IHAxID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMSk7XG4gICAgICBpZiAoIWlzUHJlc2VudChwMSkpIHtcbiAgICAgICAgcDEgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUXVlcnlNZXRhZGF0YShwMCwge2Rlc2NlbmRhbnRzOiBwMS5kZXNjZW5kYW50cywgZmlyc3Q6IHAxLmZpcnN0fSk7XG4gICAgfSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdDb250ZW50Q2hpbGRyZW4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnQ29udGVudENoaWxkJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBDb250ZW50Q2hpbGRNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCkpKTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1ZpZXdDaGlsZHJlbicpLFxuICAgICAgICAgICAgICAgICAgICAgIChtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKSA9PiBuZXcgVmlld0NoaWxkcmVuTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApKSk7XG4gICAgY29udmVyc2lvbk1hcC5zZXQodGhpcy5nZXRTdGF0aWNUeXBlKGNvcmVfbWV0YWRhdGEsICdWaWV3Q2hpbGQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikgPT4gbmV3IFZpZXdDaGlsZE1ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnVmlld1F1ZXJ5JyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAxID0gdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzUHJlc2VudChwMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcDEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmlld1F1ZXJ5TWV0YWRhdGEocDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY2VuZGFudHM6IHAxWydkZXNjZW5kYW50cyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdDogcDFbJ2ZpcnN0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ1BpcGUnKSwgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGxldCBwMCA9IHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDApO1xuICAgICAgaWYgKCFpc1ByZXNlbnQocDApKSB7XG4gICAgICAgIHAwID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFBpcGVNZXRhZGF0YSh7XG4gICAgICAgIG5hbWU6IHAwWyduYW1lJ10sXG4gICAgICAgIHB1cmU6IHAwWydwdXJlJ10sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBjb252ZXJzaW9uTWFwLnNldCh0aGlzLmdldFN0YXRpY1R5cGUoY29yZV9tZXRhZGF0YSwgJ0hvc3RCaW5kaW5nJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBIb3N0QmluZGluZ01ldGFkYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uLCAwKSkpO1xuICAgIGNvbnZlcnNpb25NYXAuc2V0KHRoaXMuZ2V0U3RhdGljVHlwZShjb3JlX21ldGFkYXRhLCAnSG9zdExpc3RlbmVyJyksXG4gICAgICAgICAgICAgICAgICAgICAgKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24pID0+IG5ldyBIb3N0TGlzdGVuZXJNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXREZWNvcmF0b3JQYXJhbWV0ZXIobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbiwgMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVjb3JhdG9yUGFyYW1ldGVyKG1vZHVsZUNvbnRleHQsIGV4cHJlc3Npb24sIDEpKSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRLbm93bkRlY29yYXRvcihtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYW55IHtcbiAgICBsZXQgY29udmVydGVyID0gdGhpcy5jb252ZXJzaW9uTWFwLmdldCh0aGlzLmdldERlY29yYXRvclR5cGUobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvbikpO1xuICAgIGlmIChpc1ByZXNlbnQoY29udmVydGVyKSkgcmV0dXJuIGNvbnZlcnRlcihtb2R1bGVDb250ZXh0LCBleHByZXNzaW9uKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGVjb3JhdG9yVHlwZShtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9KTogU3RhdGljVHlwZSB7XG4gICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddO1xuICAgICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24odGFyZ2V0KSkge1xuICAgICAgICBsZXQgbW9kdWxlSWQgPSB0aGlzLm5vcm1hbGl6ZU1vZHVsZU5hbWUobW9kdWxlQ29udGV4dCwgdGFyZ2V0Wydtb2R1bGUnXSk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRpY1R5cGUobW9kdWxlSWQsIHRhcmdldFsnbmFtZSddKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldERlY29yYXRvclBhcmFtZXRlcihtb2R1bGVDb250ZXh0OiBzdHJpbmcsIGV4cHJlc3Npb246IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogbnVtYmVyKTogYW55IHtcbiAgICBpZiAoaXNNZXRhZGF0YVN5bWJvbGljQ2FsbEV4cHJlc3Npb24oZXhwcmVzc2lvbikgJiYgaXNQcmVzZW50KGV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKSAmJlxuICAgICAgICAoPGFueVtdPmV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKS5sZW5ndGggPD0gaW5kZXggKyAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaW1wbGlmeShtb2R1bGVDb250ZXh0LCAoPGFueVtdPmV4cHJlc3Npb25bJ2FyZ3VtZW50cyddKVtpbmRleF0pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJvcGVydHlNZXRhZGF0YShtb2R1bGVDb250ZXh0OiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgIGxldCByZXN1bHQgPSB7fTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh2YWx1ZSwgKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5nZXRNZW1iZXJEYXRhKG1vZHVsZUNvbnRleHQsIHZhbHVlKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChkYXRhKSkge1xuICAgICAgICAgIGxldCBwcm9wZXJ0eURhdGEgPSBkYXRhLmZpbHRlcihkID0+IGRbJ2tpbmQnXSA9PSBcInByb3BlcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGQgPT4gZFsnZGlyZWN0aXZlcyddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgocCwgYykgPT4gKDxhbnlbXT5wKS5jb25jYXQoPGFueVtdPmMpLCBbXSk7XG4gICAgICAgICAgaWYgKHByb3BlcnR5RGF0YS5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCBuYW1lLCBwcm9wZXJ0eURhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgcHJpdmF0ZSBnZXRNZW1iZXJEYXRhKG1vZHVsZUNvbnRleHQ6IHN0cmluZywgbWVtYmVyOiB7IFtrZXk6IHN0cmluZ106IGFueSB9W10pOiB7IFtrZXk6IHN0cmluZ106IGFueSB9W10ge1xuICAgIC8vIGNsYW5nLWZvcm1hdCBvblxuICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICBpZiAoaXNQcmVzZW50KG1lbWJlcikpIHtcbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgbWVtYmVyKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICBraW5kOiBpdGVtWydfX3N5bWJvbGljJ10sXG4gICAgICAgICAgZGlyZWN0aXZlczpcbiAgICAgICAgICAgICAgaXNQcmVzZW50KGl0ZW1bJ2RlY29yYXRvcnMnXSkgP1xuICAgICAgICAgICAgICAgICAgKDxhbnlbXT5pdGVtWydkZWNvcmF0b3JzJ10pXG4gICAgICAgICAgICAgICAgICAgICAgLm1hcChkZWNvcmF0b3IgPT4gdGhpcy5jb252ZXJ0S25vd25EZWNvcmF0b3IobW9kdWxlQ29udGV4dCwgZGVjb3JhdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGQgPT4gaXNQcmVzZW50KGQpKSA6XG4gICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgc2ltcGxpZnkobW9kdWxlQ29udGV4dDogc3RyaW5nLCB2YWx1ZTogYW55KTogYW55IHtcbiAgICBsZXQgX3RoaXMgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gc2ltcGxpZnkoZXhwcmVzc2lvbjogYW55KTogYW55IHtcbiAgICAgIGlmIChpc1ByaW1pdGl2ZShleHByZXNzaW9uKSkge1xuICAgICAgICByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgIH1cbiAgICAgIGlmIChpc0FycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZig8YW55PmV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goc2ltcGxpZnkoaXRlbSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZXhwcmVzc2lvblsnX19zeW1ib2xpYyddKSkge1xuICAgICAgICAgIHN3aXRjaCAoZXhwcmVzc2lvblsnX19zeW1ib2xpYyddKSB7XG4gICAgICAgICAgICBjYXNlIFwiYmlub3BcIjpcbiAgICAgICAgICAgICAgbGV0IGxlZnQgPSBzaW1wbGlmeShleHByZXNzaW9uWydsZWZ0J10pO1xuICAgICAgICAgICAgICBsZXQgcmlnaHQgPSBzaW1wbGlmeShleHByZXNzaW9uWydyaWdodCddKTtcbiAgICAgICAgICAgICAgc3dpdGNoIChleHByZXNzaW9uWydvcGVyYXRvciddKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnJiYnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJiYgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnfHwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgfHwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCB8IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ14nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgXiByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICYgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnIT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT09IHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ID4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPD0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPj0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPDwnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPDwgcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnPj4nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgPj4gcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCArIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgLSByaWdodDtcbiAgICAgICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0ICogcmlnaHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCAvIHJpZ2h0O1xuICAgICAgICAgICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQgJSByaWdodDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgXCJwcmVcIjpcbiAgICAgICAgICAgICAgbGV0IG9wZXJhbmQgPSBzaW1wbGlmeShleHByZXNzaW9uWydvcGVyYW5kJ10pO1xuICAgICAgICAgICAgICBzd2l0Y2ggKGV4cHJlc3Npb25bJ29wZXJhdG9yJ10pIHtcbiAgICAgICAgICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIC1vcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuICFvcGVyYW5kO1xuICAgICAgICAgICAgICAgIGNhc2UgJ34nOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIH5vcGVyYW5kO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcImluZGV4XCI6XG4gICAgICAgICAgICAgIGxldCBpbmRleFRhcmdldCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2V4cHJlc3Npb24nXSk7XG4gICAgICAgICAgICAgIGxldCBpbmRleCA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ2luZGV4J10pO1xuICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGluZGV4VGFyZ2V0KSAmJiBpc1ByaW1pdGl2ZShpbmRleCkpIHJldHVybiBpbmRleFRhcmdldFtpbmRleF07XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBcInNlbGVjdFwiOlxuICAgICAgICAgICAgICBsZXQgc2VsZWN0VGFyZ2V0ID0gc2ltcGxpZnkoZXhwcmVzc2lvblsnZXhwcmVzc2lvbiddKTtcbiAgICAgICAgICAgICAgbGV0IG1lbWJlciA9IHNpbXBsaWZ5KGV4cHJlc3Npb25bJ21lbWJlciddKTtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChzZWxlY3RUYXJnZXQpICYmIGlzUHJpbWl0aXZlKG1lbWJlcikpIHJldHVybiBzZWxlY3RUYXJnZXRbbWVtYmVyXTtcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIFwicmVmZXJlbmNlXCI6XG4gICAgICAgICAgICAgIGxldCByZWZlcmVuY2VNb2R1bGVOYW1lID1cbiAgICAgICAgICAgICAgICAgIF90aGlzLm5vcm1hbGl6ZU1vZHVsZU5hbWUobW9kdWxlQ29udGV4dCwgZXhwcmVzc2lvblsnbW9kdWxlJ10pO1xuICAgICAgICAgICAgICBsZXQgcmVmZXJlbmNlTW9kdWxlID0gX3RoaXMuZ2V0TW9kdWxlTWV0YWRhdGEocmVmZXJlbmNlTW9kdWxlTmFtZSk7XG4gICAgICAgICAgICAgIGxldCByZWZlcmVuY2VWYWx1ZSA9IHJlZmVyZW5jZU1vZHVsZVsnbWV0YWRhdGEnXVtleHByZXNzaW9uWyduYW1lJ11dO1xuICAgICAgICAgICAgICBpZiAoaXNDbGFzc01ldGFkYXRhKHJlZmVyZW5jZVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gYSBwc2V1ZG8gdHlwZVxuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5nZXRTdGF0aWNUeXBlKHJlZmVyZW5jZU1vZHVsZU5hbWUsIGV4cHJlc3Npb25bJ25hbWUnXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnNpbXBsaWZ5KHJlZmVyZW5jZU1vZHVsZU5hbWUsIHJlZmVyZW5jZVZhbHVlKTtcbiAgICAgICAgICAgIGNhc2UgXCJjYWxsXCI6XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVzdWx0ID0ge307XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChleHByZXNzaW9uLCAodmFsdWUsIG5hbWUpID0+IHsgcmVzdWx0W25hbWVdID0gc2ltcGxpZnkodmFsdWUpOyB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBzaW1wbGlmeSh2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIGdldE1vZHVsZU1ldGFkYXRhKG1vZHVsZTogc3RyaW5nKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBtb2R1bGVNZXRhZGF0YSA9IHRoaXMubWV0YWRhdGFDYWNoZS5nZXQobW9kdWxlKTtcbiAgICBpZiAoIWlzUHJlc2VudChtb2R1bGVNZXRhZGF0YSkpIHtcbiAgICAgIG1vZHVsZU1ldGFkYXRhID0gdGhpcy5ob3N0LmdldE1ldGFkYXRhRm9yKG1vZHVsZSk7XG4gICAgICBpZiAoIWlzUHJlc2VudChtb2R1bGVNZXRhZGF0YSkpIHtcbiAgICAgICAgbW9kdWxlTWV0YWRhdGEgPSB7X19zeW1ib2xpYzogXCJtb2R1bGVcIiwgbW9kdWxlOiBtb2R1bGUsIG1ldGFkYXRhOiB7fX07XG4gICAgICB9XG4gICAgICB0aGlzLm1ldGFkYXRhQ2FjaGUuc2V0KG1vZHVsZSwgbW9kdWxlTWV0YWRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gbW9kdWxlTWV0YWRhdGE7XG4gIH1cblxuICBwcml2YXRlIGdldFR5cGVNZXRhZGF0YSh0eXBlOiBTdGF0aWNUeXBlKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBtb2R1bGVNZXRhZGF0YSA9IHRoaXMuZ2V0TW9kdWxlTWV0YWRhdGEodHlwZS5tb2R1bGVJZCk7XG4gICAgbGV0IHJlc3VsdCA9IG1vZHVsZU1ldGFkYXRhWydtZXRhZGF0YSddW3R5cGUubmFtZV07XG4gICAgaWYgKCFpc1ByZXNlbnQocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0ge19fc3ltYm9saWM6IFwiY2xhc3NcIn07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIG5vcm1hbGl6ZU1vZHVsZU5hbWUoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodG8uc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgICByZXR1cm4gcGF0aFRvKGZyb20sIHRvKTtcbiAgICB9XG4gICAgcmV0dXJuIHRvO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSA9PSAnY2FsbCc7XG59XG5cbmZ1bmN0aW9uIGlzTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24oZXhwcmVzc2lvbjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAhaXNQcmltaXRpdmUoZXhwcmVzc2lvbikgJiYgIWlzQXJyYXkoZXhwcmVzc2lvbikgJiZcbiAgICAgICAgIGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSA9PSAncmVmZXJlbmNlJztcbn1cblxuZnVuY3Rpb24gaXNDbGFzc01ldGFkYXRhKGV4cHJlc3Npb246IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzUHJpbWl0aXZlKGV4cHJlc3Npb24pICYmICFpc0FycmF5KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb25bJ19fc3ltYm9saWMnXSA9PSAnY2xhc3MnO1xufVxuXG5mdW5jdGlvbiBzcGxpdFBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nW10ge1xuICByZXR1cm4gcGF0aC5zcGxpdCgvXFwvfFxcXFwvZyk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQYXRoKHBhdGhQYXJ0czogc3RyaW5nW10pOiBzdHJpbmcge1xuICBsZXQgcmVzdWx0ID0gW107XG4gIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgocGF0aFBhcnRzLCAocGFydCwgaW5kZXgpID0+IHtcbiAgICBzd2l0Y2ggKHBhcnQpIHtcbiAgICAgIGNhc2UgJyc6XG4gICAgICBjYXNlICcuJzpcbiAgICAgICAgaWYgKGluZGV4ID4gMCkgcmV0dXJuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy4uJzpcbiAgICAgICAgaWYgKGluZGV4ID4gMCAmJiByZXN1bHQubGVuZ3RoICE9IDApIHJlc3VsdC5wb3AoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXN1bHQucHVzaChwYXJ0KTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQuam9pbignLycpO1xufVxuXG5mdW5jdGlvbiBwYXRoVG8oZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9IHRvO1xuICBpZiAodG8uc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgbGV0IGZyb21QYXJ0cyA9IHNwbGl0UGF0aChmcm9tKTtcbiAgICBmcm9tUGFydHMucG9wKCk7ICAvLyByZW1vdmUgdGhlIGZpbGUgbmFtZS5cbiAgICBsZXQgdG9QYXJ0cyA9IHNwbGl0UGF0aCh0byk7XG4gICAgcmVzdWx0ID0gcmVzb2x2ZVBhdGgoZnJvbVBhcnRzLmNvbmNhdCh0b1BhcnRzKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==