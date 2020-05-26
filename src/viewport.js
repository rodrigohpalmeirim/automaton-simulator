export function centerViewport() {
    var minX = window.innerWidth / 2;
    var maxX = window.innerWidth / 2;
    var minY = (window.innerHeight - document.tapeHeight) / 2;
    var maxY = (window.innerHeight - document.tapeHeight) / 2;

    console.log(document.nodes)
    for (const id in document.nodes) {
        if (document.nodes[id].x < minX) minX = document.nodes[id].x;
        if (document.nodes[id].x > maxX) maxX = document.nodes[id].x;
        if (document.nodes[id].y < minY) minY = document.nodes[id].y;
        if (document.nodes[id].y > maxY) maxY = document.nodes[id].y;
    }
    console.log(minX, maxX)
    document.viewportPos = {
        x: window.innerWidth / 2 - (minX + maxX) / 2,
        y: (window.innerHeight - document.tapeHeight) / 2 - (minY + maxY) / 2
    }
    document.update();
}

export function pan(event) {
    document.viewportPos.x = event.pageX - document.offset.x;
    document.viewportPos.y = event.pageY - document.offset.y;
    document.update();
}