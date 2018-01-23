import React from 'react';
import update from 'immutability-helper'

class Discipline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {discName:'', discType:'analysis', isEditing: false };
  
    this.handleDiscNameChange = this.handleDiscNameChange.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.onDisciplineUpdate = this.props.onDisciplineUpdate.bind(this);
    this.onDisciplineDelete = this.props.onDisciplineDelete.bind(this);
  }  
  
  handleDiscNameChange(event) {
    let newState = update(this.state, {discName: {$set: event.target.value}});
    this.setState(newState);
  } 
  
  handleEdit(event) {
    let newState = {discName: this.props.node.name, 
                    discType: this.props.node.type, 
                    isEditing: true};  
    this.setState(newState);
  }
  
  handleCancelEdit(event) {
    let newState = update(this.state, {isEditing: {$set: false}});  
    this.setState(newState);
  }
  
  handleUpdate(event) {
    event.preventDefault();
    this.handleCancelEdit(event);
    console.log("Type:"+this.state.discType);
    let discattrs = {name: this.state.discName, type: this.state.discType};
    console.log("COUCOU"+JSON.stringify(discattrs));
    this.onDisciplineUpdate(this.props.node, parseInt(this.props.pos), discattrs);
  }
  
  handleDelete(event) {
    this.onDisciplineDelete(this.props.node, parseInt(this.props.pos));
  }
  
  handleSelectChange(event) {
    let newState = update(this.state, {discType: {$set: event.target.value}});
    this.setState(newState);
  }
  
  render() {
    if (this.state.isEditing) {        
      return (
          <li className="list-group-item editor-discipline">
            <form className="form-inline" onSubmit={this.handleUpdate}>
              <div className="form-group mr-3">
                <input  className="form-control" id="name" type="text" defaultValue={this.state.discName} placeholder='Enter Name...' onChange={this.handleDiscNameChange}/>
                <select className="form-control" id="type" value={this.state.discType} onChange={this.handleSelectChange}>
                  <option value="analysis">Analysis</option>
                  <option value="function">Function</option>
                </select>
              </div>  
              <button type="submit" className="btn btn-primary">Update</button>
              <button type="button" onClick={this.handleCancelEdit} className="btn ml-md-1">Cancel</button>
            </form>
          </li>); 
      } else {
        let confirm = `Remove ${this.props.node.name} discipline?`
        return (
          <li className="list-group-item editor-discipline col-md-4">
            <span className="align-bottom">{this.props.node.name}</span>
            <button data-title="Are you sure?" data-confirm={confirm} data-commit="Yes" data-cancel="No, cancel"  
             data-method="delete" className="d-inline btn btn-light btn-inverse btn-sm float-right text-danger" 
             onClick={this.handleDelete}>
              <i className="fa fa-close"/>
            </button>
            <button className="d-inline btn btn-light btn-sm ml-2" onClick={this.handleEdit}>
              <i className="fa fa-pencil"/>
            </button>
          </li>); 
    }
  }
}

class DisciplinesEditor extends React.Component {
  constructor(props) {
    super(props);   
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ name: event.target.value });
    this.props.onNewDisciplineNameChange(event);
  }
  
  render() {
    let disciplines = this.props.nodes.map((node, i) => {
      return (<Discipline key={node.id} pos={i+1} node={node} 
                onDisciplineUpdate={this.props.onDisciplineUpdate}
                onDisciplineDelete={this.props.onDisciplineDelete}/>);
    });

    return (
        <div className='container'>
          <div className="editor-section">
            <ul className="list-group">
              {disciplines}
            </ul>
          </div>
          <div className="editor-section">          
            <form className="form-inline" onSubmit={this.props.onNewDisciplineName}>
              <div className="form-group"> 
                <label htmlFor="name" className="sr-only">Name</label>
                <input type="text" value={this.props.name} placeholder='Enter Name...' className="form-control" id="name" onChange={this.handleChange}/>
              </div>
              <button type="submit" className="btn btn-primary">New</button>
            </form>
          </div>
        </div>
        );
  }
}

export default DisciplinesEditor;