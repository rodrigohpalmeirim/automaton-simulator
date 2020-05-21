import React from 'react';
import { dragArrow } from './arrow';
import { removeConnection } from './connection';

export function renderNode(id) {
    if (typeof document.nodes[id].x !== "number" || typeof document.nodes[id].y !== "number")
        throw TypeError;

    return (
        <g key={id} id={id} type="node" onMouseDown={() => {
            document.selectedNodeId = id;
            document.selectedConnectionChar = "temp";
        }}>
            <circle cx={document.nodes[id].x} cy={document.nodes[id].y} r={document.nodeRadius} fill="#88C0D0" />
            <text x={document.nodes[id].x} y={document.nodes[id].y + 6} textAnchor="middle" fontSize="20" fontFamily="mononokiRegular" fill="#2E3440">{id}</text>
        </g>
    );
}

export function dragNode(event) {
    document.nodes[document.selectedNodeId].x = event.pageX - document.offset.x;
    document.nodes[document.selectedNodeId].y = event.pageY - document.offset.y;
    document.update();
}

export function createNode(x, y) {
    var newId = "q0";
    for (const id in document.nodes) {
        if (id.substr(1) >= newId.substr(1)) {
            newId = "q" + (Number(id.substr(1)) + 1);
        }
    }
    document.nodes[newId] = { x: x, y: y, connections: {} }
    document.update();
    return newId;
}

export function removeNode(nodeId) {
    for (const node in document.nodes) {
        for (const char in document.nodes[node].connections) {
            if (document.nodes[node].connections[char].node === nodeId) {
                removeConnection(node, char);
            }
        }
    }
    delete document.nodes[nodeId];
}

export function nodeMouseDownHandler(event) {
    if (event.button === 0 && event.target.parentElement.getAttribute("id") !== document.tempNode) {
        document.selectedNodeId = event.target.parentElement.getAttribute("id");
        document.offset = {
            x: event.pageX - document.nodes[document.selectedNodeId].x,
            y: event.pageY - document.nodes[document.selectedNodeId].y
        };
        if (!event.shiftKey) {
            document.draggingNode = true;
            document.addEventListener("mousemove", dragNode);
        } else {
            document.draggingArrow = true;
            document.addEventListener("mousemove", dragArrow);
        }
    }
}