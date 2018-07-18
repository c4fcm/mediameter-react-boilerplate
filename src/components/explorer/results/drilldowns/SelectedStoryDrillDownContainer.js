import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import slugify from 'slugify';
import { Row, Col } from 'react-flexbox-grid/lib';
import ActionMenu from '../../../common/ActionMenu';
import { fetchStory, resetStory } from '../../../../actions/storyActions';
import withHelp from '../../../common/hocs/HelpfulContainer';
import withAsyncFetch from '../../../common/hocs/AsyncContainer';
import DataCard from '../../../common/DataCard';
import StoryEntitiesContainer from '../../../common/story/StoryEntitiesContainer';
import StoryNytThemesContainer from '../../../common/story/StoryNytThemesContainer';
import SourceMetadataStatBar from '../../../common/SourceMetadataStatBar';
import messages from '../../../../resources/messages';
import { downloadSvg } from '../../../util/svg';
import { urlToSource } from '../../../../lib/urlUtil';
import { TAG_SET_NYT_THEMES } from '../../../../lib/tagUtil';

const localMessages = {
  title: { id: 'word.inContext.title', defaultMessage: 'Details for: {title}' },
  helpTitle: { id: 'word.inContext.help.title', defaultMessage: 'About Word in Context' },
  helpText: { id: 'word.inContext.help.text',
    defaultMessage: '<p>It is helpful to look at how a word is used, in addition to the fact that it is used.  While a word cloud can tell you what words are used, this interactive visualization can help you explore the use of a word in context.</p>',
  },
  close: { id: 'drilldown.story.inContext.close', defaultMessage: 'Close' },
  readThisStory: { id: 'drilldown.story.readThisStory', defaultMessage: 'Read This Story' },
  fullDescription: { id: 'explorer.story.fullDescription', defaultMessage: 'Published in {media} on {publishDate} in {language}' },
  published: { id: 'explorer.story.published', defaultMessage: 'Published in {media}' },
};

class SelectedStoryDrillDownContainer extends React.Component {
  state = {
    imageUri: null,
  }
  componentWillReceiveProps(nextProps) {
    const { lastSearchTime, fetchData, storyId } = this.props;
    if ((nextProps.lastSearchTime !== lastSearchTime ||
      nextProps.storyId !== storyId) && nextProps.storyId) {
      fetchData(nextProps.storyId);
    }
  }
  shouldComponentUpdate(nextProps) {
    const { storyId, lastSearchTime } = this.props;
    return (nextProps.lastSearchTime !== lastSearchTime || nextProps.storyId !== storyId);
  }
  getUniqueDomId = () => 'story-';
  handleDownloadSvg = () => {
    const { storyInfo } = this.props;
    // a little crazy, but it works (we have to just walk the DOM rendered by the library we are using)
    const domId = this.getUniqueDomId();
    const svgNode = document.getElementById(domId).children[0].children[0].children[0].children[0];
    const svgDownloadPrefix = `${slugify(storyInfo)}-`;
    downloadSvg(svgDownloadPrefix, svgNode);
  }
  openNewPage = (url) => {
    window.open(url, '_blank');
  }
  render() {
    const { storyId, storyInfo, handleClose, helpButton } = this.props;
    const { formatMessage, formatDate } = this.props.intl;

    let content = null;
    if (storyId) {
      content = (
        <div className="drill-down">
          <DataCard className="query-story-drill-down">
            <ActionMenu>
              <MenuItem
                className="action-icon-menu-item"
                primaryText={formatMessage(localMessages.close)}
                onTouchTap={handleClose}
              />
              <MenuItem
                className="action-icon-menu-item"
                primaryText={formatMessage(localMessages.readThisStory)}
                onTouchTap={() => this.openNewPage(storyInfo.url)}
              />
            </ActionMenu>
            <h2>
              <FormattedMessage {...localMessages.title} values={{ title: storyInfo.title }} />
              {helpButton}
            </h2>
            <a href={urlToSource(storyInfo.media_id)}><FormattedMessage {...localMessages.fullDescription} values={{ media: storyInfo.media_name, publishDate: formatDate(storyInfo.publish_date), language: storyInfo.language }} /></a>
            <Row>
              <Col lg={9}>
                <StoryEntitiesContainer storyId={storyId} />
              </Col>
              <Col lg={3}>
                <StoryNytThemesContainer storyId={storyId} tags={storyInfo.story_tags ? storyInfo.story_tags.filter(t => t.tag_sets_id === TAG_SET_NYT_THEMES) : []} />
              </Col>
            </Row>
            <h2><FormattedMessage {...localMessages.published} values={{ media: storyInfo.media_name }} /></h2>
            <Row>
              <Col lg={12}>
                <SourceMetadataStatBar source={storyInfo.media ? storyInfo.media : storyInfo.media_id} />
              </Col>
            </Row>
          </DataCard>
        </div>
      );
    }
    return content;
  }
}

SelectedStoryDrillDownContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from store
  fetchStatus: PropTypes.string.isRequired,
  storyInfo: PropTypes.object,
  storyId: PropTypes.number,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
    // from mergeProps
  asyncFetch: PropTypes.func.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
};


const mapStateToProps = state => ({
  fetchStatus: state.explorer.stories.fetchStatus,
  storyInfo: state.story.info,
  storyId: state.story.info.stories_id,
});

const mapDispatchToProps = dispatch => ({
  fetchData: (params) => {
    if (params) {
      dispatch(fetchStory(params));
    }
  },
  handleClose: () => {
    dispatch(resetStory());
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(stateProps.selectedStory);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      withHelp(localMessages.helpTitle, [localMessages.helpText, messages.wordTreeHelpText])(
        withAsyncFetch(
          SelectedStoryDrillDownContainer
        )
      )
    )
  );
