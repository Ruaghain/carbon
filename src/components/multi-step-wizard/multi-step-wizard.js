import React from 'react';
import classNames from 'classnames';
import Step from './step';

/**
 * A MultiStepWizard widget.
 *
 * == How to use a MultiStepWizard in a component:
 *
 * In your file:
 *
 *   import MultiStepWizard from 'components/multi-step-wizard';
 *
 * To render the Wizard:
 *
 *  <MultiStepWizard steps={ [<Step1 />, <Step2 />, ...] } />
 *
 * The component rendering the wizard must pass down a prop of 'steps' where you need to provide an array of custom
 * step components. Note that Step components must be objects, e.g. <Row />, <Form />, <Textbox />.
 *
 * You also need to provide a 'onSubmit' handler to handle a submit event.
 *
 * The wizard also takes a 'currentStep' prop with an integer to specify a step you want to start with.
 * e.g. currentStep={ 2 }. The wizard starts with the first step by default.
 *
 * The wizard disables inactive steps by default. If you wish to enable inactive steps, pass a 'enableInactiveSteps'
 * prop and set it to true.
 *
 * The wizard generates Next and Back buttons by default. If you wish to use custom buttons to replace the default ones
 * in a step component, you can pass a 'defaultButton' prop in the corresponding step component and set it to false.
 * Also, if you want to add additional buttons beside the default Next and Back buttons, you can pass a 'extraButtons'
 * prop in the corresponding step component with your extra buttons.
 * e.g. <MultiStepWizard steps={ [<Step1 defaultButton={ false } />, <Step2 />] } />
 *      <MultiStepWizard steps={ [<Step1 />, <Step2 extraButtons={ [<Button>Cancel</Button>] }) />] } />
 *
 * If you want to complete the wizard without going through steps, you can pass a 'completed' prop and set it to true.
 *
 * @class MultiStepWizard
 * @constructor
 */
class MultiStepWizard extends React.Component {
  static propTypes = {
    /**
     * Individual steps
     *
     * @property steps
     * @type {Array}
     */
    steps: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,

    /**
     * A custom submit event handler
     *
     * @property onSubmit
     * @type {Function}
     */
    onSubmit: React.PropTypes.func.isRequired,

    /**
     * Current step
     *
     * @property currentStep
     * @type {Number}
     * @default 1
     */
    currentStep: React.PropTypes.number,

    /**
     * Determines if the wizard disables inactive steps
     *
     * @property enableInactiveSteps
     * @type {Boolean}
     * @default false
     */
    enableInactiveSteps: React.PropTypes.bool,

    /**
     * The completion state of the wizard
     *
     * @property enableInactiveSteps
     * @type {Boolean}
     * @default false
     */
    completed: React.PropTypes.bool
  }

  static defaultProps = {
    currentStep: 1,
    enableInactiveSteps: false,
    completed: false
  }

  /**
   * A lifecycle method that is called after before initial render.
   * Can set up state of component without causing a re-render
   *
   * @method componentWillMount
   */
  componentWillMount() {
    this.setState({ currentStep: this.currentStep });
    this.setState({ completed: this.props.completed });
  }

  /**
   * A lifecycle method to update the currentStep state when a new valid value has been specified.
   *
   * @method componentWillReceiveProps
   * @param {Object} props The new props passed down to the component
   * @return {void}
   */
  componentWillReceiveProps(nextProps) {
    let nextStep = nextProps.currentStep,
        validStep;

    if (nextStep && this.state.currentStep != nextStep) {
      validStep = this.validateCurrentStep(nextStep);
      this.setState({ currentStep: validStep });
    }
  }

  static childContextTypes = {
    /**
     * Defines a context object for child components of this wizard.
     *
     * @property wizard
     * @type {Object}
     */
    wizard: React.PropTypes.object
  }

  /**
   * Returns wizard object to child components.
   *
   * @method getChildContext
   * @return {void}
   */
  getChildContext() {
    return {
      wizard: {
        nextHandler: this.props.onNext,
        backHandler: this.props.onBack,
        submitHandler: this.props.onSubmit,
        enableInactiveSteps: this.props.enableInactiveSteps,
        currentStep: this.state.currentStep,
        completed: this.state.completed,
        next: this.next,
        back: this.back,
        complete: this.complete,
        totalSteps: this.totalSteps
      }
    };
  }

  /**
   * Get current step
   *
   * @method currentStep
   * @return {Number}
   */
  get currentStep() {
    let current = this.props.currentStep,
        completed = this.props.completed;

    if (completed) {
      return this.totalSteps;
    } else if (current < 1 || current > this.totalSteps) {
      return 1;
    }

    return current;
  }

  /**
   * Get total number of steps
   *
   * @method totalSteps
   * @return {Number}
   */
  get totalSteps() {
    return this.props.steps.length;
  }

  /**
   * Validate current step
   *
   * @method currentStep
   * @return {Number}
   */
  validateCurrentStep = (step) => {
    if (!step || step < 1 || step > this.totalSteps) {
      return this.state.currentStep;
    }
    return step;
  }

  /**
   * Moves to the next step.
   *
   * @method next
   * @return {void}
   */
  next = () => {
    if (this.state.currentStep < this.totalSteps) {
      this.setState({ currentStep: this.state.currentStep + 1 });
    }
  }

  /**
   * Back to the previous step.
   *
   * @method back
   * @return {void}
   */
  back = () => {
    if (this.state.currentStep > 1) {
      this.setState({ completed: false, currentStep: this.state.currentStep - 1 });
    }
  }

  /**
   * Completes the wizard.
   *
   * @method complete
   * @return {void}
   */
  complete = () => {
    if (this.state.currentStep === this.totalSteps) {
      this.setState({ completed: true });
    }
  }

  /**
   * Returns the computed HTML for the wizard's steps.
   *
   * @method wizardStepsHTML
   * @return {Object} JSX
   */
  get wizardStepsHTML() {
    return this.props.steps.map((step, index) => {
      return (
          <Step stepContent={ step }
                stepNumber={ index + 1 }
                key={ index }
                { ...step.props } />
      );
    });
  }

  /**
   * Returns classes for the wizard.
   *
   * @method mainClasses
   * @return {String} Main className
   */
  get mainClasses() {
    return classNames(
      'multi-step-wizard',
      this.props.className
    );
  }

  /**
   * Renders the component.
   *
   * @method render
   * @return {Object} JSX
   */
  render() {
    return (
      <div className={ this.mainClasses }>
        <div className='multi-step-wizard__content'>
          { this.wizardStepsHTML }
        </div>
      </div>
    );
  }
}

export default MultiStepWizard;
