export function createConnection(endNodeId) {
    document.nodes[document.selectedNodeId].connections["temp"] = {
        node: endNodeId,
        replaceChar: "",
        move: "S",
        arrowCurve: 0,
    }
    if (document.selectedNodeId !== endNodeId) {
        for (const char in document.nodes[endNodeId].connections) {
            if (document.nodes[endNodeId].connections[char].node === document.selectedNodeId) {
                if (Math.abs(document.nodes[endNodeId].connections[char].arrowCurve) < 25) {
                    const d = Math.abs(25 - document.nodes[endNodeId].connections[char].arrowCurve);
                    for (const char2 in document.nodes[endNodeId].connections) {
                        if (document.nodes[endNodeId].connections[char2].node === document.selectedNodeId && document.nodes[endNodeId].connections[char2].arrowCurve > -25) {
                            document.nodes[endNodeId].connections[char2].arrowCurve += d;
                        }
                    }
                }
                document.nodes[document.selectedNodeId].connections["temp"].arrowCurve = 25;
            }
        }
        for (const char in document.nodes[document.selectedNodeId].connections) {
            if (char !== "temp" && document.nodes[document.selectedNodeId].connections[char].node === endNodeId && document.nodes[document.selectedNodeId].connections[char].arrowCurve >= 0)
                document.nodes[document.selectedNodeId].connections[char].arrowCurve += 50;
        }
    } else {
        for (const char in document.nodes[endNodeId].connections) {
            if (document.nodes[endNodeId].connections[char].node === document.selectedNodeId && char !== "temp") {
                document.nodes[endNodeId].connections[char].arrowCurve = Math.max(document.nodes[endNodeId].connections[char].arrowCurve + 20, 125);
            }
        }
    }
    editConnection(document.selectedNodeId, "temp");
}

export function editConnection(nodeId, char) {
    document.editingConnection = true;
    document.editingConnection = { node: nodeId, char: char }
    document.update();
}

export function applyConnectionChanges() {
    const newChar = document.getElementsByClassName("connection-input")[0].value;
    const replaceChar = document.getElementsByClassName("connection-input")[1].value;
    const move = document.getElementsByClassName("connection-input")[2].value;
    if (["L", "R", "S"].includes(move) && !Object.keys(document.nodes[document.editingConnection.node].connections).includes(newChar)) {
        const endNode = document.nodes[document.editingConnection.node].connections[document.editingConnection.char].node;
        const arrowCurve = document.nodes[document.editingConnection.node].connections[document.editingConnection.char].arrowCurve;
        delete document.nodes[document.editingConnection.node].connections[document.editingConnection.char];
        document.nodes[document.editingConnection.node].connections[newChar] = {
            node: endNode,
            replaceChar: replaceChar,
            move: move,
            arrowCurve: arrowCurve,
        }
        document.tempNode = "";
        return true;
    }
    return false;
}

export function cancelConnection() {
    for (const id in document.nodes) {
        delete document.nodes[id].connections["temp"];
    }
    document.editingConnection = false;
    delete document.nodes[document.tempNode];
    document.update();
}

export function removeConnection(nodeId, char) {
    delete document.nodes[nodeId].connections[char];
}