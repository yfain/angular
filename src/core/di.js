'use strict';/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var metadata_1 = require('./di/metadata');
exports.InjectMetadata = metadata_1.InjectMetadata;
exports.OptionalMetadata = metadata_1.OptionalMetadata;
exports.InjectableMetadata = metadata_1.InjectableMetadata;
exports.SelfMetadata = metadata_1.SelfMetadata;
exports.HostMetadata = metadata_1.HostMetadata;
exports.SkipSelfMetadata = metadata_1.SkipSelfMetadata;
exports.DependencyMetadata = metadata_1.DependencyMetadata;
// we have to reexport * because Dart and TS export two different sets of types
__export(require('./di/decorators'));
var forward_ref_1 = require('./di/forward_ref');
exports.forwardRef = forward_ref_1.forwardRef;
exports.resolveForwardRef = forward_ref_1.resolveForwardRef;
var injector_1 = require('./di/injector');
exports.Injector = injector_1.Injector;
var provider_1 = require('./di/provider');
exports.Binding = provider_1.Binding;
exports.ProviderBuilder = provider_1.ProviderBuilder;
exports.ResolvedFactory = provider_1.ResolvedFactory;
exports.Dependency = provider_1.Dependency;
exports.bind = provider_1.bind;
exports.Provider = provider_1.Provider;
exports.provide = provider_1.provide;
var key_1 = require('./di/key');
exports.Key = key_1.Key;
var exceptions_1 = require('./di/exceptions');
exports.NoProviderError = exceptions_1.NoProviderError;
exports.AbstractProviderError = exceptions_1.AbstractProviderError;
exports.CyclicDependencyError = exceptions_1.CyclicDependencyError;
exports.InstantiationError = exceptions_1.InstantiationError;
exports.InvalidProviderError = exceptions_1.InvalidProviderError;
exports.NoAnnotationError = exceptions_1.NoAnnotationError;
exports.OutOfBoundsError = exceptions_1.OutOfBoundsError;
var opaque_token_1 = require('./di/opaque_token');
exports.OpaqueToken = opaque_token_1.OpaqueToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHOzs7O0FBRUgseUJBQXFJLGVBQWUsQ0FBQztBQUE3SSxtREFBYztBQUFFLHVEQUFnQjtBQUFFLDJEQUFrQjtBQUFFLCtDQUFZO0FBQUUsK0NBQVk7QUFBRSx1REFBZ0I7QUFBRSwyREFBeUM7QUFFckosK0VBQStFO0FBQy9FLGlCQUFjLGlCQUFpQixDQUFDLEVBQUE7QUFFaEMsNEJBQTBELGtCQUFrQixDQUFDO0FBQXJFLDhDQUFVO0FBQUUsNERBQXlEO0FBQzdFLHlCQUF1QixlQUFlLENBQUM7QUFBL0IsdUNBQStCO0FBQ3ZDLHlCQUFnSSxlQUFlLENBQUM7QUFBeEkscUNBQU87QUFBRSxxREFBZTtBQUFtQixxREFBZTtBQUFFLDJDQUFVO0FBQUUsK0JBQUk7QUFBRSx1Q0FBUTtBQUFvQixxQ0FBOEI7QUFDaEosb0JBQWtCLFVBQVUsQ0FBQztBQUFyQix3QkFBcUI7QUFDN0IsMkJBQTJKLGlCQUFpQixDQUFDO0FBQXJLLHVEQUFlO0FBQUUsbUVBQXFCO0FBQUUsbUVBQXFCO0FBQUUsNkRBQWtCO0FBQUUsaUVBQW9CO0FBQUUsMkRBQWlCO0FBQUUseURBQXlDO0FBQzdLLDZCQUEwQixtQkFBbUIsQ0FBQztBQUF0QyxpREFBc0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIGBkaWAgbW9kdWxlIHByb3ZpZGVzIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGNvbnRhaW5lciBzZXJ2aWNlcy5cbiAqL1xuXG5leHBvcnQge0luamVjdE1ldGFkYXRhLCBPcHRpb25hbE1ldGFkYXRhLCBJbmplY3RhYmxlTWV0YWRhdGEsIFNlbGZNZXRhZGF0YSwgSG9zdE1ldGFkYXRhLCBTa2lwU2VsZk1ldGFkYXRhLCBEZXBlbmRlbmN5TWV0YWRhdGF9IGZyb20gJy4vZGkvbWV0YWRhdGEnO1xuXG4vLyB3ZSBoYXZlIHRvIHJlZXhwb3J0ICogYmVjYXVzZSBEYXJ0IGFuZCBUUyBleHBvcnQgdHdvIGRpZmZlcmVudCBzZXRzIG9mIHR5cGVzXG5leHBvcnQgKiBmcm9tICcuL2RpL2RlY29yYXRvcnMnO1xuXG5leHBvcnQge2ZvcndhcmRSZWYsIHJlc29sdmVGb3J3YXJkUmVmLCBGb3J3YXJkUmVmRm59IGZyb20gJy4vZGkvZm9yd2FyZF9yZWYnO1xuZXhwb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi9kaS9pbmplY3Rvcic7XG5leHBvcnQge0JpbmRpbmcsIFByb3ZpZGVyQnVpbGRlciwgUmVzb2x2ZWRCaW5kaW5nLCBSZXNvbHZlZEZhY3RvcnksIERlcGVuZGVuY3ksIGJpbmQsIFByb3ZpZGVyLCBSZXNvbHZlZFByb3ZpZGVyLCBwcm92aWRlfSBmcm9tICcuL2RpL3Byb3ZpZGVyJztcbmV4cG9ydCB7S2V5fSBmcm9tICcuL2RpL2tleSc7XG5leHBvcnQge05vUHJvdmlkZXJFcnJvciwgQWJzdHJhY3RQcm92aWRlckVycm9yLCBDeWNsaWNEZXBlbmRlbmN5RXJyb3IsIEluc3RhbnRpYXRpb25FcnJvciwgSW52YWxpZFByb3ZpZGVyRXJyb3IsIE5vQW5ub3RhdGlvbkVycm9yLCBPdXRPZkJvdW5kc0Vycm9yfSBmcm9tICcuL2RpL2V4Y2VwdGlvbnMnO1xuZXhwb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSAnLi9kaS9vcGFxdWVfdG9rZW4nO1xuIl19