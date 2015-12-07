import React, {Component} from 'react'

export default class DocumentsNavbar extends Component {
  constructor() {
    super(...arguments)
  }

  render() {
    return (
      <div className="navbar-container">
        <div className="navbar-controls-left">
          <div className="navbar-logo">
            <div className="navbar-logo-icon"></div>
          </div>
          <button className="button" onClick={this.props.createNewDocument}>New</button>
          <button className="button" disabled={!this.props.documentIsSelected} onClick={this.props.editDocument}>Edit</button>
          <button className="button button-destructive" disabled={!this.props.documentIsSelected} onClick={this.props.deleteDocument}>Delete</button>
          <button className="button" onClick={this.props.logOut}>Log Out</button>
        </div>
        <div className="navbar-controls-right">
          <input
            className="input-text-search"
            value={this.props.searchKeyword}
            onChange={this.props.searchKeywordChanged}
            placeholder="Search for Documents" />
        </div>
      </div>
    )
  }
}
