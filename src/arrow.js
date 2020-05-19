import React from 'react';
import { editConnection } from './connection';

export function renderArrow(key, nodeId, char, x1, y1, x2, y2, endDistance = 0, text = "") {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var d = Math.sqrt(dx ** 2 + dy ** 2);
    var curve = nodeId ? document.nodes[nodeId].connections[char].arrowCurve : 0;

    if (d > document.nodeRadius || (nodeId && document.nodes[nodeId].connections[char].node !== nodeId)) {
        const cpx = x1 + dx / 2 + dy / d * curve * 1.9;
        const cpy = y1 + dy / 2 - dx / d * curve * 1.9;
        const dcl1x = x1 - cpx;
        const dcl1y = y1 - cpy;
        const dcl1 = Math.sqrt(dcl1x ** 2 + dcl1y ** 2);
        const dcl2x = x2 - cpx;
        const dcl2y = y2 - cpy;
        const dcl2 = Math.sqrt(dcl2x ** 2 + dcl2y ** 2);
        const sx = x1 - dcl1x * 30 / dcl1;
        const sy = y1 - dcl1y * 30 / dcl1;
        const ex = x2 - dcl2x * (endDistance + 14) / dcl2;
        const ey = y2 - dcl2y * (endDistance + 14) / dcl2;

        if (document.selectedNodeId === nodeId && document.selectedConnectionChar === char) {
            document.arrowCenter = {
                x: ((sx + ex) / 2 + cpx) / 2,
                y: ((sy + ey) / 2 + cpy) / 2
            }
        }

        return (
            <g key={key} onMouseDown={() => {
                document.selectedNodeId = nodeId;
                document.selectedConnectionChar = char;
            }}>
                <path d={"M " + sx + " " + sy + " Q " + cpx + " " + cpy + " " + ex + " " + ey} style={{ stroke: "#88C0D0", strokeWidth: 5, pointerEvents: "none" }} fill="transparent" />
                <polygon
                    points={
                        (x2 - dcl2x * endDistance / dcl2) + "," + (y2 - dcl2y * endDistance / dcl2) + " " +
                        (x2 - dcl2x * (endDistance + 15) / dcl2 - 10 * dcl2y / dcl2) + "," + (y2 - dcl2y * (endDistance + 15) / dcl2 + 10 * dcl2x / dcl2) + " " +
                        (x2 - dcl2x * (endDistance + 15) / dcl2 + 10 * dcl2y / dcl2) + "," + (y2 - dcl2y * (endDistance + 15) / dcl2 - 10 * dcl2x / dcl2)
                    }
                    fill="#88C0D0"
                />
                {text && (
                    <g
                        onDoubleClick={() => { editConnection(nodeId, char) }}
                        onMouseDown={(event) => { if (event.button === 0) document.addEventListener("mousemove", dragLabel) }}
                    >
                        <rect x={((sx + ex) / 2 + cpx) / 2 - 27} y={((sy + ey) / 2 + cpy) / 2 - 10} height="20" width="54" rx="5" ry="5" fill="#88C0D0" />
                        <text x={((sx + ex) / 2 + cpx) / 2 - 23} y={((sy + ey) / 2 + cpy) / 2 + 5} fontSize="15" fontFamily="monospace" fill="#2E3440" xmlSpace="preserve">{text}</text>
                    </g>
                )}
            </g>
        );
    } else {
        var sign;
        const cx1 = x1 - 30;
        const cx2 = x1 + 30;
        var cy1;
        var cy2;
        x2 = x1 + 20;
        x1 -= 22;
        if (curve < 70) {
            sign = 1;
            curve = Math.min(curve, 0);
            cy1 = y1 - 70 + curve * 1.35;
            cy2 = y1 - 70 + curve * 1.35;
            y1 = y2 = y1 - 25;
        } else {
            sign = -1;
            curve = Math.max(curve, 125);
            cy1 = y1 - 100 + curve * 1.35;
            cy2 = y1 - 100 + curve * 1.35;
            y1 = y2 = y1 + 25;
        }

        if (document.selectedNodeId === nodeId && document.selectedConnectionChar === char) {
            document.arrowCenter = {
                x: x1 + 20,
                y: y1 - 63 + 23 * sign + curve
            }
        }

        return (
            <g key={key} onMouseDown={() => {
                document.selectedNodeId = nodeId;
                document.selectedConnectionChar = char;
            }}>
                <path d={`M ${x1 - 4} ${y1 - 8 * sign} C ${cx1},${cy1} ${cx2},${cy2} ${x2} ${y2}`} style={{ stroke: "#88C0D0", strokeWidth: 5, pointerEvents: "none" }} fill="transparent" />
                <polygon points={`${x1},${y1} ${x1 - 13.5},${y1 - 11.9 * sign} ${x1 + 5.78},${y1 - 17.1 * sign}`} fill="#88C0D0" />
                {text && (
                    <g
                        onDoubleClick={() => { editConnection(nodeId, char) }}
                        onMouseDown={(event) => { if (event.button === 0) document.addEventListener("mousemove", dragLabel) }}
                    >
                        <rect x={x1 - 7} y={y1 - 73 + 23 * sign + curve} height="20" width="54" rx="5" ry="5" fill="#88C0D0" />
                        <text x={x1 - 3} y={y1 - 58 + 23 * sign + curve} fontSize="15" fontFamily="monospace" fill="#2E3440" xmlSpace="preserve">{text}</text>
                    </g>
                )}
            </g>
        );
    }
}

export function dragArrow(event) {
    document.arrowPos = {
        node: document.selectedNodeId,
        x1: document.nodes[document.selectedNodeId].x,
        y1: document.nodes[document.selectedNodeId].y,
        x2: event.pageX,
        y2: event.pageY
    }
    document.update();
}

export function dragLabel(event) {
    const startNode = document.nodes[document.selectedNodeId];
    const endNode = document.nodes[document.nodes[document.selectedNodeId].connections[document.selectedConnectionChar].node]
    const x1 = startNode.x;
    const y1 = startNode.y;
    const x2 = endNode.x;
    const y2 = endNode.y;

    if (document.selectedNodeId === document.nodes[document.selectedNodeId].connections[document.selectedConnectionChar].node) {
        document.nodes[document.selectedNodeId].connections[document.selectedConnectionChar].arrowCurve = event.pageY - y1 + 64;
    } else {
        document.nodes[document.selectedNodeId].connections[document.selectedConnectionChar].arrowCurve = ((y2 - y1) * event.pageX - (x2 - x1) * event.pageY + x2 * y1 - x1 * y2) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    }
    document.update();
}