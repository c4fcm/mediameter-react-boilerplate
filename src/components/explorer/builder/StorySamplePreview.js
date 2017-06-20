import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'material-ui/Tabs';
import composeDescribedDataCard from '../../common/DescribedDataCard';
import composeAsyncContainer from '../../common/AsyncContainer';
import StoryTable from '../../common/StoryTable';
import { fetchQueryTopStories, fetchDemoQueryTopStories } from '../../../actions/explorerActions';
import messages from '../../../resources/messages';
import { getUserRoles, hasPermissions, PERMISSION_LOGGED_IN } from '../../../lib/auth';

// const NUM_TO_SHOW = 20;

// TODO check all these messages

const localMessages = {
  title: { id: 'explorer.stories.title', defaultMessage: 'Story Samples' },
  helpTitle: { id: 'explorer.stories.help.title', defaultMessage: 'About Story Samples' },
  helpText: { id: 'explorer.stories.help.text',
    defaultMessage: '<p>This chart shows you estimated coverage of your seed query</p>',
  },
  descriptionIntro: { id: 'explorer.stories.help.title', defaultMessage: 'This is a random sample of stories.' },
  tabStory: { id: 'explorer.stories.tab', defaultMessage: 'Tab for Query' },

};

class StorySamplePreview extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { urlQueryString, lastSearchTime, fetchData } = this.props;
    if (nextProps.lastSearchTime !== lastSearchTime ||
      nextProps.urlQueryString.searchId !== urlQueryString.searchId) {
    // TODO also check for name and color changes
      fetchData(nextProps.urlQueryString.searchId);
    }
  }
  render() {
    const { results, queries, handleStorySelection } = this.props;

    return (
      <Tabs>
        {results.map((storySet, idx) =>
          (<Tab label={queries[idx].q}>
            <h3>{queries[idx].label}</h3>
            <StoryTable
              stories={storySet}
              index={idx}
              onChangeFocusSelection={handleStorySelection}
              maxTitleLength={50}
            />
          </Tab>
          )
        )}
      </Tabs>
    );
  }
}

StorySamplePreview.propTypes = {
  lastSearchTime: React.PropTypes.number.isRequired,
  queries: React.PropTypes.array.isRequired,
  // from composition
  intl: React.PropTypes.object.isRequired,
  // from dispatch
  fetchData: React.PropTypes.func.isRequired,
  results: React.PropTypes.array.isRequired,
  urlQueryString: React.PropTypes.object.isRequired,
  sampleSearches: React.PropTypes.array, // TODO, could we get here without any sample searches? yes if logged in...
  // from mergeProps
  asyncFetch: React.PropTypes.func.isRequired,
  // from state
  fetchStatus: React.PropTypes.string.isRequired,
  handleStorySelection: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  user: state.user,
  urlQueryString: ownProps.params,
  fetchStatus: state.explorer.stories.fetchStatus,
  results: state.explorer.stories.results,
});

const mapDispatchToProps = (dispatch, state) => ({
  fetchData: (query, idx) => {
    // this should trigger when the user clicks the Search button or changes the URL
    // for n queries, run the dispatch with each parsed query

    const isLoggedInUser = hasPermissions(getUserRoles(state.user), PERMISSION_LOGGED_IN);
    if (isLoggedInUser) {
      if (idx) { // specific change/update here
        dispatch(fetchQueryTopStories(query, idx));
      } else { // get all results
        state.queries.map((q, index) => dispatch(fetchQueryTopStories(q, index)));
      }
    } else if (state.params && state.params.searchId) { // else assume DEMO mode
      let runTheseQueries = state.sampleSearches[state.params.searchId].data;
      // merge sample search queries with custom

      // find queries on stack without id but with index and with q, and add?
      const newQueries = state.queries.filter(q => q.id === undefined && q.index);
      runTheseQueries = runTheseQueries.concat(newQueries);
      runTheseQueries.map((q, index) => {
        const demoInfo = {
          index, // should be same as q.index btw
          search_id: state.params.searchId, // may or may not have these
          query_id: q.id, // TODO if undefined, what to do?
          q: q.q, // only if no query id, means demo user added a keyword
        };
        return dispatch(fetchDemoQueryTopStories(demoInfo)); // id
      });
    }
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData();
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composeDescribedDataCard(localMessages.descriptionIntro, [messages.storiesTableHelpText])(
        composeAsyncContainer(
          StorySamplePreview
        )
      )
    )
  );
