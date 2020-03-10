import React, { Component } from 'react';
import './App.css';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      shift: false,
      draggingNode: false,
      draggingArrow: false,
    }

    this.dragNode = this.dragNode.bind(this);
    this.dragArrow = this.dragArrow.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);

    this.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 }

    this.nodes = {
      q0: {
        x: 50,
        y: 50,
        connections: {
          "a": {
            node: "q1",
            newValue: "b",
            move: "right"
          }
        }
      },
      q1: {
        x: 200,
        y: 100,
        connections: {
          "a": {
            node: "q2",
          }
        }
      },
      q2: {
        x: 100,
        y: 200,
        connections: {
        }
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
        onMouseDown={this.mouseDownHandler}
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
    const id = this.selected.getAttribute("id");
    this.nodes[id].x = event.pageX - this.offset.x;
    this.nodes[id].y = event.pageY - this.offset.y;
    this.forceUpdate();
  }

  dragArrow(event) {
    const id = this.selected.getAttribute("id");
    this.arrowPos = {
      x1: this.nodes[id].x,
      y1: this.nodes[id].y,
      x2: event.pageX,
      y2: event.pageY
    }
    this.forceUpdate();
  }

  mouseDownHandler(event) {
    this.selected = event.target;
    this.offset = {
      x: event.pageX - this.selected.getAttribute("cx"),
      y: event.pageY - this.selected.getAttribute("cy")
    };
    if (!this.state.shift) {
      this.setState({ draggingNode: true });
      document.addEventListener("mousemove", this.dragNode);
    } else {
      this.setState({ draggingArrow: true });
      document.addEventListener("mousemove", this.dragArrow);
    }
  }

  mouseUpHandler() {
    if (this.state.draggingNode) document.removeEventListener("mousemove", this.dragNode);
    if (this.state.draggingArrow) document.removeEventListener("mousemove", this.dragArrow);
    this.setState({ draggingNode: false, draggingArrow: false })
    this.arrowPos = { x1: 0, y1: 0, x2: 0, y2: 0 }
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
        </header>
      </div>
    );
  }
}