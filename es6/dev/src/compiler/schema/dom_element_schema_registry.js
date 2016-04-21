var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
const EVENT = 'event';
const BOOLEAN = 'boolean';
const NUMBER = 'number';
const STRING = 'string';
const PROPERTIES = CONST_EXPR([
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
const attrToPropMap = CONST_EXPR({
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex'
});
export let DomElementSchemaRegistry = class DomElementSchemaRegistry {
    constructor() {
        this.schema = {};
        PROPERTIES.forEach(encodedType => {
            var parts = encodedType.split('|');
            var properties = parts[1].split(',');
            var typeParts = (parts[0] + '^').split('^');
            var typeName = typeParts[0];
            var type = this.schema[typeName] = {};
            var superType = this.schema[typeParts[1]];
            if (isPresent(superType)) {
                StringMapWrapper.forEach(superType, (v, k) => type[k] = v);
            }
            properties.forEach((property) => {
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
    hasProperty(tagName, propName) {
        if (tagName.indexOf('-') !== -1) {
            // can't tell now as we don't know which properties a custom element will get
            // once it is instantiated
            return true;
        }
        else {
            var elementProperties = this.schema[tagName.toLowerCase()];
            if (!isPresent(elementProperties)) {
                elementProperties = this.schema['unknown'];
            }
            return isPresent(elementProperties[propName]);
        }
    }
    getMappedPropName(propName) {
        var mappedPropName = StringMapWrapper.get(attrToPropMap, propName);
        return isPresent(mappedPropName) ? mappedPropName : propName;
    }
};
DomElementSchemaRegistry = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], DomElementSchemaRegistry);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC12bnJiUnk4bS50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQ3ZELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7QUFHL0QsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3RCLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUMxQixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDeEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLE1BQU0sVUFBVSxHQUNaLFVBQVUsQ0FDTjtJQUNFLDRMQUE0TDtJQUM1TCxpK0JBQWkrQjtJQUNqK0IsOGxCQUE4bEI7SUFDOWxCLFNBQVM7SUFDVCxtSEFBbUg7SUFDbkgsa0JBQWtCO0lBQ2xCLGNBQWM7SUFDZCxVQUFVO0lBQ1Ysa0JBQWtCO0lBQ2xCLGtQQUFrUDtJQUNsUCwwR0FBMEc7SUFDMUcsdUJBQXVCO0lBQ3ZCLGdCQUFnQjtJQUNoQixRQUFRO0lBQ1IsV0FBVztJQUNYLGVBQWU7SUFDZiwwQkFBMEI7SUFDMUIsWUFBWTtJQUNaLFdBQVc7SUFDWCx3Q0FBd0M7SUFDeEMseUJBQXlCO0lBQ3pCLHNCQUFzQjtJQUN0Qix3RkFBd0Y7SUFDeEYsa0ZBQWtGO0lBQ2xGLHVOQUF1TjtJQUN2TixvQ0FBb0M7SUFDcEMsT0FBTztJQUNQLFVBQVU7SUFDVixjQUFjO0lBQ2Qsb0hBQW9IO0lBQ3BILFFBQVE7SUFDUixxWkFBcVo7SUFDclosb0RBQW9EO0lBQ3BELGdCQUFnQjtJ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QUFDLEdBQUcsTUFBTSxDQUFDO2dCQUN2QyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7Z0JBQzFCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFlLEVBQUUsUUFBZ0I7UUFDM0MsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsNkVBQTZFO1lBQzdFLDBCQUEwQjtZQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzNELEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQztJQUNILENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxRQUFnQjtRQUNoQyxJQUFJLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsY0FBYyxHQUFHLFFBQVEsQ0FBQztJQUMvRCxDQUFDO0FBQ0gsQ0FBQztBQWhERDtJQUFDLFVBQVUsRUFBRTs7NEJBQUE7QUFnRFoiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7aXNQcmVzZW50LCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4vZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuXG5jb25zdCBFVkVOVCA9ICdldmVudCc7XG5jb25zdCBCT09MRUFOID0gJ2Jvb2xlYW4nO1xuY29uc3QgTlVNQkVSID0gJ251bWJlcic7XG5jb25zdCBTVFJJTkcgPSAnc3RyaW5nJztcbmNvbnN0IFBST1BFUlRJRVM6IHN0cmluZ1tdID1cbiAgICBDT05TVF9FWFBSKFxuICAgICAgICBbXG4gICAgICAgICAgJyp8Y2xhc3NOYW1lLGlkLGlubmVySFRNTCwqYmVmb3JlY29weSwqYmVmb3JlY3V0LCpiZWZvcmVwYXN0ZSwqY29weSwqY3V0LCpwYXN0ZSwqc2VhcmNoLCpzZWxlY3RzdGFydCwqd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSwqd2Via2l0ZnVsbHNjcmVlbmVycm9yLCp3aGVlbCxvdXRlckhUTUwsI3Njcm9sbExlZnQsI3Njcm9sbFRvcCcsXG4gICAgICAgICAgJ14qfGFjY2Vzc0tleSxjb250ZW50RWRpdGFibGUsZGlyLCFkcmFnZ2FibGUsIWhpZGRlbixpbm5lclRleHQsbGFuZywqYWJvcnQsKmF1dG9jb21wbGV0ZSwqYXV0b2NvbXBsZXRlZXJyb3IsKmJlZm9yZWNvcHksKmJlZm9yZWN1dCwqYmVmb3JlcGFzdGUsKmJsdXIsKmNhbmNlbCwqY2FucGxheSwqY2FucGxheXRocm91Z2gsKmNoYW5nZSwqY2xpY2ssKmNsb3NlLCpjb250ZXh0bWVudSwqY29weSwqY3VlY2hhbmdlLCpjdXQsKmRibGNsaWNrLCpkcmFnLCpkcmFnZW5kLCpkcmFnZW50ZXIsKmRyYWdsZWF2ZSwqZHJhZ292ZXIsKmRyYWdzdGFydCwqZHJvcCwqZHVyYXRpb25jaGFuZ2UsKmVtcHRpZWQsKmVuZGVkLCplcnJvciwqZm9jdXMsKmlucHV0LCppbnZhbGlkLCprZXlkb3duLCprZXlwcmVzcywqa2V5dXAsKmxvYWQsKmxvYWRlZGRhdGEsKmxvYWRlZG1ldGFkYXRhLCpsb2Fkc3RhcnQsKm1lc3NhZ2UsKm1vdXNlZG93biwqbW91c2VlbnRlciwqbW91c2VsZWF2ZSwqbW91c2Vtb3ZlLCptb3VzZW91dCwqbW91c2VvdmVyLCptb3VzZXVwLCptb3VzZXdoZWVsLCptb3pmdWxsc2NyZWVuY2hhbmdlLCptb3pmdWxsc2NyZWVuZXJyb3IsKm1venBvaW50ZXJsb2NrY2hhbmdlLCptb3pwb2ludGVybG9ja2Vycm9yLCpwYXN0ZSwqcGF1c2UsKnBsYXksKnBsYXlpbmcsKnByb2dyZXNzLCpyYXRlY2hhbmdlLCpyZXNldCwqcmVzaXplLCpzY3JvbGwsKnNlYXJjaCwqc2Vla2VkLCpzZWVraW5nLCpzZWxlY3QsKnNlbGVjdHN0YXJ0LCpzaG93LCpzdGFsbGVkLCpzdWJtaXQsKnN1c3BlbmQsKnRpbWV1cGRhdGUsKnRvZ2dsZSwqdm9sdW1lY2hhbmdlLCp3YWl0aW5nLCp3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yLCp3ZWJnbGNvbnRleHRsb3N0LCp3ZWJnbGNvbnRleHRyZXN0b3JlZCwqd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSwqd2Via2l0ZnVsbHNjcmVlbmVycm9yLCp3aGVlbCxvdXRlclRleHQsIXNwZWxsY2hlY2ssI3RhYkluZGV4LHRpdGxlLCF0cmFuc2xhdGUnLFxuICAgICAgICAgICdAc3ZnOl4qfCphYm9ydCwqYXV0b2NvbXBsZXRlLCphdXRvY29tcGxldGVlcnJvciwqYmx1ciwqY2FuY2VsLCpjYW5wbGF5LCpjYW5wbGF5dGhyb3VnaCwqY2hhbmdlLCpjbGljaywqY2xvc2UsKmNvbnRleHRtZW51LCpjdWVjaGFuZ2UsKmRibGNsaWNrLCpkcmFnLCpkcmFnZW5kLCpkcmFnZW50ZXIsKmRyYWdsZWF2ZSwqZHJhZ292ZXIsKmRyYWdzdGFydCwqZHJvcCwqZHVyYXRpb25jaGFuZ2UsKmVtcHRpZWQsKmVuZGVkLCplcnJvciwqZm9jdXMsKmlucHV0LCppbnZhbGlkLCprZXlkb3duLCprZXlwcmVzcywqa2V5dXAsKmxvYWQsKmxvYWRlZGRhdGEsKmxvYWRlZG1ldGFkYXRhLCpsb2Fkc3RhcnQsKm1vdXNlZG93biwqbW91c2VlbnRlciwqbW91c2VsZWF2ZSwqbW91c2Vtb3ZlLCptb3VzZW91dCwqbW91c2VvdmVyLCptb3VzZXVwLCptb3VzZXdoZWVsLCpwYXVzZSwqcGxheSwqcGxheWluZywqcHJvZ3Jlc3MsKnJhdGVjaGFuZ2UsKnJlc2V0LCpyZXNpemUsKnNjcm9sbCwqc2Vla2VkLCpzZWVraW5nLCpzZWxlY3QsKnNob3csKnN0YWxsZWQsKnN1Ym1pdCwqc3VzcGVuZCwqdGltZXVwZGF0ZSwqdG9nZ2xlLCp2b2x1bWVjaGFuZ2UsKndhaXRpbmcsI3RhYkluZGV4JyxcbiAgICAgICAgICAnYW5jaG9yfCcsXG4gICAgICAgICAgJ2FyZWF8YWx0LGNvb3JkcyxoYXNoLGhvc3QsaG9zdG5hbWUsaHJlZiwhbm9IcmVmLHBhc3N3b3JkLHBhdGhuYW1lLHBpbmcscG9ydCxwcm90b2NvbCxzZWFyY2gsc2hhcGUsdGFyZ2V0LHVzZXJuYW1lJyxcbiAgICAgICAgICAnbWVkaWF8KmVuY3J5cHRlZCcsXG4gICAgICAgICAgJ2F1ZGlvXm1lZGlhfCcsXG4gICAgICAgICAgJ2JyfGNsZWFyJyxcbiAgICAgICAgICAnYmFzZXxocmVmLHRhcmdldCcsXG4gICAgICAgICAgJ2JvZHl8YUxpbmssYmFja2dyb3VuZCxiZ0NvbG9yLGxpbmssKmJlZm9yZXVubG9hZCwqYmx1ciwqZXJyb3IsKmZvY3VzLCpoYXNoY2hhbmdlLCpsYW5ndWFnZWNoYW5nZSwqbG9hZCwqbWVzc2FnZSwqb2ZmbGluZSwqb25saW5lLCpwYWdlaGlkZSwqcGFnZXNob3csKnBvcHN0YXRlLCpyZWplY3Rpb25oYW5kbGVkLCpyZXNpemUsKnNjcm9sbCwqc3RvcmFnZSwqdW5oYW5kbGVkcmVqZWN0aW9uLCp1bmxvYWQsdGV4dCx2TGluaycsXG4gICAgICAgICAgJ2J1dHRvbnwhYXV0b2ZvY3VzLCFkaXNhYmxlZCxmb3JtQWN0aW9uLGZvcm1FbmN0eXBlLGZvcm1NZXRob2QsIWZvcm1Ob1ZhbGlkYXRlLGZvcm1UYXJnZXQsbmFtZSx0eXBlLHZhbHVlJyxcbiAgICAgICAgICAnY2FudmFzfCNoZWlnaHQsI3dpZHRoJyxcbiAgICAgICAgICAnY29udGVudHxzZWxlY3QnLFxuICAgICAgICAgICdkbGlzdHwnLFxuICAgICAgICAgICdkYXRhbGlzdHwnLFxuICAgICAgICAgICdkZXRhaWxzfCFvcGVuJyxcbiAgICAgICAgICAnZGlhbG9nfCFvcGVuLHJldHVyblZhbHVlJyxcbiAgICAgICAgICAnZGlyZWN0b3J5fCcsXG4gICAgICAgICAgJ2RpdnxhbGlnbicsXG4gICAgICAgICAgJ2VtYmVkfGFsaWduLGhlaWdodCxuYW1lLHNyYyx0eXBlLHdpZHRoJyxcbiAgICAgICAgICAnZmllbGRzZXR8IWRpc2FibGVkLG5hbWUnLFxuICAgICAgICAgICdmb250fGNvbG9yLGZhY2Usc2l6ZScsXG4gICAgICAgICAgJ2Zvcm18YWNjZXB0Q2hhcnNldCxhY3Rpb24sYXV0b2NvbXBsZXRlLGVuY29kaW5nLGVuY3R5cGUsbWV0aG9kLG5hbWUsIW5vVmFsaWRhdGUsdGFyZ2V0JyxcbiAgICAgICAgICAnZnJhbWV8ZnJhbWVCb3JkZXIsbG9uZ0Rlc2MsbWFyZ2luSGVpZ2h0LG1hcmdpbldpZHRoLG5hbWUsIW5vUmVzaXplLHNjcm9sbGluZyxzcmMnLFxuICAgICAgICAgICdmcmFtZXNldHxjb2xzLCpiZWZvcmV1bmxvYWQsKmJsdXIsKmVycm9yLCpmb2N1cywqaGFzaGNoYW5nZSwqbGFuZ3VhZ2VjaGFuZ2UsKmxvYWQsKm1lc3NhZ2UsKm9mZmxpbmUsKm9ubGluZSwqcGFnZWhpZGUsKnBhZ2VzaG93LCpwb3BzdGF0ZSwqcmVqZWN0aW9uaGFuZGxlZCwqcmVzaXplLCpzY3JvbGwsKnN0b3JhZ2UsKnVuaGFuZGxlZHJlamVjdGlvbiwqdW5sb2FkLHJvd3MnLFxuICAgICAgICAgICdocnxhbGlnbixjb2xvciwhbm9TaGFkZSxzaXplLHdpZHRoJyxcbiAgICAgICAgICAnaGVhZHwnLFxuICAgICAgICAgICdoZWFkaW5nfCcsXG4gICAgICAgICAgJ2h0bWx8dmVyc2lvbicsXG4gICAgICAgICAgJ2lmcmFtZXxhbGlnbiwhYWxsb3dGdWxsc2NyZWVuLGZyYW1lQm9yZGVyLGhlaWdodCxsb25nRGVzYyxtYXJnaW5IZWlnaHQsbWFyZ2luV2lkdGgsbmFtZSxzY3JvbGxpbmcsc3JjLHNyY2RvYyx3aWR0aCcsXG4gICAgICAgICAgJ2ltYWdlfCcsXG4gICAgICAgICAgJ2lucHV0fGFjY2VwdCxhbGlnbixhbHQsYXV0b2NhcGl0YWxpemUsYXV0b2NvbXBsZXRlLCFhdXRvZm9jdXMsIWNoZWNrZWQsIWRlZmF1bHRDaGVja2VkLGRlZmF1bHRWYWx1ZSxkaXJOYW1lLCFkaXNhYmxlZCxmb3JtQWN0aW9uLGZvcm1FbmN0eXBlLGZvcm1NZXRob2QsIWZvcm1Ob1ZhbGlkYXRlLGZvcm1UYXJnZXQsI2hlaWdodCwhaW5jcmVtZW50YWwsIWluZGV0ZXJtaW5hdGUsbWF4LCNtYXhMZW5ndGgsbWluLCNtaW5MZW5ndGgsIW11bHRpcGxlLG5hbWUscGF0dGVybixwbGFjZWhvbGRlciwhcmVhZE9ubHksIXJlcXVpcmVkLHNlbGVjdGlvbkRpcmVjdGlvbiwjc2VsZWN0aW9uRW5kLCNzZWxlY3Rpb25TdGFydCwjc2l6ZSxzcmMsc3RlcCx0eXBlLHVzZU1hcCx2YWx1ZSwjdmFsdWVBc051bWJlciwjd2lkdGgnLFxuICAgICAgICAgICdrZXlnZW58IWF1dG9mb2N1cyxjaGFsbGVuZ2UsIWRpc2FibGVkLGtleXR5cGUsbmFtZScsXG4gICAgICAgICAgJ2xpfHR5cGUsI3ZhbHVlJyxcbiAgICAgICAgICAnbGFiZWx8aHRtbEZvcicsXG4gICAgICAgICAgJ2xlZ2VuZHxhbGlnbicsXG4gICAgICAgICAgJ2xpbmt8YXMsY2hhcnNldCwhZGlzYWJsZWQsaHJlZixocmVmbGFuZyxpbnRlZ3JpdHksbWVkaWEscmVsLHJldix0YXJnZXQsdHlwZScsXG4gICAgICAgICAgJ21hcHxuYW1lJyxcbiAgICAgICAgICAnbWFycXVlZXxiZWhhdmlvcixiZ0NvbG9yLGRpcmVjdGlvbixoZWlnaHQsI2hzcGFjZSwjbG9vcCwjc2Nyb2xsQW1vdW50LCNzY3JvbGxEZWxheSwhdHJ1ZVNwZWVkLCN2c3BhY2Usd2lkdGgnLFxuICAgICAgICAgICdtZW51fCFjb21wYWN0JyxcbiAgICAgICAgICAnbWV0YXxjb250ZW50LGh0dHBFcXVpdixuYW1lLHNjaGVtZScsXG4gICAgICAgICAgJ21ldGVyfCNoaWdoLCNsb3csI21heCwjbWluLCNvcHRpbXVtLCN2YWx1ZScsXG4gICAgICAgICAgJ21vZHwnLFxuICAgICAgICAgICdvbGlzdHwnLFxuICAgICAgICAgICdvYmplY3R8YWxpZ24sYXJjaGl2ZSxib3JkZXIsY29kZSxjb2RlQmFzZSxjb2RlVHlwZSxkYXRhLCFkZWNsYXJlLGhlaWdodCwjaHNwYWNlLG5hbWUsc3RhbmRieSx0eXBlLHVzZU1hcCwjdnNwYWNlLHdpZHRoJyxcbiAgICAgICAgICAnb3B0Z3JvdXB8IWRpc2FibGVkLGxhYmVsJyxcbiAgICAgICAgICAnb3B0aW9ufCFkZWZhdWx0U2VsZWN0ZWQsIWRpc2FibGVkLGxhYmVsLCFzZWxlY3RlZCx0ZXh0LHZhbHVlJyxcbiAgICAgICAgICAnb3V0cHV0fGRlZmF1bHRWYWx1ZSxuYW1lLHZhbHVlJyxcbiAgICAgICAgICAncGFyYWdyYXBofCcsXG4gICAgICAgICAgJ3BhcmFtfG5hbWUsdHlwZSx2YWx1ZSx2YWx1ZVR5cGUnLFxuICAgICAgICAgICdwaWN0dXJlfCcsXG4gICAgICAgICAgJ3ByZXwjd2lkdGgnLFxuICAgICAgICAgICdwcm9ncmVzc3wjbWF4LCN2YWx1ZScsXG4gICAgICAgICAgJ3F1b3RlfCcsXG4gICAgICAgICAgJ3NjcmlwdHwhYXN5bmMsY2hhcnNldCwhZGVmZXIsZXZlbnQsaHRtbEZvcixpbnRlZ3JpdHksc3JjLHRleHQsdHlwZScsXG4gICAgICAgICAgJ3NlbGVjdHwhYXV0b2ZvY3VzLCFkaXNhYmxlZCwjbGVuZ3RoLCFtdWx0aXBsZSxuYW1lLCFyZXF1aXJlZCwjc2VsZWN0ZWRJbmRleCwjc2l6ZSx2YWx1ZScsXG4gICAgICAgICAgJ3NoYWRvd3wnLFxuICAgICAgICAgICdzb3VyY2V8bWVkaWEsc2l6ZXMsc3JjLHNyY3NldCx0eXBlJyxcbiAgICAgICAgICAnc3BhbnwnLFxuICAgICAgICAgICdzdHlsZXwhZGlzYWJsZWQsbWVkaWEsdHlwZScsXG4gICAgICAgICAgJ3RhYmxlY2FwdGlvbnwnLFxuICAgICAgICAgICd0YWJsZWNlbGx8JyxcbiAgICAgICAgICAndGFibGVjb2x8JyxcbiAgICAgICAgICAndGFibGV8YWxpZ24sYmdDb2xvcixib3JkZXIsY2VsbFBhZGRpbmcsY2VsbFNwYWNpbmcsZnJhbWUscnVsZXMsc3VtbWFyeSx3aWR0aCcsXG4gICAgICAgICAgJ3RhYmxlcm93fCcsXG4gICAgICAgICAgJ3RhYmxlc2VjdGlvbnwnLFxuICAgICAgICAgICd0ZW1wbGF0ZXwnLFxuICAgICAgICAgICd0ZXh0YXJlYXxhdXRvY2FwaXRhbGl6ZSwhYXV0b2ZvY3VzLCNjb2xzLGRlZmF1bHRWYWx1ZSxkaXJOYW1lLCFkaXNhYmxlZCwjbWF4TGVuZ3RoLCNtaW5MZW5ndGgsbmFtZSxwbGFjZWhvbGRlciwhcmVhZE9ubHksIXJlcXVpcmVkLCNyb3dzLHNlbGVjdGlvbkRpcmVjdGlvbiwjc2VsZWN0aW9uRW5kLCNzZWxlY3Rpb25TdGFydCx2YWx1ZSx3cmFwJyxcbiAgICAgICAgICAndGl0bGV8dGV4dCcsXG4gICAgICAgICAgJ3RyYWNrfCFkZWZhdWx0LGtpbmQsbGFiZWwsc3JjLHNyY2xhbmcnLFxuICAgICAgICAgICd1bGlzdHwnLFxuICAgICAgICAgICd1bmtub3dufCcsXG4gICAgICAgICAgJ3ZpZGVvXm1lZGlhfCNoZWlnaHQscG9zdGVyLCN3aWR0aCcsXG4gICAgICAgICAgJ0Bzdmc6Z3JhcGhpY3NeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzphXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2ZzphbmltYXRpb25eQHN2Zzp8KmJlZ2luLCplbmQsKnJlcGVhdCcsXG4gICAgICAgICAgJ0Bzdmc6YW5pbWF0ZV5Ac3ZnOmFuaW1hdGlvbnwnLFxuICAgICAgICAgICdAc3ZnOmFuaW1hdGVtb3Rpb25eQHN2ZzphbmltYXRpb258JyxcbiAgICAgICAgICAnQHN2ZzphbmltYXRldHJhbnNmb3JtXkBzdmc6YW5pbWF0aW9ufCcsXG4gICAgICAgICAgJ0Bzdmc6Z2VvbWV0cnleQHN2ZzpncmFwaGljc3wnLFxuICAgICAgICAgICdAc3ZnOmNpcmNsZV5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAgICAgJ0Bzdmc6Y2xpcHBhdGheQHN2ZzpncmFwaGljc3wnLFxuICAgICAgICAgICdAc3ZnOmNvbXBvbmVudHRyYW5zZmVyZnVuY3Rpb25eQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpjdXJzb3JeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpkZWZzXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2ZzpkZXNjXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZGlzY2FyZF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmVsbGlwc2VeQHN2ZzpnZW9tZXRyeXwnLFxuICAgICAgICAgICdAc3ZnOmZlYmxlbmReQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZWNvbG9ybWF0cml4XkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVjb21wb25lbnR0cmFuc2Zlcl5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlY29tcG9zaXRlXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVjb252b2x2ZW1hdHJpeF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlZGlmZnVzZWxpZ2h0aW5nXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVkaXNwbGFjZW1lbnRtYXBeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZWRpc3RhbnRsaWdodF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlZHJvcHNoYWRvd15Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlZmxvb2ReQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZWZ1bmNhXkBzdmc6Y29tcG9uZW50dHJhbnNmZXJmdW5jdGlvbnwnLFxuICAgICAgICAgICdAc3ZnOmZlZnVuY2JeQHN2Zzpjb21wb25lbnR0cmFuc2ZlcmZ1bmN0aW9ufCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVmdW5jZ15Ac3ZnOmNvbXBvbmVudHRyYW5zZmVyZnVuY3Rpb258JyxcbiAgICAgICAgICAnQHN2ZzpmZWZ1bmNyXkBzdmc6Y29tcG9uZW50dHJhbnNmZXJmdW5jdGlvbnwnLFxuICAgICAgICAgICdAc3ZnOmZlZ2F1c3NpYW5ibHVyXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVpbWFnZV5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlbWVyZ2VeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZW1lcmdlbm9kZV5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlbW9ycGhvbG9neV5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmZlb2Zmc2V0XkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVwb2ludGxpZ2h0XkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVzcGVjdWxhcmxpZ2h0aW5nXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6ZmVzcG90bGlnaHReQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZXRpbGVeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmZXR1cmJ1bGVuY2VeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpmaWx0ZXJeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2Zzpmb3JlaWdub2JqZWN0XkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2ZzpnXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2ZzpncmFkaWVudF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOmltYWdlXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2ZzpsaW5lXkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICAgICAnQHN2ZzpsaW5lYXJncmFkaWVudF5Ac3ZnOmdyYWRpZW50fCcsXG4gICAgICAgICAgJ0Bzdmc6bXBhdGheQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzptYXJrZXJeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzptYXNrXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6bWV0YWRhdGFeQHN2Zzp8JyxcbiAgICAgICAgICAnQHN2ZzpwYXRoXkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICAgICAnQHN2ZzpwYXR0ZXJuXkBzdmc6fCcsXG4gICAgICAgICAgJ0Bzdmc6cG9seWdvbl5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAgICAgJ0Bzdmc6cG9seWxpbmVeQHN2ZzpnZW9tZXRyeXwnLFxuICAgICAgICAgICdAc3ZnOnJhZGlhbGdyYWRpZW50XkBzdmc6Z3JhZGllbnR8JyxcbiAgICAgICAgICAnQHN2ZzpyZWN0XkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICAgICAnQHN2ZzpzdmdeQHN2ZzpncmFwaGljc3wjY3VycmVudFNjYWxlLCN6b29tQW5kUGFuJyxcbiAgICAgICAgICAnQHN2ZzpzY3JpcHReQHN2Zzp8dHlwZScsXG4gICAgICAgICAgJ0Bzdmc6c2V0XkBzdmc6YW5pbWF0aW9ufCcsXG4gICAgICAgICAgJ0Bzdmc6c3RvcF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOnN0eWxlXkBzdmc6fCFkaXNhYmxlZCxtZWRpYSx0aXRsZSx0eXBlJyxcbiAgICAgICAgICAnQHN2Zzpzd2l0Y2heQHN2ZzpncmFwaGljc3wnLFxuICAgICAgICAgICdAc3ZnOnN5bWJvbF5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOnRleHRjb250ZW50XkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICAgICAnQHN2Zzp0ZXh0cG9zaXRpb25pbmdeQHN2Zzp0ZXh0Y29udGVudHwnLFxuICAgICAgICAgICdAc3ZnOnRzcGFuXkBzdmc6dGV4dHBvc2l0aW9uaW5nfCcsXG4gICAgICAgICAgJ0Bzdmc6dGV4dF5Ac3ZnOnRleHRwb3NpdGlvbmluZ3wnLFxuICAgICAgICAgICdAc3ZnOnRleHRwYXRoXkBzdmc6dGV4dGNvbnRlbnR8JyxcbiAgICAgICAgICAnQHN2Zzp0aXRsZV5Ac3ZnOnwnLFxuICAgICAgICAgICdAc3ZnOnVzZV5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAgICAgJ0Bzdmc6dmlld15Ac3ZnOnwjem9vbUFuZFBhbidcbiAgICAgICAgXSk7XG5cbmNvbnN0IGF0dHJUb1Byb3BNYXAgPSA8e1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9PkNPTlNUX0VYUFIoe1xuICAnY2xhc3MnOiAnY2xhc3NOYW1lJyxcbiAgJ2lubmVySHRtbCc6ICdpbm5lckhUTUwnLFxuICAncmVhZG9ubHknOiAncmVhZE9ubHknLFxuICAndGFiaW5kZXgnOiAndGFiSW5kZXgnXG59KTtcblxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IGltcGxlbWVudHMgRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IHtcbiAgc2NoZW1hID0gPHtbZWxlbWVudDogc3RyaW5nXToge1twcm9wZXJ0eTogc3RyaW5nXTogc3RyaW5nfX0+e307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgUFJPUEVSVElFUy5mb3JFYWNoKGVuY29kZWRUeXBlID0+IHtcbiAgICAgIHZhciBwYXJ0cyA9IGVuY29kZWRUeXBlLnNwbGl0KCd8Jyk7XG4gICAgICB2YXIgcHJvcGVydGllcyA9IHBhcnRzWzFdLnNwbGl0KCcsJyk7XG4gICAgICB2YXIgdHlwZVBhcnRzID0gKHBhcnRzWzBdICsgJ14nKS5zcGxpdCgnXicpO1xuICAgICAgdmFyIHR5cGVOYW1lID0gdHlwZVBhcnRzWzBdO1xuICAgICAgdmFyIHR5cGUgPSB0aGlzLnNjaGVtYVt0eXBlTmFtZV0gPSA8e1twcm9wZXJ0eTogc3RyaW5nXTogc3RyaW5nfT57fTtcbiAgICAgIHZhciBzdXBlclR5cGUgPSB0aGlzLnNjaGVtYVt0eXBlUGFydHNbMV1dO1xuICAgICAgaWYgKGlzUHJlc2VudChzdXBlclR5cGUpKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChzdXBlclR5cGUsICh2LCBrKSA9PiB0eXBlW2tdID0gdik7XG4gICAgICB9XG4gICAgICBwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHByb3BlcnR5ID09ICcnKSB7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkuc3RhcnRzV2l0aCgnKicpKSB7XG4gICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gRVZFTlQ7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkuc3RhcnRzV2l0aCgnIScpKSB7XG4gICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gQk9PTEVBTjtcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eS5zdGFydHNXaXRoKCcjJykpIHtcbiAgICAgICAgICB0eXBlW3Byb3BlcnR5LnN1YnN0cmluZygxKV0gPSBOVU1CRVI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHlwZVtwcm9wZXJ0eV0gPSBTVFJJTkc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pXG4gIH1cblxuICBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAodGFnTmFtZS5pbmRleE9mKCctJykgIT09IC0xKSB7XG4gICAgICAvLyBjYW4ndCB0ZWxsIG5vdyBhcyB3ZSBkb24ndCBrbm93IHdoaWNoIHByb3BlcnRpZXMgYSBjdXN0b20gZWxlbWVudCB3aWxsIGdldFxuICAgICAgLy8gb25jZSBpdCBpcyBpbnN0YW50aWF0ZWRcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZWxlbWVudFByb3BlcnRpZXMgPSB0aGlzLnNjaGVtYVt0YWdOYW1lLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFpc1ByZXNlbnQoZWxlbWVudFByb3BlcnRpZXMpKSB7XG4gICAgICAgIGVsZW1lbnRQcm9wZXJ0aWVzID0gdGhpcy5zY2hlbWFbJ3Vua25vd24nXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ByZXNlbnQoZWxlbWVudFByb3BlcnRpZXNbcHJvcE5hbWVdKTtcbiAgICB9XG4gIH1cblxuICBnZXRNYXBwZWRQcm9wTmFtZShwcm9wTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgbWFwcGVkUHJvcE5hbWUgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChhdHRyVG9Qcm9wTWFwLCBwcm9wTmFtZSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChtYXBwZWRQcm9wTmFtZSkgPyBtYXBwZWRQcm9wTmFtZSA6IHByb3BOYW1lO1xuICB9XG59XG4iXX0=