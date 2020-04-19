import React, { Component } from 'react';
import './App.css';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.dragNode = this.dragNode.bind(this);
    this.dragArrow = this.dragArrow.bind(this);
    this.dragLabel = this.dragLabel.bind(this);
    this.dragTape = this.dragTape.bind(this);
    this.updateTape = this.updateTape.bind(this);
    this.nodeMouseDownHandler = this.nodeMouseDownHandler.bind(this);
    this.tapeMouseDownHandler = this.tapeMouseDownHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.editConnection = this.editConnection.bind(this);
    this.applyConnectionChanges = this.applyConnectionChanges.bind(this);
    this.cancelConnection = this.cancelConnection.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.contextMenuHandler = this.contextMenuHandler.bind(this);
    this.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 };
    this.tempNode = "";
    this.contextMenu = { x: 0, y: 0, options: [] }
    this.tapePos = 0;
    this.startCharId = 0;

    this.state = {
      draggingNode: false,
      draggingArrow: false,
      editingConnection: false,
      contextMenu: false,
      tapeHeight: 100,
      focusedCharId: this.startCharId,
      running: false,
    }

    this.nodes = {
      q0: {
        x: 200,
        y: 200,
        connections: {}
      }
    }

    this.chars = {}
    this.firstKey = 0;
    for (var i = 0; i < window.innerWidth / this.state.tapeHeight; i++) {
      this.chars[i] = "";
    }
    this.lastKey = i - 1;
  }

  renderArrow(key, nodeId, char, x1, y1, x2, y2, endDistance = 0, text = "") {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx ** 2 + dy ** 2);
    const curve = nodeId ? this.nodes[nodeId].connections[char].arrowCurve : 0;
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

    if (this.selectedNodeId === nodeId && this.selectedConnectionChar === char) {
      this.arrowCenter = {
        x: ((sx + ex) / 2 + cpx) / 2,
        y: ((sy + ey) / 2 + cpy) / 2
      }
    }

    if (d > 0) {
      return (
        <g key={key} onMouseDown={() => {
          this.selectedNodeId = nodeId;
          this.selectedConnectionChar = char;
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
              onDoubleClick={() => { this.editConnection(nodeId, char) }}
              onMouseDown={(event) => { if (event.button === 0) document.addEventListener("mousemove", this.dragLabel) }}
            >
              <rect x={((sx + ex) / 2 + cpx) / 2 - 27} y={((sy + ey) / 2 + cpy) / 2 - 10} height="20" width="54" rx="5" ry="5" fill="#88C0D0" />
              <text x={((sx + ex) / 2 + cpx) / 2 - 23} y={((sy + ey) / 2 + cpy) / 2 + 5} fontSize="15" fontFamily="monospace" fill="#2E3440">{text}</text>
            </g>
          )}
        </g>
      );
    }
  }

  renderNode(id) {
    return (
      <g key={id} id={id} type="node" onMouseDown={() => {
        this.selectedNodeId = id;
        this.selectedConnectionChar = "";
      }}>
        <circle cx={this.nodes[id].x} cy={this.nodes[id].y} r="25" fill="#88C0D0" />
        {id.length === 2 ? <text x={this.nodes[id].x - 12} y={this.nodes[id].y + 6} fontSize="20" fontFamily="monospace" fill="#2E3440">{id}</text> :
          <text x={this.nodes[id].x - 18} y={this.nodes[id].y + 6} fontSize="20" fontFamily="monospace" fill="#2E3440">{id}</text>
        }
      </g>
    );
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("resize", this.updateTape);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", this.dragTape)
    });
  }

  dragNode(event) {
    this.nodes[this.selectedNodeId].x = event.pageX - this.offset.x;
    this.nodes[this.selectedNodeId].y = event.pageY - this.offset.y;
    this.forceUpdate();
  }

  dragArrow(event) {
    this.arrowPos = {
      node: this.selectedNodeId,
      x1: this.nodes[this.selectedNodeId].x,
      y1: this.nodes[this.selectedNodeId].y,
      x2: event.pageX,
      y2: event.pageY
    }
    this.forceUpdate();
  }

  dragLabel(event) {
    const startNode = this.nodes[this.selectedNodeId];
    const endNode = this.nodes[this.nodes[this.selectedNodeId].connections[this.selectedConnectionChar].node]
    const x1 = startNode.x;
    const y1 = startNode.y;
    const x2 = endNode.x;
    const y2 = endNode.y;
    this.nodes[this.selectedNodeId].connections[this.selectedConnectionChar].arrowCurve = ((y2 - y1) * event.pageX - (x2 - x1) * event.pageY + x2 * y1 - x1 * y2) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    this.forceUpdate();
  }

  updateTape() {
    while (-this.tapePos < this.state.tapeHeight * this.firstKey) {
      this.firstKey--;
      this.chars[this.firstKey] = "";
    }
    while (window.innerWidth > this.state.tapeHeight * (this.lastKey + 1) + this.tapePos) {
      this.lastKey++;
      this.chars[this.lastKey] = "";
    }
    this.forceUpdate();
  }

  dragTape(event) {
    this.tapePos = event.pageX - this.tapeClickDelta;
    this.updateTape();
  }

  createNode(x, y) {
    var newId = "q0";
    for (const id in this.nodes) {
      if (id.substr(1) >= newId.substr(1)) {
        newId = "q" + (Number(id.substr(1)) + 1);
      }
    }
    this.nodes[newId] = { x: x, y: y, connections: {} }
    this.forceUpdate();
    return newId;
  }

  removeNode(nodeId) {
    for (const node in this.nodes) {
      for (const char in this.nodes[node].connections) {
        if (this.nodes[node].connections[char].node === nodeId) {
          this.removeConnection(node, char);
        }
      }
    }
    delete this.nodes[nodeId];
  }

  createConnection(endNodeId) {
    this.nodes[this.selectedNodeId].connections[""] = {
      node: endNodeId,
      replaceChar: "",
      move: "",
      arrowCurve: 0,
    }
    for (const char in this.nodes[endNodeId].connections) {
      if (this.nodes[endNodeId].connections[char].node === this.selectedNodeId) {
        if (Math.abs(this.nodes[endNodeId].connections[char].arrowCurve) < 25) {
          const d = Math.abs(25 - this.nodes[endNodeId].connections[char].arrowCurve);
          for (const char2 in this.nodes[endNodeId].connections) {
            if (this.nodes[endNodeId].connections[char2].node === this.selectedNodeId && this.nodes[endNodeId].connections[char2].arrowCurve > -25) {
              this.nodes[endNodeId].connections[char2].arrowCurve += d;
            }
          }
        }
        this.nodes[this.selectedNodeId].connections[""].arrowCurve = 25;
      }
    }
    for (const char in this.nodes[this.selectedNodeId].connections) {
      if (char !== "" && this.nodes[this.selectedNodeId].connections[char].node === endNodeId && this.nodes[this.selectedNodeId].connections[char].arrowCurve >= 0)
        this.nodes[this.selectedNodeId].connections[char].arrowCurve += 50;
    }
    this.editConnection(this.selectedNodeId, "");
  }

  editConnection(nodeId, char) {
    this.setState({ editingConnection: true });
    this.editingConnection = { node: nodeId, char: char }
  }

  applyConnectionChanges() {
    const newChar = document.getElementsByClassName("connection-input")[0].value;
    const replaceChar = document.getElementsByClassName("connection-input")[1].value;
    const move = document.getElementsByClassName("connection-input")[2].value;
    if (newChar && replaceChar && move) {
      const endNode = this.nodes[this.editingConnection.node].connections[this.editingConnection.char].node;
      const arrowCurve = this.nodes[this.editingConnection.node].connections[this.editingConnection.char].arrowCurve;
      delete this.nodes[this.editingConnection.node].connections[this.editingConnection.char];
      this.nodes[this.editingConnection.node].connections[newChar] = {
        node: endNode,
        replaceChar: replaceChar,
        move: move,
        arrowCurve: arrowCurve,
      }
      this.tempNode = "";
      return true;
    }
    return false;
  }

  cancelConnection() {
    for (const id in this.nodes) {
      delete this.nodes[id].connections[""];
    }
    this.setState({ editingConnection: false });
    delete this.nodes[this.tempNode];
    this.forceUpdate();
  }

  removeConnection(nodeId, char) {
    delete this.nodes[nodeId].connections[char];
  }

  nodeMouseDownHandler(event) {
    if (event.button === 0 && event.target.parentElement.getAttribute("id") !== this.tempNode) {
      this.selectedNodeId = event.target.parentElement.getAttribute("id");
      this.offset = {
        x: event.pageX - this.nodes[this.selectedNodeId].x,
        y: event.pageY - this.nodes[this.selectedNodeId].y
      };
      if (!event.shiftKey) {
        this.setState({ draggingNode: true });
        document.addEventListener("mousemove", this.dragNode);
      } else {
        this.setState({ draggingArrow: true });
        document.addEventListener("mousemove", this.dragArrow);
      }
    }
  }

  tapeMouseDownHandler(event) {
    if (event.button === 0) {
      this.tapeClickDelta = event.pageX - this.tapePos;
      document.addEventListener("mousemove", this.dragTape);
    }
  }

  mouseDownHandler(event) {
    this.setState({ contextMenu: false });
    if (this.state.editingConnection && event.target.className !== "connection-input" && event.target.id !== "connection-box") {
      if (this.applyConnectionChanges()) {
        this.setState({ editingConnection: false });
      } else {
        this.cancelConnection();
      }
    }
    try {
      if (event.target.parentElement.getAttribute("type") === "node") {
        this.nodeMouseDownHandler(event);
      }
    } catch (e) { }
    this.tempNode = "";
  }

  mouseUpHandler(event) {
    document.removeEventListener("mousemove", this.dragLabel);
    if (this.state.draggingNode) document.removeEventListener("mousemove", this.dragNode);
    if (this.state.draggingArrow) {
      document.removeEventListener("mousemove", this.dragArrow);
      if (event.target.parentElement.getAttribute("type") === "node") {
        this.createConnection(event.target.parentElement.getAttribute("id"));
      } else {
        const newId = this.createNode(event.pageX, event.pageY);
        this.tempNode = newId;
        this.createConnection(newId);
      }
    }
    this.setState({ draggingNode: false, draggingArrow: false });
    this.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 }
  }

  keyDownHandler(event) {
    if (this.state.editingConnection) {
      if (event.key === "Enter" && this.applyConnectionChanges()) {
        this.setState({ editingConnection: false });
      } else if (event.key === "Escape") {
        this.cancelConnection();
      }
    }
  }

  contextMenuHandler(event) {
    event.preventDefault();
    this.setState({ contextMenu: true })
    this.contextMenu = {
      x: event.pageX,
      y: event.pageY
    }
    if (event.target.tagName === "svg") { // Background
      this.contextMenu.options = [
        <p key="0" onClick={() => { this.createNode(this.contextMenu.x, this.contextMenu.y) }}>Add node</p>
      ];
    } else if (this.selectedConnectionChar) { // Connection
      this.contextMenu.options = [
        <p key="0" onClick={() => { this.editConnection(this.selectedNodeId, this.selectedConnectionChar) }}>Edit connection</p>,
        <p key="1" onClick={() => { this.removeConnection(this.selectedNodeId, this.selectedConnectionChar) }}>Remove connection</p>
      ];
    } else { // Node
      this.contextMenu.options = [
        <p key="0" onClick={() => { this.removeNode(this.selectedNodeId) }}>Remove node</p>
      ];
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <svg style={{ height: "100%", width: "100%", position: "absolute" }} onMouseDown={this.mouseDownHandler} onMouseUp={this.mouseUpHandler} onContextMenu={this.contextMenuHandler}>
            {Object.keys(this.nodes).map((id) => {
              return Object.keys(this.nodes[id].connections).map((char, key) => {
                return this.renderArrow(
                  key,
                  id,
                  char,
                  this.nodes[id].x,
                  this.nodes[id].y,
                  this.nodes[this.nodes[id].connections[char].node].x,
                  this.nodes[this.nodes[id].connections[char].node].y,
                  30,
                  char + "→" + this.nodes[id].connections[char].replaceChar + "," + this.nodes[id].connections[char].move
                );
              });
            })}
            {this.state.draggingArrow && this.renderArrow("user", "", "", this.arrowPos.x1, this.arrowPos.y1, this.arrowPos.x2, this.arrowPos.y2)}
            {Object.keys(this.nodes).map((id) => this.renderNode(id))}
          </svg>
          <div id="tape" style={{ height: this.state.tapeHeight }} onMouseDown={this.tapeMouseDownHandler}>
            {
              Object.keys(this.chars).map((id) => {
                if (-this.tapePos < this.state.tapeHeight * (Number(id) + 1) && window.innerWidth > this.state.tapeHeight * (Number(id)) + this.tapePos) {
                  return (<input key={id} style={{
                    height: this.state.tapeHeight,
                    width: this.state.tapeHeight,
                    backgroundColor: id % 2 ? "#4C566A" : "#3B4252",
                    position: "absolute",
                    bottom: 0,
                    left: id * this.state.tapeHeight + this.tapePos,
                    fontSize: this.state.tapeHeight / 2
                  }} maxLength="1" onInput={(event) => { this.chars[id] = event.target.value }} defaultValue={this.chars[id]} />
                  )
                }
              })
            }
            <div id="cursor" style={{
              height: this.state.tapeHeight - 20,
              width: this.state.tapeHeight - 20,
              left: this.state.focusedCharId * this.state.tapeHeight + this.tapePos,
              transition: this.state.running ? ".5s" : "0s",
            }} />
          </div>
          {this.state.editingConnection && (
            <form id="connection-box" style={{ left: this.arrowCenter.x, top: this.arrowCenter.y }}>
              <input className="connection-input" type="text" name="char" maxLength="1" autoFocus onInput={(event) => event.target.nextElementSibling.focus()} /> → <input className="connection-input" type="text" name="replaceChar" maxLength="1" onInput={(event) => event.target.nextElementSibling.focus()} />, <input className="connection-input" type="text" name="move" maxLength="1" />
            </form>
          )}
          {this.state.contextMenu && (
            <div style={{ left: this.contextMenu.x, top: this.contextMenu.y }} id="context-menu" onClick={() => this.setState({ contextMenu: false })}>
              {this.contextMenu.options.map((option) => option)}
            </div>
          )}
        </header>
      </div>
    );
  }
}