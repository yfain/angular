library angular2.src.i18n.message_extractor;

import "package:angular2/src/compiler/html_parser.dart" show HtmlParser;
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
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/core/change_detection/parser/parser.dart"
    show Parser;
import "package:angular2/src/core/change_detection/parser/ast.dart"
    show Interpolation;
import "message.dart" show Message, id;

const I18N_ATTR = "i18n";
const I18N_ATTR_PREFIX = "i18n-";

/**
 * All messages extracted from a template.
 */
class ExtractionResult {
  List<Message> messages;
  List<ParseError> errors;
  ExtractionResult(this.messages, this.errors) {}
}

/**
 * An extraction error.
 */
class I18nExtractionError extends ParseError {
  I18nExtractionError(ParseSourceSpan span, String msg) : super(span, msg) {
    /* super call moved to initializer */;
  }
}

/**
 * Removes duplicate messages.
 *
 * E.g.
 *
 * ```
 *  var m = [new Message("message", "meaning", "desc1"), new Message("message", "meaning",
 * "desc2")];
 *  expect(removeDuplicates(m)).toEqual([new Message("message", "meaning", "desc1")]);
 * ```
 */
List<Message> removeDuplicates(List<Message> messages) {
  Map<String, Message> uniq = {};
  messages.forEach((m) {
    if (!StringMapWrapper.contains(uniq, id(m))) {
      uniq[id(m)] = m;
    }
  });
  return StringMapWrapper.values(uniq);
}

/**
 * Extracts all messages from a template.
 *
 * It works like this. First, the extractor uses the provided html parser to get
 * the html AST of the template. Then it partitions the root nodes into parts.
 * Everything between two i18n comments becomes a single part. Every other nodes becomes
 * a part too.
 *
 * We process every part as follows. Say we have a part A.
 *
 * If the part has the i18n attribute, it gets converted into a message.
 * And we do not recurse into that part, except to extract messages from the attributes.
 *
 * If the part doesn't have the i18n attribute, we recurse into that part and
 * partition its children.
 *
 * While walking the AST we also remove i18n attributes from messages.
 */
class MessageExtractor {
  HtmlParser _htmlParser;
  Parser _parser;
  List<Message> messages;
  List<ParseError> errors;
  MessageExtractor(this._htmlParser, this._parser) {}
  ExtractionResult extract(String template, String sourceUrl) {
    this.messages = [];
    this.errors = [];
    var res = this._htmlParser.parse(template, sourceUrl);
    if (res.errors.length > 0) {
      return new ExtractionResult([], res.errors);
    } else {
      var ps = this._partition(res.rootNodes);
      ps.forEach((p) => this._extractMessagesFromPart(p));
      return new ExtractionResult(this.messages, this.errors);
    }
  }

  void _extractMessagesFromPart(_Part p) {
    if (p.hasI18n) {
      this.messages.add(new Message(_stringifyNodes(p.children, this._parser),
          _meaning(p.i18n), _description(p.i18n)));
      this._recurseToExtractMessagesFromAttributes(p.children);
    } else {
      this._recurse(p.children);
    }
    if (isPresent(p.rootElement)) {
      this._extractMessagesFromAttributes(p.rootElement);
    }
  }

  void _recurse(List<HtmlAst> nodes) {
    var ps = this._partition(nodes);
    ps.forEach((p) => this._extractMessagesFromPart(p));
  }

  void _recurseToExtractMessagesFromAttributes(List<HtmlAst> nodes) {
    nodes.forEach((n) {
      if (n is HtmlElementAst) {
        this._extractMessagesFromAttributes(n);
        this._recurseToExtractMessagesFromAttributes(n.children);
      }
    });
  }

  void _extractMessagesFromAttributes(HtmlElementAst p) {
    p.attrs.forEach((attr) {
      if (attr.name.startsWith(I18N_ATTR_PREFIX)) {
        var expectedName = attr.name.substring(5);
        var matching = p.attrs.where((a) => a.name == expectedName).toList();
        if (matching.length > 0) {
          var value = _removeInterpolation(
              matching[0].value, p.sourceSpan, this._parser);
          this.messages.add(new Message(
              value, _meaning(attr.value), _description(attr.value)));
        } else {
          this.errors.add(new I18nExtractionError(
              p.sourceSpan, '''Missing attribute \'${ expectedName}\'.'''));
        }
      }
    });
  }

  // Man, this is so ugly!
  List<_Part> _partition(List<HtmlAst> nodes) {
    var res = [];
    for (var i = 0; i < nodes.length; ++i) {
      var n = nodes[i];
      var temp = [];
      if (_isOpeningComment(n)) {
        var i18n = ((n as HtmlCommentAst)).value.substring(5).trim();
        i++;
        while (!_isClosingComment(nodes[i])) {
          temp.add(nodes[i++]);
          if (identical(i, nodes.length)) {
            this.errors.add(new I18nExtractionError(
                n.sourceSpan, "Missing closing 'i18n' comment."));
            break;
          }
        }
        res.add(new _Part(null, temp, i18n, true));
      } else if (n is HtmlElementAst) {
        var i18n = _findI18nAttr(n);
        res.add(new _Part(n, n.children, isPresent(i18n) ? i18n.value : null,
            isPresent(i18n)));
      }
    }
    return res;
  }
}

class _Part {
  HtmlElementAst rootElement;
  List<HtmlAst> children;
  String i18n;
  bool hasI18n;
  _Part(this.rootElement, this.children, this.i18n, this.hasI18n) {}
}

bool _isOpeningComment(HtmlAst n) {
  return n is HtmlCommentAst &&
      isPresent(n.value) &&
      n.value.startsWith("i18n:");
}

bool _isClosingComment(HtmlAst n) {
  return n is HtmlCommentAst && isPresent(n.value) && n.value == "/i18n";
}

_stringifyNodes(List<HtmlAst> nodes, Parser parser) {
  var visitor = new _StringifyVisitor(parser);
  return htmlVisitAll(visitor, nodes).join("");
}

class _StringifyVisitor implements HtmlAstVisitor {
  Parser _parser;
  _StringifyVisitor(this._parser) {}
  dynamic visitElement(HtmlElementAst ast, dynamic context) {
    var attrs = this._join(htmlVisitAll(this, ast.attrs), " ");
    var children = this._join(htmlVisitAll(this, ast.children), "");
    return '''<${ ast . name} ${ attrs}>${ children}</${ ast . name}>''';
  }

  dynamic visitAttr(HtmlAttrAst ast, dynamic context) {
    if (ast.name.startsWith(I18N_ATTR_PREFIX)) {
      return "";
    } else {
      return '''${ ast . name}="${ ast . value}"''';
    }
  }

  dynamic visitText(HtmlTextAst ast, dynamic context) {
    return _removeInterpolation(ast.value, ast.sourceSpan, this._parser);
  }

  dynamic visitComment(HtmlCommentAst ast, dynamic context) {
    return "";
  }

  String _join(List<String> strs, String str) {
    return strs.where((s) => s.length > 0).toList().join(str);
  }
}

String _removeInterpolation(
    String value, ParseSourceSpan source, Parser parser) {
  try {
    var parsed = parser.parseInterpolation(value, source.toString());
    if (isPresent(parsed)) {
      Interpolation ast = (parsed.ast as dynamic);
      var res = "";
      for (var i = 0; i < ast.strings.length; ++i) {
        res += ast.strings[i];
        if (i != ast.strings.length - 1) {
          res += '''{{I${ i}}}''';
        }
      }
      return res;
    } else {
      return value;
    }
  } catch (e, e_stack) {
    return value;
  }
}

HtmlAttrAst _findI18nAttr(HtmlElementAst p) {
  var i18n = p.attrs.where((a) => a.name == I18N_ATTR).toList();
  return i18n.length == 0 ? null : i18n[0];
}

String _meaning(String i18n) {
  if (isBlank(i18n) || i18n == "") return null;
  return i18n.split("|")[0];
}

String _description(String i18n) {
  if (isBlank(i18n) || i18n == "") return null;
  var parts = i18n.split("|");
  return parts.length > 1 ? parts[1] : null;
}
