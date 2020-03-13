import React, { Component } from 'react';
import './App.css';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      draggingNode: false,
      draggingArrow: false,
      editingConnection: false,
      contextMenu: false
    }

    this.dragNode = this.dragNode.bind(this);
    this.dragArrow = this.dragArrow.bind(this);
    this.nodeMouseDownHandler = this.nodeMouseDownHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.changeConnectionAttributes = this.changeConnectionAttributes.bind(this);
    this.cancelConnection = this.cancelConnection.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.contextMenuHandler = this.contextMenuHandler.bind(this);
    this.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 };
    this.selectedConnectionChar = "";
    this.tempNode = "";
    this.contextMenuPos = { x: 0, y: 0 }

    this.nodes = {
      q0: {
        x: 200,
        y: 200,
        connections: {}
      }
    }
  }

  renderArrow(key, node, char, x1, y1, x2, y2, endDistance = 0, text = "") {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx ** 2 + dy ** 2);
    if (d > 0) {
      return (
        <g key={key}>
          {(d > 35) && (<line
            x1={x1 + dx * 30 / d}  // TODO remove hardcoded chars
            y1={y1 + dy * 30 / d}
            x2={x2 - dx * (endDistance + 14) / d}
            y2={y2 - dy * (endDistance + 14) / d}
            style={{ stroke: "#88C0D0", strokeWidth: 5 }}
          />)
          }
          <polygon
            points={
              (x2 - dx * endDistance / d) + "," + (y2 - dy * endDistance / d) + " " +
              (x2 - dx * (endDistance + 15) / d - 10 * dy / d) + "," + (y2 - dy * (endDistance + 15) / d + 10 * dx / d) + " " +
              (x2 - dx * (endDistance + 15) / d + 10 * dy / d) + "," + (y2 - dy * (endDistance + 15) / d - 10 * dx / d)
            }
            fill="#88C0D0"
          />
          {text && (
            <g onDoubleClick={() => {
              this.setState({ editingConnection: true });
              this.selectedConnectionChar = char;
              this.selectedNodeId = node;
              this.arrowCenter = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
            }}>
              <rect x={(x1 + x2) / 2 - 27} y={(y1 + y2) / 2 - 10} height="20" width="54" rx="5" ry="5" fill="#88C0D0" />
              <text x={(x1 + x2) / 2 - 23} y={(y1 + y2) / 2 + 5} fontSize="15" fontFamily="monospace" fill="#2E3440">{text}</text>
            </g>
          )}
        </g>
      );
    }
  }

  renderNode(id) {
    return (
      <g key={id} id={id} type="node">
        <circle cx={this.nodes[id].x} cy={this.nodes[id].y} r="25" fill="#88C0D0" />
        {id.length === 2 ? <text x={this.nodes[id].x - 12} y={this.nodes[id].y + 6} fontSize="20" fontFamily="monospace" fill="#2E3440">{id}</text> :
          <text x={this.nodes[id].x - 18} y={this.nodes[id].y + 6} fontSize="20" fontFamily="monospace" fill="#2E3440">{id}</text>
        }
      </g>
    );
  }

  componentDidMount() {
    document.querySelector("svg").addEventListener("mousedown", this.mouseDownHandler);
    document.addEventListener("keydown", this.keyDownHandler);
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

  createConnection(endNodeId) {
    this.nodes[this.selectedNodeId].connections[""] = {
      node: endNodeId,
      replaceChar: "",
      move: ""
    }
    this.arrowCenter = {
      x: (this.nodes[this.selectedNodeId].x + this.nodes[endNodeId].x) / 2,
      y: (this.nodes[this.selectedNodeId].y + this.nodes[endNodeId].y) / 2
    }
    this.setState({ editingConnection: true });
  }

  changeConnectionAttributes(node, char, newChar, replaceChar, move) {
    const endNode = this.nodes[node].connections[char].node;
    delete this.nodes[node].connections[char];
    this.nodes[node].connections[newChar] = {
      node: endNode,
      replaceChar: replaceChar,
      move: move
    }
    this.selectedConnectionChar = "";
    this.tempNode = "";
  }

  cancelConnection() {
    for (const id in this.nodes) {
      delete this.nodes[id].connections[""];
    }
    this.setState({ editingConnection: false });
    this.selectedConnectionChar = "";
    delete this.nodes[this.tempNode];
    this.forceUpdate();
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

  mouseDownHandler(event) {
    this.setState({contextMenu: false});
    if (this.state.editingConnection && event.target.className !== "connection-input" && event.target.id !== "connection-box") {
      const newChar = document.getElementsByClassName("connection-input")[0].value;
      const replaceChar = document.getElementsByClassName("connection-input")[1].value;
      const move = document.getElementsByClassName("connection-input")[2].value;
      if (newChar && replaceChar && move) {
        this.changeConnectionAttributes(this.selectedNodeId, this.selectedConnectionChar, newChar, replaceChar, move)
        this.setState({ editingConnection: false });
      } else {
        this.cancelConnection();
      }
    }
    try {
      if (event.target.parentElement.getAttribute("type") === "node") {
        this.nodeMouseDownHandler(event);
      }
    } catch (e) {}
  }

  mouseUpHandler(event) {
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
      const newChar = document.getElementsByClassName("connection-input")[0].value;
      const replaceChar = document.getElementsByClassName("connection-input")[1].value;
      const move = document.getElementsByClassName("connection-input")[2].value;
      if (event.key === "Enter" && newChar && replaceChar && move) {
        this.changeConnectionAttributes(this.selectedNodeId, this.selectedConnectionChar, newChar, replaceChar, move)
        this.setState({ editingConnection: false });
      } else if (event.key === "Escape") {
        this.cancelConnection();
      }
    }
  }

  contextMenuHandler(event) {
    event.preventDefault();
    this.setState({contextMenu: true})
    this.contextMenuPos = {
      x: event.pageX,
      y: event.pageY
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <svg style={{ height: "100%", width: "100%", position: "absolute" }} onMouseUp={this.mouseUpHandler} onContextMenu={this.contextMenuHandler}>
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
          {this.state.editingConnection && (
            <form id="connection-box" style={{ left: this.arrowCenter.x, top: this.arrowCenter.y }}>
              <input className="connection-input" type="text" name="char" maxLength="1" autoFocus /> → <input className="connection-input" type="text" name="replaceChar" maxLength="1" />, <input className="connection-input" type="text" name="move" maxLength="1" />
            </form>
          )}
          {this.state.contextMenu && (
            <div style={{ left: this.contextMenuPos.x, top: this.contextMenuPos.y }} id="context-menu" onClick={() => this.setState({contextMenu: false})}>
              <p onClick={() => {this.createNode(this.contextMenuPos.x, this.contextMenuPos.y)}}>Add node</p>
            </div>
          )}
        </header>
      </div>
    );
  }
}