import { RenderStoreObject } from 'angular2/src/web_workers/shared/serializer';
import { serializeMouseEvent, serializeKeyboardEvent, serializeGenericEvent, serializeEventWithTarget, serializeTransitionEvent } from 'angular2/src/web_workers/ui/event_serializer';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ObservableWrapper } from 'angular2/src/facade/async';
export class EventDispatcher {
    constructor(_sink, _serializer) {
        this._sink = _sink;
        this._serializer = _serializer;
    }
    dispatchRenderEvent(element, eventTarget, eventName, event) {
        var serializedEvent;
        // TODO (jteplitz602): support custom events #3350
        switch (event.type) {
            case 'click':
            case 'mouseup':
            case 'mousedown':
            case 'dblclick':
            case 'contextmenu':
            case 'mouseenter':
            case 'mouseleave':
            case 'mousemove':
            case 'mouseout':
            case 'mouseover':
            case 'show':
                serializedEvent = serializeMouseEvent(event);
                break;
            case 'keydown':
            case 'keypress':
            case 'keyup':
                serializedEvent = serializeKeyboardEvent(event);
                break;
            case 'input':
            case 'change':
            case 'blur':
                serializedEvent = serializeEventWithTarget(event);
                break;
            case 'abort':
            case 'afterprint':
            case 'beforeprint':
            case 'cached':
            case 'canplay':
            case 'canplaythrough':
            case 'chargingchange':
            case 'chargingtimechange':
            case 'close':
            case 'dischargingtimechange':
            case 'DOMContentLoaded':
            case 'downloading':
            case 'durationchange':
            case 'emptied':
            case 'ended':
            case 'error':
            case 'fullscreenchange':
            case 'fullscreenerror':
            case 'invalid':
            case 'languagechange':
            case 'levelfchange':
            case 'loadeddata':
            case 'loadedmetadata':
            case 'obsolete':
            case 'offline':
            case 'online':
            case 'open':
            case 'orientatoinchange':
            case 'pause':
            case 'pointerlockchange':
            case 'pointerlockerror':
            case 'play':
            case 'playing':
            case 'ratechange':
            case 'readystatechange':
            case 'reset':
            case 'scroll':
            case 'seeked':
            case 'seeking':
            case 'stalled':
            case 'submit':
            case 'success':
            case 'suspend':
            case 'timeupdate':
            case 'updateready':
            case 'visibilitychange':
            case 'volumechange':
            case 'waiting':
                serializedEvent = serializeGenericEvent(event);
                break;
            case 'transitionend':
                serializedEvent = serializeTransitionEvent(event);
                break;
            default:
                throw new BaseException(eventName + ' not supported on WebWorkers');
        }
        ObservableWrapper.callEmit(this._sink, {
            'element': this._serializer.serialize(element, RenderStoreObject),
            'eventName': eventName,
            'eventTarget': eventTarget,
            'event': serializedEvent
        });
        // TODO(kegluneq): Eventually, we want the user to indicate from the UI side whether the event
        // should be canceled, but for now just call `preventDefault` on the original DOM event.
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdzNEUmxYSmkudG1wL2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbIkV2ZW50RGlzcGF0Y2hlciIsIkV2ZW50RGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsIkV2ZW50RGlzcGF0Y2hlci5kaXNwYXRjaFJlbmRlckV2ZW50Il0sIm1hcHBpbmdzIjoiT0FBTyxFQUFhLGlCQUFpQixFQUFDLE1BQU0sNENBQTRDO09BQ2pGLEVBQUMsbUJBQW1CLEVBQUUsc0JBQXNCLEVBQUUscUJBQXFCLEVBQUUsd0JBQXdCLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSw4Q0FBOEM7T0FDNUssRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BRXZFLEVBQWUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFFekU7SUFDRUEsWUFBb0JBLEtBQXdCQSxFQUFVQSxXQUF1QkE7UUFBekRDLFVBQUtBLEdBQUxBLEtBQUtBLENBQW1CQTtRQUFVQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7SUFBR0EsQ0FBQ0E7SUFFakZELG1CQUFtQkEsQ0FBQ0EsT0FBWUEsRUFBRUEsV0FBbUJBLEVBQUVBLFNBQWlCQSxFQUFFQSxLQUFVQTtRQUNsRkUsSUFBSUEsZUFBZUEsQ0FBQ0E7UUFDcEJBLGtEQUFrREE7UUFDbERBLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ25CQSxLQUFLQSxPQUFPQSxDQUFDQTtZQUNiQSxLQUFLQSxTQUFTQSxDQUFDQTtZQUNmQSxLQUFLQSxXQUFXQSxDQUFDQTtZQUNqQkEsS0FBS0EsVUFBVUEsQ0FBQ0E7WUFDaEJBLEtBQUtBLGFBQWFBLENBQUNBO1lBQ25CQSxLQUFLQSxZQUFZQSxDQUFDQTtZQUNsQkEsS0FBS0EsWUFBWUEsQ0FBQ0E7WUFDbEJBLEtBQUtBLFdBQVdBLENBQUNBO1lBQ2pCQSxLQUFLQSxVQUFVQSxDQUFDQTtZQUNoQkEsS0FBS0EsV0FBV0EsQ0FBQ0E7WUFDakJBLEtBQUtBLE1BQU1BO2dCQUNUQSxlQUFlQSxHQUFHQSxtQkFBbUJBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM3Q0EsS0FBS0EsQ0FBQ0E7WUFDUkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsVUFBVUEsQ0FBQ0E7WUFDaEJBLEtBQUtBLE9BQU9BO2dCQUNWQSxlQUFlQSxHQUFHQSxzQkFBc0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNoREEsS0FBS0EsQ0FBQ0E7WUFDUkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0EsUUFBUUEsQ0FBQ0E7WUFDZEEsS0FBS0EsTUFBTUE7Z0JBQ1RBLGVBQWVBLEdBQUdBLHdCQUF3QkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xEQSxLQUFLQSxDQUFDQTtZQUNSQSxLQUFLQSxPQUFPQSxDQUFDQTtZQUNiQSxLQUFLQSxZQUFZQSxDQUFDQTtZQUNsQkEsS0FBS0EsYUFBYUEsQ0FBQ0E7WUFDbkJBLEtBQUtBLFFBQVFBLENBQUNBO1lBQ2RBLEtBQUtBLFNBQVNBLENBQUNBO1lBQ2ZBLEtBQUtBLGdCQUFnQkEsQ0FBQ0E7WUFDdEJBLEtBQUtBLGdCQUFnQkEsQ0FBQ0E7WUFDdEJBLEtBQUtBLG9CQUFvQkEsQ0FBQ0E7WUFDMUJBLEtBQUtBLE9BQU9BLENBQUNBO1lBQ2JBLEtBQUtBLHVCQUF1QkEsQ0FBQ0E7WUFDN0JBLEtBQUtBLGtCQUFrQkEsQ0FBQ0E7WUFDeEJBLEtBQUtBLGFBQWFBLENBQUNBO1lBQ25CQSxLQUFLQSxnQkFBZ0JBLENBQUNBO1lBQ3RCQSxLQUFLQSxTQUFTQSxDQUFDQTtZQUNmQSxLQUFLQSxPQUFPQSxDQUFDQTtZQUNiQSxLQUFLQSxPQUFPQSxDQUFDQTtZQUNiQSxLQUFLQSxrQkFBa0JBLENBQUNBO1lBQ3hCQSxLQUFLQSxpQkFBaUJBLENBQUNBO1lBQ3ZCQSxLQUFLQSxTQUFTQSxDQUFDQTtZQUNmQSxLQUFLQSxnQkFBZ0JBLENBQUNBO1lBQ3RCQSxLQUFLQSxjQUFjQSxDQUFDQTtZQUNwQkEsS0FBS0EsWUFBWUEsQ0FBQ0E7WUFDbEJBLEtBQUtBLGdCQUFnQkEsQ0FBQ0E7WUFDdEJBLEtBQUtBLFVBQVVBLENBQUNBO1lBQ2hCQSxLQUFLQSxTQUFTQSxDQUFDQTtZQUNmQSxLQUFLQSxRQUFRQSxDQUFDQTtZQUNkQSxLQUFLQSxNQUFNQSxDQUFDQTtZQUNaQSxLQUFLQSxtQkFBbUJBLENBQUNBO1lBQ3pCQSxLQUFLQSxPQUFPQSxDQUFDQTtZQUNiQSxLQUFLQSxtQkFBbUJBLENBQUNBO1lBQ3pCQSxLQUFLQSxrQkFBa0JBLENBQUNBO1lBQ3hCQSxLQUFLQSxNQUFNQSxDQUFDQTtZQUNaQSxLQUFLQSxTQUFTQSxDQUFDQTtZQUNmQSxLQUFLQSxZQUFZQSxDQUFDQTtZQUNsQkEsS0FBS0Esa0JBQWtCQSxDQUFDQTtZQUN4QkEsS0FBS0EsT0FBT0EsQ0FBQ0E7WUFDYkEsS0FBS0EsUUFBUUEsQ0FBQ0E7WUFDZEEsS0FBS0EsUUFBUUEsQ0FBQ0E7WUFDZEEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsUUFBUUEsQ0FBQ0E7WUFDZEEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDZkEsS0FBS0EsWUFBWUEsQ0FBQ0E7WUFDbEJBLEtBQUtBLGFBQWFBLENBQUNBO1lBQ25CQSxLQUFLQSxrQkFBa0JBLENBQUNBO1lBQ3hCQSxLQUFLQSxjQUFjQSxDQUFDQTtZQUNwQkEsS0FBS0EsU0FBU0E7Z0JBQ1pBLGVBQWVBLEdBQUdBLHFCQUFxQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9DQSxLQUFLQSxDQUFDQTtZQUNSQSxLQUFLQSxlQUFlQTtnQkFDbEJBLGVBQWVBLEdBQUdBLHdCQUF3QkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xEQSxLQUFLQSxDQUFDQTtZQUNSQTtnQkFDRUEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EsU0FBU0EsR0FBR0EsOEJBQThCQSxDQUFDQSxDQUFDQTtRQUN4RUEsQ0FBQ0E7UUFDREEsaUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQTtZQUNyQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsRUFBRUEsaUJBQWlCQSxDQUFDQTtZQUNqRUEsV0FBV0EsRUFBRUEsU0FBU0E7WUFDdEJBLGFBQWFBLEVBQUVBLFdBQVdBO1lBQzFCQSxPQUFPQSxFQUFFQSxlQUFlQTtTQUN6QkEsQ0FBQ0EsQ0FBQ0E7UUFFSEEsOEZBQThGQTtRQUM5RkEsd0ZBQXdGQTtRQUN4RkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U2VyaWFsaXplciwgUmVuZGVyU3RvcmVPYmplY3R9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5pbXBvcnQge3NlcmlhbGl6ZU1vdXNlRXZlbnQsIHNlcmlhbGl6ZUtleWJvYXJkRXZlbnQsIHNlcmlhbGl6ZUdlbmVyaWNFdmVudCwgc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0LCBzZXJpYWxpemVUcmFuc2l0aW9uRXZlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9zZXJpYWxpemVyJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9zaW5rOiBFdmVudEVtaXR0ZXI8YW55PiwgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplcikge31cblxuICBkaXNwYXRjaFJlbmRlckV2ZW50KGVsZW1lbnQ6IGFueSwgZXZlbnRUYXJnZXQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICB2YXIgc2VyaWFsaXplZEV2ZW50O1xuICAgIC8vIFRPRE8gKGp0ZXBsaXR6NjAyKTogc3VwcG9ydCBjdXN0b20gZXZlbnRzICMzMzUwXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICBjYXNlICdjbGljayc6XG4gICAgICBjYXNlICdtb3VzZXVwJzpcbiAgICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICBjYXNlICdkYmxjbGljayc6XG4gICAgICBjYXNlICdjb250ZXh0bWVudSc6XG4gICAgICBjYXNlICdtb3VzZWVudGVyJzpcbiAgICAgIGNhc2UgJ21vdXNlbGVhdmUnOlxuICAgICAgY2FzZSAnbW91c2Vtb3ZlJzpcbiAgICAgIGNhc2UgJ21vdXNlb3V0JzpcbiAgICAgIGNhc2UgJ21vdXNlb3Zlcic6XG4gICAgICBjYXNlICdzaG93JzpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplTW91c2VFdmVudChldmVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAna2V5ZG93bic6XG4gICAgICBjYXNlICdrZXlwcmVzcyc6XG4gICAgICBjYXNlICdrZXl1cCc6XG4gICAgICAgIHNlcmlhbGl6ZWRFdmVudCA9IHNlcmlhbGl6ZUtleWJvYXJkRXZlbnQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2lucHV0JzpcbiAgICAgIGNhc2UgJ2NoYW5nZSc6XG4gICAgICBjYXNlICdibHVyJzpcbiAgICAgICAgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0KGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdhYm9ydCc6XG4gICAgICBjYXNlICdhZnRlcnByaW50JzpcbiAgICAgIGNhc2UgJ2JlZm9yZXByaW50JzpcbiAgICAgIGNhc2UgJ2NhY2hlZCc6XG4gICAgICBjYXNlICdjYW5wbGF5JzpcbiAgICAgIGNhc2UgJ2NhbnBsYXl0aHJvdWdoJzpcbiAgICAgIGNhc2UgJ2NoYXJnaW5nY2hhbmdlJzpcbiAgICAgIGNhc2UgJ2NoYXJnaW5ndGltZWNoYW5nZSc6XG4gICAgICBjYXNlICdjbG9zZSc6XG4gICAgICBjYXNlICdkaXNjaGFyZ2luZ3RpbWVjaGFuZ2UnOlxuICAgICAgY2FzZSAnRE9NQ29udGVudExvYWRlZCc6XG4gICAgICBjYXNlICdkb3dubG9hZGluZyc6XG4gICAgICBjYXNlICdkdXJhdGlvbmNoYW5nZSc6XG4gICAgICBjYXNlICdlbXB0aWVkJzpcbiAgICAgIGNhc2UgJ2VuZGVkJzpcbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgIGNhc2UgJ2Z1bGxzY3JlZW5jaGFuZ2UnOlxuICAgICAgY2FzZSAnZnVsbHNjcmVlbmVycm9yJzpcbiAgICAgIGNhc2UgJ2ludmFsaWQnOlxuICAgICAgY2FzZSAnbGFuZ3VhZ2VjaGFuZ2UnOlxuICAgICAgY2FzZSAnbGV2ZWxmY2hhbmdlJzpcbiAgICAgIGNhc2UgJ2xvYWRlZGRhdGEnOlxuICAgICAgY2FzZSAnbG9hZGVkbWV0YWRhdGEnOlxuICAgICAgY2FzZSAnb2Jzb2xldGUnOlxuICAgICAgY2FzZSAnb2ZmbGluZSc6XG4gICAgICBjYXNlICdvbmxpbmUnOlxuICAgICAgY2FzZSAnb3Blbic6XG4gICAgICBjYXNlICdvcmllbnRhdG9pbmNoYW5nZSc6XG4gICAgICBjYXNlICdwYXVzZSc6XG4gICAgICBjYXNlICdwb2ludGVybG9ja2NoYW5nZSc6XG4gICAgICBjYXNlICdwb2ludGVybG9ja2Vycm9yJzpcbiAgICAgIGNhc2UgJ3BsYXknOlxuICAgICAgY2FzZSAncGxheWluZyc6XG4gICAgICBjYXNlICdyYXRlY2hhbmdlJzpcbiAgICAgIGNhc2UgJ3JlYWR5c3RhdGVjaGFuZ2UnOlxuICAgICAgY2FzZSAncmVzZXQnOlxuICAgICAgY2FzZSAnc2Nyb2xsJzpcbiAgICAgIGNhc2UgJ3NlZWtlZCc6XG4gICAgICBjYXNlICdzZWVraW5nJzpcbiAgICAgIGNhc2UgJ3N0YWxsZWQnOlxuICAgICAgY2FzZSAnc3VibWl0JzpcbiAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgY2FzZSAnc3VzcGVuZCc6XG4gICAgICBjYXNlICd0aW1ldXBkYXRlJzpcbiAgICAgIGNhc2UgJ3VwZGF0ZXJlYWR5JzpcbiAgICAgIGNhc2UgJ3Zpc2liaWxpdHljaGFuZ2UnOlxuICAgICAgY2FzZSAndm9sdW1lY2hhbmdlJzpcbiAgICAgIGNhc2UgJ3dhaXRpbmcnOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVHZW5lcmljRXZlbnQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RyYW5zaXRpb25lbmQnOlxuICAgICAgICBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVUcmFuc2l0aW9uRXZlbnQoZXZlbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGV2ZW50TmFtZSArICcgbm90IHN1cHBvcnRlZCBvbiBXZWJXb3JrZXJzJyk7XG4gICAgfVxuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3NpbmssIHtcbiAgICAgICdlbGVtZW50JzogdGhpcy5fc2VyaWFsaXplci5zZXJpYWxpemUoZWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgJ2V2ZW50TmFtZSc6IGV2ZW50TmFtZSxcbiAgICAgICdldmVudFRhcmdldCc6IGV2ZW50VGFyZ2V0LFxuICAgICAgJ2V2ZW50Jzogc2VyaWFsaXplZEV2ZW50XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPKGtlZ2x1bmVxKTogRXZlbnR1YWxseSwgd2Ugd2FudCB0aGUgdXNlciB0byBpbmRpY2F0ZSBmcm9tIHRoZSBVSSBzaWRlIHdoZXRoZXIgdGhlIGV2ZW50XG4gICAgLy8gc2hvdWxkIGJlIGNhbmNlbGVkLCBidXQgZm9yIG5vdyBqdXN0IGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgb3JpZ2luYWwgRE9NIGV2ZW50LlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19