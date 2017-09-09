import React from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import * as d3 from 'd3';
import { selectQuery, selectBySearchId, selectBySearchParams, updateQueryCollectionLookupInfo, updateQuerySourceLookupInfo,
         fetchSampleSearches, demoQuerySourcesByIds, demoQueryCollectionsByIds, resetSelected, resetQueries,
         resetSentenceCounts, resetSampleStories, resetStoryCounts, resetGeo, updateTimestampForQueries } from '../../../actions/explorerActions';
import { addNotice } from '../../../actions/appActions';
import QueryBuilderContainer from './QueryBuilderContainer';
import QueryResultsContainer from './QueryResultsContainer';
import { getPastTwoWeeksDateRange } from '../../../lib/dateUtil';
import { DEFAULT_COLLECTION_OBJECT_ARRAY } from '../../../lib/explorerUtil';
import * as fetchConstants from '../../../lib/fetchConstants';
import { LEVEL_ERROR, WarningNotice } from '../../common/Notice';
import LoadingSpinner from '../../common/LoadingSpinner';

const localMessages = {
  errorInURLParams: { id: 'explorer.queryBuilder.urlParams', defaultMessage: 'Your URL query is incomplete. Check the URL and make sure the keyword(s), start and end dates, and collection(s) are properly specified.' },
  register: { id: 'explorer.queryBuilder.urlParams', defaultMessage: 'Register for a free Media Cloud account to get access to all the Dashboard features! <a href="http://tools.mediacloud.org/#/user/signup">Register Now</a>' },
};
const MAX_COLORS = 20;

class DemoQueryBuilderContainer extends React.Component {
  componentWillMount() {
    const { selected } = this.props;
    if (!selected) {
      this.checkPropsAndDispatch(this.props);
    }
  }
  componentWillReceiveProps(nextProps) {
    this.checkPropsAndDispatch(nextProps);
  }
  componentWillUnmount() {
    const { resetExplorerData } = this.props;
    resetExplorerData();
  }
  checkPropsAndDispatch(whichProps) {
    const { samples, selected, selectSearchQueriesById, selectQueriesByURLParams, setSelectedQuery, loadSampleSearches, addAppNotice } = this.props;
    const { formatMessage } = this.props.intl;
    const url = whichProps.location.pathname;
    let currentIndexOrQuery = url.slice(url.lastIndexOf('/') + 1, url.length);

    // if a search (and not samples) we need to parse the querystring
    if (whichProps.location.pathname.includes('/demo/search')) {
      // make sure JSON is valid
      let parsedObjectArray = null;
      try {
        parsedObjectArray = this.parseJSONParams(currentIndexOrQuery);
      } catch (e) {
        addAppNotice({ level: LEVEL_ERROR, message: formatMessage(localMessages.errorInURLParams) });
        return;
      }

      if (this.props.lastSearchTime !== whichProps.lastSearchTime ||
        (url !== this.props.location.pathname) ||
        (!selected && !whichProps.selected &&
        (!whichProps.queries || whichProps.queries.length === 0 ||
        whichProps.collectionLookupFetchStatus === fetchConstants.FETCH_INVALID))) {
        // change queries if:
        //   url has changed
        //   OR searchTime has change
        //   OR coming into search page for first time
        selectQueriesByURLParams(parsedObjectArray);
      } else if (!selected && !whichProps.selected && whichProps.collectionLookupFetchStatus === fetchConstants.FETCH_SUCCEEDED) {
        // select the first query by default if:
        //   there is nothing selected but you've got all the collection data needed to paint it
        setSelectedQuery(whichProps.queries[0]); // once we have the lookups,
      }

    // if it is a sample search then handle it differently
    } else if (whichProps.location.pathname.includes('/queries/demo')) {
      currentIndexOrQuery = parseInt(currentIndexOrQuery, 10);
      if (!samples || samples.length === 0) {
        // if they hit the URL directly with the sample id
        loadSampleSearches(currentIndexOrQuery); // currentIndex
      } else if (!selected && !whichProps.selected && (!whichProps.queries || whichProps.queries.length === 0)) {
        // if they are hitting a sample search but we haven't loaded it into the queries yet
        selectSearchQueriesById(samples[currentIndexOrQuery]);
      } else if (!selected && !whichProps.selected && whichProps.collectionLookupFetchStatus === fetchConstants.FETCH_SUCCEEDED) {
        // select the first query by default once we have the collections loaded
        setSelectedQuery(samples[currentIndexOrQuery].queries[0]);
      }
    }
  }

  parseJSONParams = (queriesFromURL) => {
    let parsedObjectArray = JSON.parse(queriesFromURL);
    const colorPallette = idx => d3.schemeCategory10[idx < MAX_COLORS ? idx : 0];
    const parsedObjectArrayWithDefColor = parsedObjectArray.map((q, idx) => ({ ...q, color: unescape(q.color), defaultColor: colorPallette(idx) }));
    parsedObjectArray = parsedObjectArrayWithDefColor.map((q, idx) => {
      const defaultObjVals = {};
      if (q.label === undefined) {
        defaultObjVals.label = q.label || q.q; // TODO auto generate for logged in users!
      }
      if (q.color === undefined || q.color === 'undefined') {
        defaultObjVals.color = q.defaultColor; // generated from ColorWheel();
      }
      if (q.index === undefined) {
        defaultObjVals.index = idx; // the backend won't use these values, but this is for the QueryPicker display
      }
      if (q.sources === undefined) {
        defaultObjVals.sources = [];
      }
      if (q.collections === undefined) {
        defaultObjVals.collections = DEFAULT_COLLECTION_OBJECT_ARRAY;
      }
      const dateObj = getPastTwoWeeksDateRange();
      if (q.startDate === undefined) {
        defaultObjVals.startDate = dateObj.start;
      }
      if (q.endDate === undefined) {
        defaultObjVals.endDate = dateObj.end;
      }
      return Object.assign({}, q, defaultObjVals);
    });

    return parsedObjectArray;
    // generate color and index?
  }

  render() {
    const { selected, queries, handleSearch, samples, location, lastSearchTime } = this.props;
    // const { formatMessage } = this.props.intl;
    let content = <LoadingSpinner />;
    const isEditable = location.pathname.includes('queries/demo/search');
    if (queries && queries.length > 0 && selected) {
      content = (
        <div>
          <WarningNotice><FormattedHTMLMessage {...localMessages.register} />
          </WarningNotice>
          <QueryBuilderContainer isEditable={isEditable} handleSearch={() => handleSearch(queries)} />
          <QueryResultsContainer lastSearchTime={lastSearchTime} queries={queries} params={location} samples={samples} />
        </div>
      );
    }
    return (
      <div>
        { content }
      </div>
    );
  }
}

DemoQueryBuilderContainer.propTypes = {
  intl: React.PropTypes.object.isRequired,
  // from parent
  initialValues: React.PropTypes.object,
  // from state
  location: React.PropTypes.object,
  addAppNotice: React.PropTypes.func.isRequired,
  user: React.PropTypes.object.isRequired,
  selected: React.PropTypes.object,
  queries: React.PropTypes.array,
  collectionResults: React.PropTypes.array,
  collectionLookupFetchStatus: React.PropTypes.string,
  samples: React.PropTypes.array,
  query: React.PropTypes.object,
  handleSearch: React.PropTypes.func.isRequired,
  lastSearchTime: React.PropTypes.number,
  setSampleSearch: React.PropTypes.func.isRequired,
  setSelectedQuery: React.PropTypes.func.isRequired,
  resetExplorerData: React.PropTypes.func.isRequired,
  selectSearchQueriesById: React.PropTypes.func.isRequired,
  selectQueriesByURLParams: React.PropTypes.func.isRequired,
  loadSampleSearches: React.PropTypes.func.isRequired,
  fetchSamples: React.PropTypes.func.isRequired,
  urlQueryString: React.PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
  // queryFetchStatus: state.explorer.queries.fetchStatus,
  selected: state.explorer.selected,
  selectedQuery: state.explorer.selected ? state.explorer.selected.q : '',
  queries: state.explorer.queries.queries ? state.explorer.queries.queries : null,
  collectionResults: state.explorer.queries.collections ? state.explorer.queries.collections.results : null,
  collectionLookupFetchStatus: state.explorer.queries.collections.fetchStatus,
  urlQueryString: ownProps.location.pathname,
  lastSearchTime: state.explorer.lastSearchTime.time,
  samples: state.explorer.samples.list,
  user: state.user,
});

// push any updates (including selected) into queries in state, will trigger async load in sub sections
const mapDispatchToProps = dispatch => ({
  addAppNotice: (info) => {
    dispatch(addNotice(info));
  },
  setSelectedQuery: (queryObj) => {
    dispatch(selectQuery(queryObj));
  },
  resetExplorerData: () => { // TODO we will reduce this down to one call
    dispatch(resetSelected());
    dispatch(resetQueries());
    dispatch(resetSentenceCounts());
    dispatch(resetSampleStories());
    dispatch(resetStoryCounts());
    dispatch(resetGeo());
  },
  updateQueryList: (queryObj) => {
    dispatch(selectBySearchId(queryObj)); // query obj or search id?
  },
  handleSearch: (queries) => {
    // update URL location according to updated queries
    const unDeletedQueries = queries.filter(q => !q.deleted);
    dispatch(updateTimestampForQueries());
    const nonEmptyQueries = unDeletedQueries.filter(q => q.q !== undefined && q.q !== '');
    const urlParamString = nonEmptyQueries.map((q, idx) => `{"index":${idx},"q":"${q.q}","color":"${escape(q.color)}"}`);
    const newLocation = `/queries/demo/search/[${urlParamString}]`;
    dispatch(push(newLocation));
  },
  setQueryFromURL: (queryArrayFromURL) => {
    dispatch(selectBySearchParams(queryArrayFromURL)); // load query data into queries

    queryArrayFromURL.map((q, idx) => {
      const demoInfo = {
        index: idx,
      };
      if (q.sources && q.sources.length > 0) {
        demoInfo.sources = q.sources.map(src => src.media_id || src.id);
        dispatch(demoQuerySourcesByIds(demoInfo))
        .then((results) => {
          demoInfo.sources = results;
          dispatch(updateQuerySourceLookupInfo(demoInfo)); // updates the query and the selected query
        });
      }
      if (q.collections && q.collections.length > 0) {
        demoInfo.collections = q.collections.map(coll => coll.tags_id || coll.id);
        dispatch(demoQueryCollectionsByIds(demoInfo))
        .then((results) => {
          demoInfo.collections = results;
          dispatch(updateQueryCollectionLookupInfo(demoInfo)); // updates the query and the selected query
        });
      }
      return 0;
    });
  },
  setSampleSearch: (searchObj) => {
    dispatch(selectBySearchId(searchObj));
    searchObj.queries.map((q, idx) => {
      const demoInfo = {
        index: idx,
      };
      if (q.sources && q.sources.length > 0) {
        demoInfo.sources = q.sources.map(src => src.media_id || src.id);
        dispatch(demoQuerySourcesByIds(demoInfo)).then((results) => {
          demoInfo.sources = results;
          dispatch(updateQuerySourceLookupInfo(demoInfo)); // updates the query and the selected query
        });
      }
      if (q.collections && q.collections.length > 0) {
        demoInfo.collections = q.collections.map(coll => coll.tags_id || coll.id);
        dispatch(demoQueryCollectionsByIds(demoInfo))
        .then((results) => {
          demoInfo.collections = results;
          dispatch(updateQueryCollectionLookupInfo(demoInfo)); // updates the query and the selected query
        });
      }
      return 0;
    });
  },
  fetchSamples: () => {
    dispatch(fetchSampleSearches()); // fetch all searches
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    selectSearchQueriesById: (searchObj) => {
      dispatchProps.setSampleSearch(searchObj);
    },
    selectQueriesByURLParams: (queryArray) => {
      dispatchProps.setQueryFromURL(queryArray);
    },
    loadSampleSearches: (currentIndex) => {
      dispatchProps.fetchSamples(currentIndex);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      DemoQueryBuilderContainer
    )
  );
