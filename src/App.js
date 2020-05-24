import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronLeft, faCopy, faPencilAlt, faCheck, faTimes, faFileImport, faFileExport, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import './App.css';
import { renderNode, dragNode, createNode, removeNode, nodeMouseDownHandler } from './node';
import { renderArrow, dragArrow, dragLabel } from './arrow';
import { updateTape, dragTape, tapeMouseDownHandler } from './tape';
import { createConnection, editConnection, applyConnectionChanges, cancelConnection, removeConnection } from './connection';
import { run, stop, changeSpeed } from './simulation';
import { parseJSON, updateJSON } from './json';
import { upload, download, readFile } from './file';
import { binaryCounter } from './examples/binary-counter';
import { bouncer } from './examples/bouncer';
export default class App extends Component {

  constructor(props) {
    super(props);

    document.update = () => { this.forceUpdate(); }
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
    document.state = "q0";
    document.tapeHeight = 100;
    document.draggingNode = false;
    document.draggingArrow = false;
    document.editingConnection = false;
    document.showContextMenu = false;
    document.focusedCharId = document.startCharId;
    document.state = document.startState;
    document.running = false;
    document.firstTapePos = 0;
    document.lastTapePos = 0;
    document.selectedConnectionChar = "temp";
    document.freeEdit = false;
    document.speed = 1;

    if (!window.localStorage.getItem("json-pane"))
      window.localStorage.setItem("json-pane", window.innerWidth > 1000 ? "show" : "hide");
    if (!window.localStorage.getItem("help-pane"))
      window.localStorage.setItem("help-pane", "show");

    document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;

    document.nodes = {
      q0: {
        x: Math.round((window.innerWidth) / 2),
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
        window.localStorage.setItem("json-pane", "hide");
      updateTape();
      document.update();
    });
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", dragTape)
    });
    document.addEventListener("mousedown", this.mouseDownHandler);
    document.addEventListener("mouseup", this.mouseUpHandler);
    document.addEventListener("contextmenu", this.contextMenuHandler);

    if (window.localStorage.getItem("json"))
      parseJSON(window.localStorage.getItem("json"));
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

    if (document.freeEdit && event.key === "Escape") {
      document.freeEdit = false;
      document.update();
    }

    if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      if (event.key === "j") {
        window.localStorage.setItem("json-pane", window.localStorage.getItem("json-pane") === "show" ? "hide" : "show");
        document.freeEdit = false;
        document.update();
      }

      if (event.key === "h") {
        window.localStorage.setItem("help-pane", window.localStorage.getItem("help-pane") === "show" ? "hide" : "show");
        document.update();
      }

      if (event.key === " ") {
        if (document.running)
          stop();
        else
          run();
      }

      if (document.running && event.key === "Escape")
        stop();

      if (event.ctrlKey && event.key === "c") {
        navigator.clipboard.writeText(document.getElementById("json").value);
      }

    }

    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      document.freeEdit = false;
      parseJSON(document.getElementById("json").value);
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
      } else if (event.target.parentElement.getAttribute("type") === "arrow") { // Connection
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
          <p key="0" onClick={() => { removeNode(document.selectedNodeId) }}>Remove node</p>,
          <p key="1" onClick={() => { document.startState = document.state = document.selectedNodeId }}>Define as start state</p>
        ];
      }
    } catch (e) { }
    document.update();
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
                    typeof document.nodes[id].connections[char].newChar !== "string" ||
                    document.nodes[id].connections[char].newChar.length > 1 ||
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
                    (char === "temp") ? "" : (char ? char : " ") + "→" + (document.nodes[id].connections[char].newChar ? document.nodes[id].connections[char].newChar : " ") + "," + document.nodes[id].connections[char].move
                  );
                });
              })}
              {document.draggingArrow && renderArrow("user", "", "", document.arrowPos.x1, document.arrowPos.y1, document.arrowPos.x2, document.arrowPos.y2)}
              {Object.keys(document.nodes).map((id) => renderNode(id))}
            </svg>
            <div className="topbar">
              <div className="toolbar-button" style={{ width: 50, height: 50 }} onClick={() => { window.localStorage.setItem("help-pane", window.localStorage.getItem("help-pane") === "show" ? "hide" : "show"); document.update(); }}>
                <FontAwesomeIcon icon={faQuestionCircle} />
                <span className="tooltip">Help</span>
              </div>
              <div style={{ flexGrow: 1 }}></div>
              <div className="toolbar-button" style={{ width: 50, height: 50 }}>
                <input type="file" text="" style={{ position: "absolute", width: 50, height: 50, marginLeft: -10, opacity: 0, cursor: "pointer" }} onChange={(event) => { upload(event) }} />
                <FontAwesomeIcon icon={faFileImport} />
                <span className="tooltip" style={{ transform: "translate(calc(-50% - 10px), 200%)" }}>Import</span>
              </div>
              <div className="toolbar-button" style={{ width: 50, height: 50 }} onClick={() => download()}>
                <FontAwesomeIcon icon={faFileExport} />
                <span className="tooltip" style={{ transform: "translate(calc(-50% - 22px), 200%)" }}>Export</span>
              </div>
            </div>
            <div id="tape" style={{ height: document.tapeHeight }} onMouseDown={tapeMouseDownHandler}>
              {
                Object.keys(document.initChars).map((id) => {
                  if (-document.tapePos < document.tapeHeight * (Number(id) + 2) && window.innerWidth > document.tapeHeight * (Number(id) - 1) + document.tapePos) {
                    return (<input key={id} num={id} style={{
                      height: document.tapeHeight,
                      width: document.tapeHeight,
                      backgroundColor: id % 2 ? "#434C5E" : "#3B4252",
                      position: "absolute",
                      bottom: 0,
                      left: id * document.tapeHeight + document.tapePos,
                      fontSize: document.tapeHeight / 2,
                      transition: document.running ? 0.5 / document.speed + "s" : 0 + "s",
                    }} maxLength="1" onInput={(event) => {
                      if (event.target.value === " ")
                        event.target.value = "␣";
                      document.initChars[id] = event.target.value;
                      document.firstTapePos = Math.min(id, document.firstTapePos);
                      document.lastTapePos = Math.max(id, document.lastTapePos);
                      updateJSON();
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
            {!document.running && (
              <div className="button" style={{ bottom: document.tapeHeight + 20 }} onClick={() => run()}>
                <svg width="100%" height="100%">
                  <polygon points={"12,10 30,20 12,30"} fill="#2E3440" />
                </svg>
              </div>
            )}
            <div id="speed-controls" style={{ bottom: document.tapeHeight + 20, zIndex: document.running ? 2 : 0 }}>
              <div style={document.speed === 0.5 ? { backgroundColor: "#88C0D0", color: "#2E3440" } : {}} onClick={() => { changeSpeed(0.5); }}>×½</div>
              <div style={document.speed === 1 ? { backgroundColor: "#88C0D0", color: "#2E3440" } : {}} onClick={() => { changeSpeed(1); }}>×1</div>
              <div style={document.speed === 2 ? { backgroundColor: "#88C0D0", color: "#2E3440" } : {}} onClick={() => { changeSpeed(2); }}>×2</div>
              <div style={document.speed === 5 ? { backgroundColor: "#88C0D0", color: "#2E3440" } : {}} onClick={() => { changeSpeed(5); }}>×5</div>
              <div style={document.speed === Infinity ? { backgroundColor: "#88C0D0", color: "#2E3440" } : {}} onClick={() => { changeSpeed(Infinity); }}>×∞</div>
            </div>
            {document.editingConnection && (
              <form id="connection-box" style={{ left: document.arrowCenter.x, top: document.arrowCenter.y }}>
                <input className="connection-input" type="text" name="char" maxLength="1" autoFocus
                  onFocus={(event) => { event.target.select(); }}
                  onInput={(event) => { event.target.nextElementSibling.focus(); if (event.target.value === " ") event.target.value = "␣" }}
                  defaultValue={(document.selectedConnectionChar !== "temp") ? document.selectedConnectionChar : ""}
                /> → <input className="connection-input" type="text" name="newChar" maxLength="1"
                  onFocus={(event) => { event.target.select(); }}
                  defaultValue={(document.selectedConnectionChar !== "temp") ? document.nodes[document.selectedNodeId].connections[document.selectedConnectionChar].newChar : ""}
                  onInput={(event) => { event.target.nextElementSibling.focus(); if (event.target.value === " ") event.target.value = "␣" }}
                />, <input className="connection-input" type="text" name="move" maxLength="1"
                  onFocus={(event) => { event.target.select(); }}
                  defaultValue={(document.selectedConnectionChar !== "temp") ? document.nodes[document.selectedNodeId].connections[document.selectedConnectionChar].move : ""}
                />
              </form>
            )}
            <div className="pane" style={{ height: Math.min(420, window.innerHeight - 120 - document.tapeHeight), width: 350, top: 100, left: window.localStorage.getItem("help-pane") === "show" ? 20 : -400 }}>
              <div className="toolbar">
                <span style={{ flexGrow: 1 }}>Help</span>
                <div className="toolbar-button" onClick={() => { window.localStorage.setItem("help-pane", "hide"); document.update(); }}>
                  <FontAwesomeIcon icon={faTimes} />
                </div>
              </div>
              <div className="pane-content">
                <p style={{ marginTop: 0 }}>Create connections by pressing <span className="key">Shift</span> and dragging from a node.</p>
                <p>Connections hold 3 values:<br />
                  - the current character<br />
                  - the replacement character<br />
                  - the movement instruction
                </p>
                <p>The movement instructions are:<br />
                  - 'R' (right)<br />
                  - 'L' (left)<br />
                  - 'S' (stay)
                </p>
                <p>Currently, there cannot be two connections with the same character comming from the same node.</p>
                <p>Learn about Turing machines <a className="link" href="https://simple.m.wikipedia.org/wiki/Turing_machine" target="_blank" rel="noopener noreferrer">here</a>.</p>
                <p>Curve the arrows by dragging the label.</p>
                <p>On the right side there is the JSON pane which you can toggle by pressing <span className="key">J</span>. It contains all the information that defines the automaton and the tape. Unless the 'free edit' mode is enabled, it ignores any input that would break the JSON or the automaton.</p>
                <p>Start the simulation by pressing <span className="key">Space</span> and control its speed using the buttons on the bottom right corner.</p>
                <p>Here are some examples:<br />
                  - <span className="link" onClick={() => readFile(bouncer, parseJSON)}>Bouncer</span><br />
                  - <span className="link" onClick={() => readFile(binaryCounter, parseJSON)}>Binary counter</span>
                </p>
              </div>
            </div>
            <div className="blocker" style={{ opacity: document.freeEdit ? 0.5 : 0, pointerEvents: document.freeEdit ? "auto" : "none" }} />
            <div className="pane" style={{
              top: 100,
              height: window.innerHeight - document.tapeHeight - 200,
              right: window.localStorage.getItem("json-pane") === "show" ? 20 : -360,
            }}>
              <div className="toolbar">
                {window.localStorage.getItem("json-pane") === "show" ?
                  <div className="toolbar-button" onClick={() => { window.localStorage.setItem("json-pane", "hide"); document.freeEdit = false; document.update(); }}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </div> :
                  <div className="toolbar-button" onClick={() => { window.localStorage.setItem("json-pane", "show"); document.update(); }}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </div>
                }
                <span style={{ flexGrow: 1 }}>JSON</span>
                {document.freeEdit ?
                  <div className="toolbar-button" onClick={() => { document.freeEdit = false; document.update(); }}>
                    <FontAwesomeIcon icon={faTimes} />
                    <span className="tooltip">Cancel</span>
                  </div> :
                  <div className="toolbar-button" onClick={() => { document.freeEdit = true; document.update(); }}>
                    <FontAwesomeIcon icon={faPencilAlt} />
                    <span className="tooltip">Free edit</span>
                  </div>
                }
                {document.freeEdit ?
                  <div className="toolbar-button" onClick={() => { document.freeEdit = false; parseJSON(document.getElementById("json").value); }}>
                    <FontAwesomeIcon icon={faCheck} />
                    <span className="tooltip">Apply</span>
                  </div> :
                  <div className="toolbar-button" onClick={() => { navigator.clipboard.writeText(document.getElementById("json").value); }}>
                    <FontAwesomeIcon icon={faCopy} />
                    <span className="tooltip">Copy</span>
                  </div>
                }
              </div>
              <textarea className="pane-content" id="json" onInput={() => { if (!document.freeEdit) parseJSON(document.getElementById("json").value) }} defaultValue={updateJSON()} spellCheck="false" />
            </div>
            <div className="blocker" style={{ opacity: 0, pointerEvents: document.running ? "auto" : "none" }} />
            {document.running && (
              <div className="button" style={{ bottom: document.tapeHeight + 20 }} onClick={() => stop()}>
                <svg width="100%" height="100%">
                  <polygon points={"12,12 28,12 28,28 12,28"} fill="#2E3440" />
                </svg>
              </div>
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
      parseJSON(window.localStorage.getItem("json"));
    }
    return html;
  }

  componentDidUpdate() {
    window.localStorage.setItem("json", updateJSON());
  }
}