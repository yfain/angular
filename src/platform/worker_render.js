'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var post_message_bus_1 = require('angular2/src/web_workers/shared/post_message_bus');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var core_1 = require('angular2/core');
var di_1 = require('angular2/src/core/di');
var worker_render_common_1 = require('angular2/src/platform/worker_render_common');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
/**
 * Wrapper class that exposes the Worker
 * and underlying {@link MessageBus} for lower level message passing.
 */
var WebWorkerInstance = (function () {
    function WebWorkerInstance() {
    }
    /** @internal */
    WebWorkerInstance.prototype.init = function (worker, bus) {
        this.worker = worker;
        this.bus = bus;
    };
    WebWorkerInstance = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], WebWorkerInstance);
    return WebWorkerInstance;
})();
exports.WebWorkerInstance = WebWorkerInstance;
/**
 * An array of providers that should be passed into `application()` when initializing a new Worker.
 */
exports.WORKER_RENDER_APPLICATION = lang_1.CONST_EXPR([
    worker_render_common_1.WORKER_RENDER_APPLICATION_COMMON, WebWorkerInstance, new di_1.Provider(core_1.APP_INITIALIZER, {
        useFactory: function (injector) { return function () { return initWebWorkerApplication(injector); }; },
        multi: true,
        deps: [di_1.Injector]
    }),
    new di_1.Provider(message_bus_1.MessageBus, { useFactory: function (instance) { return instance.bus; }, deps: [WebWorkerInstance] })
]);
function initWebWorkerApplication(injector) {
    var scriptUri;
    try {
        scriptUri = injector.get(worker_render_common_1.WORKER_SCRIPT);
    }
    catch (e) {
        throw new exceptions_1.BaseException('You must provide your WebWorker\'s initialization script with the WORKER_SCRIPT token');
    }
    var instance = injector.get(WebWorkerInstance);
    spawnWebWorker(scriptUri, instance);
    worker_render_common_1.initializeGenericWorkerRenderer(injector);
}
/**
 * Spawns a new class and initializes the WebWorkerInstance
 */
function spawnWebWorker(uri, instance) {
    var webWorker = new Worker(uri);
    var sink = new post_message_bus_1.PostMessageBusSink(webWorker);
    var source = new post_message_bus_1.PostMessageBusSource(webWorker);
    var bus = new post_message_bus_1.PostMessageBus(sink, source);
    instance.init(webWorker, bus);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUHZPdVJqdngudG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlckluc3RhbmNlIiwiV2ViV29ya2VySW5zdGFuY2UuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJJbnN0YW5jZS5pbml0IiwiaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uIiwic3Bhd25XZWJXb3JrZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLGlDQUF1RSxrREFBa0QsQ0FBQyxDQUFBO0FBQzFILDRCQUF5Qiw2Q0FBNkMsQ0FBQyxDQUFBO0FBQ3ZFLHFCQUE4QixlQUFlLENBQUMsQ0FBQTtBQUM5QyxtQkFBNkMsc0JBQXNCLENBQUMsQ0FBQTtBQUdwRSxxQ0FBa0ksNENBQTRDLENBQUMsQ0FBQTtBQUMvSywyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRDs7O0dBR0c7QUFDSDtJQUFBQTtJQVVBQyxDQUFDQTtJQUxDRCxnQkFBZ0JBO0lBQ1RBLGdDQUFJQSxHQUFYQSxVQUFZQSxNQUFjQSxFQUFFQSxHQUFlQTtRQUN6Q0UsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ2pCQSxDQUFDQTtJQVRIRjtRQUFDQSxlQUFVQSxFQUFFQTs7MEJBVVpBO0lBQURBLHdCQUFDQTtBQUFEQSxDQUFDQSxBQVZELElBVUM7QUFUWSx5QkFBaUIsb0JBUzdCLENBQUE7QUFFRDs7R0FFRztBQUNVLGlDQUF5QixHQUEyQyxpQkFBVSxDQUFDO0lBQzFGLHVEQUFnQyxFQUFFLGlCQUFpQixFQUFFLElBQUksYUFBUSxDQUFDLHNCQUFlLEVBQUU7UUFDakYsVUFBVSxFQUFFLFVBQUMsUUFBUSxJQUFLLE9BQUEsY0FBTSxPQUFBLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxFQUFsQyxDQUFrQyxFQUF4QyxDQUF3QztRQUNsRSxLQUFLLEVBQUUsSUFBSTtRQUNYLElBQUksRUFBRSxDQUFDLGFBQVEsQ0FBQztLQUNqQixDQUFDO0lBQ0YsSUFBSSxhQUFRLENBQUMsd0JBQVUsRUFBRSxFQUFDLFVBQVUsRUFBRSxVQUFDLFFBQVEsSUFBSyxPQUFBLFFBQVEsQ0FBQyxHQUFHLEVBQVosQ0FBWSxFQUFFLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUMsQ0FBQztDQUM5RixDQUFDLENBQUM7QUFFSCxrQ0FBa0MsUUFBa0I7SUFDbERHLElBQUlBLFNBQWlCQSxDQUFDQTtJQUN0QkEsSUFBSUEsQ0FBQ0E7UUFDSEEsU0FBU0EsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0Esb0NBQWFBLENBQUNBLENBQUNBO0lBQzFDQSxDQUFFQTtJQUFBQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNYQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FDbkJBLHVGQUF1RkEsQ0FBQ0EsQ0FBQ0E7SUFDL0ZBLENBQUNBO0lBRURBLElBQUlBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7SUFDL0NBLGNBQWNBLENBQUNBLFNBQVNBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO0lBRXBDQSxzREFBK0JBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO0FBQzVDQSxDQUFDQTtBQUVEOztHQUVHO0FBQ0gsd0JBQXdCLEdBQVcsRUFBRSxRQUEyQjtJQUM5REMsSUFBSUEsU0FBU0EsR0FBV0EsSUFBSUEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDeENBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLHFDQUFrQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7SUFDN0NBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLHVDQUFvQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7SUFDakRBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLGlDQUFjQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUUzQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDaENBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQb3N0TWVzc2FnZUJ1cywgUG9zdE1lc3NhZ2VCdXNTaW5rLCBQb3N0TWVzc2FnZUJ1c1NvdXJjZX0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9wb3N0X21lc3NhZ2VfYnVzJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge0FQUF9JTklUSUFMSVpFUn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0luamVjdG9yLCBJbmplY3RhYmxlLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3JlbmRlcmVyJztcbmltcG9ydCB7TWVzc2FnZUJhc2VkWEhSSW1wbH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3hocl9pbXBsJztcbmltcG9ydCB7V09SS0VSX1JFTkRFUl9BUFBMSUNBVElPTl9DT01NT04sIFdPUktFUl9SRU5ERVJfTUVTU0FHSU5HX1BST1ZJREVSUywgV09SS0VSX1NDUklQVCwgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL3dvcmtlcl9yZW5kZXJfY29tbW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBXcmFwcGVyIGNsYXNzIHRoYXQgZXhwb3NlcyB0aGUgV29ya2VyXG4gKiBhbmQgdW5kZXJseWluZyB7QGxpbmsgTWVzc2FnZUJ1c30gZm9yIGxvd2VyIGxldmVsIG1lc3NhZ2UgcGFzc2luZy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlckluc3RhbmNlIHtcbiAgcHVibGljIHdvcmtlcjogV29ya2VyO1xuICBwdWJsaWMgYnVzOiBNZXNzYWdlQnVzO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIGluaXQod29ya2VyOiBXb3JrZXIsIGJ1czogTWVzc2FnZUJ1cykge1xuICAgIHRoaXMud29ya2VyID0gd29ya2VyO1xuICAgIHRoaXMuYnVzID0gYnVzO1xuICB9XG59XG5cbi8qKlxuICogQW4gYXJyYXkgb2YgcHJvdmlkZXJzIHRoYXQgc2hvdWxkIGJlIHBhc3NlZCBpbnRvIGBhcHBsaWNhdGlvbigpYCB3aGVuIGluaXRpYWxpemluZyBhIG5ldyBXb3JrZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBXT1JLRVJfUkVOREVSX0FQUExJQ0FUSU9OOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9IENPTlNUX0VYUFIoW1xuICBXT1JLRVJfUkVOREVSX0FQUExJQ0FUSU9OX0NPTU1PTiwgV2ViV29ya2VySW5zdGFuY2UsIG5ldyBQcm92aWRlcihBUFBfSU5JVElBTElaRVIsIHtcbiAgICB1c2VGYWN0b3J5OiAoaW5qZWN0b3IpID0+ICgpID0+IGluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbihpbmplY3RvciksXG4gICAgbXVsdGk6IHRydWUsXG4gICAgZGVwczogW0luamVjdG9yXVxuICB9KSxcbiAgbmV3IFByb3ZpZGVyKE1lc3NhZ2VCdXMsIHt1c2VGYWN0b3J5OiAoaW5zdGFuY2UpID0+IGluc3RhbmNlLmJ1cywgZGVwczogW1dlYldvcmtlckluc3RhbmNlXX0pXG5dKTtcblxuZnVuY3Rpb24gaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uKGluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICB2YXIgc2NyaXB0VXJpOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgc2NyaXB0VXJpID0gaW5qZWN0b3IuZ2V0KFdPUktFUl9TQ1JJUFQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICdZb3UgbXVzdCBwcm92aWRlIHlvdXIgV2ViV29ya2VyXFwncyBpbml0aWFsaXphdGlvbiBzY3JpcHQgd2l0aCB0aGUgV09SS0VSX1NDUklQVCB0b2tlbicpO1xuICB9XG5cbiAgbGV0IGluc3RhbmNlID0gaW5qZWN0b3IuZ2V0KFdlYldvcmtlckluc3RhbmNlKTtcbiAgc3Bhd25XZWJXb3JrZXIoc2NyaXB0VXJpLCBpbnN0YW5jZSk7XG5cbiAgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlcihpbmplY3Rvcik7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgbmV3IGNsYXNzIGFuZCBpbml0aWFsaXplcyB0aGUgV2ViV29ya2VySW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gc3Bhd25XZWJXb3JrZXIodXJpOiBzdHJpbmcsIGluc3RhbmNlOiBXZWJXb3JrZXJJbnN0YW5jZSk6IHZvaWQge1xuICB2YXIgd2ViV29ya2VyOiBXb3JrZXIgPSBuZXcgV29ya2VyKHVyaSk7XG4gIHZhciBzaW5rID0gbmV3IFBvc3RNZXNzYWdlQnVzU2luayh3ZWJXb3JrZXIpO1xuICB2YXIgc291cmNlID0gbmV3IFBvc3RNZXNzYWdlQnVzU291cmNlKHdlYldvcmtlcik7XG4gIHZhciBidXMgPSBuZXcgUG9zdE1lc3NhZ2VCdXMoc2luaywgc291cmNlKTtcblxuICBpbnN0YW5jZS5pbml0KHdlYldvcmtlciwgYnVzKTtcbn1cbiJdfQ==