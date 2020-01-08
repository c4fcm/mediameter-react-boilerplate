import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import withAsyncData from '../../../../common/hocs/AsyncDataContainer';
import withDescription from '../../../../common/hocs/DescribedDataCard';
import OrderedWordCloud from '../../../../vis/OrderedWordCloud';
import DataCard from '../../../../common/DataCard';
import { fetchWordsByPlatformQuery } from '../../../../../actions/topicActions';
import messages from '../../../../../resources/messages';

const localMessages = {
  descriptionIntro: { id: 'topic.summary.words.help.into',
    defaultMessage: "The words most used in the matching content can give you some clues about what is being discussed. If this isn't the conversation you want to capture, then go back and edit your query to remove certain words.",
  },
};
const WORD_CLOUD_DOM_ID = 'topic-platform-preview-word-cloud';

const formSelector = formValueSelector('platform');

const PlatformWordsPreview = ({ words, intl }) => (
  <DataCard>
    <h2>
      <FormattedMessage {...messages.topWords} />
    </h2>
    <OrderedWordCloud
      words={words}
      title={intl.formatMessage(messages.topWords)}
      domId={WORD_CLOUD_DOM_ID}
      width={700}
    />
  </DataCard>
);

PlatformWordsPreview.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topic: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  words: PropTypes.array,
  selectedPlatform: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  topic: state.topics.selected.info,
  fetchStatus: state.topics.selected.platforms.preview.matchingWords.fetchStatus,
  words: state.topics.selected.platforms.preview.matchingWords.list,
  formValues: formSelector(state, 'media', 'query'),
  selectedPlatform: state.topics.selected.platforms.selected,
});

const fetchAsyncData = (dispatch, { topic, formValues, selectedPlatform, formatPlatformChannelData }) => {
  // call the fetcher the parent passed in to fetch the data we want to show
  dispatch(fetchWordsByPlatformQuery(topic.topics_id, {
    platform_type: selectedPlatform.platform,
    platform_query: formValues.query,
    platform_source: selectedPlatform.source,
    platform_channel: formatPlatformChannelData ? JSON.stringify(formatPlatformChannelData(formValues)) : JSON.stringify(formValues),
    start_date: topic.start_date,
    end_date: topic.end_date,
  }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withDescription(localMessages.descriptionIntro, [messages.wordcloudHelpText])(
      withAsyncData(fetchAsyncData, ['query'])(
        PlatformWordsPreview
      )
    )
  )
);