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

    document.update = () => { this.forceUpdate() }
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

    document.tapePos = window.innerWidth / 2 - document.tapeHeight / 2 - document.focusedCharId * document.tapeHeight;

    document.nodes = {
      q0: {
        x: 200,
        y: 200,
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
      updateTape();
    });
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", dragTape)
    });
  }

  mouseDownHandler(event) {
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
  }

  contextMenuHandler(event) {
    event.preventDefault();
    document.showContextMenu = true;
    document.contextMenu = {
      x: event.pageX,
      y: event.pageY
    }
    if (event.target.tagName === "svg") { // Background
      document.contextMenu.options = [
        <p key="0" onClick={() => { createNode(document.contextMenu.x, document.contextMenu.y) }}>Add node</p>
      ];
    } else if (document.selectedConnectionChar !== "temp") { // Connection
      document.contextMenu.options = [
        <p key="0" onClick={() => { editConnection(document.selectedNodeId, document.selectedConnectionChar) }}>Edit connection</p>,
        <p key="1" onClick={() => { removeConnection(document.selectedNodeId, document.selectedConnectionChar) }}>Remove connection</p>
      ];
    } else { // Node
      document.contextMenu.options = [
        <p key="0" onClick={() => { removeNode(document.selectedNodeId) }}>Remove node</p>
      ];
    }
    document.update();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <svg style={{ height: "100%", width: "100%", position: "absolute" }} onMouseDown={this.mouseDownHandler} onMouseUp={this.mouseUpHandler} onContextMenu={this.contextMenuHandler}>
            {Object.keys(document.nodes).map((id) => {
              return Object.keys(document.nodes[id].connections).map((char, key) => {
                return renderArrow(
                  key,
                  id,
                  char,
                  document.nodes[id].x,
                  document.nodes[id].y,
                  document.nodes[document.nodes[id].connections[char].node].x,
                  document.nodes[document.nodes[id].connections[char].node].y,
                  30,
                  (char ? char : " ") + "→" + (document.nodes[id].connections[char].replaceChar ? document.nodes[id].connections[char].replaceChar : " ") + "," + document.nodes[id].connections[char].move
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
                  }} maxLength="1" onInput={(event) => { document.initChars[id] = event.target.value }} defaultValue={document.running ? document.chars[id] : document.initChars[id]} />
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
          {document.editingConnection && (
            <form id="connection-box" style={{ left: document.arrowCenter.x, top: document.arrowCenter.y }}>
              <input className="connection-input" type="text" name="char" maxLength="1" autoFocus onInput={(event) => event.target.nextElementSibling.focus()} /> → <input className="connection-input" type="text" name="replaceChar" maxLength="1" onInput={(event) => event.target.nextElementSibling.focus()} />, <input className="connection-input" type="text" name="move" maxLength="1" />
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
  }
}