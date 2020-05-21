import React, { Component } from 'react';
import './App.css';
import { renderNode, dragNode, createNode, removeNode, nodeMouseDownHandler } from './node';
import { renderArrow, dragArrow, dragLabel } from './arrow';
import { updateTape, dragTape, tapeMouseDownHandler } from './tape';
import { createConnection, editConnection, applyConnectionChanges, cancelConnection, removeConnection } from './connection';
import { run, stop } from './simulation';
export default class App extends Component {

  constructor(props) {
    super(props);

    document.update = () => { this.updateJSON(); this.forceUpdate(); }
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.contextMenuHandler = this.contextMenuHandler.bind(this);

    document.nodeRadius = 25;
    document.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 };
    document.tempNode = "";
    document.contextMenu = { x: 0, y: 0, options: [] }
    document.startCharId = 0;
    document.startState = "q0";
    document.tapeHeight = 100;
    document.draggingNode = false;
    document.draggingArrow = false;
    document.editingConnection = false;
    document.showContextMenu = false;
    document.focusedCharId = document.startCharId;
    document.state = document.startState;
    document.running = false;
    document.showPane = window.innerWidth > 1000;
    document.firstTapePos = 0;
    document.lastTapePos = 0;
    document.selectedConnectionChar = "temp";

    document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;

    document.nodes = {
      q0: {
        x: Math.round((window.innerWidth - 400) / 2),
        y: Math.round((window.innerHeight - document.tapeHeight) / 2),
        connections: {}
      }
    }

    document.initChars = {};
    document.firstKey = 0;
    for (var i = Math.floor(-(window.innerWidth / 2) / document.tapeHeight); i < 2 + (window.innerWidth / 2) / document.tapeHeight; i++) {
      if (document.initChars[i] === undefined)
        document.initChars[i] = "";
    }
    document.lastKey = i - 1;
    document.chars = {};
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("resize", () => {
      document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;
      if (window.innerWidth < 1000)
        document.showPane = false;
      updateTape();
      document.update();
    });
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", dragTape)
    });
    document.addEventListener("mousedown", this.mouseDownHandler);
    document.addEventListener("mouseup", this.mouseUpHandler);
    document.addEventListener("contextmenu", this.contextMenuHandler);
  }

  mouseDownHandler(event) {
    if (event.target.parentElement.id !== "context-menu")
      document.showContextMenu = false;
    if (document.editingConnection && event.target.className !== "connection-input" && event.target.id !== "connection-box") {
      if (applyConnectionChanges()) {
        document.editingConnection = false;
      } else {
        cancelConnection();
      }
    }
    try {
      if (event.target.parentElement.getAttribute("type") === "node") {
        nodeMouseDownHandler(event);
      }
    } catch (e) { }
    document.tempNode = "";
    document.update();
  }

  mouseUpHandler(event) {
    document.removeEventListener("mousemove", dragLabel);
    if (document.draggingNode) document.removeEventListener("mousemove", dragNode);
    if (document.draggingArrow) {
      document.removeEventListener("mousemove", dragArrow);
      if (event.target.parentElement.getAttribute("type") === "node") {
        createConnection(event.target.parentElement.getAttribute("id"));
      } else {
        const newId = createNode(event.pageX, event.pageY);
        document.tempNode = newId;
        createConnection(newId);
      }
    }
    document.draggingNode = false;
    document.draggingArrow = false;
    document.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 }
    document.update();
  }

  keyDownHandler(event) {
    if (document.editingConnection) {
      if (event.key === "Enter" && applyConnectionChanges()) {
        document.editingConnection = false;
        document.update();
      } else if (event.key === "Escape") {
        cancelConnection();
      }
    }

    if (event.key === "j" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      document.showPane = !document.showPane;
      document.update();
    }
  }

  contextMenuHandler(event) {
    document.contextMenu = {
      x: event.pageX,
      y: event.pageY,
      options: []
    }
    try {
      if (event.target.tagName === "svg") { // Background
        event.preventDefault();
        document.showContextMenu = true;
        document.contextMenu.options = [
          <p key="0" onClick={() => { createNode(document.contextMenu.x, document.contextMenu.y) }}>Add node</p>
        ];
      } else if (document.selectedConnectionChar !== "temp") { // Connection
        event.preventDefault();
        document.showContextMenu = true;
        document.contextMenu.options = [
          <p key="0" onClick={() => { editConnection(document.selectedNodeId, document.selectedConnectionChar) }}>Edit connection</p>,
          <p key="1" onClick={() => { removeConnection(document.selectedNodeId, document.selectedConnectionChar) }}>Remove connection</p>
        ];
      } else if (event.target.parentElement.getAttribute("type") === "node") { // Node
        event.preventDefault();
        document.showContextMenu = true;
        document.contextMenu.options = [
          <p key="0" onClick={() => { removeNode(document.selectedNodeId) }}>Remove node</p>
        ];
      }
    } catch (e) { }
    document.update();
  }

  parseJSON() {
    try {
      const json = JSON.parse(document.getElementById("json").value);
      document.startState = json["startState"];
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
    } catch (e) { }
    document.update();
  }

  updateJSON() {
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
      document.getElementById("json").value = json;
    } catch (e) { }
    return json;
  }

  render() {
    var html = (
      <div className="App">
        <header className="App-header"></header>
      </div>
    );
    try {
      html = (
        <div className="App">
          <header className="App-header">
            <svg style={{ height: "100%", width: "100%", position: "absolute" }}>
              {Object.keys(document.nodes).map((id) => {
                return Object.keys(document.nodes[id].connections).map((char, key) => {
                  if (
                    (char.length > 1 && char !== "temp") ||
                    typeof document.nodes[id].connections[char].replaceChar !== "string" ||
                    document.nodes[id].connections[char].replaceChar.length > 1 ||
                    typeof document.nodes[id].connections[char].move !== "string" ||
                    typeof document.nodes[id].connections[char].arrowCurve !== "number" ||
                    !["L", "R", "S"].includes(document.nodes[id].connections[char].move)
                  )
                    throw TypeError;

                  return renderArrow(
                    key,
                    id,
                    char,
                    document.nodes[id].x,
                    document.nodes[id].y,
                    document.nodes[document.nodes[id].connections[char].node].x,
                    document.nodes[document.nodes[id].connections[char].node].y,
                    30,
                    (char === "temp") ? "" : (char ? char : " ") + "→" + (document.nodes[id].connections[char].replaceChar ? document.nodes[id].connections[char].replaceChar : " ") + "," + document.nodes[id].connections[char].move
                  );
                });
              })}
              {document.draggingArrow && renderArrow("user", "", "", document.arrowPos.x1, document.arrowPos.y1, document.arrowPos.x2, document.arrowPos.y2)}
              {Object.keys(document.nodes).map((id) => renderNode(id))}
            </svg>
            <div id="tape" style={{ height: document.tapeHeight }} onMouseDown={tapeMouseDownHandler}>
              {
                Object.keys(document.initChars).map((id) => {
                  if (-document.tapePos < document.tapeHeight * (Number(id) + 2) && window.innerWidth > document.tapeHeight * (Number(id) - 1) + document.tapePos) {
                    return (<input key={id} num={id} style={{
                      height: document.tapeHeight,
                      width: document.tapeHeight,
                      backgroundColor: id % 2 ? "#4C566A" : "#3B4252",
                      position: "absolute",
                      bottom: 0,
                      left: id * document.tapeHeight + document.tapePos,
                      fontSize: document.tapeHeight / 2,
                      transition: document.running ? ".5s" : "0s",
                    }} maxLength="1" onInput={(event) => {
                      if (event.target.value === " ")
                        event.target.value = "␣";
                      document.initChars[id] = event.target.value;
                      document.firstTapePos = Math.min(id, document.firstTapePos);
                      document.lastTapePos = Math.max(id, document.lastTapePos);
                      this.updateJSON();
                    }} defaultValue={document.running ? document.chars[id] : document.initChars[id]} />
                    )
                  }
                })
              }
              <div id="cursor" style={{
                height: document.tapeHeight - 20,
                width: document.tapeHeight - 20,
                left: document.running ? window.innerWidth / 2 - document.tapeHeight / 2 : document.focusedCharId * document.tapeHeight + document.tapePos,
                transition: document.running ? ".5s" : "0s",
              }} />
            </div>
            {document.running ? (
              <div className="button" style={{ bottom: document.tapeHeight + 20 }} onClick={() => stop()}>
                <svg width="100%" height="100%">
                  <polygon points={"12,12 28,12 28,28 12,28"} fill="#2E3440" />
                </svg>
              </div>
            ) : (
                <div className="button" style={{ bottom: document.tapeHeight + 20 }} onClick={() => run()}>
                  <svg width="100%" height="100%">
                    <polygon points={"12,10 30,20 12,30"} fill="#2E3440" />
                  </svg>
                </div>
              )
            }
            <div id="json-pane" style={{
              height: window.innerHeight - document.tapeHeight - 200,
              right: document.showPane ? 20 : -380,
            }}>
              <textarea id="json" onInput={this.parseJSON} defaultValue={this.updateJSON()} spellCheck="false" />
            </div>
            {document.editingConnection && (
              <form id="connection-box" style={{ left: document.arrowCenter.x, top: document.arrowCenter.y }}>
                <input className="connection-input" type="text" name="char" maxLength="1" autoFocus onInput={(event) => { event.target.nextElementSibling.focus(); if (event.target.value === " ") event.target.value = "␣" }} /> → <input className="connection-input" type="text" name="replaceChar" maxLength="1" onInput={(event) => { event.target.nextElementSibling.focus(); if (event.target.value === " ") event.target.value = "␣" }} />, <input className="connection-input" type="text" name="move" maxLength="1" />
              </form>
            )}
            {document.showContextMenu && (
              <div style={{ left: document.contextMenu.x, top: document.contextMenu.y }} id="context-menu" onClick={() => { document.showContextMenu = false; document.update(); }}>
                {document.contextMenu.options.map((option) => option)}
              </div>
            )}
          </header>
        </div>
      );
    } catch (e) {
      console.log("DEBUG: " + e);
      document.nodes = document.json;
      document.update();
    }
    return html;
  }

  componentDidUpdate() {
    document.json = document.nodes;
  }
}