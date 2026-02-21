var ws = new WebSocket('wss://jetstream2.us-east.bsky.network/subscribe');

ws.onopen = () => {
  ws.send(JSON.stringify({
    "type": "options_update",
    "payload": {
      "wantedCollections": ["app.bsky.feed.post"],
      "maxMessageSizeBytes": 100
    }
  }));
};

var ignoredStrings = ["@", "bsky.social", "http", "test", "/"];
var badWords = [
  "ass",
  "arse",
  "bastard",
  "bitch",
  "cock",
  "crap",
  "cum",
  "cunt",
  "dick",
  "dyke",
  "fag",
  "fuck",
  "nigga",
  "piss",
  "prick",
  "pussy",
  "shit",
  "slut",
  "twat",
  "wank"
];

var coords = [];

ws.onmessage = (event) => {
  var data = JSON.parse(event.data);
  if (data.kind !== "commit") return;
  var record = data.commit.record;
  if (!record) return;
  if (!record.langs || record.langs[0] !== "en") return;
  if (record.text.length > 50) return;
  if (record.text.length < 5) return;
  if (record.embed) return;
  if (record.reply) return;

  // match only ascii symbols
  if (!record.text.match(/^[\x20-\x7F]+$/)) return;

  for (var str of ignoredStrings) {
    if (record.text.toLowerCase().includes(str)) return;
  }

  for (var word of badWords) {
    if (record.text.toLowerCase().includes(word)) return;
  }

  var left = 0;
  var top = 0;
  var topRand = 0;

  while (!left && !top) {
    left = (10 + Math.random() * 80) * Math.max(300, window.innerWidth) / 100;
    topRand = Math.random();
    top = (50 + topRand * 35) * Math.max(300, window.innerHeight) / 100;

    for (var coord of coords) {
      var dx = Math.abs(left - coord.left);
      var dy = Math.abs(top - coord.top);
      if (dx < 200 && dy < 30) {
        left = 0;
        top = 0;
        break;
      }
    }
  }

  var coord = { left, top };
  coords.push(coord);

  var duration = Math.round((8 - topRand * 3) * 1000);

  var thoughtEl = document.createElement("div");
  thoughtEl.className = "thought";
  thoughtEl.textContent = record.text;
  thoughtEl.style.left = left + "px";
  thoughtEl.style.top = top + "px";
  thoughtEl.style.animationDuration = duration + "ms";
  document.body.appendChild(thoughtEl);
  setTimeout(() => {
    document.body.removeChild(thoughtEl);
    coords = coords.filter(c => c !== coord);
  }, duration);
};