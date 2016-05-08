import React, { Component } from 'react'
import { reduxForm } from 'redux-form'
import { createChore } from '../../actions'


class ChoresAssign extends Component {
  onSubmit(props) {
    this.props.createChore(props)
      .then(() => {
        this.props.resetForm()
      })
  }

  render() {
    const  {fields: {userId, task, details, dueDate}, 
      handleSubmit, 
      resetForm,
      submitting,
    } = this.props;
    
    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>

        <h5 className="text-center">Add a Todo</h5>

        <div className={`form-group col-lg-6 col-xl-4 no-padding-xs ${task.touched && task.invalid ? 'has-danger': ''}`} >
          <label>Task</label>
          <input type="text" className="form-control" {...task} />
          <div className="text-help">
            {task.touched ? task.error : ''}
          </div>
        </div>
        
        <div className="form-group col-lg-6 col-xl-4 no-padding-xs" >
          <label>More Details? (Optional)</label>
          <input type="text" className="form-control" {...details} />
        </div>

        <div className="form-group col-xs-12 col-xl-4 no-padding-xs" >
          <label>Complete By (Optional)</label>
          <input type="date" className="form-control" {...dueDate} />
        </div>

        <button type="submit" className="btn btn-primary full-width-xs">Submit</button>
      </form>
    );
  }
}

function validate(values) {
  const errors = {};

  if (!values.task) {
    errors.task = 'Enter chore';
  }

  return errors;
}

export default reduxForm({
  form: 'ChoresNewForm',
  fields: ['userId', 'task', 'details', 'dueDate'],
  validate
}, null, { createChore })(ChoresAssign);
