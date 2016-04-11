var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PostMessageBus, PostMessageBusSink, PostMessageBusSource } from 'angular2/src/web_workers/shared/post_message_bus';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { APP_INITIALIZER } from 'angular2/core';
import { Injector, Injectable, Provider } from 'angular2/src/core/di';
import { WORKER_RENDER_APPLICATION_COMMON, WORKER_SCRIPT, initializeGenericWorkerRenderer } from 'angular2/src/platform/worker_render_common';
import { BaseException } from 'angular2/src/facade/exceptions';
import { CONST_EXPR } from 'angular2/src/facade/lang';
/**
 * Wrapper class that exposes the Worker
 * and underlying {@link MessageBus} for lower level message passing.
 */
export let WebWorkerInstance = class {
    /** @internal */
    init(worker, bus) {
        this.worker = worker;
        this.bus = bus;
    }
};
WebWorkerInstance = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], WebWorkerInstance);
/**
 * An array of providers that should be passed into `application()` when initializing a new Worker.
 */
export const WORKER_RENDER_APPLICATION = CONST_EXPR([
    WORKER_RENDER_APPLICATION_COMMON, WebWorkerInstance, new Provider(APP_INITIALIZER, {
        useFactory: (injector) => () => initWebWorkerApplication(injector),
        multi: true,
        deps: [Injector]
    }),
    new Provider(MessageBus, { useFactory: (instance) => instance.bus, deps: [WebWorkerInstance] })
]);
function initWebWorkerApplication(injector) {
    var scriptUri;
    try {
        scriptUri = injector.get(WORKER_SCRIPT);
    }
    catch (e) {
        throw new BaseException('You must provide your WebWorker\'s initialization script with the WORKER_SCRIPT token');
    }
    let instance = injector.get(WebWorkerInstance);
    spawnWebWorker(scriptUri, instance);
    initializeGenericWorkerRenderer(injector);
}
/**
 * Spawns a new class and initializes the WebWorkerInstance
 */
function spawnWebWorker(uri, instance) {
    var webWorker = new Worker(uri);
    var sink = new PostMessageBusSink(webWorker);
    var source = new PostMessageBusSource(webWorker);
    var bus = new PostMessageBus(sink, source);
    instance.init(webWorker, bus);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVnZpcENCVVAudG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlckluc3RhbmNlIiwiV2ViV29ya2VySW5zdGFuY2UuaW5pdCIsImluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbiIsInNwYXduV2ViV29ya2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLGtEQUFrRDtPQUNsSCxFQUFDLFVBQVUsRUFBQyxNQUFNLDZDQUE2QztPQUMvRCxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWU7T0FDdEMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBQyxNQUFNLHNCQUFzQjtPQUc1RCxFQUFDLGdDQUFnQyxFQUFxQyxhQUFhLEVBQUUsK0JBQStCLEVBQUMsTUFBTSw0Q0FBNEM7T0FDdkssRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7QUFFbkQ7OztHQUdHO0FBQ0g7SUFLRUEsZ0JBQWdCQTtJQUNUQSxJQUFJQSxDQUFDQSxNQUFjQSxFQUFFQSxHQUFlQTtRQUN6Q0MsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ2pCQSxDQUFDQTtBQUNIRCxDQUFDQTtBQVZEO0lBQUMsVUFBVSxFQUFFOztzQkFVWjtBQUVEOztHQUVHO0FBQ0gsYUFBYSx5QkFBeUIsR0FBMkMsVUFBVSxDQUFDO0lBQzFGLGdDQUFnQyxFQUFFLGlCQUFpQixFQUFFLElBQUksUUFBUSxDQUFDLGVBQWUsRUFBRTtRQUNqRixVQUFVLEVBQUUsQ0FBQyxRQUFRLEtBQUssTUFBTSx3QkFBd0IsQ0FBQyxRQUFRLENBQUM7UUFDbEUsS0FBSyxFQUFFLElBQUk7UUFDWCxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUM7S0FDakIsQ0FBQztJQUNGLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUMsQ0FBQztDQUM5RixDQUFDLENBQUM7QUFFSCxrQ0FBa0MsUUFBa0I7SUFDbERFLElBQUlBLFNBQWlCQSxDQUFDQTtJQUN0QkEsSUFBSUEsQ0FBQ0E7UUFDSEEsU0FBU0EsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7SUFDMUNBLENBQUVBO0lBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ1hBLE1BQU1BLElBQUlBLGFBQWFBLENBQ25CQSx1RkFBdUZBLENBQUNBLENBQUNBO0lBQy9GQSxDQUFDQTtJQUVEQSxJQUFJQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO0lBQy9DQSxjQUFjQSxDQUFDQSxTQUFTQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUVwQ0EsK0JBQStCQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtBQUM1Q0EsQ0FBQ0E7QUFFRDs7R0FFRztBQUNILHdCQUF3QixHQUFXLEVBQUUsUUFBMkI7SUFDOURDLElBQUlBLFNBQVNBLEdBQVdBLElBQUlBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3hDQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxrQkFBa0JBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQzdDQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxvQkFBb0JBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQ2pEQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxjQUFjQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUUzQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDaENBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQb3N0TWVzc2FnZUJ1cywgUG9zdE1lc3NhZ2VCdXNTaW5rLCBQb3N0TWVzc2FnZUJ1c1NvdXJjZX0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9wb3N0X21lc3NhZ2VfYnVzJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge0FQUF9JTklUSUFMSVpFUn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0luamVjdG9yLCBJbmplY3RhYmxlLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3JlbmRlcmVyJztcbmltcG9ydCB7TWVzc2FnZUJhc2VkWEhSSW1wbH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3hocl9pbXBsJztcbmltcG9ydCB7V09SS0VSX1JFTkRFUl9BUFBMSUNBVElPTl9DT01NT04sIFdPUktFUl9SRU5ERVJfTUVTU0FHSU5HX1BST1ZJREVSUywgV09SS0VSX1NDUklQVCwgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL3dvcmtlcl9yZW5kZXJfY29tbW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBXcmFwcGVyIGNsYXNzIHRoYXQgZXhwb3NlcyB0aGUgV29ya2VyXG4gKiBhbmQgdW5kZXJseWluZyB7QGxpbmsgTWVzc2FnZUJ1c30gZm9yIGxvd2VyIGxldmVsIG1lc3NhZ2UgcGFzc2luZy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlckluc3RhbmNlIHtcbiAgcHVibGljIHdvcmtlcjogV29ya2VyO1xuICBwdWJsaWMgYnVzOiBNZXNzYWdlQnVzO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIGluaXQod29ya2VyOiBXb3JrZXIsIGJ1czogTWVzc2FnZUJ1cykge1xuICAgIHRoaXMud29ya2VyID0gd29ya2VyO1xuICAgIHRoaXMuYnVzID0gYnVzO1xuICB9XG59XG5cbi8qKlxuICogQW4gYXJyYXkgb2YgcHJvdmlkZXJzIHRoYXQgc2hvdWxkIGJlIHBhc3NlZCBpbnRvIGBhcHBsaWNhdGlvbigpYCB3aGVuIGluaXRpYWxpemluZyBhIG5ldyBXb3JrZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBXT1JLRVJfUkVOREVSX0FQUExJQ0FUSU9OOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9IENPTlNUX0VYUFIoW1xuICBXT1JLRVJfUkVOREVSX0FQUExJQ0FUSU9OX0NPTU1PTiwgV2ViV29ya2VySW5zdGFuY2UsIG5ldyBQcm92aWRlcihBUFBfSU5JVElBTElaRVIsIHtcbiAgICB1c2VGYWN0b3J5OiAoaW5qZWN0b3IpID0+ICgpID0+IGluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbihpbmplY3RvciksXG4gICAgbXVsdGk6IHRydWUsXG4gICAgZGVwczogW0luamVjdG9yXVxuICB9KSxcbiAgbmV3IFByb3ZpZGVyKE1lc3NhZ2VCdXMsIHt1c2VGYWN0b3J5OiAoaW5zdGFuY2UpID0+IGluc3RhbmNlLmJ1cywgZGVwczogW1dlYldvcmtlckluc3RhbmNlXX0pXG5dKTtcblxuZnVuY3Rpb24gaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uKGluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICB2YXIgc2NyaXB0VXJpOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgc2NyaXB0VXJpID0gaW5qZWN0b3IuZ2V0KFdPUktFUl9TQ1JJUFQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICdZb3UgbXVzdCBwcm92aWRlIHlvdXIgV2ViV29ya2VyXFwncyBpbml0aWFsaXphdGlvbiBzY3JpcHQgd2l0aCB0aGUgV09SS0VSX1NDUklQVCB0b2tlbicpO1xuICB9XG5cbiAgbGV0IGluc3RhbmNlID0gaW5qZWN0b3IuZ2V0KFdlYldvcmtlckluc3RhbmNlKTtcbiAgc3Bhd25XZWJXb3JrZXIoc2NyaXB0VXJpLCBpbnN0YW5jZSk7XG5cbiAgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlcihpbmplY3Rvcik7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgbmV3IGNsYXNzIGFuZCBpbml0aWFsaXplcyB0aGUgV2ViV29ya2VySW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gc3Bhd25XZWJXb3JrZXIodXJpOiBzdHJpbmcsIGluc3RhbmNlOiBXZWJXb3JrZXJJbnN0YW5jZSk6IHZvaWQge1xuICB2YXIgd2ViV29ya2VyOiBXb3JrZXIgPSBuZXcgV29ya2VyKHVyaSk7XG4gIHZhciBzaW5rID0gbmV3IFBvc3RNZXNzYWdlQnVzU2luayh3ZWJXb3JrZXIpO1xuICB2YXIgc291cmNlID0gbmV3IFBvc3RNZXNzYWdlQnVzU291cmNlKHdlYldvcmtlcik7XG4gIHZhciBidXMgPSBuZXcgUG9zdE1lc3NhZ2VCdXMoc2luaywgc291cmNlKTtcblxuICBpbnN0YW5jZS5pbml0KHdlYldvcmtlciwgYnVzKTtcbn1cbiJdfQ==