import React from 'react';
import { dragArrow } from './arrow';
import { removeConnection } from './connection';

export function renderNode(id) {
    if (typeof document.nodes[id].x !== "number" || typeof document.nodes[id].y !== "number")
        throw TypeError;
    if (!["normal", "accept", "reject"].includes(document.nodes[id].type))
        throw TypeError;

    return (
        <g key={id} id={id} type="node" onMouseDown={() => {
            document.selectedNodeId = id;
            document.selectedConnectionChar = "temp";
        }}>
            <circle cx={document.nodes[id].x + document.viewportPos.x} cy={document.nodes[id].y + document.viewportPos.y} r={document.nodeRadius} fill={
                (document.nodes[id].type === "accept" && (document.state === id ? "#e3ffcc" : "#A3BE8C")) ||
                (document.nodes[id].type === "reject" && (document.state === id ? "#ffb3ba" : "#BF616A")) ||
                (document.state === id ? "#E5E9F0" : "#88C0D0")
            } />
            <text x={document.nodes[id].x + document.viewportPos.x} y={document.nodes[id].y + document.viewportPos.y + 6} textAnchor="middle" fontSize="20" fontFamily="mononokiRegular" fill="#2E3440">{id}</text>
        </g>
    );
}

export function dragNode(event) {
    document.nodes[document.selectedNodeId].x = event.pageX - document.nodeOffset.x;
    document.nodes[document.selectedNodeId].y = event.pageY - document.nodeOffset.y;
    document.update();
}

export function createNode(x, y) {
    for (var i = 0; i < Object.keys(document.nodes).length; i++) {
        if (!Object.keys(document.nodes).includes("q" + i))
            break;
    }
    var newId = "q" + i;
    document.nodes[newId] = { x: x, y: y, type: "normal", connections: {} }
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
        document.nodeOffset = {
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