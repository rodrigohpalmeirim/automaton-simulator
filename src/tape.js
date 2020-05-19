export function updateTape() {
    while (-document.tapePos < document.tapeHeight * (document.firstKey + 1)) {
        document.firstKey--;
        document.initChars[document.firstKey] = "";
        document.chars[document.firstKey] = "";
    }
    while (window.innerWidth > document.tapeHeight * document.lastKey + document.tapePos) {
        document.lastKey++;
        document.initChars[document.lastKey] = "";
        document.chars[document.lastKey] = "";
    }
    document.update();
}

export function dragTape(event) {
    document.tapePos = event.pageX - document.tapeMouseDownHandler;
    updateTape();
}

export function tapeMouseDownHandler(event) {
    if (event.button === 0) {
        document.tapeMouseDownHandler = event.pageX - document.tapePos;
        document.addEventListener("mousemove", dragTape);
    }
}