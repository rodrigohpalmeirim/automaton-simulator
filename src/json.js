import { updateTape } from './tape';
import { reset } from './App'

export function parseJSON(json) {
    try {
        json = JSON.parse(json);
        if (typeof json["startState"] !== "string" ||
            typeof json["tape"]["string"] !== "string" ||
            typeof json["tape"]["startPos"] !== "number") {
            throw TypeError;
        }
        document.startState = json["startState"];
        document.state = document.startState;
        document.nodes = json["nodes"];
        document.initChars = {};
        document.firstKey = -json["tape"]["startPos"];
        document.firstTapePos = document.firstKey;
        for (var i = 0; i < json["tape"]["string"].length; i++) {
            document.initChars[i + document.firstTapePos] = json["tape"]["string"][i] === " " ? "" : json["tape"]["string"][i];
        }
        document.lastKey = i - 1 + document.firstTapePos;
        document.lastTapePos = document.lastKey;
        document.startCharId = 0;
        document.focusedCharId = document.startCharId;
        updateTape();
        for (const input of document.querySelectorAll("#tape input")) {
            input.value = document.initChars[input.getAttribute("num")];
        }
    } catch (e) {
        if (document.firstUpdate) {
            window.localStorage.removeItem("json");
            reset();
        } else {
            parseJSON(window.localStorage.getItem("json"));
        }
    }
    document.update();
}

export function updateJSON() {
    var tape = "";
    for (var i = document.firstTapePos; i <= document.lastTapePos; i++) {
        tape += document.initChars[i] === "" ? " " : document.initChars[i];
    }
    const json = JSON.stringify({
        startState: document.startState,
        nodes: document.nodes,
        tape: { string: tape, startPos: -document.firstTapePos + document.startCharId }
    }, null, 2);
    try {
        if (!document.freeEdit)
            document.getElementById("json").value = json;
    } catch (e) { }
    return json;
}