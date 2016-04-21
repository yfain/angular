import {Injectable} from 'angular2/src/core/di';
import {isPresent, CONST_EXPR} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {ElementSchemaRegistry} from './element_schema_registry';

const EVENT = 'event';
const BOOLEAN = 'boolean';
const NUMBER = 'number';
const STRING = 'string';
const PROPERTIES: string[] =
    CONST_EXPR(
        [
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

const attrToPropMap = <{[name: string]: string}>CONST_EXPR({
  'class': 'className',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex'
});


@Injectable()
export class DomElementSchemaRegistry implements ElementSchemaRegistry {
  schema = <{[element: string]: {[property: string]: string}}>{};

  constructor() {
    PROPERTIES.forEach(encodedType => {
      var parts = encodedType.split('|');
      var properties = parts[1].split(',');
      var typeParts = (parts[0] + '^').split('^');
      var typeName = typeParts[0];
      var type = this.schema[typeName] = <{[property: string]: string}>{};
      var superType = this.schema[typeParts[1]];
      if (isPresent(superType)) {
        StringMapWrapper.forEach(superType, (v, k) => type[k] = v);
      }
      properties.forEach((property: string) => {
        if (property == '') {
        } else if (property.startsWith('*')) {
          type[property.substring(1)] = EVENT;
        } else if (property.startsWith('!')) {
          type[property.substring(1)] = BOOLEAN;
        } else if (property.startsWith('#')) {
          type[property.substring(1)] = NUMBER;
        } else {
          type[property] = STRING;
        }
      });
    })
  }

  hasProperty(tagName: string, propName: string): boolean {
    if (tagName.indexOf('-') !== -1) {
      // can't tell now as we don't know which properties a custom element will get
      // once it is instantiated
      return true;
    } else {
      var elementProperties = this.schema[tagName.toLowerCase()];
      if (!isPresent(elementProperties)) {
        elementProperties = this.schema['unknown'];
      }
      return isPresent(elementProperties[propName]);
    }
  }

  getMappedPropName(propName: string): string {
    var mappedPropName = StringMapWrapper.get(attrToPropMap, propName);
    return isPresent(mappedPropName) ? mappedPropName : propName;
  }
}
