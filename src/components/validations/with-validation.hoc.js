import React from 'react';
import PropTypes from 'prop-types';
import { ValidationsContext } from './form-with-validations.hoc';
import validator from '../../utils/validations/validator';
import VALIDATION_TYPES from './validation-types.config';
import ValidationIcon from './validation-icon.component';

const withValidation = (WrappedComponent) => {
  class WithValidation extends React.Component {
    state = Object.keys(VALIDATION_TYPES).reduce((acc, type) => ({
      ...acc,
      [`${type}Message`]: undefined
    }), {});

    componentDidMount() {
      if (this.checkValidations()) {
        const value = this.props.value || this.state.value;
        this.context.addInput(this.props.name, this.validate, value);
      }
    }

    componentWillUnmount() {
      if (this.checkContext('removeInput')) this.context.removeInput(this.props.name);
    }

    componentDidUpdate(prevProps) {
      if (this.isUpdatedValidationProps(prevProps) && this.checkValidations()) {
        const value = this.props.value || this.state.value;
        this.context.addInput(this.props.name, this.validate, value);
      }

      if (prevProps.value !== this.props.value) {
        this.validate();
      }
    }

    isUpdatedValidationProps(prevProps) {
      let updated = false;
      const validationTypes = Object.values(VALIDATION_TYPES);
      validationTypes.forEach((type) => {
        if (this.props[type] !== prevProps[type]) updated = true;
      });
      return updated;
    }

    checkValidations() {
      if (!this.checkContext('addInput')) return false;

      const types = Object.keys(VALIDATION_TYPES);
      let hasValidations = false;
      types.forEach((validationType) => {
        const type = VALIDATION_TYPES[validationType];
        const validation = this.props[type];
        const isArray = Array.isArray(validation);
        const isPopulatedArray = isArray && validation.length;
        const isDefined = typeof validation !== 'undefined';
        if (isPopulatedArray || (!isArray && isDefined)) {
          hasValidations = true;
        }
      });

      return hasValidations;
    }

    checkContext(prop) {
      if (!this.context || !this.context[prop]) return false;

      return true;
    }

    validate = (types = Object.keys(VALIDATION_TYPES), isOnSubmit) => {
      if (!isOnSubmit && this.blockValidation) return new Promise(resolve => resolve(true));

      const validationPromises = [];
      types.forEach((type) => {
        const validationPromise = this.runValidation(type);
        if (validationPromise) validationPromises.push(validationPromise);
      });
      return Promise.all(validationPromises).then((results) => {
        return !results.includes(false);
      });
    }

    updateValidationStatus(type, message) {
      const stateProp = `${type}Message`;

      if (message && !this.state[stateProp]) {
        if (this.checkContext('adjustCount')) this.context.adjustCount(type, true);
        this.setState({ [stateProp]: message });
      } else if (!message && this.state[stateProp]) {
        if (this.checkContext('adjustCount')) this.context.adjustCount(type);
        this.setState({ [stateProp]: undefined });
      }
    }

    runValidation(validationType) {
      const type = VALIDATION_TYPES[validationType];
      if (typeof this.props[type] === 'undefined') return null;
      if (Array.isArray(this.props[type]) && this.props[type].length === 0) return null;

      const value = this.props.value || this.state.value;

      return new Promise((resolve) => {
        setTimeout(() => {
          validator(this.props[type])(value, this.props)
            .then(() => {
              this.updateValidationStatus(validationType);
              return resolve(true);
            })
            .catch((error) => {
              this.updateValidationStatus(validationType, error.message);
              return resolve(false);
            });
        }, 100); // allow 100ms delay to accommodate for browser events
      });
    }

    renderValidationMarkup() {
      const type = Object.keys(VALIDATION_TYPES).find(validationType => (
        this.props[`${validationType}Message`] || this.state[`${validationType}Message`]
      ));
      if (!type) return null;

      return (
        <ValidationIcon
          type={ type }
          message={ this.props[`${type}Message`] || this.state[`${type}Message`] }
        />
      );
    }

    handleBlur = (ev) => {
      this.blockValidation = false;
      this.validate();
      if (this.props.onBlur) this.props.onBlur(ev);
    }

    handleChange = (ev) => {
      this.blockValidation = true;

      Object.keys(VALIDATION_TYPES).forEach((type) => {
        if (this.state[`${type}Message`]) {
          this.updateValidationStatus(type);
          this.setState({ [`${type}Message`]: undefined });
        }
      });

      if (!this.props.value) this.setState({ value: ev.target.value });

      if (this.props.onChange) {
        this.props.onChange(ev);
      }

      this.updateInput(ev.target.value);
    }

    updateInput(value) {
      if (this.checkValidations()) {
        this.context.addInput(this.props.name, this.validate, value);
      }
    }

    validationProps() {
      // builds '[validationType]Message' props for the defined validation types
      return Object.keys(VALIDATION_TYPES).reduce((acc, type) => ({
        ...acc,
        [`${type}Message`]: this.state[`${type}Message`]
      }), {});
    }

    render() {
      return (
        <WrappedComponent
          { ...this.validationProps() }
          { ...this.props }
          onBlur={ this.handleBlur }
          onChange={ this.handleChange }
          value={ this.props.value || this.state.value }
        >
          { this.props.children }
          { this.renderValidationMarkup() }
        </WrappedComponent>
      );
    }
  }

  WithValidation.contextType = ValidationsContext;

  WithValidation.propTypes = {
    children: PropTypes.node, // Children elements
    name: PropTypes.string.isRequired, // Name to uniquely identify the component
    value: PropTypes.string, // The current value of the component
    onBlur: PropTypes.func, // Custom function to be called when the component blurs
    onChange: PropTypes.func, // Custom function called when component value changes
    ...Object.values(VALIDATION_TYPES).reduce((acc, type) => ({
      ...acc,
      [type]: PropTypes.oneOfType([ // The info validations that should be run against the value
        PropTypes.func,
        PropTypes.arrayOf(
          PropTypes.shape({
            message: PropTypes.func,
            validate: PropTypes.func
          })
        ),
        PropTypes.arrayOf(PropTypes.func)
      ])
    }), {})
  };

  WithValidation.defaultProps = Object.values(VALIDATION_TYPES).reduce((acc, type) => ({
    ...acc,
    [type]: []
  }), {});

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithValidation.displayName = `WithValidation(${displayName})`;

  return WithValidation;
};

export default withValidation;
