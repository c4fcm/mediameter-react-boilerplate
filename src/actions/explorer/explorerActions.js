import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/explorer';

export const UPDATE_TIMESTAMP_FOR_QUERIES = 'UPDATE_TIMESTAMP_FOR_QUERIES';
export const updateTimestampForQueries = createAction(UPDATE_TIMESTAMP_FOR_QUERIES, queries => queries);

export const FETCH_SAMPLE_SEARCHES = 'FETCH_SAMPLE_SEARCHES';
export const fetchSampleSearches = createAsyncAction(FETCH_SAMPLE_SEARCHES, api.fetchSampleSearches);

export const SELECT_SEARCH = 'SELECT_SEARCH';
export const selectBySearchId = createAction(SELECT_SEARCH, searchId => searchId);


export const FETCH_SAVED_SEARCHES = 'FETCH_SAVED_SEARCHES';
export const fetchSavedSearches = createAsyncAction(FETCH_SAVED_SEARCHES, api.fetchSavedSearches);

export const SELECT_QUERY = 'SELECT_QUERY';
export const selectQuery = createAction(SELECT_QUERY, query => query);

export const ADD_CUSTOM_QUERY = 'ADD_CUSTOM_QUERY';
export const addCustomQuery = createAction(ADD_CUSTOM_QUERY, query => query);

export const UPDATE_QUERY = 'UPDATE_QUERY';
export const updateQuery = createAction(UPDATE_QUERY, query => query);


export const PREPARE_QUERIES = 'PREPARE_QUERIES';
export const prepareQueries = createAsyncAction(PREPARE_QUERIES, api.prepareQueries);

export const FETCH_QUERY_SENTENCE_COUNTS = 'FETCH_QUERY_SENTENCE_COUNTS';
export const fetchQuerySentenceCounts = createAsyncAction(FETCH_QUERY_SENTENCE_COUNTS, api.fetchQuerySentenceCounts, params => params);

export const FETCH_DEMO_QUERY_SENTENCE_COUNTS = 'FETCH_DEMO_QUERY_SENTENCE_COUNTS';
export const fetchDemoQuerySentenceCounts = createAsyncAction(FETCH_DEMO_QUERY_SENTENCE_COUNTS, api.fetchDemoQuerySentenceCounts, params => params);

export const FETCH_DEMO_QUERY_TOP_STORIES = 'FETCH_DEMO_QUERY_TOP_STORIES';
export const fetchDemoQueryTopStories = createAsyncAction(FETCH_DEMO_QUERY_TOP_STORIES, api.fetchDemoQueryTopStories, params => params);

export const FETCH_DEMO_QUERY_STORY_COUNT = 'FETCH_DEMO_QUERY_STORY_COUNT';
export const fetchDemoQueryStoryCount = createAsyncAction(FETCH_DEMO_QUERY_STORY_COUNT, api.fetchDemoQueryStoryCount, params => params);
