import React, { Component } from "react"
import styled from "styled-components"
import { PubInput } from "../ui/pub-input"
import { FramedButton, TextButton } from "../ui/pub-button"

const ErrorMessage = styled.div`
  color: red;
`

class LoginForm extends Component {
  constructor() {
    super(...arguments)
    this.createTestDriveAccount = this.createTestDriveAccount.bind(this)
    this.submitLoginForm = this.submitLoginForm.bind(this)
    this.formValueChanged = this.formValueChanged.bind(this)
  }

  state = {
    emailAddress: "",
    password: ""
  }

  createTestDriveAccount() {

  }

  submitLoginForm(event) {
    event.preventDefault()
    const { emailAddress, password } = this.state
    this.props.authenticateUser({ emailAddress, password })
  }

  formValueChanged({ target }) {
    this.setState({ [target.name]: target.value })
  }

  renderErrorMessage() {
    const { errors } = this.props
    return errors.includes("user_auth_error")
      ? (<ErrorMessage>
          The password or email address was incorrect. Please try again.
        </ErrorMessage>)
      : null
  }

  render() {
    const { emailAddress, password } = this.state
    return (
      <form
        onSubmit={this.submitLoginForm}
      >
        { this.renderErrorMessage() }
        <div>
          <PubInput
            placeholder="Email Address"
            name="emailAddress"
            type="text"
            value={emailAddress}
            onChange={this.formValueChanged}
          />
          <PubInput
            placeholder="Password"
            name="password"
            type="password"
            value={password}
            onChange={this.formValueChanged}
          />
        </div>
        <div className="buttons">
          <FramedButton
            big
            type="submit"
          >
            Log In
          </FramedButton>
          <TextButton
            type="button"
            onClick={this.createTestDriveAccount}
          >
            or test drive Publications without an account
          </TextButton>
        </div>
      </form>
    )
  }
}

export { LoginForm }
