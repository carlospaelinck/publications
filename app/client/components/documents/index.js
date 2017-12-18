import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Route from "react-router-dom/Route";
import Toolbar from "../toolbar";
import EditorView from "../editor";
import LoadingView from "./loading";
import AsyncViewContent from "../async-content";
import MetricsBar from "../metrics-bar";
import LayersSidebar from "../layers-sidebar/index";
import OpenDocumentDialog from "../open-document";
import NewDocumentDialog from "../new-document";
import Modal from "../modal";
import to from "await-to-js";
import Api from "../../util/api";
import {
  documentsWithEditorState,
  addEditorStateToDocument,
} from "../../util/documents";
import {
  updatedDocumentStateForObjectChanges,
  updatedDocumentStateForLayerChanges,
  updatedDocumentStateForClipboardAction,
} from "./editor-actions";
import shortid from "shortid";

const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ViewContent = styled.div`
  display: flex;
  flex: 1 0 calc(100% - 85px);
`;

export default class DocumentsView extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  state = {
    user: null,
    documents: null,
    currentDocument: null,
    selectedObject: null,
    clipboardContents: null,
    newDocumentModalVisible: false,
    openDocumentModalVisible: false,
    layersPanelVisible: false,
  };

  componentDidMount() {
    this.getCurrentUser();
  }

  /**
   * Display Actions
   */

  toggleVisibility = identifier => {
    const key = `${identifier}Visible`;
    this.setState(prevState => ({
      [key]: !prevState[key],
    }));
  };

  toggleNewDocument = this.toggleVisibility.bind(this, "newDocumentModal");
  toggleOpenDocument = this.toggleVisibility.bind(this, "openDocumentModal");
  toggleLayersPanel = this.toggleVisibility.bind(this, "layersPanel");

  /**
   * Data Actions
   */

  getCurrentUser = async () => {
    const [err, user] = await to(Api.GET("users/current"));
    if (err) {
      this.context.router.history.replace("/");
      return;
    }
    this.setState({ user });
  };

  getDocuments = async () => {
    const [err, documents] = await to(Api.GET("documents"));
    if (err) {
      this.setState({ documents: null });
      return;
    }
    this.setState({
      documents: documentsWithEditorState(documents),
      selectedObject: null,
    });
  };

  getDocument = async id => {
    const [err, doc] = await to(Api.GET(`documents/${id}`));
    if (err) {
      return;
    }
    this.setState({
      currentDocument: addEditorStateToDocument(doc),
      selectedObject: null,
    });
  };

  /**
   * Editor Actions
   */

  updateSelectedObject = sender =>
    this.setState(prevState =>
      updatedDocumentStateForObjectChanges(
        sender,
        prevState.selectedObject,
        prevState.currentDocument
      )
    );

  addObject = sender => {
    const newObject = {
      ...sender,
      z: this.state.currentDocument.shapes.length + 1,
      id: shortid.generate(),
    };
    this.setState(prevState => ({
      currentDocument: {
        ...prevState.currentDocument,
        shapes: [...prevState.currentDocument.shapes, newObject],
      },
      selectedObject: newObject,
    }));
  };

  deleteObject = () => {
    const objectToDelete = this.state.selectedObject;
    const shapes = this.state.currentDocument.shapes
      .filter(shape => shape.id !== objectToDelete.id)
      .map(shape => {
        if (shape.z > objectToDelete.z) {
          shape.z -= 1;
        }
        return shape;
      });
    this.setState(prevState => ({
      selectedObject: null,
      currentDocument: { ...prevState.currentDocument, shapes },
    }));
  };

  adjustObjectLayer = sender =>
    this.setState(prevState =>
      updatedDocumentStateForLayerChanges(sender, prevState.currentDocument)
    );

  handleClipboardAction = action =>
    this.setState(prevState =>
      updatedDocumentStateForClipboardAction(action, prevState)
    );

  /**
   * Render
   */

  render() {
    const {
      state: {
        user,
        documents,
        currentDocument,
        selectedObject,
        openDocumentModalVisible,
        newDocumentModalVisible,
        layersPanelVisible,
      },
    } = this;
    return (
      <ViewContainer>
        <Modal
          renderContent={
            <OpenDocumentDialog
              documents={documents}
              getDocuments={this.getDocuments}
              replaceRoute={this.context.router.history.replace}
              onDismiss={this.toggleOpenDocument}
            />
          }
          visible={openDocumentModalVisible}
        />
        <Modal
          renderContent={
            <NewDocumentDialog onDismiss={this.toggleNewDocument} />
          }
          visible={newDocumentModalVisible}
        />
        <Toolbar
          user={user}
          selectedObject={selectedObject}
          currentDocument={currentDocument}
          showNewDocumentModal={this.toggleNewDocument}
          showOpenDocumentModal={this.toggleOpenDocument}
          toggleLayersPanel={this.toggleLayersPanel}
          layersPanelVisible={layersPanelVisible}
          addObject={this.addObject}
          deleteObject={this.deleteObject}
        />
        <MetricsBar
          shape={selectedObject}
          updateSelectedObject={this.updateSelectedObject}
        />
        <ViewContent>
          <AsyncViewContent
            waitFor={user}
            renderLoading={<LoadingView />}
            renderContent={
              <div>
                <LayersSidebar
                  visible={layersPanelVisible}
                  currentDocument={currentDocument}
                  selectedObject={selectedObject}
                  adjustObjectLayer={this.adjustObjectLayer}
                  updateSelectedObject={this.updateSelectedObject}
                />
                <Route
                  path="/documents/:id"
                  render={props => (
                    <EditorView
                      {...props}
                      selectedObject={selectedObject}
                      currentDocument={currentDocument}
                      getDocument={this.getDocument}
                      updateSelectedObject={this.updateSelectedObject}
                    />
                  )}
                />
              </div>
            }
          />
        </ViewContent>
      </ViewContainer>
    );
  }
}
