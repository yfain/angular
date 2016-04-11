'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var event_manager_1 = require('./event_manager');
var di_1 = require('angular2/src/core/di');
var modifierKeys = ['alt', 'control', 'meta', 'shift'];
var modifierKeyGetters = {
    'alt': function (event) { return event.altKey; },
    'control': function (event) { return event.ctrlKey; },
    'meta': function (event) { return event.metaKey; },
    'shift': function (event) { return event.shiftKey; }
};
var KeyEventsPlugin = (function (_super) {
    __extends(KeyEventsPlugin, _super);
    function KeyEventsPlugin() {
        _super.call(this);
    }
    KeyEventsPlugin.prototype.supports = function (eventName) {
        return lang_1.isPresent(KeyEventsPlugin.parseEventName(eventName));
    };
    KeyEventsPlugin.prototype.addEventListener = function (element, eventName, handler) {
        var parsedEvent = KeyEventsPlugin.parseEventName(eventName);
        var outsideHandler = KeyEventsPlugin.eventCallback(element, collection_1.StringMapWrapper.get(parsedEvent, 'fullKey'), handler, this.manager.getZone());
        return this.manager.getZone().runOutsideAngular(function () {
            return dom_adapter_1.DOM.onAndCancel(element, collection_1.StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
        });
    };
    KeyEventsPlugin.parseEventName = function (eventName) {
        var parts = eventName.toLowerCase().split('.');
        var domEventName = parts.shift();
        if ((parts.length === 0) ||
            !(lang_1.StringWrapper.equals(domEventName, 'keydown') ||
                lang_1.StringWrapper.equals(domEventName, 'keyup'))) {
            return null;
        }
        var key = KeyEventsPlugin._normalizeKey(parts.pop());
        var fullKey = '';
        modifierKeys.forEach(function (modifierName) {
            if (collection_1.ListWrapper.contains(parts, modifierName)) {
                collection_1.ListWrapper.remove(parts, modifierName);
                fullKey += modifierName + '.';
            }
        });
        fullKey += key;
        if (parts.length != 0 || key.length === 0) {
            // returning null instead of throwing to let another plugin process the event
            return null;
        }
        var result = collection_1.StringMapWrapper.create();
        collection_1.StringMapWrapper.set(result, 'domEventName', domEventName);
        collection_1.StringMapWrapper.set(result, 'fullKey', fullKey);
        return result;
    };
    KeyEventsPlugin.getEventFullKey = function (event) {
        var fullKey = '';
        var key = dom_adapter_1.DOM.getEventKey(event);
        key = key.toLowerCase();
        if (lang_1.StringWrapper.equals(key, ' ')) {
            key = 'space'; // for readability
        }
        else if (lang_1.StringWrapper.equals(key, '.')) {
            key = 'dot'; // because '.' is used as a separator in event names
        }
        modifierKeys.forEach(function (modifierName) {
            if (modifierName != key) {
                var modifierGetter = collection_1.StringMapWrapper.get(modifierKeyGetters, modifierName);
                if (modifierGetter(event)) {
                    fullKey += modifierName + '.';
                }
            }
        });
        fullKey += key;
        return fullKey;
    };
    KeyEventsPlugin.eventCallback = function (element, fullKey, handler, zone) {
        return function (event) {
            if (lang_1.StringWrapper.equals(KeyEventsPlugin.getEventFullKey(event), fullKey)) {
                zone.run(function () { return handler(event); });
            }
        };
    };
    /** @internal */
    KeyEventsPlugin._normalizeKey = function (keyName) {
        // TODO: switch to a StringMap if the mapping grows too much
        switch (keyName) {
            case 'esc':
                return 'escape';
            default:
                return keyName;
        }
    };
    KeyEventsPlugin = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], KeyEventsPlugin);
    return KeyEventsPlugin;
})(event_manager_1.EventManagerPlugin);
exports.KeyEventsPlugin = KeyEventsPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5X2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUHZPdVJqdngudG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2tleV9ldmVudHMudHMiXSwibmFtZXMiOlsiS2V5RXZlbnRzUGx1Z2luIiwiS2V5RXZlbnRzUGx1Z2luLmNvbnN0cnVjdG9yIiwiS2V5RXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiS2V5RXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUiLCJLZXlFdmVudHNQbHVnaW4uZ2V0RXZlbnRGdWxsS2V5IiwiS2V5RXZlbnRzUGx1Z2luLmV2ZW50Q2FsbGJhY2siLCJLZXlFdmVudHNQbHVnaW4uX25vcm1hbGl6ZUtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCxxQkFBOEUsMEJBQTBCLENBQUMsQ0FBQTtBQUN6RywyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSw4QkFBaUMsaUJBQWlCLENBQUMsQ0FBQTtBQUVuRCxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRCxJQUFJLFlBQVksR0FBRyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELElBQUksa0JBQWtCLEdBQXVEO0lBQzNFLEtBQUssRUFBRSxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxFQUFaLENBQVk7SUFDN0MsU0FBUyxFQUFFLFVBQUMsS0FBb0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxPQUFPLEVBQWIsQ0FBYTtJQUNsRCxNQUFNLEVBQUUsVUFBQyxLQUFvQixJQUFLLE9BQUEsS0FBSyxDQUFDLE9BQU8sRUFBYixDQUFhO0lBQy9DLE9BQU8sRUFBRSxVQUFDLEtBQW9CLElBQUss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QUNBO0FBQURBLENBQUNBLEFBM0ZELEVBQ3FDLGtDQUFrQixFQTBGdEQ7QUExRlksdUJBQWUsa0JBMEYzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIFN0cmluZ1dyYXBwZXIsIFJlZ0V4cFdyYXBwZXIsIE51bWJlcldyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtFdmVudE1hbmFnZXJQbHVnaW59IGZyb20gJy4vZXZlbnRfbWFuYWdlcic7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG52YXIgbW9kaWZpZXJLZXlzID0gWydhbHQnLCAnY29udHJvbCcsICdtZXRhJywgJ3NoaWZ0J107XG52YXIgbW9kaWZpZXJLZXlHZXR0ZXJzOiB7W2tleTogc3RyaW5nXTogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBib29sZWFufSA9IHtcbiAgJ2FsdCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuYWx0S2V5LFxuICAnY29udHJvbCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuY3RybEtleSxcbiAgJ21ldGEnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50Lm1ldGFLZXksXG4gICdzaGlmdCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuc2hpZnRLZXlcbn07XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBLZXlFdmVudHNQbHVnaW4gZXh0ZW5kcyBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTsgfVxuXG4gIHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudChLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUoZXZlbnROYW1lKSk7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHBhcnNlZEV2ZW50ID0gS2V5RXZlbnRzUGx1Z2luLnBhcnNlRXZlbnROYW1lKGV2ZW50TmFtZSk7XG5cbiAgICB2YXIgb3V0c2lkZUhhbmRsZXIgPSBLZXlFdmVudHNQbHVnaW4uZXZlbnRDYWxsYmFjayhcbiAgICAgICAgZWxlbWVudCwgU3RyaW5nTWFwV3JhcHBlci5nZXQocGFyc2VkRXZlbnQsICdmdWxsS2V5JyksIGhhbmRsZXIsIHRoaXMubWFuYWdlci5nZXRab25lKCkpO1xuXG4gICAgcmV0dXJuIHRoaXMubWFuYWdlci5nZXRab25lKCkucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgcmV0dXJuIERPTS5vbkFuZENhbmNlbChcbiAgICAgICAgICBlbGVtZW50LCBTdHJpbmdNYXBXcmFwcGVyLmdldChwYXJzZWRFdmVudCwgJ2RvbUV2ZW50TmFtZScpLCBvdXRzaWRlSGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgcGFyc2VFdmVudE5hbWUoZXZlbnROYW1lOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB7XG4gICAgdmFyIHBhcnRzOiBzdHJpbmdbXSA9IGV2ZW50TmFtZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcuJyk7XG5cbiAgICB2YXIgZG9tRXZlbnROYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICBpZiAoKHBhcnRzLmxlbmd0aCA9PT0gMCkgfHxcbiAgICAgICAgIShTdHJpbmdXcmFwcGVyLmVxdWFscyhkb21FdmVudE5hbWUsICdrZXlkb3duJykgfHxcbiAgICAgICAgICBTdHJpbmdXcmFwcGVyLmVxdWFscyhkb21FdmVudE5hbWUsICdrZXl1cCcpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGtleSA9IEtleUV2ZW50c1BsdWdpbi5fbm9ybWFsaXplS2V5KHBhcnRzLnBvcCgpKTtcblxuICAgIHZhciBmdWxsS2V5ID0gJyc7XG4gICAgbW9kaWZpZXJLZXlzLmZvckVhY2gobW9kaWZpZXJOYW1lID0+IHtcbiAgICAgIGlmIChMaXN0V3JhcHBlci5jb250YWlucyhwYXJ0cywgbW9kaWZpZXJOYW1lKSkge1xuICAgICAgICBMaXN0V3JhcHBlci5yZW1vdmUocGFydHMsIG1vZGlmaWVyTmFtZSk7XG4gICAgICAgIGZ1bGxLZXkgKz0gbW9kaWZpZXJOYW1lICsgJy4nO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZ1bGxLZXkgKz0ga2V5O1xuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCAhPSAwIHx8IGtleS5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIHJldHVybmluZyBudWxsIGluc3RlYWQgb2YgdGhyb3dpbmcgdG8gbGV0IGFub3RoZXIgcGx1Z2luIHByb2Nlc3MgdGhlIGV2ZW50XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCAnZG9tRXZlbnROYW1lJywgZG9tRXZlbnROYW1lKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChyZXN1bHQsICdmdWxsS2V5JywgZnVsbEtleSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFdmVudEZ1bGxLZXkoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBzdHJpbmcge1xuICAgIHZhciBmdWxsS2V5ID0gJyc7XG4gICAgdmFyIGtleSA9IERPTS5nZXRFdmVudEtleShldmVudCk7XG4gICAga2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKGtleSwgJyAnKSkge1xuICAgICAga2V5ID0gJ3NwYWNlJzsgIC8vIGZvciByZWFkYWJpbGl0eVxuICAgIH0gZWxzZSBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoa2V5LCAnLicpKSB7XG4gICAgICBrZXkgPSAnZG90JzsgIC8vIGJlY2F1c2UgJy4nIGlzIHVzZWQgYXMgYSBzZXBhcmF0b3IgaW4gZXZlbnQgbmFtZXNcbiAgICB9XG4gICAgbW9kaWZpZXJLZXlzLmZvckVhY2gobW9kaWZpZXJOYW1lID0+IHtcbiAgICAgIGlmIChtb2RpZmllck5hbWUgIT0ga2V5KSB7XG4gICAgICAgIHZhciBtb2RpZmllckdldHRlciA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KG1vZGlmaWVyS2V5R2V0dGVycywgbW9kaWZpZXJOYW1lKTtcbiAgICAgICAgaWYgKG1vZGlmaWVyR2V0dGVyKGV2ZW50KSkge1xuICAgICAgICAgIGZ1bGxLZXkgKz0gbW9kaWZpZXJOYW1lICsgJy4nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgZnVsbEtleSArPSBrZXk7XG4gICAgcmV0dXJuIGZ1bGxLZXk7XG4gIH1cblxuICBzdGF0aWMgZXZlbnRDYWxsYmFjayhlbGVtZW50OiBIVE1MRWxlbWVudCwgZnVsbEtleTogYW55LCBoYW5kbGVyOiBGdW5jdGlvbiwgem9uZTogTmdab25lKTpcbiAgICAgIEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoS2V5RXZlbnRzUGx1Z2luLmdldEV2ZW50RnVsbEtleShldmVudCksIGZ1bGxLZXkpKSB7XG4gICAgICAgIHpvbmUucnVuKCgpID0+IGhhbmRsZXIoZXZlbnQpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX25vcm1hbGl6ZUtleShrZXlOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIFRPRE86IHN3aXRjaCB0byBhIFN0cmluZ01hcCBpZiB0aGUgbWFwcGluZyBncm93cyB0b28gbXVjaFxuICAgIHN3aXRjaCAoa2V5TmFtZSkge1xuICAgICAgY2FzZSAnZXNjJzpcbiAgICAgICAgcmV0dXJuICdlc2NhcGUnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGtleU5hbWU7XG4gICAgfVxuICB9XG59XG4iXX0=