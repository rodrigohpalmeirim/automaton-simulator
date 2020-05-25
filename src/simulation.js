import { updateTape } from './tape';

var interval;

function loop() {
    document.stalled = true;
    for (const char in document.nodes[document.state].connections) {
        if (char === document.chars[document.focusedCharId]) {
            document.stalled = false;
            const connection = document.nodes[document.state].connections[char];
            document.chars[document.focusedCharId] = connection.newChar;
            try {
                document.querySelector("#tape input[num='" + document.focusedCharId + "']").value = connection.newChar;
            } catch (e) { }
            if (connection.move === "L") {
                document.focusedCharId = document.focusedCharId - 1;
            } else if (connection.move === "R") {
                document.focusedCharId = document.focusedCharId + 1;
            }
            document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;
            updateTape();
            document.state = connection.node;
            document.update();
            break;
        }
    }
    document.update();
}

export function run() {
    if (document.nodes[document.startState]) {
        document.state = document.startState;
        document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;
        updateTape();
        document.update();
        setTimeout(() => { document.running = true; document.update(); }, 1);

        document.chars = JSON.parse(JSON.stringify(document.initChars));

        interval = setInterval(loop, 1000 / document.speed);
    }
}

export function stop() {
    clearInterval(interval);
    document.running = false;
    document.stalled = false;
    document.focusedCharId = document.startCharId;
    document.state = document.startState;
    for (const input of document.querySelectorAll("#tape input")) {
        input.value = document.initChars[input.getAttribute("num")];
    }
    document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;
    updateTape();
    document.update();
}

export function changeSpeed(speed) {
    document.speed = speed;
    document.update();
    if (document.running) {
        clearInterval(interval);
        interval = setInterval(loop, 1000 / document.speed);
    }
}