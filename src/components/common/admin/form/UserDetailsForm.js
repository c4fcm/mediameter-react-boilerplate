import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../hocs/IntlForm';

const localMessages = {
  nameLabel: { id: 'user.update.name.label', defaultMessage: 'User Name' },
  urlLabel: { id: 'user.update.url.label', defaultMessage: 'Email' },
  notesLabel: { id: 'user.update.notes.label', defaultMessage: 'Notes' },
  activeLabel: { id: 'user.update.active.label', defaultMessage: 'Active?' },
  pwdLabel: { id: 'user.update.pwd.hint', defaultMessage: 'Password' },
  confirmPwdLabel: { id: 'user.update.pwd.confirm', defaultMessage: 'Confirm Password' },
  nameError: { id: 'user.update.name.error', defaultMessage: 'You must have a name for this user.' },
  emailError: { id: 'user.update.url.error', defaultMessage: 'You must have an email for this user.' },
};

const UserDetailsForm = (props) => {
  const { renderTextField, renderCheckbox, initialValues } = props;
  return (
    <div className="user-details-form">
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.nameLabel} />
          </span>
        </Col>
        <Col md={4}>
          <Field
            name="name"
            component={renderTextField}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.emailLabel} />
          </span>
        </Col>
        <Col md={4}>
          <Field
            name="email"
            component={renderTextField}
            fullWidth
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.publicNotesLabel} />
          </span>
        </Col>
        <Col md={8}>
          <Field
            name="public_notes"
            component={renderTextField}
            label={localMessages.publicNotesHint}
            fullWidth
            disabled={initialValues.disabled}
            rows={2}
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <span className="label unlabeled-field-label">
            <FormattedMessage {...localMessages.activeLabel} />
          </span>
        </Col>
        <Col md={2}>
          <Field
            name="active"
            component={renderCheckbox}
            fullWidth
            label={localMessages.isActiveLabel}
            disabled={initialValues.disabled}
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <Field
            name="password"
            component={renderCheckbox}
            fullWidth
            label={localMessages.pwdLabel}
            disabled={initialValues.disabled}
          />
        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <Field
            name="confirmPassword"
            component={renderCheckbox}
            fullWidth
            label={localMessages.confirmPwdLabel}
            disabled={initialValues.disabled}
          />
        </Col>
      </Row>
    </div>
  );
};

UserDetailsForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
};

const reduxFormConfig = {
  form: 'sourceForm',
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      UserDetailsForm
    )
  )
);