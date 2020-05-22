import { updateTape } from './tape';

var interval;

export function run() {
    if (document.nodes[document.startState]) {
        document.state = document.startState;
        document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;
        updateTape();
        document.update();
        setTimeout(() => { document.running = true; document.update(); }, 1);

        document.chars = JSON.parse(JSON.stringify(document.initChars));

        interval = setInterval(() => {
            for (const char in document.nodes[document.state].connections) {
                if (char === document.chars[document.focusedCharId]) {
                    const connection = document.nodes[document.state].connections[char];
                    document.chars[document.focusedCharId] = connection.replaceChar;
                    try {
                        document.querySelector("#tape input[num='" + document.focusedCharId + "']").value = connection.replaceChar;
                    } catch (e) { }
                    if (connection.move === "L") {
                        document.focusedCharId = document.focusedCharId - 1;
                    } else if (connection.move === "R") {
                        document.focusedCharId = document.focusedCharId + 1;
                    }
                    document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;
                    updateTape();
                    document.update();
                    document.state = connection.node;
                    break;
                }
            }
        }, 1000);
    }
}

export function stop() {
    clearInterval(interval);
    document.running = false;
    document.focusedCharId = document.startCharId;
    document.state = document.startState;
    for (const input of document.querySelectorAll("#tape input")) {
        input.value = document.initChars[input.getAttribute("num")];
    }
    document.update();
}