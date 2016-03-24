library angular2.src.i18n.i18n_html_parser;

import "package:angular2/src/compiler/html_parser.dart"
    show HtmlParser, HtmlParseTreeResult;
import "package:angular2/src/compiler/parse_util.dart"
    show ParseSourceSpan, ParseError;
import "package:angular2/src/compiler/html_ast.dart"
    show
        HtmlAst,
        HtmlAstVisitor,
        HtmlElementAst,
        HtmlAttrAst,
        HtmlTextAst,
        HtmlCommentAst,
        htmlVisitAll;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, StringMapWrapper;
import "package:angular2/src/facade/lang.dart"
    show RegExpWrapper, NumberWrapper, isPresent;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/core/change_detection/parser/parser.dart"
    show Parser;
import "message.dart" show Message, id;
import "shared.dart"
    show
        messageFromAttribute,
        I18nError,
        isI18nAttr,
        partition,
        Part,
        stringifyNodes,
        meaning;

const I18N_ATTR = "i18n";
const PLACEHOLDER_ELEMENT = "ph";
const NAME_ATTR = "name";
const I18N_ATTR_PREFIX = "i18n-";
var PLACEHOLDER_REGEXP =
    RegExpWrapper.create('''\\<ph(\\s)+name=("(\\d)+")\\/\\>''');
var PLACEHOLDER_EXPANDED_REGEXP =
    RegExpWrapper.create('''\\<ph(\\s)+name=("(\\d)+")\\>\\<\\/ph\\>''');

/**
 * Creates an i18n-ed version of the parsed template.
 *
 * Algorithm:
 *
 * To understand the algorithm, you need to know how partitioning works.
 * Partitioning is required as we can use two i18n comments to group node siblings together.
 * That is why we cannot just use nodes.
 *
 * Partitioning transforms an array of HtmlAst into an array of Part.
 * A part can optionally contain a root element or a root text node. And it can also contain
 * children.
 * A part can contain i18n property, in which case it needs to be transalted.
 *
 * Example:
 *
 * The following array of nodes will be split into four parts:
 *
 * ```
 * <a>A</a>
 * <b i18n>B</b>
 * <!-- i18n -->
 * <c>C</c>
 * D
 * <!-- /i18n -->
 * E
 * ```
 *
 * Part 1 containing the a tag. It should not be translated.
 * Part 2 containing the b tag. It should be translated.
 * Part 3 containing the c tag and the D text node. It should be translated.
 * Part 4 containing the E text node. It should not be translated.
 *
 *
 * It is also important to understand how we stringify nodes to create a message.
 *
 * We walk the tree and replace every element node with a placeholder. We also replace
 * all expressions in interpolation with placeholders. We also insert a placeholder element
 * to wrap a text node containing interpolation.
 *
 * Example:
 *
 * The following tree:
 *
 * ```
 * <a>A{{I}}</a><b>B</b>
 * ```
 *
 * will be stringified into:
 * ```
 * <ph name="e0"><ph name="t1">A<ph name="0"/></ph></ph><ph name="e2">B</ph>
 * ```
 *
 * This is what the algorithm does:
 *
 * 1. Use the provided html parser to get the html AST of the template.
 * 2. Partition the root nodes, and process each part separately.
 * 3. If a part does not have the i18n attribute, recurse to process children and attributes.
 * 4. If a part has the i18n attribute, merge the translated i18n part with the original tree.
 *
 * This is how the merging works:
 *
 * 1. Use the stringify function to get the message id. Look up the message in the map.
 * 2. Parse the translated message. At this point we have two trees: the original tree
 * and the translated tree, where all the elements are replaced with placeholders.
 * 3. Use the original tree to create a mapping Index:number -> HtmlAst.
 * 4. Walk the translated tree.
 * 5. If we encounter a placeholder element, get is name property.
 * 6. Get the type and the index of the node using the name property.
 * 7. If the type is 'e', which means element, then:
 *     - translate the attributes of the original element
 *     - recurse to merge the children
 *     - create a new element using the original element name, original position,
 *     and translated children and attributes
 * 8. If the type if 't', which means text, then:
 *     - get the list of expressions from the original node.
 *     - get the string version of the interpolation subtree
 *     - find all the placeholders in the translated message, and replace them with the
 *     corresponding original expressions
 */
class I18nHtmlParser implements HtmlParser {
  HtmlParser _htmlParser;
  Parser _parser;
  Map<String, String> _messages;
  List<ParseError> errors;
  I18nHtmlParser(this._htmlParser, this._parser, this._messages) {}
  HtmlParseTreeResult parse(String sourceContent, String sourceUrl) {
    this.errors = [];
    var res = this._htmlParser.parse(sourceContent, sourceUrl);
    if (res.errors.length > 0) {
      return res;
    } else {
      var nodes = this._recurse(res.rootNodes);
      return this.errors.length > 0
          ? new HtmlParseTreeResult([], this.errors)
          : new HtmlParseTreeResult(nodes, []);
    }
  }

  List<HtmlAst> _processI18nPart(Part p) {
    try {
      return p.hasI18n ? this._mergeI18Part(p) : this._recurseIntoI18nPart(p);
    } catch (e, e_stack) {
      if (e is I18nError) {
        this.errors.add(e);
        return [];
      } else {
        rethrow;
      }
    }
  }

  List<HtmlAst> _mergeI18Part(Part p) {
    var messageId = id(p.createMessage(this._parser));
    if (!StringMapWrapper.contains(this._messages, messageId)) {
      throw new I18nError(
          p.sourceSpan, '''Cannot find message for id \'${ messageId}\'''');
    }
    // get the message and expand a placeholder so <ph/> becomes <ph></ph>

    // we need to do it cause we use HtmlParser to parse the message
    var message = _expandPlaceholder(this._messages[messageId]);
    var parsedMessage = this._htmlParser.parse(message, "source");
    if (parsedMessage.errors.length > 0) {
      this.errors = (new List.from(this.errors)..addAll(parsedMessage.errors));
      return [];
    } else {
      return this._mergeTrees(p, message, parsedMessage.rootNodes, p.children);
    }
  }

  List<HtmlAst> _recurseIntoI18nPart(Part p) {
    // we found an element without an i18n attribute

    // we need to recurse in cause its children may have i18n set

    // we also need to translate its attributes
    if (isPresent(p.rootElement)) {
      var root = p.rootElement;
      var children = this._recurse(p.children);
      var attrs = this._i18nAttributes(root);
      return [
        new HtmlElementAst(root.name, attrs, children, root.sourceSpan,
            root.startSourceSpan, root.endSourceSpan)
      ];
    } else if (isPresent(p.rootTextNode)) {
      return [p.rootTextNode];
    } else {
      return this._recurse(p.children);
    }
  }

  List<HtmlAst> _recurse(List<HtmlAst> nodes) {
    var ps = partition(nodes, this.errors);
    return ListWrapper
        .flatten(ps.map((p) => this._processI18nPart(p)).toList());
  }

  List<HtmlAst> _mergeTrees(Part p, String translatedSource,
      List<HtmlAst> translated, List<HtmlAst> original) {
    var l = new _CreateNodeMapping();
    htmlVisitAll(l, original);
    // merge the translated tree with the original tree.

    // we do it by preserving the source code position of the original tree
    var merged =
        this._mergeTreesHelper(translatedSource, translated, l.mapping);
    // if the root element is present, we need to create a new root element with its attributes

    // translated
    if (isPresent(p.rootElement)) {
      var root = p.rootElement;
      var attrs = this._i18nAttributes(root);
      return [
        new HtmlElementAst(root.name, attrs, merged, root.sourceSpan,
            root.startSourceSpan, root.endSourceSpan)
      ];
    } else if (isPresent(p.rootTextNode)) {
      throw new BaseException("should not be reached");
    } else {
      return merged;
    }
  }

  List<HtmlAst> _mergeTreesHelper(String translatedSource,
      List<HtmlAst> translated, List<HtmlAst> mapping) {
    return translated.map((t) {
      if (t is HtmlElementAst) {
        return this._mergeElementOrInterpolation(
            t, translatedSource, translated, mapping);
      } else if (t is HtmlTextAst) {
        return t;
      } else {
        throw new BaseException("should not be reached");
      }
    }).toList();
  }

  HtmlAst _mergeElementOrInterpolation(
      HtmlElementAst t,
      String translatedSource,
      List<HtmlAst> translated,
      List<HtmlAst> mapping) {
    var name = this._getName(t);
    var type = name[0];
    var index = NumberWrapper.parseInt(name.substring(1), 10);
    var originalNode = mapping[index];
    if (type == "t") {
      return this._mergeTextInterpolation(
          t, (originalNode as HtmlTextAst), translatedSource);
    } else if (type == "e") {
      return this._mergeElement(
          t, (originalNode as HtmlElementAst), mapping, translatedSource);
    } else {
      throw new BaseException("should not be reached");
    }
  }

  String _getName(HtmlElementAst t) {
    if (t.name != PLACEHOLDER_ELEMENT) {
      throw new I18nError(t.sourceSpan,
          '''Unexpected tag "${ t . name}". Only "${ PLACEHOLDER_ELEMENT}" tags are allowed.''');
    }
    var names = t.attrs.where((a) => a.name == NAME_ATTR).toList();
    if (names.length == 0) {
      throw new I18nError(
          t.sourceSpan, '''Missing "${ NAME_ATTR}" attribute.''');
    }
    return names[0].value;
  }

  HtmlTextAst _mergeTextInterpolation(
      HtmlElementAst t, HtmlTextAst originalNode, String translatedSource) {
    var split = this._parser.splitInterpolation(
        originalNode.value, originalNode.sourceSpan.toString());
    var exps = isPresent(split) ? split.expressions : [];
    var messageSubstring = translatedSource.substring(
        t.startSourceSpan.end.offset, t.endSourceSpan.start.offset);
    var translated = this._replacePlaceholdersWithExpressions(
        messageSubstring, exps, originalNode.sourceSpan);
    return new HtmlTextAst(translated, originalNode.sourceSpan);
  }

  HtmlElementAst _mergeElement(HtmlElementAst t, HtmlElementAst originalNode,
      List<HtmlAst> mapping, String translatedSource) {
    var children =
        this._mergeTreesHelper(translatedSource, t.children, mapping);
    return new HtmlElementAst(
        originalNode.name,
        this._i18nAttributes(originalNode),
        children,
        originalNode.sourceSpan,
        originalNode.startSourceSpan,
        originalNode.endSourceSpan);
  }

  List<HtmlAttrAst> _i18nAttributes(HtmlElementAst el) {
    var res = [];
    el.attrs.forEach((attr) {
      if (isI18nAttr(attr.name)) {
        var messageId = id(messageFromAttribute(this._parser, el, attr));
        var expectedName = attr.name.substring(5);
        var m = el.attrs.where((a) => a.name == expectedName).toList()[0];
        if (StringMapWrapper.contains(this._messages, messageId)) {
          var split =
              this._parser.splitInterpolation(m.value, m.sourceSpan.toString());
          var exps = isPresent(split) ? split.expressions : [];
          var message = this._replacePlaceholdersWithExpressions(
              _expandPlaceholder(this._messages[messageId]),
              exps,
              m.sourceSpan);
          res.add(new HtmlAttrAst(m.name, message, m.sourceSpan));
        } else {
          throw new I18nError(
              m.sourceSpan, '''Cannot find message for id \'${ messageId}\'''');
        }
      }
    });
    return res;
  }

  String _replacePlaceholdersWithExpressions(
      String message, List<String> exps, ParseSourceSpan sourceSpan) {
    return RegExpWrapper.replaceAll(PLACEHOLDER_EXPANDED_REGEXP, message,
        (match) {
      var nameWithQuotes = match[2];
      var name = nameWithQuotes.substring(1, nameWithQuotes.length - 1);
      var index = NumberWrapper.parseInt(name, 10);
      return this._convertIntoExpression(index, exps, sourceSpan);
    });
  }

  _convertIntoExpression(
      num index, List<String> exps, ParseSourceSpan sourceSpan) {
    if (index >= 0 && index < exps.length) {
      return '''{{${ exps [ index ]}}}''';
    } else {
      throw new I18nError(
          sourceSpan, '''Invalid interpolation index \'${ index}\'''');
    }
  }
}

class _CreateNodeMapping implements HtmlAstVisitor {
  List<HtmlAst> mapping = [];
  dynamic visitElement(HtmlElementAst ast, dynamic context) {
    this.mapping.add(ast);
    htmlVisitAll(this, ast.children);
    return null;
  }

  dynamic visitAttr(HtmlAttrAst ast, dynamic context) {
    return null;
  }

  dynamic visitText(HtmlTextAst ast, dynamic context) {
    this.mapping.add(ast);
    return null;
  }

  dynamic visitComment(HtmlCommentAst ast, dynamic context) {
    return "";
  }
}

String _expandPlaceholder(String input) {
  return RegExpWrapper.replaceAll(PLACEHOLDER_REGEXP, input, (match) {
    var nameWithQuotes = match[2];
    return '''<ph name=${ nameWithQuotes}></ph>''';
  });
}
