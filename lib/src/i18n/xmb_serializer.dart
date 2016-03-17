library angular2.src.i18n.xmb_serializer;

import "package:angular2/src/facade/lang.dart" show isPresent;
import "message.dart" show Message, id;

String serialize(List<Message> messages) {
  var ms = messages.map((m) => _serializeMessage(m)).toList().join("");
  return '''<message-bundle>${ ms}</message-bundle>''';
}

String _serializeMessage(Message m) {
  var desc =
      isPresent(m.description) ? ''' desc=\'${ m . description}\'''' : "";
  return '''<msg id=\'${ id ( m )}\'${ desc}>${ m . content}</msg>''';
}
