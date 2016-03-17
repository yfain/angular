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
import "package:angular2/src/i18n/message.dart" show Message, id;
import "package:angular2/src/i18n/xmb_serializer.dart" show serialize;

main() {
  describe("Xmb Serialization", () {
    it("should return an empty message bundle for an empty list of messages",
        () {
      expect(serialize([])).toEqual("<message-bundle></message-bundle>");
    });
    it("should serialize messages without desc", () {
      var m = new Message("content", "meaning", null);
      var expected =
          '''<message-bundle><msg id=\'${ id ( m )}\'>content</msg></message-bundle>''';
      expect(serialize([m])).toEqual(expected);
    });
    it("should serialize messages with desc", () {
      var m = new Message("content", "meaning", "description");
      var expected =
          '''<message-bundle><msg id=\'${ id ( m )}\' desc=\'description\'>content</msg></message-bundle>''';
      expect(serialize([m])).toEqual(expected);
    });
  });
}
