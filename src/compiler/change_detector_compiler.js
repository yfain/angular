'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var source_module_1 = require('./source_module');
var change_detection_jit_generator_1 = require('angular2/src/core/change_detection/change_detection_jit_generator');
var abstract_change_detector_1 = require('angular2/src/core/change_detection/abstract_change_detector');
var change_detection_util_1 = require('angular2/src/core/change_detection/change_detection_util');
var constants_1 = require('angular2/src/core/change_detection/constants');
var change_definition_factory_1 = require('./change_definition_factory');
var lang_1 = require('angular2/src/facade/lang');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var change_detector_codegen_1 = require('angular2/src/transform/template_compiler/change_detector_codegen');
var util_1 = require('./util');
var di_1 = require('angular2/src/core/di');
var ABSTRACT_CHANGE_DETECTOR = 'AbstractChangeDetector';
var UTIL = 'ChangeDetectionUtil';
var CHANGE_DETECTOR_STATE = 'ChangeDetectorState';
exports.CHANGE_DETECTION_JIT_IMPORTS = lang_1.CONST_EXPR({
    'AbstractChangeDetector': abstract_change_detector_1.AbstractChangeDetector,
    'ChangeDetectionUtil': change_detection_util_1.ChangeDetectionUtil,
    'ChangeDetectorState': constants_1.ChangeDetectorState
});
var ABSTRACT_CHANGE_DETECTOR_MODULE = source_module_1.moduleRef("package:angular2/src/core/change_detection/abstract_change_detector" + util_1.MODULE_SUFFIX);
var UTIL_MODULE = source_module_1.moduleRef("package:angular2/src/core/change_detection/change_detection_util" + util_1.MODULE_SUFFIX);
var PREGEN_PROTO_CHANGE_DETECTOR_MODULE = source_module_1.moduleRef("package:angular2/src/core/change_detection/pregen_proto_change_detector" + util_1.MODULE_SUFFIX);
var CONSTANTS_MODULE = source_module_1.moduleRef("package:angular2/src/core/change_detection/constants" + util_1.MODULE_SUFFIX);
var ChangeDetectionCompiler = (function () {
    function ChangeDetectionCompiler(_genConfig) {
        this._genConfig = _genConfig;
    }
    ChangeDetectionCompiler.prototype.compileComponentRuntime = function (componentType, strategy, parsedTemplate) {
        var _this = this;
        var changeDetectorDefinitions = change_definition_factory_1.createChangeDetectorDefinitions(componentType, strategy, this._genConfig, parsedTemplate);
        return changeDetectorDefinitions.map(function (definition) { return _this._createChangeDetectorFactory(definition); });
    };
    ChangeDetectionCompiler.prototype._createChangeDetectorFactory = function (definition) {
        var proto = new change_detection_1.DynamicProtoChangeDetector(definition);
        return function () { return proto.instantiate(); };
    };
    ChangeDetectionCompiler.prototype.compileComponentCodeGen = function (componentType, strategy, parsedTemplate) {
        var changeDetectorDefinitions = change_definition_factory_1.createChangeDetectorDefinitions(componentType, strategy, this._genConfig, parsedTemplate);
        var factories = [];
        var index = 0;
        var sourceParts = changeDetectorDefinitions.map(function (definition) {
            var codegen;
            var sourcePart;
            // TODO(tbosch): move the 2 code generators to the same place, one with .dart and one with .ts
            // suffix
            // and have the same API for calling them!
            if (lang_1.IS_DART) {
                codegen = new change_detector_codegen_1.Codegen(PREGEN_PROTO_CHANGE_DETECTOR_MODULE);
                var className = "_" + definition.id;
                var typeRef = (index === 0 && componentType.isHost) ?
                    'dynamic' :
                    "" + source_module_1.moduleRef(componentType.moduleUrl) + componentType.name;
                codegen.generate(typeRef, className, definition);
                factories.push(className + ".newChangeDetector");
                sourcePart = codegen.toString();
            }
            else {
                codegen = new change_detection_jit_generator_1.ChangeDetectorJITGenerator(definition, "" + UTIL_MODULE + UTIL, "" + ABSTRACT_CHANGE_DETECTOR_MODULE + ABSTRACT_CHANGE_DETECTOR, "" + CONSTANTS_MODULE + CHANGE_DETECTOR_STATE);
                factories.push("function() { return new " + codegen.typeName + "(); }");
                sourcePart = codegen.generateSource();
            }
            index++;
            return sourcePart;
        });
        return new source_module_1.SourceExpressions(sourceParts, factories);
    };
    ChangeDetectionCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [change_detection_1.ChangeDetectorGenConfig])
    ], ChangeDetectionCompiler);
    return ChangeDetectionCompiler;
})();
exports.ChangeDetectionCompiler = ChangeDetectionCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdG9yX2NvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WM3YwVkpGSC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2NoYW5nZV9kZXRlY3Rvcl9jb21waWxlci50cyJdLCJuYW1lcyI6WyJDaGFuZ2VEZXRlY3Rpb25Db21waWxlciIsIkNoYW5nZURldGVjdGlvbkNvbXBpbGVyLmNvbnN0cnVjdG9yIiwiQ2hhbmdlRGV0ZWN0aW9uQ29tcGlsZXIuY29tcGlsZUNvbXBvbmVudFJ1bnRpbWUiLCJDaGFuZ2VEZXRlY3Rpb25Db21waWxlci5fY3JlYXRlQ2hhbmdlRGV0ZWN0b3JGYWN0b3J5IiwiQ2hhbmdlRGV0ZWN0aW9uQ29tcGlsZXIuY29tcGlsZUNvbXBvbmVudENvZGVHZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLDhCQUEyQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQzdELCtDQUF5QyxtRUFBbUUsQ0FBQyxDQUFBO0FBQzdHLHlDQUFxQyw2REFBNkQsQ0FBQyxDQUFBO0FBQ25HLHNDQUFrQywwREFBMEQsQ0FBQyxDQUFBO0FBQzdGLDBCQUFrQyw4Q0FBOEMsQ0FBQyxDQUFBO0FBRWpGLDBDQUE4Qyw2QkFBNkIsQ0FBQyxDQUFBO0FBQzVFLHFCQUE4QywwQkFBMEIsQ0FBQyxDQUFBO0FBRXpFLGlDQUFxSCxxREFBcUQsQ0FBQyxDQUFBO0FBRzNLLHdDQUFzQixrRUFBa0UsQ0FBQyxDQUFBO0FBQ3pGLHFCQUE0QixRQUFRLENBQUMsQ0FBQTtBQUNyQyxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRCxJQUFNLHdCQUF3QixHQUFHLHdCQUF3QixDQUFDO0FBQzFELElBQU0sSUFBSSxHQUFHLHFCQUFxQixDQUFDO0FBQ25DLElBQU0scUJBQXFCLEdBQUcscUJBQXFCLENBQUM7QUFFdkMsb0NBQTRCLEdBQUcsaUJBQVUsQ0FBQztJQUNyRCx3QkFBd0Is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QUVBLENBQUNBO1lBQ2xDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsT0FBT0EsR0FBR0EsSUFBSUEsMkRBQTBCQSxDQUNwQ0EsVUFBVUEsRUFBRUEsS0FBR0EsV0FBV0EsR0FBR0EsSUFBTUEsRUFDbkNBLEtBQUdBLCtCQUErQkEsR0FBR0Esd0JBQTBCQSxFQUMvREEsS0FBR0EsZ0JBQWdCQSxHQUFHQSxxQkFBdUJBLENBQUNBLENBQUNBO2dCQUNuREEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsNkJBQTJCQSxPQUFPQSxDQUFDQSxRQUFRQSxVQUFPQSxDQUFDQSxDQUFDQTtnQkFDbkVBLFVBQVVBLEdBQUdBLE9BQU9BLENBQUNBLGNBQWNBLEVBQUVBLENBQUNBO1lBQ3hDQSxDQUFDQTtZQUNEQSxLQUFLQSxFQUFFQSxDQUFDQTtZQUNSQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUNwQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDSEEsTUFBTUEsQ0FBQ0EsSUFBSUEsaUNBQWlCQSxDQUFDQSxXQUFXQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUN2REEsQ0FBQ0E7SUFwREhKO1FBQUNBLGVBQVVBLEVBQUVBOztnQ0FxRFpBO0lBQURBLDhCQUFDQTtBQUFEQSxDQUFDQSxBQXJERCxJQXFEQztBQXBEWSwrQkFBdUIsMEJBb0RuQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21waWxlVHlwZU1ldGFkYXRhfSBmcm9tICcuL2RpcmVjdGl2ZV9tZXRhZGF0YSc7XG5pbXBvcnQge1NvdXJjZUV4cHJlc3Npb25zLCBtb2R1bGVSZWZ9IGZyb20gJy4vc291cmNlX21vZHVsZSc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb25faml0X2dlbmVyYXRvcic7XG5pbXBvcnQge0Fic3RyYWN0Q2hhbmdlRGV0ZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vYWJzdHJhY3RfY2hhbmdlX2RldGVjdG9yJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uVXRpbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uX3V0aWwnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclN0YXRlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NvbnN0YW50cyc7XG5cbmltcG9ydCB7Y3JlYXRlQ2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9uc30gZnJvbSAnLi9jaGFuZ2VfZGVmaW5pdGlvbl9mYWN0b3J5JztcbmltcG9ydCB7SVNfREFSVCwgaXNKc09iamVjdCwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvckdlbkNvbmZpZywgQ2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9uLCBEeW5hbWljUHJvdG9DaGFuZ2VEZXRlY3RvciwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5cbmltcG9ydCB7VGVtcGxhdGVBc3R9IGZyb20gJy4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7Q29kZWdlbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3RyYW5zZm9ybS90ZW1wbGF0ZV9jb21waWxlci9jaGFuZ2VfZGV0ZWN0b3JfY29kZWdlbic7XG5pbXBvcnQge01PRFVMRV9TVUZGSVh9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuY29uc3QgQUJTVFJBQ1RfQ0hBTkdFX0RFVEVDVE9SID0gJ0Fic3RyYWN0Q2hhbmdlRGV0ZWN0b3InO1xuY29uc3QgVVRJTCA9ICdDaGFuZ2VEZXRlY3Rpb25VdGlsJztcbmNvbnN0IENIQU5HRV9ERVRFQ1RPUl9TVEFURSA9ICdDaGFuZ2VEZXRlY3RvclN0YXRlJztcblxuZXhwb3J0IGNvbnN0IENIQU5HRV9ERVRFQ1RJT05fSklUX0lNUE9SVFMgPSBDT05TVF9FWFBSKHtcbiAgJ0Fic3RyYWN0Q2hhbmdlRGV0ZWN0b3InOiBBYnN0cmFjdENoYW5nZURldGVjdG9yLFxuICAnQ2hhbmdlRGV0ZWN0aW9uVXRpbCc6IENoYW5nZURldGVjdGlvblV0aWwsXG4gICdDaGFuZ2VEZXRlY3RvclN0YXRlJzogQ2hhbmdlRGV0ZWN0b3JTdGF0ZVxufSk7XG5cbnZhciBBQlNUUkFDVF9DSEFOR0VfREVURUNUT1JfTU9EVUxFID0gbW9kdWxlUmVmKFxuICAgIGBwYWNrYWdlOmFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vYWJzdHJhY3RfY2hhbmdlX2RldGVjdG9yJHtNT0RVTEVfU1VGRklYfWApO1xudmFyIFVUSUxfTU9EVUxFID1cbiAgICBtb2R1bGVSZWYoYHBhY2thZ2U6YW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uX3V0aWwke01PRFVMRV9TVUZGSVh9YCk7XG52YXIgUFJFR0VOX1BST1RPX0NIQU5HRV9ERVRFQ1RPUl9NT0RVTEUgPSBtb2R1bGVSZWYoXG4gICAgYHBhY2thZ2U6YW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wcmVnZW5fcHJvdG9fY2hhbmdlX2RldGVjdG9yJHtNT0RVTEVfU1VGRklYfWApO1xudmFyIENPTlNUQU5UU19NT0RVTEUgPVxuICAgIG1vZHVsZVJlZihgcGFja2FnZTphbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NvbnN0YW50cyR7TU9EVUxFX1NVRkZJWH1gKTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENoYW5nZURldGVjdGlvbkNvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZ2VuQ29uZmlnOiBDaGFuZ2VEZXRlY3RvckdlbkNvbmZpZykge31cblxuICBjb21waWxlQ29tcG9uZW50UnVudGltZShcbiAgICAgIGNvbXBvbmVudFR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsIHN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICAgIHBhcnNlZFRlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdKTogRnVuY3Rpb25bXSB7XG4gICAgdmFyIGNoYW5nZURldGVjdG9yRGVmaW5pdGlvbnMgPVxuICAgICAgICBjcmVhdGVDaGFuZ2VEZXRlY3RvckRlZmluaXRpb25zKGNvbXBvbmVudFR5cGUsIHN0cmF0ZWd5LCB0aGlzLl9nZW5Db25maWcsIHBhcnNlZFRlbXBsYXRlKTtcbiAgICByZXR1cm4gY2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9ucy5tYXAoXG4gICAgICAgIGRlZmluaXRpb24gPT4gdGhpcy5fY3JlYXRlQ2hhbmdlRGV0ZWN0b3JGYWN0b3J5KGRlZmluaXRpb24pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUNoYW5nZURldGVjdG9yRmFjdG9yeShkZWZpbml0aW9uOiBDaGFuZ2VEZXRlY3RvckRlZmluaXRpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHByb3RvID0gbmV3IER5bmFtaWNQcm90b0NoYW5nZURldGVjdG9yKGRlZmluaXRpb24pO1xuICAgIHJldHVybiAoKSA9PiBwcm90by5pbnN0YW50aWF0ZSgpO1xuICB9XG5cbiAgY29tcGlsZUNvbXBvbmVudENvZGVHZW4oXG4gICAgICBjb21wb25lbnRUeXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLCBzdHJhdGVneTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgICBwYXJzZWRUZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSk6IFNvdXJjZUV4cHJlc3Npb25zIHtcbiAgICB2YXIgY2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9ucyA9XG4gICAgICAgIGNyZWF0ZUNoYW5nZURldGVjdG9yRGVmaW5pdGlvbnMoY29tcG9uZW50VHlwZSwgc3RyYXRlZ3ksIHRoaXMuX2dlbkNvbmZpZywgcGFyc2VkVGVtcGxhdGUpO1xuICAgIHZhciBmYWN0b3JpZXMgPSBbXTtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2VQYXJ0cyA9IGNoYW5nZURldGVjdG9yRGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT4ge1xuICAgICAgdmFyIGNvZGVnZW46IGFueTtcbiAgICAgIHZhciBzb3VyY2VQYXJ0OiBzdHJpbmc7XG4gICAgICAvLyBUT0RPKHRib3NjaCk6IG1vdmUgdGhlIDIgY29kZSBnZW5lcmF0b3JzIHRvIHRoZSBzYW1lIHBsYWNlLCBvbmUgd2l0aCAuZGFydCBhbmQgb25lIHdpdGggLnRzXG4gICAgICAvLyBzdWZmaXhcbiAgICAgIC8vIGFuZCBoYXZlIHRoZSBzYW1lIEFQSSBmb3IgY2FsbGluZyB0aGVtIVxuICAgICAgaWYgKElTX0RBUlQpIHtcbiAgICAgICAgY29kZWdlbiA9IG5ldyBDb2RlZ2VuKFBSRUdFTl9QUk9UT19DSEFOR0VfREVURUNUT1JfTU9EVUxFKTtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGBfJHtkZWZpbml0aW9uLmlkfWA7XG4gICAgICAgIHZhciB0eXBlUmVmID0gKGluZGV4ID09PSAwICYmIGNvbXBvbmVudFR5cGUuaXNIb3N0KSA/XG4gICAgICAgICAgICAnZHluYW1pYycgOlxuICAgICAgICAgICAgYCR7bW9kdWxlUmVmKGNvbXBvbmVudFR5cGUubW9kdWxlVXJsKX0ke2NvbXBvbmVudFR5cGUubmFtZX1gO1xuICAgICAgICBjb2RlZ2VuLmdlbmVyYXRlKHR5cGVSZWYsIGNsYXNzTmFtZSwgZGVmaW5pdGlvbik7XG4gICAgICAgIGZhY3Rvcmllcy5wdXNoKGAke2NsYXNzTmFtZX0ubmV3Q2hhbmdlRGV0ZWN0b3JgKTtcbiAgICAgICAgc291cmNlUGFydCA9IGNvZGVnZW4udG9TdHJpbmcoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvZGVnZW4gPSBuZXcgQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IoXG4gICAgICAgICAgICBkZWZpbml0aW9uLCBgJHtVVElMX01PRFVMRX0ke1VUSUx9YCxcbiAgICAgICAgICAgIGAke0FCU1RSQUNUX0NIQU5HRV9ERVRFQ1RPUl9NT0RVTEV9JHtBQlNUUkFDVF9DSEFOR0VfREVURUNUT1J9YCxcbiAgICAgICAgICAgIGAke0NPTlNUQU5UU19NT0RVTEV9JHtDSEFOR0VfREVURUNUT1JfU1RBVEV9YCk7XG4gICAgICAgIGZhY3Rvcmllcy5wdXNoKGBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyAke2NvZGVnZW4udHlwZU5hbWV9KCk7IH1gKTtcbiAgICAgICAgc291cmNlUGFydCA9IGNvZGVnZW4uZ2VuZXJhdGVTb3VyY2UoKTtcbiAgICAgIH1cbiAgICAgIGluZGV4Kys7XG4gICAgICByZXR1cm4gc291cmNlUGFydDtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IFNvdXJjZUV4cHJlc3Npb25zKHNvdXJjZVBhcnRzLCBmYWN0b3JpZXMpO1xuICB9XG59XG4iXX0=