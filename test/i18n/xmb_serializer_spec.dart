library angular2.test.i18n.xmb_serializer_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xdescribe,
        xit;
import "package:angular2/src/compiler/html_ast.dart" show HtmlAst;
import "package:angular2/src/i18n/message.dart" show Message, id;
import "package:angular2/src/i18n/xmb_serializer.dart"
    show serializeXmb, deserializeXmb;
import "package:angular2/src/compiler/parse_util.dart"
    show ParseSourceSpan, ParseError;

main() {
  describe("Xmb", () {
    describe("Xmb Serialization", () {
      it("should return an empty message bundle for an empty list of messages",
          () {
        expect(serializeXmb([])).toEqual("<message-bundle></message-bundle>");
      });
      it("should serializeXmb messages without desc", () {
        var m = new Message("content", "meaning", null);
        var expected =
            '''<message-bundle><msg id=\'${ id ( m )}\'>content</msg></message-bundle>''';
        expect(serializeXmb([m])).toEqual(expected);
      });
      it("should serializeXmb messages with desc", () {
        var m = new Message("content", "meaning", "description");
        var expected =
            '''<message-bundle><msg id=\'${ id ( m )}\' desc=\'description\'>content</msg></message-bundle>''';
        expect(serializeXmb([m])).toEqual(expected);
      });
    });
    describe("Xmb Deserialization", () {
      it("should parse an empty bundle", () {
        var mb = "<message-bundle></message-bundle>";
        expect(deserializeXmb(mb, "url").messages).toEqual({});
      });
      it("should parse an non-empty bundle", () {
        var mb = '''
          <message-bundle>
            <msg id="id1" desc="description1">content1</msg>
            <msg id="id2">content2</msg>
          </message-bundle>
        ''';
        var parsed = deserializeXmb(mb, "url").messages;
        expect(_serialize(parsed["id1"])).toEqual("content1");
        expect(_serialize(parsed["id2"])).toEqual("content2");
      });
      it("should error when cannot parse the content", () {
        var mb = '''
          <message-bundle>
            <msg id="id1" desc="description1">content
          </message-bundle>
        ''';
        var res = deserializeXmb(mb, "url");
        expect(_serializeErrors(res.errors))
            .toEqual(["Unexpected closing tag \"message-bundle\""]);
      });
      it("should error when cannot find the id attribute", () {
        var mb = '''
          <message-bundle>
            <msg>content</msg>
          </message-bundle>
        ''';
        var res = deserializeXmb(mb, "url");
        expect(_serializeErrors(res.errors))
            .toEqual(["\"id\" attribute is missing"]);
      });
      it("should error on empty content", () {
        var mb = '''''';
        var res = deserializeXmb(mb, "url");
        expect(_serializeErrors(res.errors))
            .toEqual(["Missing element \"message-bundle\""]);
      });
      it("should error on an invalid element", () {
        var mb = '''
          <message-bundle>
            <invalid>content</invalid>
          </message-bundle>
        ''';
        var res = deserializeXmb(mb, "url");
        expect(_serializeErrors(res.errors))
            .toEqual(["Unexpected element \"invalid\""]);
      });
      it("should expand 'ph' elements", () {
        var mb = '''
          <message-bundle>
            <msg id="id1">a<ph name="i0"/></msg>
          </message-bundle>
        ''';
        var res = deserializeXmb(mb, "url").messages["id1"];
        expect(((res[1] as dynamic)).name).toEqual("ph");
      });
    });
  });
}

String _serialize(List<HtmlAst> nodes) {
  return ((nodes[0] as dynamic)).value;
}

List<String> _serializeErrors(List<ParseError> errors) {
  return errors.map((e) => e.msg).toList();
}
