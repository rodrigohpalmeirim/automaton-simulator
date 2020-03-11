import React, { Component } from 'react';

export class ConnectionInput extends Component {
    render() {
        return (
            <form className="connection-input">
                <input type="text" name="value" maxLength="1" /> → <input type="text" name="newValue" maxLength="1" />, <input type="text" name="move" maxLength="1" />
            </form>
        )
    }
}