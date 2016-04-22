import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { contains, isEmpty } from 'lodash'
import { autobind } from 'core-decorators'

import DocumentsNavbar from 'components/documents/documents.navbar'
import DocumentItem from 'components/documents/document.item'
import NewDocumentModal from 'components/documents/documents.new.modal'
import UserAccountModal from 'components/user/user.account.modal'
import InputText from 'components/ui/input.text'

import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as UserActions from 'actions/user'
import * as DocumentActions from 'actions/document'
import * as ErrorActions from 'actions/errors'

const mapStateToProps = state => Object.assign({}, state.user, state.doc, state.errors)
const mapDispatchToProps = dispatch => bindActionCreators(
    Object.assign({}, UserActions, DocumentActions, ErrorActions
  ), dispatch)

export class Documents extends Component {
  constructor() {
    super(...arguments)

    this.state = {
      searchKeyword: '',
      selectedDocument: null,
      isNewDocModalOpen: false,
      isUserAccountModalOpen: false
    }
  }

  componentDidMount() {
    document.title = 'Publications — All Documents'
    this.props.getDocuments()
  }

  componentWillUnmount() {
    this.setState({selectedDocument: null})
    document.title = 'Publications'
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.documents.length > this.props.documents.length) {
      this.setState({isNewDocModalOpen: false})
    }
  }

  @autobind
  updateSelectedDocument(sender, event) {
    if (!!event) event.preventDefault()
    this.setState({selectedDocument: sender})
  }

  @autobind
  searchKeywordChanged(event) {
    this.setState({searchKeyword: event.target.value})
  }

  @autobind
  toggleNewDocumentModal() {
    this.setState({
      isNewDocModalOpen: !this.state.isNewDocModalOpen
    })
  }

  @autobind
  toggleUserAccountModal() {
    this.setState({
      isUserAccountModalOpen: !this.state.isUserAccountModalOpen
    })
  }

  @autobind
  createNewDocument(options) {
    this.props.newDocument({
      name: options.name,
      width: options.width,
      height: options.height,
      shapes: options.shapes
    })
  }

  @autobind
  editDocument() {
    const selectedDocument = this.state.selectedDocument

    if (selectedDocument) {
      const {id} = selectedDocument
      this.props.history.push(`/documents/${id}/edit`)
    }
  }

  @autobind
  deleteDocument() {
    const selectedDocument = this.state.selectedDocument

    if (!!selectedDocument) {
      this.props.removeDocument(selectedDocument)
      this.setState({selectedDocument: null})
    }
  }

  @autobind
  logOut() {
    const {history, logoutUser, clearDocuments} = this.props

    logoutUser(() => {
      clearDocuments()
      this.props.history.push('/')
    })
  }

  render() {
    const { documents } = this.props

    const documentItems = documents
      .filter(doc => {
        if (isEmpty(this.state.searchKeyword)) {
          return true
        } else {
          return contains(doc.name.toLowerCase(), this.state.searchKeyword.toLowerCase())
        }
      })
      .sort((lhs, rhs) => rhs.lastModified - lhs.lastModified)
      .map(doc => {
        return <DocumentItem
          key={doc.id}
          doc={doc}
          editDocument={this.editDocument}
          selectedDocument={this.state.selectedDocument}
          updateSelectedDocument={this.updateSelectedDocument} />
      })

    return <div>
      <UserAccountModal
        userId={this.props.userId}
        userName={this.props.userName}
        updateUser={this.props.updateUser}
        errors={this.props.errors}
        removeError={this.props.removeError}
        isTemporaryUser={this.props.isTemporaryUser}
        toggleModal={this.toggleUserAccountModal}
        isOpen={this.state.isUserAccountModalOpen} />
      <NewDocumentModal
        createNewDocument={this.createNewDocument}
        toggleNewDocumentModal={this.toggleNewDocumentModal}
        isOpen={this.state.isNewDocModalOpen} />
      <DocumentsNavbar
        isTemporaryUser={this.props.isTemporaryUser}
        isAuthenticated={this.props.isAuthenticated}
        documentIsSelected={this.state.selectedDocument !== null}
        editDocument={this.editDocument}
        deleteDocument={this.deleteDocument}
        createNewDocument={this.toggleNewDocumentModal}
        searchKeyword={this.state.searchKeyword}
        searchKeywordChanged={this.searchKeywordChanged}
        logOut={this.logOut}
        toggleUserAccountModal={this.toggleUserAccountModal} />
      <div className="app-content">
        <ul className="document-items" onClick={() => this.updateSelectedDocument(null, event)}>
          <ReactCSSTransitionGroup
            transitionName="document-item-animation"
            transitionAppear={true}
            transitionAppearTimeout={0}
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300} >
            {documentItems}
          </ReactCSSTransitionGroup>
        </ul>
      </div>
    </div>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Documents)