import React from 'react';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';

import { actionCreators, selectors } from '../../redux';
import { AuthPage } from '../AuthPage/AuthPage';
import { TextInput } from '../TextInput/TextInput';
import { validateEmail, validateIsRequired, composeValidators } from '../../helpers/validators';
import styles from './LoginPage.css';

const emailValidator = composeValidators(validateIsRequired, validateEmail);

const REGISTER_LINK = {
  href: '/auth/register',
  label: "Don't have an account?",
};

class LoginPage extends React.Component {
  state = {
    inputs: {
      email: { value: '', error: null },
      password: { value: '', error: null },
    },
  };

  inputsValidators = {
    email: emailValidator,
    password: validateIsRequired,
  };

  render() {
    const { inputs: { email, password } } = this.state;
    const { loginError } = this.props;
    return (
      <AuthPage
        redirectLink={REGISTER_LINK}
        submitButtonLabel="Login"
        onFormSubmit={this.handleAuthFormSubmit}
        title="Login"
        submitError={loginError}
      >
        <div className={styles.input}>
          <TextInput
            value={email.value}
            name="email"
            placeholder="Email"
            type="email"
            onChange={this.makeTextInputChangeHandler('email')}
            onBlur={this.makeTextInputBlurHandler('email')}
            error={email.error}
          />
        </div>
        <TextInput
          value={password.value}
          name="password"
          placeholder="Password"
          type="password"
          onChange={this.makeTextInputChangeHandler('password')}
          onBlur={this.makeTextInputBlurHandler('password')}
          error={password.error}
        />
      </AuthPage>
    );
  }

  @autobind
  handleAuthFormSubmit() {
    const { inputs } = this.state;
    const isFormWithoutErrors = Object.values(inputs).every(inputState => !inputState.error);
    if (isFormWithoutErrors) {
      const { email, password } = inputs;
      const emailError = emailValidator(email.value);
      const passwordError = validateIsRequired(password.value);
      if (emailError || passwordError) {
        this.setState(({ inputs: prevInputs }) => ({
          inputs: {
            email: { ...prevInputs.email, error: emailError },
            password: { ...prevInputs.password, error: passwordError },
          },
        }));
      } else {
        const { login } = this.props;
        login(email.value, password.value);
      }
    }
  }

  makeTextInputBlurHandler(inputName) {
    return inputValue => {
      const validator = this.inputsValidators[inputName];
      const error = validator(inputValue);
      if (error !== this.state.inputs[inputName].error) {
        this.setState(({ inputs: prevInputs }) => ({
          inputs: {
            ...prevInputs,
            [inputName]: { ...prevInputs[inputName], error },
          }
        }));
      }
    }
  }

  makeTextInputChangeHandler(name) {
    return inputValue => this.setState(({ inputs: prevInputs }) => ({
      inputs: {
        ...prevInputs,
        [name]: { value: inputValue, error: null }
      },
    }));
  }
}

function mapState(state) {
  return {
    loginError: selectors.selectLoginError(state),
  };
}

const actionProps = {
  login: actionCreators.login,
};

const component = connect(mapState, actionProps)(LoginPage);

export { component as LoginPage };
