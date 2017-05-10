import React from 'react';
import Title from 'react-title-component';
import { push } from 'react-router-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { updateSource, fetchSourceDetails } from '../../../actions/sourceActions';
import { updateFeedback, setSubHeaderVisible } from '../../../actions/appActions';
import SourceForm from './form/SourceForm';
import { isCollectionTagSet, TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE, TAG_SET_PRIMARY_LANGUAGE } from '../../../lib/tagUtil';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import Permissioned from '../../common/Permissioned';
import { nullOrUndefined } from '../../../lib/formValidators';

const localMessages = {
  mainTitle: { id: 'source.maintitle', defaultMessage: 'Modify this Source' },
  addButton: { id: 'source.add.saveAll', defaultMessage: 'Save Changes' },
  feedback: { id: 'source.add.feedback', defaultMessage: 'We saved your changes to this source' },
};

const EditSourceContainer = (props) => {
  const { handleSave, source } = props;
  const { formatMessage } = props.intl;
  const titleHandler = parentTitle => `${formatMessage(localMessages.mainTitle)} | ${parentTitle}`;
  const pubCountry = source.media_source_tags.find(t => t.tag_sets_id === TAG_SET_PUBLICATION_COUNTRY);
  const pubState = source.media_source_tags.find(t => t.tag_sets_id === TAG_SET_PUBLICATION_STATE);
  const pLanguage = source.media_source_tags.find(t => t.tag_sets_id === TAG_SET_PRIMARY_LANGUAGE);
  const intialValues = {
    ...source,
    // if user cannot edit media, disabled=true
    collections: source.media_source_tags
      .map(t => ({ ...t, name: t.label }))
      .filter(t => (isCollectionTagSet(t.tag_sets_id) && (t.show_on_media === 1))),
    publicationCountry: pubCountry ? pubCountry.tags_id : undefined,
    publicationState: pubState ? pubState.tags_id : undefined,
    pLanguage: pLanguage ? pLanguage.tags_id : undefined,
  };
  return (
    <div className="edit-source">
      <Title render={titleHandler} />
      <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
        <Grid>
          <Row>
            <Col lg={12}>
              <h1><FormattedMessage {...localMessages.mainTitle} /></h1>
            </Col>
          </Row>
          <SourceForm
            initialValues={intialValues}
            onSave={handleSave}
            buttonLabel={formatMessage(localMessages.addButton)}
          />
        </Grid>
      </Permissioned>
    </div>
  );
};

EditSourceContainer.propTypes = {
  // from context
  intl: React.PropTypes.object.isRequired,
  // from dispatch
  handleSave: React.PropTypes.func.isRequired,
  // form state
  sourceId: React.PropTypes.number.isRequired,
  fetchStatus: React.PropTypes.string.isRequired,
  source: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  sourceId: parseInt(ownProps.params.sourceId, 10),
  fetchStatus: state.sources.sources.selected.sourceDetails.fetchStatus,
  source: state.sources.sources.selected.sourceDetails,
  // user: state.user,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleSave: (values) => {
    const metadataTagFormKeys = ['publicationCountry', 'publicationState', 'primaryLanguage'];
    const infoToSave = {
      id: ownProps.params.collectionId,
      name: values.name,
      description: values.description,
      editor_notes: nullOrUndefined(values.editor_notes) ? '' : values.editor_notes,
      public_notes: nullOrUndefined(values.public_notes) ? '' : values.public_notes,
      monitored: values.monitored,
    };
    metadataTagFormKeys.forEach((key) => { // the metdata tags are encoded in individual properties on the form
      if (key in values) {
        infoToSave[key] = nullOrUndefined(values[key]) ? '' : values[key];
      }
    });
    if ('sources' in values) {
      infoToSave['collections[]'] = values.sources.map(s => (s.id ? s.id : s.tags_id));
    } else {
      infoToSave['collections[]'] = [];
    }
    dispatch(updateSource(values))
      .then((result) => {
        if (result.success === 1) {
          // need to fetch it again because something may have changed
          dispatch(fetchSourceDetails(ownProps.params.sourceId))
            .then(() => {
              dispatch(setSubHeaderVisible(true));
              dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
              dispatch(push(`/sources/${ownProps.params.sourceId}`));
            });
        }
      });
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      EditSourceContainer
    ),
  );
