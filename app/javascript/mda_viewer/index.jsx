import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import XdsmViewer from 'mda_viewer/components/XdsmViewer';
import AnalysisEditor from 'mda_viewer/components/AnalysisEditor';
import AnalysisNotePanel from 'mda_viewer/components/AnalysisNotePanel';
import AnalysisBreadCrumbs from 'mda_viewer/components/AnalysisBreadCrumbs';
import DisciplinesEditor from 'mda_viewer/components/DisciplinesEditor';
import ConnectionsEditor from 'mda_viewer/components/ConnectionsEditor';
import VariablesEditor from 'mda_viewer/components/VariablesEditor';
import OpenmdaoImplEditor from 'mda_viewer/components/OpenmdaoImplEditor';
import ExportPanel from 'mda_viewer/components/ExportPanel';
import ComparisonPanel from 'mda_viewer/components/ComparisonPanel';
import DistributionModals from 'mda_viewer/components/DistributionModals';

import Error from '../utils/components/Error';
import MetaModelQualification from '../utils/components/MetaModelQualification';
import AnalysisDatabase from '../utils/AnalysisDatabase';
import deepIsEqual from '../utils/compare';

const VAR_REGEXP = /^[a-zA-Z][_a-zA-Z0-9:.=]*$/;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

class MdaViewer extends React.Component {
  constructor(props) {
    super(props);
    const { api, members, mda } = this.props;
    this.api = api;
    const { isEditing } = this.props;
    const filter = { fr: undefined, to: undefined };
    this.db = new AnalysisDatabase(props.mda);
    this.state = {
      filter,
      isEditing,
      mda: props.mda,
      analysisMembers: members,
      newAnalysisName: mda.name,
      newDisciplineName: '',
      analysisNote: '',
      selectedConnectionNames: [],
      errors: [],
      implEdited: false,
      mdaEdited: false,
      useScaling: this.db.isScaled(),
    };
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleAnalysisNameChange = this.handleAnalysisNameChange.bind(this);
    this.handleAnalysisNoteChange = this.handleAnalysisNoteChange.bind(this);
    this.handleAnalysisPublicChange = this.handleAnalysisPublicChange.bind(this);
    this.handleAnalysisMemberSearch = this.handleAnalysisMemberSearch.bind(this);
    this.handleAnalysisMemberCreate = this.handleAnalysisMemberCreate.bind(this);
    this.handleAnalysisMemberDelete = this.handleAnalysisMemberDelete.bind(this);
    this.handleAnalysisUpdate = this.handleAnalysisUpdate.bind(this);
    this.handleDisciplineNameChange = this.handleDisciplineNameChange.bind(this);
    this.handleDisciplineCreate = this.handleDisciplineCreate.bind(this);
    this.handleDisciplineUpdate = this.handleDisciplineUpdate.bind(this);
    this.handleDisciplineDelete = this.handleDisciplineDelete.bind(this);
    this.handleSubAnalysisSearch = this.handleSubAnalysisSearch.bind(this);
    this.handleConnectionNameChange = this.handleConnectionNameChange.bind(this);
    this.handleConnectionCreate = this.handleConnectionCreate.bind(this);
    this.handleConnectionDelete = this.handleConnectionDelete.bind(this);
    this.handleConnectionDelete = this.handleConnectionDelete.bind(this);
    this.handleConnectionChange = this.handleConnectionChange.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
    this.handleOpenmdaoImplUpdate = this.handleOpenmdaoImplUpdate.bind(this);
    this.handleOpenmdaoImplChange = this.handleOpenmdaoImplChange.bind(this);
    this.handleOpenmdaoImplReset = this.handleOpenmdaoImplReset.bind(this);
    this.handleProjectSearch = this.handleProjectSearch.bind(this);
    this.handleProjectSelected = this.handleProjectSelected.bind(this);
  }

  handleFilterChange(filter) {
    const newState = update(this.state, { filter: { $set: filter } });
    this.setState(newState);
    this.xdsmViewer.setSelection(filter);
  }

  // *** Connections *********************************************************

  handleConnectionNameChange(selected) {
    // console.log(selected);
    const selection = this._validateConnectionNames(selected);
    const newState = update(this.state, {
      selectedConnectionNames: { $set: selection.selected },
      errors: { $set: selection.errors },
    });
    this.setState(newState);
  }

  handleConnectionCreate(event) {
    event.preventDefault();

    const { errors, selectedConnectionNames, filter } = this.state;
    const { mda } = this.props;
    if (errors.length > 0) {
      return;
    }
    const names = selectedConnectionNames.map((e) => e.name);
    // console.log("CREATE", names);
    const data = { from: filter.fr, to: filter.to, names };
    this.api.createConnection(mda.id, data, () => {
      const newState = update(this.state, { selectedConnectionNames: { $set: [] } });
      this.setState(newState);
      // console.log("NEW CONNECTION RESET");
      this.renderXdsm();
    }, (error) => {
      const message = error.response.data.message || 'Error: Creation failed';
      const newState = update(this.state, { errors: { $set: [message] } });
      this.setState(newState);
    });
  }

  handleConnectionChange(connId, connAttrs) {
    // console.log('Change variable connection '+connId+ ' with '+JSON.stringify(connAttrs));

    // parameter
    const cAttrs = JSON.parse(JSON.stringify(connAttrs));
    if (connAttrs.init || connAttrs.init === '') {
      cAttrs.parameter_attributes = { init: connAttrs.init };
    }
    if (connAttrs.lower || connAttrs.lower === '') {
      cAttrs.parameter_attributes = { lower: connAttrs.lower };
    }
    if (connAttrs.upper || connAttrs.upper === '') {
      cAttrs.parameter_attributes = { upper: connAttrs.upper };
    }
    delete cAttrs.init;
    delete cAttrs.lower;
    delete cAttrs.upper;

    // scaling
    if (connAttrs.ref || connAttrs.ref === '') {
      cAttrs.scaling_attributes = { ref: connAttrs.ref };
    }
    if (connAttrs.ref0 || connAttrs.ref0 === '') {
      cAttrs.scaling_attributes = { ref0: connAttrs.ref0 };
    }
    if (connAttrs.res_ref || connAttrs.res_ref === '') {
      cAttrs.scaling_attributes = { res_ref: connAttrs.res_ref };
    }
    delete cAttrs.ref;
    delete cAttrs.ref0;
    delete cAttrs.res_ref;

    if (Object.keys(cAttrs).length !== 0) {
      this.api.updateConnection(connId, cAttrs,
        () => {
          this.renderXdsm();
        },
        (error) => {
          const message = error.response.data.message || 'Error: Update failed';
          const newState = update(this.state, { errors: { $set: [message] } });
          this.setState(newState);
        });
    }
  }

  handleConnectionDelete(connId) {
    this.api.deleteConnection(connId,
      () => { this.renderXdsm(); },
      (error) => {
        const message = error.response.data.message || 'Error: Update failed';
        const newState = update(this.state, { errors: { $set: [message] } });
        this.setState(newState);
      });
  }

  // *** Disciplines ************************************************************

  handleDisciplineCreate(event) {
    event.preventDefault();
    const { mda, newDisciplineName } = this.state;
    this.api.createDiscipline(mda.id, { name: newDisciplineName, type: 'analysis' },
      () => {
        const newState = update(this.state, { newDisciplineName: { $set: '' } });
        this.setState(newState);
        this.renderXdsm();
      },
      (error) => {
        const message = error.response.data.message || 'Error: Update failed';
        const newState = update(this.state, { errors: { $set: [message] } });
        this.setState(newState);
      });
  }

  handleDisciplineNameChange(event) {
    event.preventDefault();
    const newState = update(this.state, { newDisciplineName: { $set: event.target.value } });
    this.setState(newState);
  }

  handleDisciplineUpdate(node, discAttrs) {
    const { mda } = this.state;
    if ('position' in discAttrs) {
      const items = reorder(mda.nodes, mda.nodes.indexOf(node), discAttrs.position);
      const newState = update(this.state, { mda: { nodes: { $set: items } } });
      this.setState(newState);
    }
    console.log(discAttrs);
    this.api.updateDiscipline(node.id, discAttrs,
      () => { this.renderXdsm(); },
      (error) => {
        const message = error.response.data.message || 'Error: Update failed';
        const newState = update(this.state, { errors: { $set: [message] } });
        this.setState(newState);
      });
  }

  handleDisciplineDelete(node) {
    const { filter } = this.state;
    this.api.deleteDiscipline(node.id, () => {
      if (filter.fr === node.id || filter.to === node.id) {
        this.handleFilterChange({ fr: undefined, to: undefined });
      }
      this.renderXdsm();
    });
  }

  handleSubAnalysisSearch(callback) {
    const { mda } = this.state;
    this.api.getSubAnalysisCandidates(
      (response) => {
        const options = response.data
          .filter((analysis) => analysis.id !== mda.id)
          .map((analysis) => ({ id: analysis.id, label: `#${analysis.id} ${analysis.name}` }));
        callback(options);
      },
    );
  }

  // *** Analysis ************************************************************
  handleAnalysisNameChange(event) {
    event.preventDefault();
    const newState = update(this.state, {
      newAnalysisName: { $set: event.target.value },
      errors: { $set: [] },
      mdaEdited: { $set: true },
    });
    this.setState(newState);
    return false;
  }

  handleProjectSearch(callback) {
    // TODO: query could be used to filter user on server side
    this.api.getProjects((response) => callback(response.data));
  }

  handleProjectSelected(selected) {
    const { mda: { project } } = this.state;
    if (selected !== project) {
      let newState = update(this.state, {
        mdaEdited: { $set: true },
        mda: {
          project: { $set: { id: -1, name: '' } },
        },
      });
      if (selected.length) {
        console.log(`Project: ${JSON.stringify(selected[0])}`);
        newState = update(this.state, {
          mda: { project: { $set: selected[0] } },
        });
      }
      this.setState(newState);
    }
  }

  handleAnalysisNoteChange(event) {
    const newState = update(this.state, {
      mda: { note: { $set: event.target.innerHTML } },
      mdaEdited: { $set: true },
    });
    this.setState(newState);
  }

  handleAnalysisPublicChange() {
    const { mda } = this.state;
    this.api.updateAnalysis(mda.id, { public: !mda.public },
      () => {
        const newState = update(this.state, { mda: { public: { $set: !mda.public } } });
        this.setState(newState);
      },
      (error) => { console.log(error); });
    return false;
  }

  handleAnalysisMemberSearch(query, callback) {
    // TODO: query could be used to filter user on server side
    const { mda } = this.state;
    this.api.getMemberCandidates(mda.id,
      (response) => {
        callback(response.data);
      });
  }

  handleAnalysisMemberCreate(selected) {
    const { mda } = this.state;
    if (selected.length) {
      this.api.addMember(selected[0].id, mda.id,
        () => {
          const newState = update(this.state, { analysisMembers: { $push: selected } });
          this.setState(newState);
        });
    }
  }

  handleAnalysisMemberDelete(user) {
    const { mda, analysisMembers } = this.state;
    this.api.removeMember(user.id, mda.id, () => {
      const idx = analysisMembers.indexOf(user);
      const newState = update(this.state, { analysisMembers: { $splice: [[idx, 1]] } });
      this.setState(newState);
    });
  }

  handleAnalysisUpdate(event) {
    event.preventDefault();
    const { mda, newAnalysisName } = this.state;
    const params = {
      name: newAnalysisName,
      note: mda.note,
      design_project_id: mda.project.id,
    };
    this.api.updateAnalysis(mda.id, params,
      () => {
        this.api.getAnalysis(mda.id, false,
          () => {
            console.log('MDA UPDATED');
            const newState = update(this.state, {
              mdaEdited: { $set: false },
              mda: {
                name: { $set: newAnalysisName },
                note: { $set: mda.note },
                project: { $set: mda.project },
              },
            });
            this.setState(newState);
          });
      },
      (error) => {
        const message = error.response.data.message || 'Error: Update failed';
        const newState = update(this.state, { errors: { $set: [message] } });
        this.setState(newState);
      });
  }

  handleErrorClose(index) {
    const newState = update(this.state, { errors: { $splice: [[index, 1]] } });
    this.setState(newState);
  }

  // *** OpenmdaoImpl ************************************************************
  handleOpenmdaoImplUpdate(openmdaoImpl) {
    const oImpl = JSON.parse(JSON.stringify(openmdaoImpl));
    delete oImpl.components.use_scaling;
    const { mda } = this.props;
    this.api.updateOpenmdaoImpl(mda.id, oImpl,
      () => {
        const newState = update(this.state, {
          implEdited: { $set: false },
          mda: { impl: { openmdao: { $set: oImpl } } },
        });
        this.setState(newState);
      });
  }

  handleOpenmdaoImplChange(openmdaoImpl) {
    let newState;
    const { mda } = this.state;
    if (deepIsEqual(mda.impl.openmdao, openmdaoImpl)) {
      newState = update(this.state, { implEdited: { $set: false } });
    } else if (mda.impl.openmdao.components.use_scaling === openmdaoImpl.components.use_scaling) {
      newState = update(this.state, { implEdited: { $set: openmdaoImpl } });
    } else {
      newState = update(this.state, { useScaling: { $set: openmdaoImpl.components.use_scaling } });
    }
    this.setState(newState);
  }

  handleOpenmdaoImplReset() {
    const newState = update(this.state, { implEdited: { $set: false } });
    this.setState(newState);
  }

  _validateConnectionNames(selected) {
    const names = selected.map((e) => e.name);
    const newSelected = [];
    const errors = [];
    // console.log("VALID: ", names);
    names.forEach((n) => {
      const vnames = n.split(','); // allow "var1, var2" input
      const varnames = vnames.map((name) => name.trim());
      // console.log(varnames);
      varnames.forEach((name) => {
        if (!name.match(VAR_REGEXP)) {
          if (name !== '') {
            errors.push(`Variable name '${name}' is invalid`);
            // console.log("Error: " + errors);
          }
        }
        newSelected.push({ name });
      }, this);
    }, this);
    // console.log(JSON.stringify({ selected: newSelected, errors: errors }));
    return { selected: newSelected, errors };
  }

  renderXdsm() {
    const { mda } = this.state;
    this.api.getAnalysis(mda.id, true,
      (response) => {
        const newState = update(this.state,
          {
            mda: {
              nodes: { $set: response.data.nodes },
              edges: { $set: response.data.edges },
              inactive_edges: { $set: response.data.inactive_edges },
              vars: { $set: response.data.vars },
              impl: { $set: response.data.impl },
            },
          });
        this.setState(newState);
        const newMda = { nodes: response.data.nodes, edges: response.data.edges };
        this.xdsmViewer.update(newMda);
      });
  }

  render() {
    const {
      mda, useScaling, errors, isEditing, filter, implEdited, mdaEdited,
      newAnalysisName, analysisMembers, selectedConnectionNames, newDisciplineName,
    } = this.state;
    const errs = errors.map(
      // eslint-disable-next-line react/no-array-index-key
      (message, i) => (<Error key={i} msg={message} onClose={() => this.handleErrorClose(i)} />),
    );
    const db = new AnalysisDatabase(mda);
    this.db = db;
    const scaled = useScaling || this.db.isScaled();

    let breadcrumbs;
    if (mda.path.length > 1) {
      breadcrumbs = <AnalysisBreadCrumbs api={this.api} path={mda.path} />;
    }

    const xdsmViewer = (
      <XdsmViewer
        ref={(viewer) => { this.xdsmViewer = viewer; }}
        api={this.api}
        isEditing={isEditing}
        mda={mda}
        filter={filter}
        onFilterChange={this.handleFilterChange}
      />
    );

    const varEditor = (
      <VariablesEditor
        db={db}
        filter={filter}
        useScaling={useScaling}
        onFilterChange={this.handleFilterChange}
        onConnectionChange={this.handleConnectionChange}
        isEditing={isEditing}
        limited={db.mda.operated}
      />
    );

    if (isEditing) {
      let openmdaoImpl = implEdited;
      if (!implEdited) {
        openmdaoImpl = mda.impl.openmdao;
        openmdaoImpl.components.use_scaling = scaled;
      }
      let openmdaoImplMsg;
      if (implEdited) {
        openmdaoImplMsg = (
          <div className="alert alert-warning" role="alert">
            Changes are not saved.
          </div>
        );
      }
      let mdaMsg;
      if (mdaEdited) {
        mdaMsg = (
          <div className="alert alert-warning" role="alert">
            Changes are not saved.
          </div>
        );
      }
      let warningIfOperated;
      if (db.mda.operated) {
        warningIfOperated = (
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            As this analysis is already operated,
            {' '}
            <strong>your edition access is limited</strong>
            . If you need full edition access either restart with a copy of the analysis
            or discard existing operation results.
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        );
      }

      let mdaProjectLink;
      if (db.mda.project.id > 0) {
        mdaProjectLink = (
          <span>
            <a href={this.api.url(`/design_projects/${db.mda.project.id}`)}>
              {db.mda.project.name}
            </a>
            {' '}
            /
            {' '}
          </span>
        );
      }

      return (
        <div>
          <form className="button_to" method="get" action={this.api.url(`/analyses/${mda.id}`)}>
            <button className="btn float-right" type="submit">
              <i className="fa fa-times-circle" />
              {' '}
              Close
            </button>
          </form>
          <h1>
            Edit
            {' '}
            {mdaProjectLink}
            {mda.name}
          </h1>
          {warningIfOperated}
          {breadcrumbs}
          <div className="mda-section">
            {xdsmViewer}
          </div>
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link"
                id="analysis-tab"
                data-toggle="tab"
                href="#analysis"
                role="tab"
                aria-controls="analysis"
                aria-selected="false"
              >
                Analysis
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="disciplines-tab"
                data-toggle="tab"
                href="#disciplines"
                role="tab"
                aria-controls="disciplines"
                aria-selected="false"
              >
                Disciplines
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="connections-tab"
                data-toggle="tab"
                href="#connections"
                role="tab"
                aria-controls="connections"
                aria-selected="false"
              >
                Connections
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link active"
                id="variables-tab"
                data-toggle="tab"
                href="#variables"
                role="tab"
                aria-controls="variables"
                aria-selected="true"
              >
                Variables
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="openmdao-impl-tab"
                data-toggle="tab"
                href="#openmdao-impl"
                role="tab"
                aria-controls="openmdao-impl"
                aria-selected="false"
              >
                OpenMDAO
              </a>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            {errs}
            <div className="tab-pane fade" id="analysis" role="tabpanel" aria-labelledby="analysis-tab">
              {mdaMsg}
              <AnalysisEditor
                mdaId={db.mda.id}
                mdaProject={db.mda.project}
                api={this.api}
                note={db.mda.note}
                newAnalysisName={newAnalysisName}
                analysisPublic={mda.public}
                analysisMembers={analysisMembers}
                onAnalysisUpdate={this.handleAnalysisUpdate}
                onAnalysisNameChange={this.handleAnalysisNameChange}
                onAnalysisNoteChange={this.handleAnalysisNoteChange}
                onAnalysisPublicChange={this.handleAnalysisPublicChange}
                onAnalysisMemberSearch={this.handleAnalysisMemberSearch}
                onAnalysisMemberSelected={this.handleAnalysisMemberCreate}
                onAnalysisMemberDelete={this.handleAnalysisMemberDelete}
                onProjectSearch={this.handleProjectSearch}
                onProjectSelected={this.handleProjectSelected}
              />
            </div>
            <div className="tab-pane fade" id="disciplines" role="tabpanel" aria-labelledby="disciplines-tab">
              <DisciplinesEditor
                name={newDisciplineName}
                nodes={db.nodes}
                limited={db.mda.operated}
                onDisciplineNameChange={this.handleDisciplineNameChange}
                onSubAnalysisSearch={this.handleSubAnalysisSearch}
                onSubAnalysisSelected={this.handleSubAnalysisSelected}
                onDisciplineCreate={this.handleDisciplineCreate}
                onDisciplineDelete={this.handleDisciplineDelete}
                onDisciplineUpdate={this.handleDisciplineUpdate}
              />
            </div>
            <div className="tab-pane fade" id="connections" role="tabpanel" aria-labelledby="connections-tab">
              <ConnectionsEditor
                db={db}
                filter={filter}
                limited={db.mda.operated}
                onFilterChange={this.handleFilterChange}
                selectedConnectionNames={selectedConnectionNames}
                connectionErrors={errors}
                onConnectionNameChange={this.handleConnectionNameChange}
                onConnectionCreate={this.handleConnectionCreate}
                onConnectionDelete={this.handleConnectionDelete}
              />
            </div>
            <div className="tab-pane fade show active" id="variables" role="tabpanel" aria-labelledby="variables-tab">
              {varEditor}
              <DistributionModals db={db} onConnectionChange={this.handleConnectionChange} />
            </div>
            <div className="tab-pane fade" id="openmdao-impl" role="tabpanel" aria-labelledby="openmdao-impl-tab">
              {openmdaoImplMsg}
              <OpenmdaoImplEditor
                impl={openmdaoImpl}
                db={db}
                onOpenmdaoImplUpdate={this.handleOpenmdaoImplUpdate}
                onOpenmdaoImplChange={this.handleOpenmdaoImplChange}
                onOpenmdaoImplReset={this.handleOpenmdaoImplReset}
              />
            </div>
          </div>
        </div>
      );
    }

    let noteItem; let noteTab;
    if (mda.note && mda.note.length > 0) {
      noteItem = (
        <li className="nav-item">
          <a
            className="nav-link"
            id="note-tab"
            href="#note"
            role="tab"
            aria-controls="note"
            data-toggle="tab"
            aria-selected="false"
          >
            Notes
          </a>
        </li>
      );
      noteTab = (<AnalysisNotePanel note={mda.note} />);
    }

    let metaModelItem; let metaModelTab;
    const { quality } = mda.impl.metamodel;
    if (quality && quality.length > 0) {
      metaModelItem = (
        <li className="nav-item">
          <a
            className="nav-link"
            id="metamodel-tab"
            href="#metamodel"
            role="tab"
            aria-controls="metamodel"
            data-toggle="tab"
            aria-selected="false"
          >
            MetaModel
          </a>
        </li>
      );
      metaModelTab = (
        <div className="tab-pane fade" id="metamodel" role="tabpanel" aria-labelledby="metamodel-tab">
          <MetaModelQualification quality={mda.impl.metamodel.quality} />
        </div>
      );
    }

    return (
      <div>
        {breadcrumbs}
        <div className="mda-section">
          {xdsmViewer}
        </div>
        <div className="mda-section">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link active"
                id="variables-tab"
                data-toggle="tab"
                href="#variables"
                role="tab"
                aria-controls="variables"
                aria-selected="true"
              >
                Variables
              </a>
            </li>
            {noteItem}
            {metaModelItem}
            <li className="nav-item">
              <a
                className="nav-link"
                id="exports-tab"
                data-toggle="tab"
                href="#exports"
                role="tab"
                aria-controls="exports"
                aria-selected="false"
              >
                Export...
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="exports-tab"
                data-toggle="tab"
                href="#diffs"
                role="tab"
                aria-controls="diffs"
                aria-selected="false"
              >
                Compare...
              </a>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade show active" id="variables" role="tabpanel" aria-labelledby="variables-tab">
              {varEditor}
            </div>
            {noteTab}
            {metaModelTab}
            <div className="tab-pane fade" id="exports" role="tabpanel" aria-labelledby="exports-tab">
              <ExportPanel
                api={this.api}
                db={db}
              />
            </div>
            <div className="tab-pane fade" id="diffs" role="tabpanel" aria-labelledby="diffs-tab">
              <ComparisonPanel api={this.api} mdaId={db.mda.id} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MdaViewer.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  api: PropTypes.object.isRequired,
  members: PropTypes.array,
  mda: PropTypes.shape({
    name: PropTypes.string.isRequired,
    public: PropTypes.bool.isRequired,
    note: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    path: PropTypes.array.isRequired,
    impl: PropTypes.shape({
      openmdao: PropTypes.object.isRequired,
      metamodel: PropTypes.shape(
        { quality: PropTypes.array.isRequired },
      ),
    }),
  }).isRequired,
};
MdaViewer.defaultProps = {
  members: [],
};

export default MdaViewer;
