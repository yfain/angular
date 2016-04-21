'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var EVENT = 'event';
var BOOLEAN = 'boolean';
var NUMBER = 'number';
var STRING = 'string';
var PROPERTIES = lang_1.CONST_EXPR([
    '*|className,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*copy,*cut,*paste,*search,*selectstart,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerHTML,#scrollLeft,#scrollTop',
    '^*|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*autocomplete,*autocompleteerror,*beforecopy,*beforecut,*beforepaste,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*message,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*paste,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*search,*seeked,*seeking,*select,*selectstart,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerText,!spellcheck,#tabIndex,title,!translate',
    '@svg:^*|*abort,*autocomplete,*autocompleteerror,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,#tabIndex',
    'anchor|',
    'area|alt,coords,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,search,shape,target,username',
    'media|*encrypted',
    'audio^media|',
    'br|clear',
    'base|href,target',
    'body|aLink,background,bgColor,link,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
    'button|!autofocus,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
    'canvas|#height,#width',
    'content|select',
    'dlist|',
    'datalist|',
    'details|!open',
    'dialog|!open,returnValue',
    'directory|',
    'div|align',
    'embed|align,height,name,src,type,width',
    'fieldset|!disabled,name',
    'font|color,face,size',
    'form|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target',
    'frame|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src',
    'frameset|cols,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
    'hr|align,color,!noShade,size,width',
    'head|',
    'heading|',
    'html|version',
    'iframe|align,!allowFullscreen,frameBorder,height,longDesc,marginHeight,marginWidth,name,scrolling,src,srcdoc,width',
    'image|',
    'input|accept,align,alt,autocapitalize,autocomplete,!autofocus,!checked,!defaultChecked,defaultValue,dirName,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,#valueAsNumber,#width',
    'keygen|!autofocus,challenge,!disabled,keytype,name',
    'li|type,#value',
    'label|htmlFor',
    'legend|align',
    'link|as,charset,!disabled,href,hreflang,integrity,media,rel,rev,target,type',
    'map|name',
    'marquee|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
    'menu|!compact',
    'meta|content,httpEquiv,name,scheme',
    'meter|#high,#low,#max,#min,#optimum,#value',
    'mod|',
    'olist|',
    'object|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width',
    'optgroup|!disabled,label',
    'option|!defaultSelected,!disabled,label,!selected,text,value',
    'output|defaultValue,name,value',
    'paragraph|',
    'param|name,type,value,valueType',
    'picture|',
    'pre|#width',
    'progress|#max,#value',
    'quote|',
    'script|!async,charset,!defer,event,htmlFor,integrity,src,text,type',
    'select|!autofocus,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
    'shadow|',
    'source|media,sizes,src,srcset,type',
    'span|',
    'style|!disabled,media,type',
    'tablecaption|',
    'tablecell|',
    'tablecol|',
    'table|align,bgColor,border,cellPadding,cellSpacing,frame,rules,summary,width',
    'tablerow|',
    'tablesection|',
    'template|',
    'textarea|autocapitalize,!autofocus,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
    'title|text',
    'track|!default,kind,label,src,srclang',
    'ulist|',
    'unknown|',
    'video^media|#height,poster,#width',
    '@svg:graphics^@svg:|',
    '@svg:a^@svg:graphics|',
    '@svg:animation^@svg:|*begin,*end,*repeat',
    '@svg:animate^@svg:animation|',
    '@svg:animatemotion^@svg:animation|',
    '@svg:animatetransform^@svg:animation|',
    '@svg:geometry^@svg:graphics|',
    '@svg:circle^@svg:geometry|',
    '@svg:clippath^@svg:graphics|',
    '@svg:componenttransferfunction^@svg:|',
    '@svg:cursor^@svg:|',
    '@svg:defs^@svg:graphics|',
    '@svg:desc^@svg:|',
    '@svg:discard^@svg:|',
    '@svg:ellipse^@svg:geometry|',
    '@svg:feblend^@svg:|',
    '@svg:fecolormatrix^@svg:|',
    '@svg:fecomponenttransfer^@svg:|',
    '@svg:fecomposite^@svg:|',
    '@svg:feconvolvematrix^@svg:|',
    '@svg:fediffuselighting^@svg:|',
    '@svg:fedisplacementmap^@svg:|',
    '@svg:fedistantlight^@svg:|',
    '@svg:fedropshadow^@svg:|',
    '@svg:feflood^@svg:|',
    '@svg:fefunca^@svg:componenttransferfunction|',
    '@svg:fefuncb^@svg:componenttransferfunction|',
    '@svg:fefuncg^@svg:componenttransferfunction|',
    '@svg:fefuncr^@svg:componenttransferfunction|',
    '@svg:fegaussianblur^@svg:|',
    '@svg:feimage^@svg:|',
    '@svg:femerge^@svg:|',
    '@svg:femergenode^@svg:|',
    '@svg:femorphology^@svg:|',
    '@svg:feoffset^@svg:|',
    '@svg:fepointlight^@svg:|',
    '@svg:fespecularlighting^@svg:|',
    '@svg:fespotlight^@svg:|',
    '@svg:fetile^@svg:|',
    '@svg:feturbulence^@svg:|',
    '@svg:filter^@svg:|',
    '@svg:foreignobject^@svg:graphics|',
    '@svg:g^@svg:graphics|',
    '@svg:gradient^@svg:|',
    '@svg:image^@svg:graphics|',
    '@svg:line^@svg:geometry|',
    '@svg:lineargradient^@svg:gradient|',
    '@svg:mpath^@svg:|',
    '@svg:marker^@svg:|',
    '@svg:mask^@svg:|',
    '@svg:metadata^@svg:|',
    '@svg:path^@svg:geometry|',
    '@svg:pattern^@svg:|',
    '@svg:polygon^@svg:geometry|',
    '@svg:polyline^@svg:geometry|',
    '@svg:radialgradient^@svg:gradient|',
    '@svg:rect^@svg:geometry|',
    '@svg:svg^@svg:graphics|#currentScale,#zoomAndPan',
    '@svg:script^@svg:|type',
    '@svg:set^@svg:animation|',
    '@svg:stop^@svg:|',
    '@svg:style^@svg:|!disabled,media,title,type',
    '@svg:switch^@svg:graphics|',
    '@svg:symbol^@svg:|',
    '@svg:textcontent^@svg:graphics|',
    '@svg:textpositioning^@svg:textcontent|',
    '@svg:tspan^@svg:textpositioning|',
    '@svg:text^@svg:textpositioning|',
    '@svg:textpath^@svg:textcontent|',
    '@svg:title^@svg:|',
    '@svg:use^@svg:graphics|',
    '@svg:view^@svg:|#zoomAndPan'
]);
var attrToPropMap = lang_1.CONST_EXPR({
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex'
});
var DomElementSchemaRegistry = (function () {
    function DomElementSchemaRegistry() {
        var _this = this;
        this.schema = {};
        PROPERTIES.forEach(function (encodedType) {
            var parts = encodedType.split('|');
            var properties = parts[1].split(',');
            var typeParts = (parts[0] + '^').split('^');
            var typeName = typeParts[0];
            var type = _this.schema[typeName] = {};
            var superType = _this.schema[typeParts[1]];
            if (lang_1.isPresent(superType)) {
                collection_1.StringMapWrapper.forEach(superType, function (v, k) { return type[k] = v; });
            }
            properties.forEach(function (property) {
                if (property == '') {
                }
                else if (property.startsWith('*')) {
                    type[property.substring(1)] = EVENT;
                }
                else if (property.startsWith('!')) {
                    type[property.substring(1)] = BOOLEAN;
                }
                else if (property.startsWith('#')) {
                    type[property.substring(1)] = NUMBER;
                }
                else {
                    type[property] = STRING;
                }
            });
        });
    }
    DomElementSchemaRegistry.prototype.hasProperty = function (tagName, propName) {
        if (tagName.indexOf('-') !== -1) {
            // can't tell now as we don't know which properties a custom element will get
            // once it is instantiated
            return true;
        }
        else {
            var elementProperties = this.schema[tagName.toLowerCase()];
            if (!lang_1.isPresent(elementProperties)) {
                elementProperties = this.schema['unknown'];
            }
            return lang_1.isPresent(elementProperties[propName]);
        }
    };
    DomElementSchemaRegistry.prototype.getMappedPropName = function (propName) {
        var mappedPropName = collection_1.StringMapWrapper.get(attrToPropMap, propName);
        return lang_1.isPresent(mappedPropName) ? mappedPropName : propName;
    };
    DomElementSchemaRegistry = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DomElementSchemaRegistry);
    return DomElementSchemaRegistry;
}());
exports.DomElementSchemaRegistry = DomElementSchemaRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1Rck9xU0RMMC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHFCQUFvQywwQkFBMEIsQ0FBQyxDQUFBO0FBQy9ELDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBR2hFLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQztBQUN0QixJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDMUIsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUN4QixJQUFNLFVBQVUsR0FDWixpQkFBVSxDQUNOO0lBQ0UsNExBQTRMO0lBQzVMLGkrQkFBaStCO0lBQ2orQiw4bEJBQThsQjtJQUM5bEIsU0FBUztJQUNULG1IQUFtSDtJQUNuSCxrQkFBa0I7SUFDbEIsY0FBYztJQUNkLFVBQVU7SUFDVixrQkFBa0I7SUFDbEIsa1BBQWtQO0lBQ2xQLDBHQUEwRztJQUMxRyx1QkFBdUI7SUFDdkIsZ0JBQWdCO0lBQ2hCLFFBQVE7SUFDUixXQUFXO0lBQ1gsZUFBZTtJQUNmLDBCQUEwQjtJQUMxQixZQUFZO0lBQ1osV0FBVztJQUNYLHdDQUF3QztJQUN4Qyx5QkFBeUI7SUFDekIsc0JBQXNCO0lBQ3RCLHdGQUF3RjtJQUN4RixrRkFBa0Y7SUFDbEYsdU5BQXVOO0lBQ3ZOLG9DQUFvQztJQUNwQyxPQUFPO0lBQ1AsVUFBVTtJQUNWLGNBQWM7SUFDZCxvSEFBb0g7SUFDcEgsUUFBUTtJQUNSLHFaQUFxWjtJQUNyWixvREFBb0Q7SUFDcEQsZ0JBQWdCO0lBQ2hCLGVBQWU7SUFDZixjQUFj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K0NwQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge2lzUHJlc2VudCwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcblxuY29uc3QgRVZFTlQgPSAnZXZlbnQnO1xuY29uc3QgQk9PTEVBTiA9ICdib29sZWFuJztcbmNvbnN0IE5VTUJFUiA9ICdudW1iZXInO1xuY29uc3QgU1RSSU5HID0gJ3N0cmluZyc7XG5jb25zdCBQUk9QRVJUSUVTOiBzdHJpbmdbXSA9XG4gICAgQ09OU1RfRVhQUihcbiAgICAgICAgW1xuICAgICAgICAgICcqfGNsYXNzTmFtZSxpZCxpbm5lckhUTUwsKmJlZm9yZWNvcHksKmJlZm9yZWN1dCwqYmVmb3JlcGFzdGUsKmNvcHksKmN1dCwqcGFzdGUsKnNlYXJjaCwqc2VsZWN0c3RhcnQsKndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UsKndlYmtpdGZ1bGxzY3JlZW5lcnJvciwqd2hlZWwsb3V0ZXJIVE1MLCNzY3JvbGxMZWZ0LCNzY3JvbGxUb3AnLFxuICAgICAgICAgICdeKnxhY2Nlc3NLZXksY29udGVudEVkaXRhYmxlLGRpciwhZHJhZ2dhYmxlLCFoaWRkZW4saW5uZXJUZXh0LGxhbmcsKmFib3J0LCphdXRvY29tcGxldGUsKmF1dG9jb21wbGV0ZWVycm9yLCpiZWZvcmVjb3B5LCpiZWZvcmVjdXQsKmJlZm9yZXBhc3RlLCpibHVyLCpjYW5jZWwsKmNhbnBsYXksKmNhbnBsYXl0aHJvdWdoLCpjaGFuZ2UsKmNsaWNrLCpjbG9zZSwqY29udGV4dG1lbnUsKmNvcHksKmN1ZWNoYW5nZSwqY3V0LCpkYmxjbGljaywqZHJhZywqZHJhZ2VuZCwqZHJhZ2VudGVyLCpkcmFnbGVhdmUsKmRyYWdvdmVyLCpkcmFnc3RhcnQsKmRyb3AsKmR1cmF0aW9uY2hhbmdlLCplbXB0aWVkLCplbmRlZCwqZXJyb3IsKmZvY3VzLCppbnB1dCwqaW52YWxpZCwqa2V5ZG93biwqa2V5cHJlc3MsKmtleXVwLCpsb2FkLCpsb2FkZWRkYXRhLCpsb2FkZWRtZXRhZGF0YSwqbG9hZHN0YXJ0LCptZXNzYWdlLCptb3VzZWRvd24sKm1vdXNlZW50ZXIsKm1vdXNlbGVhdmUsKm1vdXNlbW92ZSwqbW91c2VvdXQsKm1vdXNlb3ZlciwqbW91c2V1cCwqbW91c2V3aGVlbCwqbW96ZnVsbHNjcmVlbmNoYW5nZSwqbW96ZnVsbHNjcmVlbmVycm9yLCptb3pwb2ludGVybG9ja2NoYW5nZSwqbW96cG9pbnRlcmxvY2tlcnJvciwqcGFzdGUsKnBhdXNlLCpwbGF5LCpwbGF5aW5nLCpwcm9ncmVzcywqcmF0ZWNoYW5nZSwqcmVzZXQsKnJlc2l6ZSwqc2Nyb2xsLCpzZWFyY2gsKnNlZWtlZCwqc2Vla2luZywqc2VsZWN0LCpzZWxlY3RzdGFydCwqc2hvdywqc3RhbGxlZCwqc3VibWl0LCpzdXNwZW5kLCp0aW1ldXBkYXRlLCp0b2dnbGUsKnZvbHVtZWNoYW5nZSwqd2FpdGluZywqd2ViZ2xjb250ZXh0Y3JlYXRpb25lcnJvciwqd2ViZ2xjb250ZXh0bG9zdCwqd2ViZ2xjb250ZXh0cmVzdG9yZWQsKndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UsKndlYmtpdGZ1bGxzY3JlZW5lcnJvciwqd2hlZWwsb3V0ZXJUZXh0LCFzcGVsbGNoZWNrLCN0YWJJbmRleCx0aXRsZSwhdHJhbnNsYXRlJyxcbiAgICAgICAgICAnQHN2ZzpeKnwqYWJvcnQsKmF1dG9jb21wbGV0ZSwqYXV0b2NvbXBsZXRlZXJyb3IsKmJsdXIsKmNhbmNlbCwqY2FucGxheSwqY2FucGxheXRocm91Z2gsKmNoYW5nZSwqY2xpY2ssKmNsb3NlLCpjb250ZXh0bWVudSwqY3VlY2hhbmdlLCpkYmxjbGljaywqZHJhZywqZHJhZ2VuZCwqZHJhZ2VudGVyLCpkcmFnbGVhdmUsKmRyYWdvdmVyLCpkcmFnc3RhcnQsKmRyb3AsKmR1cmF0aW9uY2hhbmdlLCplbXB0aWVkLCplbmRlZCwqZXJyb3IsKmZvY3VzLCppbnB1dCwqaW52YWxpZCwqa2V5ZG93biwqa2V5cHJlc3MsKmtleXVwLCpsb2FkLCpsb2FkZWRkYXRhLCpsb2FkZWRtZXRhZGF0YSwqbG9hZHN0YXJ0LCptb3VzZWRvd24sKm1vdXNlZW50ZXIsKm1vdXNlbGVhdmUsKm1vdXNlbW92ZSwqbW91c2VvdXQsKm1vdXNlb3ZlciwqbW91c2V1cCwqbW91c2V3aGVlbCwqcGF1c2UsKnBsYXksKnBsYXlpbmcsKnByb2dyZXNzLCpyYXRlY2hhbmdlLCpyZXNldCwqcmVzaXplLCpzY3JvbGwsKnNlZWtlZCwqc2Vla2luZywqc2VsZWN0LCpzaG93LCpzdGFsbGVkLCpzdWJtaXQsKnN1c3BlbmQsKnRpbWV1cGRhdGUsKnRvZ2dsZSwqdm9sdW1lY2hhbmdlLCp3YWl0aW5nLCN0YWJJbmRleCcsXG4gICAgICAgICAgJ2FuY2hvcnwnLFxuICAgICAgICAgICdhcmVhfGFsdCxjb29yZHMsaGFzaCxob3N0LGhvc3RuYW1lLGhyZWYsIW5vSHJlZixwYXNzd29yZCxwYXRobmFtZSxwaW5nLHBvcnQscHJvdG9jb2wsc2VhcmNoLHNoYXBlLHRhcmdldCx1c2VybmFtZScsXG4gICAgICAgICAgJ21lZGlhfCplbmNyeXB0ZWQnLFxuICAgICAgICAgICdhdWRpb15tZWRpYXwnLFxuICAgICAgICAgICdicnxjbGVhcicsXG4gICAgICAgICAgJ2Jhc2V8aHJlZix0YXJnZXQnLFxuICAgICAgICAgICdib2R5fGFMaW5rLGJhY2tncm91bmQsYmdDb2xvcixsaW5rLCpiZWZvcmV1bmxvYWQsKmJsdXIsKmVycm9yLCpmb2N1cywqaGFzaGNoYW5nZSwqbGFuZ3VhZ2VjaGFuZ2UsKmxvYWQsKm1lc3NhZ2UsKm9mZmxpbmUsKm9ubGluZSwqcGFnZWhpZGUsKnBhZ2VzaG93LCpwb3BzdGF0ZSwqcmVqZWN0aW9uaGFuZGxlZCwqcmVzaXplLCpzY3JvbGwsKnN0b3JhZ2UsKnVuaGFuZGxlZHJlamVjdGlvbiwqdW5sb2FkLHRleHQsdkxpbmsnLFxuICAgICAgICAgICdidXR0b258IWF1dG9mb2N1cywhZGlzYWJsZWQsZm9ybUFjdGlvbixmb3JtRW5jdHlwZSxmb3JtTWV0aG9kLCFmb3JtTm9WYWxpZGF0ZSxmb3JtVGFyZ2V0LG5hbWUsdHlwZSx2YWx1ZScsXG4gICAgICAgICAgJ2NhbnZhc3wjaGVpZ2h0LCN3aWR0aCcsXG4gICAgICAgICAgJ2NvbnRlbnR8c2VsZWN0JyxcbiAgICAgICAgICAnZGxpc3R8JyxcbiAgICAgICAgICAnZGF0YWxpc3R8JyxcbiAgICAgICAgICAnZGV0YWlsc3whb3BlbicsXG4gICAgICAgICAgJ2RpYWxvZ3whb3BlbixyZXR1cm5WYWx1ZScsXG4gICAgICAgICAgJ2RpcmVjdG9yeXwnLFxuICAgICAgICAgICdkaXZ8YWxpZ24nLFxuICAgICAgICAgICdlbWJlZHxhbGlnbixoZWlnaHQsbmFtZSxzcmMsdHlwZSx3aWR0aCcsXG4gICAgICAgICAgJ2ZpZWxkc2V0fCFkaXNhYmxlZCxuYW1lJyxcbiAgICAgICAgICAnZm9udHxjb2xvcixmYWNlLHNpemUnLFxuICAgICAgICAgICdmb3JtfGFjY2VwdENoYXJzZXQsYWN0aW9uLGF1dG9jb21wbGV0ZSxlbmNvZGluZyxlbmN0eXBlLG1ldGhvZCxuYW1lLCFub1ZhbGlkYXRlLHRhcmdldCcsXG4gICAgICAgICAgJ2ZyYW1lfGZyYW1lQm9yZGVyLGxvbmdEZXNjLG1hcmdpbkhlaWdodCxtYXJnaW5XaWR0aCxuYW1lLCFub1Jlc2l6ZSxzY3JvbGxpbmcsc3JjJyxcbiAgICAgICAgICAnZnJhbWVzZXR8Y29scywqYmVmb3JldW5sb2FkLCpibHVyLCplcnJvciwqZm9jdXMsKmhhc2hjaGFuZ2UsKmxhbmd1YWdlY2hhbmdlLCpsb2FkLCptZXNzYWdlLCpvZmZsaW5lLCpvbmxpbmUsKnBhZ2VoaWRlLCpwYWdlc2hvdywqcG9wc3RhdGUsKnJlamVjdGlvbmhhbmRsZWQsKnJlc2l6ZSwqc2Nyb2xsLCpzdG9yYWdlLCp1bmhhbmRsZWRyZWplY3Rpb24sKnVubG9hZCxyb3dzJyxcbiAgICAgICAgICAnaHJ8YWxpZ24sY29sb3IsIW5vU2hhZGUsc2l6ZSx3aWR0aCcsXG4gICAgICAgICAgJ2hlYWR8JyxcbiAgICAgICAgICAnaGVhZGluZ3wnLFxuICAgICAgICAgICdodG1sfHZlcnNpb24nLFxuICAgICAgICAgICdpZnJhbWV8YWxpZ24sIWFsbG93RnVsbHNjcmVlbixmcmFtZUJvcmRlcixoZWlnaHQsbG9uZ0Rlc2MsbWFyZ2luSGVpZ2h0LG1hcmdpbldpZHRoLG5hbWUsc2Nyb2xsaW5nLHNyYyxzcmNkb2Msd2lkdGgnLFxuICAgICAgICAgICdpbWFnZXwnLFxuICAgICAgICAgICdpbnB1dHxhY2NlcHQsYWxpZ24sYWx0LGF1dG9jYXBpdGFsaXplLGF1dG9jb21wbGV0ZSwhYXV0b2ZvY3VzLCFjaGVja2VkLCFkZWZhdWx0Q2hlY2tlZCxkZWZhdWx0VmFsdWUsZGlyTmFtZSwhZGlzYWJsZWQsZm9ybUFjdGlvbixmb3JtRW5jdHlwZSxmb3JtTWV0aG9kLCFmb3JtTm9WYWxpZGF0ZSxmb3JtVGFyZ2V0LCNoZWlnaHQsIWluY3JlbWVudGFsLCFpbmRldGVybWluYXRlLG1heCwjbWF4TGVuZ3RoLG1pbiwjbWluTGVuZ3RoLCFtdWx0aXBsZSxuYW1lLHBhdHRlcm4scGxhY2Vob2xkZXIsIXJlYWRPbmx5LCFyZXF1aXJlZCxzZWxlY3Rpb25EaXJlY3Rpb24sI3NlbGVjdGlvbkVuZCwjc2VsZWN0aW9uU3RhcnQsI3NpemUsc3JjLHN0ZXAsdHlwZSx1c2VNYXAsdmFsdWUsI3ZhbHVlQXNOdW1iZXIsI3dpZHRoJyxcbiAgICAgICAgICAna2V5Z2VufCFhdXRvZm9jdXMsY2hhbGxlbmdlLCFkaXNhYmxlZCxrZXl0eXBlLG5hbWUnLFxuICAgICAgICAgICdsaXx0eXBlLCN2YWx1ZScsXG4gICAgICAgICAgJ2xhYmVsfGh0bWxGb3InLFxuICAgICAgICAgICdsZWdlbmR8YWxpZ24nLFxuICAgICAgICAgICdsaW5rfGFzLGNoYXJzZXQsIWRpc2FibGVkLGhyZWYsaHJlZmxhbmcsaW50ZWdyaXR5LG1lZGlhLHJlbCxyZXYsdGFyZ2V0LHR5cGUnLFxuICAgICAgICAgICdtYXB8bmFtZScsXG4gICAgICAgICAgJ21hcnF1ZWV8YmVoYXZpb3IsYmdDb2xvcixkaXJlY3Rpb24saGVpZ2h0LCNoc3BhY2UsI2xvb3AsI3Njcm9sbEFtb3VudCwjc2Nyb2xsRGVsYXksIXRydWVTcGVlZCwjdnNwYWNlLHdpZHRoJyxcbiAgICAgICAgICAnbWVudXwhY29tcGFjdCcsXG4gICAgICAgICAgJ21ldGF8Y29udGVudCxodHRwRXF1aXYsbmFtZSxzY2hlbWUnLFxuICAgICAgICAgICdtZXRlcnwjaGlnaCwjbG93LCNtYXgsI21pbiwjb3B0aW11bSwjdmFsdWUnLFxuICAgICAgICAgICdtb2R8JyxcbiAgICAgICAgICAnb2xpc3R8JyxcbiAgICAgICAgICAnb2JqZWN0fGFsaWduLGFyY2hpdmUsYm9yZGVyLGNvZGUsY29kZUJhc2UsY29kZVR5cGUsZGF0YSwhZGVjbGFyZSxoZWlnaHQsI2hzcGFjZSxuYW1lLHN0YW5kYnksdHlwZSx1c2VNYXAsI3ZzcGFjZSx3aWR0aCcsXG4gICAgICAgICAgJ29wdGdyb3VwfCFkaXNhYmxlZCxsYWJlbCcsXG4gICAgICAgICAgJ29wdGlvbnwhZGVmYXVsdFNlbGVjdGVkLCFkaXNhYmxlZCxsYWJlbCwhc2VsZWN0ZWQsdGV4dCx2YWx1ZScsXG4gICAgICAgICAgJ291dHB1dHxkZWZhdWx0VmFsdWUsbmFtZSx2YWx1ZScsXG4gICAgICAgICAgJ3BhcmFncmFwaHwnLFxuICAgICAgICAgICdwYXJhbXxuYW1lLHR5cGUsdmFsdWUsdmFsdWVUeXBlJyxcbiAgICAgICAgICAncGljdHVyZXwnLFxuICAgICAgICAgICdwcmV8I3dpZHRoJyxcbiAgICAgICAgICAncHJvZ3Jlc3N8I21heCwjdmFsdWUnLFxuICAgICAgICAgICdxdW90ZXwnLFxuICAgICAgICAgICdzY3JpcHR8IWFzeW5jLGNoYXJzZXQsIWRlZmVyLGV2ZW50LGh0bWxGb3IsaW50ZWdyaXR5LHNyYyx0ZXh0LHR5cGUnLFxuICAgICAgICAgICdzZWxlY3R8IWF1dG9mb2N1cywhZGlzYWJsZWQsI2xlbmd0aCwhbXVsdGlwbGUsbmFtZSwhcmVxdWlyZWQsI3NlbGVjdGVkSW5kZXgsI3NpemUsdmFsdWUnLFxuICAgICAgICAgICdzaGFkb3d8JyxcbiAgICAgICAgICAnc291cmNlfG1lZGlhLHNpemVzLHNyYyxzcmNzZXQsdHlwZScsXG4gICAgICAgICAgJ3NwYW58JyxcbiAgICAgICAgICAnc3R5bGV8IWRpc2FibGVkLG1lZGlhLHR5cGUnLFxuICAgICAgICAgICd0YWJsZWNhcHRpb258JyxcbiAgICAgICAgICAndGFibGVjZWxsfCcsXG4gICAgICAgICAgJ3RhYmxlY29sfCcsXG4gICAgICAgICAgJ3RhYmxlfGFsaWduLGJnQ29sb3IsYm9yZGVyLGNlbGxQYWRkaW5nLGNlbGxTcGFjaW5nLGZyYW1lLHJ1bGVzLHN1bW1hcnksd2lkdGgnLFxuICAgICAgICAgICd0YWJsZXJvd3wnLFxuICAgICAgICAgICd0YWJsZXNlY3Rpb258JyxcbiAgICAgICAgICAndGVtcGxhdGV8JyxcbiAgICAgICAgICAndGV4dGFyZWF8YXV0b2NhcGl0YWxpemUsIWF1dG9mb2N1cywjY29scyxkZWZhdWx0VmFsdWUsZGlyTmFtZSwhZGlzYWJsZWQsI21heExlbmd0aCwjbWluTGVuZ3RoLG5hbWUscGxhY2Vob2xkZXIsIXJlYWRPbmx5LCFyZXF1aXJlZCwjcm93cyxzZWxlY3Rpb25EaXJlY3Rpb24sI3NlbGVjdGlvbkVuZCwjc2VsZWN0aW9uU3RhcnQsdmFsdWUsd3JhcCcsXG4gICAgICAgICAgJ3RpdGxlfHRleHQnLFxuICAgICAgICAgICd0cmFja3whZGVmYXVsdCxraW5kLGxhYmVsLHNyYyxzcmNsYW5nJyxcbiAgICAgICAgICAndWxpc3R8JyxcbiAgICAgICAgICAndW5rbm93bnwnLFxuICAgICAgICAgICd2aWRlb15tZWRpYXwjaGVpZ2h0LHBvc3Rlciwjd2lkdGgnLFxuICAgICAgICAgICdAc3ZnOmdyYXBoaWNzXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6YV5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAgICAgJ0Bzdmc6YW5pbWF0aW9uXkBzdmc6fCpiZWdpbiwqZW5kLCpyZXBlYXQnLFxuICAgICAgICAgICdAc3ZnOmFuaW1hdGVeQHN2ZzphbmltYXRpb258JyxcbiAgICAgICAgICAnQHN2ZzphbmltYXRlbW90aW9uXkBzdmc6YW5pbWF0aW9ufCcsXG4gICAgICAgICAgJ0Bzdmc6YW5pbWF0ZXRyYW5zZm9ybV5Ac3ZnOmFuaW1hdGlvbnwnLFxuICAgICAgICAgICdAc3ZnOmdlb21ldHJ5XkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2ZzpjaXJjbGVeQHN2ZzpnZW9tZXRyeXwnLFxuICAgICAgICAgICdAc3ZnOmNsaXBwYXRoXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2Zzpjb21wb25lbnR0cmFuc2ZlcmZ1bmN0aW9uXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6Y3Vyc29yXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZGVmc15Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAgICAgJ0Bzdmc6ZGVzY15Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmRpc2NhcmReQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzplbGxpcHNlXkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICAgICAnQHN2ZzpmZWJsZW5kXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVjb2xvcm1hdHJpeF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlY29tcG9uZW50dHJhbnNmZXJeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZWNvbXBvc2l0ZV5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlY29udm9sdmVtYXRyaXheQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZWRpZmZ1c2VsaWdodGluZ15Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlZGlzcGxhY2VtZW50bWFwXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVkaXN0YW50bGlnaHReQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZWRyb3BzaGFkb3deQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZWZsb29kXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVmdW5jYV5Ac3ZnOmNvbXBvbmVudHRyYW5zZmVyZnVuY3Rpb258JyxcbiAgICAgICAgICAnQHN2ZzpmZWZ1bmNiXkBzdmc6Y29tcG9uZW50dHJhbnNmZXJmdW5jdGlvbnwnLFxuICAgICAgICAgICdAc3ZnOmZlZnVuY2deQHN2Zzpjb21wb25lbnR0cmFuc2ZlcmZ1bmN0aW9ufCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVmdW5jcl5Ac3ZnOmNvbXBvbmVudHRyYW5zZmVyZnVuY3Rpb258JyxcbiAgICAgICAgICAnQHN2ZzpmZWdhdXNzaWFuYmx1cl5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlaW1hZ2VeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZW1lcmdlXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVtZXJnZW5vZGVeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZW1vcnBob2xvZ3leQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZW9mZnNldF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlcG9pbnRsaWdodF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlc3BlY3VsYXJsaWdodGluZ15Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlc3BvdGxpZ2h0XkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmV0aWxlXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmV0dXJidWxlbmNlXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmlsdGVyXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6Zm9yZWlnbm9iamVjdF5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAgICAgJ0Bzdmc6Z15Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAgICAgJ0Bzdmc6Z3JhZGllbnReQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzppbWFnZV5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAgICAgJ0Bzdmc6bGluZV5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAgICAgJ0Bzdmc6bGluZWFyZ3JhZGllbnReQHN2ZzpncmFkaWVudHwnLFxuICAgICAgICAgICdAc3ZnOm1wYXRoXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6bWFya2VyXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6bWFza15Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOm1ldGFkYXRhXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6cGF0aF5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAgICAgJ0Bzdmc6cGF0dGVybl5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOnBvbHlnb25eQHN2ZzpnZW9tZXRyeXwnLFxuICAgICAgICAgICdAc3ZnOnBvbHlsaW5lXkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICAgICAnQHN2ZzpyYWRpYWxncmFkaWVudF5Ac3ZnOmdyYWRpZW50fCcsXG4gICAgICAgICAgJ0Bzdmc6cmVjdF5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAgICAgJ0Bzdmc6c3ZnXkBzdmc6Z3JhcGhpY3N8I2N1cnJlbnRTY2FsZSwjem9vbUFuZFBhbicsXG4gICAgICAgICAgJ0Bzdmc6c2NyaXB0XkBzdmc6fHR5cGUnLFxuICAgICAgICAgICdAc3ZnOnNldF5Ac3ZnOmFuaW1hdGlvbnwnLFxuICAgICAgICAgICdAc3ZnOnN0b3BeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpzdHlsZV5Ac3ZnOnwhZGlzYWJsZWQsbWVkaWEsdGl0bGUsdHlwZScsXG4gICAgICAgICAgJ0Bzdmc6c3dpdGNoXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2ZzpzeW1ib2xeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2Zzp0ZXh0Y29udGVudF5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAgICAgJ0Bzdmc6dGV4dHBvc2l0aW9uaW5nXkBzdmc6dGV4dGNvbnRlbnR8JyxcbiAgICAgICAgICAnQHN2Zzp0c3Bhbl5Ac3ZnOnRleHRwb3NpdGlvbmluZ3wnLFxuICAgICAgICAgICdAc3ZnOnRleHReQHN2Zzp0ZXh0cG9zaXRpb25pbmd8JyxcbiAgICAgICAgICAnQHN2Zzp0ZXh0cGF0aF5Ac3ZnOnRleHRjb250ZW50fCcsXG4gICAgICAgICAgJ0Bzdmc6dGl0bGVeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2Zzp1c2VeQHN2ZzpncmFwaGljc3wnLFxuICAgICAgICAgICdAc3ZnOnZpZXdeQHN2Zzp8I3pvb21BbmRQYW4nXG4gICAgICAgIF0pO1xuXG5jb25zdCBhdHRyVG9Qcm9wTWFwID0gPHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfT5DT05TVF9FWFBSKHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdpbm5lckh0bWwnOiAnaW5uZXJIVE1MJyxcbiAgJ3JlYWRvbmx5JzogJ3JlYWRPbmx5JyxcbiAgJ3RhYmluZGV4JzogJ3RhYkluZGV4J1xufSk7XG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSBpbXBsZW1lbnRzIEVsZW1lbnRTY2hlbWFSZWdpc3RyeSB7XG4gIHNjaGVtYSA9IDx7W2VsZW1lbnQ6IHN0cmluZ106IHtbcHJvcGVydHk6IHN0cmluZ106IHN0cmluZ319Pnt9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIFBST1BFUlRJRVMuZm9yRWFjaChlbmNvZGVkVHlwZSA9PiB7XG4gICAgICB2YXIgcGFydHMgPSBlbmNvZGVkVHlwZS5zcGxpdCgnfCcpO1xuICAgICAgdmFyIHByb3BlcnRpZXMgPSBwYXJ0c1sxXS5zcGxpdCgnLCcpO1xuICAgICAgdmFyIHR5cGVQYXJ0cyA9IChwYXJ0c1swXSArICdeJykuc3BsaXQoJ14nKTtcbiAgICAgIHZhciB0eXBlTmFtZSA9IHR5cGVQYXJ0c1swXTtcbiAgICAgIHZhciB0eXBlID0gdGhpcy5zY2hlbWFbdHlwZU5hbWVdID0gPHtbcHJvcGVydHk6IHN0cmluZ106IHN0cmluZ30+e307XG4gICAgICB2YXIgc3VwZXJUeXBlID0gdGhpcy5zY2hlbWFbdHlwZVBhcnRzWzFdXTtcbiAgICAgIGlmIChpc1ByZXNlbnQoc3VwZXJUeXBlKSkge1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goc3VwZXJUeXBlLCAodiwgaykgPT4gdHlwZVtrXSA9IHYpO1xuICAgICAgfVxuICAgICAgcHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChwcm9wZXJ0eSA9PSAnJykge1xuICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5LnN0YXJ0c1dpdGgoJyonKSkge1xuICAgICAgICAgIHR5cGVbcHJvcGVydHkuc3Vic3RyaW5nKDEpXSA9IEVWRU5UO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5LnN0YXJ0c1dpdGgoJyEnKSkge1xuICAgICAgICAgIHR5cGVbcHJvcGVydHkuc3Vic3RyaW5nKDEpXSA9IEJPT0xFQU47XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkuc3RhcnRzV2l0aCgnIycpKSB7XG4gICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gTlVNQkVSO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHR5cGVbcHJvcGVydHldID0gU1RSSU5HO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KVxuICB9XG5cbiAgaGFzUHJvcGVydHkodGFnTmFtZTogc3RyaW5nLCBwcm9wTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKHRhZ05hbWUuaW5kZXhPZignLScpICE9PSAtMSkge1xuICAgICAgLy8gY2FuJ3QgdGVsbCBub3cgYXMgd2UgZG9uJ3Qga25vdyB3aGljaCBwcm9wZXJ0aWVzIGEgY3VzdG9tIGVsZW1lbnQgd2lsbCBnZXRcbiAgICAgIC8vIG9uY2UgaXQgaXMgaW5zdGFudGlhdGVkXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGVsZW1lbnRQcm9wZXJ0aWVzID0gdGhpcy5zY2hlbWFbdGFnTmFtZS50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmICghaXNQcmVzZW50KGVsZW1lbnRQcm9wZXJ0aWVzKSkge1xuICAgICAgICBlbGVtZW50UHJvcGVydGllcyA9IHRoaXMuc2NoZW1hWyd1bmtub3duJ107XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNQcmVzZW50KGVsZW1lbnRQcm9wZXJ0aWVzW3Byb3BOYW1lXSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWFwcGVkUHJvcE5hbWUocHJvcE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIG1hcHBlZFByb3BOYW1lID0gU3RyaW5nTWFwV3JhcHBlci5nZXQoYXR0clRvUHJvcE1hcCwgcHJvcE5hbWUpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobWFwcGVkUHJvcE5hbWUpID8gbWFwcGVkUHJvcE5hbWUgOiBwcm9wTmFtZTtcbiAgfVxufVxuIl19