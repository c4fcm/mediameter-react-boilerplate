import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import LoadingSpinner from '../../common/LoadingSpinner';
import TopicInfo from './TopicInfo';
import StoriesSummaryContainer from './StoriesSummaryContainer';
import MediaSummaryContainer from './MediaSummaryContainer';
import WordsSummaryContainer from './WordsSummaryContainer';
import SentenceCountSummaryContainer from './SentenceCountSummaryContainer';
import TopicTimespanInfo from './TopicTimespanInfo';
import StoryTotalsSummaryContainer from './StoryTotalsSummaryContainer';

class TopicSummaryContainer extends React.Component {
  filtersAreSet() {
    const { filters, topicId } = this.props;
    return (topicId && filters.snapshotId && filters.timespanId);
  }
  render() {
    const { filters, topicId, topicInfo, timespan } = this.props;
    let content = <div />;
    let subContent = <div />;
    if (this.filtersAreSet()) {
      subContent = (
        <Grid>
          <Row>
            <Col lg={6} xs={12}>
              <SentenceCountSummaryContainer topicId={topicId} filters={filters} />
            </Col>
            <Col lg={6} xs={12}>
              <WordsSummaryContainer topicId={topicId} filters={filters} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <StoriesSummaryContainer topicId={topicId} filters={filters} />
            </Col>
          </Row>
          <Row>
            <Col lg={6} xs={12}>
              <MediaSummaryContainer topicId={topicId} filters={filters} />
            </Col>
            <Col lg={6} xs={12}>
              <TopicTimespanInfo timespan={timespan} />
              <StoryTotalsSummaryContainer topicId={topicId} filters={filters} />
            </Col>
          </Row>
          <Row>
            <Col lg={6} xs={12}>
              <TopicInfo topic={topicInfo} />
            </Col>
            <Col lg={6} xs={12} />
          </Row>
        </Grid>
      );
    } else {
      subContent = <LoadingSpinner />;
    }
    content = (
      <div>
        {subContent}
      </div>
    );
    return (
      <div>
        <div>
          {content}
        </div>
      </div>
    );
  }
}

TopicSummaryContainer.propTypes = {
  // from context
  intl: React.PropTypes.object.isRequired,
  params: React.PropTypes.object.isRequired,
  // from state
  timespan: React.PropTypes.object,
  filters: React.PropTypes.object.isRequired,
  topicId: React.PropTypes.number,
  topicInfo: React.PropTypes.object,
};

const mapStateToProps = state => ({
  filters: state.topics.selected.filters,
  topicId: state.topics.selected.id,
  topicInfo: state.topics.selected.info,
  timespan: state.topics.selected.timespans.selected,
});

export default
  injectIntl(
    connect(mapStateToProps)(
      TopicSummaryContainer
    )
  );
