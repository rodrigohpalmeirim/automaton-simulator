import React, { Component } from 'react';
import './App.css';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      shift: false,
      draggingNode: false,
      draggingArrow: false,
      editingConnection: false
    }

    this.dragNode = this.dragNode.bind(this);
    this.dragArrow = this.dragArrow.bind(this);
    this.nodeMouseDownHandler = this.nodeMouseDownHandler.bind(this);
    this.nodeMouseUpHandler = this.nodeMouseUpHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.changeConnectionAttributes = this.changeConnectionAttributes.bind(this);
    this.cancelConnection = this.cancelConnection.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);

    this.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 }

    this.nodes = {
      q0: {
        x: 50,
        y: 50,
        connections: {
          /* "a": {
            node: "q1",
            newValue: "b",
            move: "right"
          } */
        }
      },
      q1: {
        x: 200,
        y: 100,
        connections: {}
      },
      q2: {
        x: 100,
        y: 200,
        connections: {}
      }
    }
  }

  arrow(key, x1, y1, x2, y2, endDistance = 0) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx ** 2 + dy ** 2);
    if (d > 0) {
      return (
        <g key={key}>
          {(d > 35) && (<line
            x1={x1 + dx * 30 / d}  // TODO remove hardcoded values
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
        </g>
      );
    }
  }

  node(id) {
    return (
      <circle id={id} key={id} cx={this.nodes[id].x} cy={this.nodes[id].y} r="25" fill="#88C0D0"
        onMouseDown={this.nodeMouseDownHandler}
        onMouseUp={this.nodeMouseUpHandler}
      />
    );
  }

  componentDidMount() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Shift") this.setState({ shift: true });
    });
    document.addEventListener("keyup", (event) => {
      if (event.key === "Shift") this.setState({ shift: false });
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

  nodeMouseDownHandler(event) {
    this.selectedNodeId = event.target.getAttribute("id");
    this.offset = {
      x: event.pageX - this.nodes[this.selectedNodeId].x,
      y: event.pageY - this.nodes[this.selectedNodeId].y
    };
    if (!this.state.shift) {
      this.setState({ draggingNode: true });
      document.addEventListener("mousemove", this.dragNode);
    } else {
      this.setState({ draggingArrow: true });
      document.addEventListener("mousemove", this.dragArrow);
    }
  }

  nodeMouseUpHandler(event) {
    if (this.state.draggingArrow) {
      const endNodeId = event.target.getAttribute("id");
      this.nodes[this.selectedNodeId].connections[""] = {
        node: endNodeId
      }
      this.arrowCenter = {
        x: (this.nodes[this.selectedNodeId].x + this.nodes[endNodeId].x) / 2,
        y: (this.nodes[this.selectedNodeId].y + this.nodes[endNodeId].y) / 2
      }
      this.setState({ editingConnection: true });
      document.addEventListener("mousedown", this.mouseDownHandler);
      document.addEventListener("keydown", this.keyDownHandler);
    }
  }

  changeConnectionAttributes(value, newValue, move) {
    this.nodes[this.selectedNodeId].connections[value] = this.nodes[this.selectedNodeId].connections[""];
    delete this.nodes[this.selectedNodeId].connections[""];
    this.nodes[this.selectedNodeId].connections[value].newValue = newValue;
    this.nodes[this.selectedNodeId].connections[value].move = move;
  }

  cancelConnection() {
    delete this.nodes[this.selectedNodeId].connections[""];
    this.setState({ editingConnection: false });
    document.removeEventListener("mousedown", this.mouseDownHandler);
    document.removeEventListener("keydown", this.keyDownHandler);
  }

  mouseDownHandler(event) {
    if (event.target.className !== "connection-input" && event.target.id !== "connection-box") {
      document.removeEventListener("mousedown", this.mouseDownHandler);
      document.removeEventListener("keydown", this.keyDownHandler);
      const value = document.getElementsByClassName("connection-input")[0].value;
      const newValue = document.getElementsByClassName("connection-input")[1].value;
      const move = document.getElementsByClassName("connection-input")[2].value;
      if (value && newValue && move) {
        this.changeConnectionAttributes(value, newValue, move)
        this.setState({ editingConnection: false });
      } else {
        this.cancelConnection();
      }
    }
  }

  mouseUpHandler() {
    if (this.state.draggingNode) document.removeEventListener("mousemove", this.dragNode);
    if (this.state.draggingArrow) document.removeEventListener("mousemove", this.dragArrow);
    this.setState({ draggingNode: false, draggingArrow: false });
    this.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 }
  }

  keyDownHandler(event) {
    const value = document.getElementsByClassName("connection-input")[0].value;
    const newValue = document.getElementsByClassName("connection-input")[1].value;
    const move = document.getElementsByClassName("connection-input")[2].value;
    if (event.key === "Enter" && value && newValue && move) {
      document.removeEventListener("mousedown", this.mouseDownHandler);
      document.removeEventListener("keydown", this.keyDownHandler);
      this.changeConnectionAttributes(value, newValue, move)
      this.setState({ editingConnection: false });
    } else if (event.key === "Escape") {
      this.cancelConnection();
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <svg style={{ height: "100%", width: "100%", position: "absolute" }} onMouseUp={this.mouseUpHandler}>
            {Object.keys(this.nodes).map((id) => {
              return Object.keys(this.nodes[id].connections).map((char, key) => {
                return this.arrow(key, this.nodes[id].x, this.nodes[id].y, this.nodes[this.nodes[id].connections[char].node].x, this.nodes[this.nodes[id].connections[char].node].y, 30);
              });
            })}
            {this.state.draggingArrow && this.arrow("user", this.arrowPos.x1, this.arrowPos.y1, this.arrowPos.x2, this.arrowPos.y2)}
            {Object.keys(this.nodes).map((id) => this.node(id))}
          </svg>
          {this.state.editingConnection && (
            <form id="connection-box" style={{ left: this.arrowCenter.x, top: this.arrowCenter.y }}>
              <input className="connection-input" type="text" name="value" maxLength="1" autoFocus /> → <input className="connection-input" type="text" name="newValue" maxLength="1" />, <input className="connection-input" type="text" name="move" maxLength="1" />
            </form>
          )}
        </header>
      </div>
    );
  }
}