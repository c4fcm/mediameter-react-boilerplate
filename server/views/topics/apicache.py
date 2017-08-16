import logging
from flask import request

from server import mc, TOOL_API_KEY
from server.cache import cache
from server.util.tags import STORY_UNDATEABLE_TAG
from server.auth import user_admin_mediacloud_client, user_mediacloud_key, is_user_logged_in
from server.util.request import filters_from_args
from server.views.topics import validated_sort, access_public_topic

logger = logging.getLogger(__name__)


def topic_media_list(user_mc_key, topics_id, **kwargs):
    '''
    Return sorted media list based on filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q,
        'sort': validated_sort(request.args.get('sort')),
        'limit': request.args.get('limit'),
        'link_id': request.args.get('linkId'),
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    return _cached_topic_media_list(user_mc_key, topics_id, **merged_args)


@cache
def _cached_topic_media_list(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_media_list instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    local_mc = None
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()
    return local_mc.topicMediaList(topics_id, **kwargs)


def topic_story_count(user_mc_key, topics_id, **kwargs):
    '''
    Return filterd story count within topic.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    # logger.info("!!!!!"+str(merged_args['timespans_id']))
    return _cached_topic_story_count(user_mc_key, topics_id, **merged_args)


@cache
def _cached_topic_story_count(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_story_count instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    local_mc = None
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()
    return local_mc.topicStoryCount(topics_id, **kwargs)


def topic_story_list(user_mc_key, topics_id, **kwargs):
    '''
    Return sorted story list based on filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q,
        'sort': validated_sort(request.args.get('sort')),
        'limit': request.args.get('limit'),
        'link_id': request.args.get('linkId'),
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    return _cached_topic_story_list(user_mc_key, topics_id, **merged_args)


@cache
def _cached_topic_story_list(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_story_list instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    local_mc = None
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()
    return local_mc.topicStoryList(topics_id, **kwargs)


def topic_word_counts(user_mc_key, topics_id, **kwargs):
    '''
    Return sampled word counts based on filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q,
        'sample_size': 1000
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    return _cached_topic_word_counts(user_mc_key, topics_id, **merged_args)


@cache
def _cached_topic_word_counts(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_word_counts instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    local_mc = None
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()
    return local_mc.topicWordCount(topics_id, **kwargs)


def topic_sentence_counts(user_mc_key, topics_id, **kwargs):
    '''
    Return setence counts over timebased on filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    # and make sure to ignore undateable stories
    undateable_query_part = "NOT tags_id_stories:{}".format(STORY_UNDATEABLE_TAG)   # doesn't work if the query includes parens!!!
    if merged_args['q'] is not None:
        merged_args['q'] += " AND {}".format(undateable_query_part)
    else:
        merged_args['q'] = "* AND {}".format(undateable_query_part)
    return _cached_topic_sentence_counts(user_mc_key, topics_id, **merged_args)


@cache
def _cached_topic_sentence_counts(user_mc_key, topics_id, **kwargs):
    '''
    Internal helper - don't call this; call topic_sentence_counts instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly.
    '''
    local_mc = None
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()

    # grab the timespan because we need the start and end dates
    timespan = local_mc.topicTimespanList(topics_id,
        snapshots_id=kwargs['snapshots_id'], foci_id=kwargs['foci_id'], timespans_id=kwargs['timespans_id'])[0]
    return local_mc.topicSentenceCount(topics_id,
        split=True, split_start_date=timespan['start_date'][:10], split_end_date=timespan['end_date'][:10],
        **kwargs)


@cache
def topic_focal_sets(user_mc_key, topics_id, snapshots_id):
    '''
    This needs user_mc_key in the function signature to make sure the caching is keyed correctly.
    '''
    user_mc = user_admin_mediacloud_client()
    response = user_mc.topicFocalSetList(topics_id, snapshots_id=snapshots_id)
    return response


@cache
def cached_topic_timespan_list(user_mc_key, topics_id, snapshots_id, foci_id=None):
    # this includes the user_mc_key as a first param so the cache works right
    user_mc = user_admin_mediacloud_client()
    timespans = user_mc.topicTimespanList(topics_id, snapshots_id=snapshots_id, foci_id=foci_id)
    return timespans


def topic_tag_coverage(topics_id, tags_id):
    '''
    Useful for seeing how many stories in the topic are tagged with a specific tag
    '''
    # respect any query filter the user has set
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    tag_query = "tags_id_stories:{}".format(tags_id)
    if q is None:
        query_with_tag = tag_query
    else:
        query_with_tag = "({}) AND ({})".format(q, tag_query)
    # now get the counts
    if access_public_topic(topics_id):
        total = topic_story_count(TOOL_API_KEY, topics_id)
        tagged = topic_story_count(TOOL_API_KEY, topics_id, q=query_with_tag )  # force a count with just the query
    elif is_user_logged_in():
        total = topic_story_count(user_mediacloud_key(), topics_id)
        tagged = topic_story_count(user_mediacloud_key(), topics_id, q=query_with_tag )   # force a count with just the query
    else:
        return None
    return {'counts': {'count': tagged['count'], 'total': total['count']}}

@cache
def topic_tag_counts(user_mc_key, timespans_id, tag_sets_id, sample_size):
    '''
    Get a breakdown of the most-used tags within a set within a single timespan.
     This doesn't support the other filters, because it has to use sentenceFieldCount,
     not a topicSentenceFieldCount method that takes filters (which doesn't exit)
    '''
    query = None
    if timespans_id is not None:
        query = "timespans_id:{}".format(timespans_id)
    user_mc = user_admin_mediacloud_client()
    tag_counts = user_mc.sentenceFieldCount('*', query, field='tags_id_stories',
                                            tag_sets_id=tag_sets_id, sample_size=sample_size)
    # add in the pct so we can show relative values within the sample
    for t in tag_counts:  # add in pct so user knows it was sampled
        t['pct'] = float(t['count']) / float(sample_size)
    return tag_counts


def topic_sentence_sample(user_mc_key, topics_id, sample_size=1000, **kwargs):
    '''
    Return a sample of sentences based on the filters.
    '''
    snapshots_id, timespans_id, foci_id, q = filters_from_args(request.args)
    merged_args = {
        'snapshots_id': snapshots_id,
        'timespans_id': timespans_id,
        'foci_id': foci_id,
        'q': q
    }
    merged_args.update(kwargs)    # passed in args override anything pulled form the request.args
    return _cached_topic_sentence_sample(user_mc_key, topics_id, sample_size, **merged_args)


@cache
def _cached_topic_sentence_sample(user_mc_key, topics_id, sample_size=1000, **kwargs):
    '''
    Internal helper - don't call this; call topic_sentence_sample instead. This needs user_mc_key in the
    function signature to make sure the caching is keyed correctly. It includes topics_id in the method
    signature to make sure caching works reasonably.
    '''
    local_mc = None
    if user_mc_key == TOOL_API_KEY:
        local_mc = mc
    else:
        local_mc = user_admin_mediacloud_client()

    sentences = local_mc.sentenceList(kwargs['q'], "timespans_id:{}".format(kwargs['timespans_id']),
                                     rows=sample_size, sort=local_mc.SORT_RANDOM)
    return sentences


def topic_timespan(topics_id, snapshots_id, foci_id, timespans_id):
    '''
    No timespan/single end point, so we need a helper to do it
    :param snapshots_id: 
    :param timespans_id: 
    :param foci_id: 
    :return: info about one timespan as specified
    '''
    timespans = cached_topic_timespan_list(user_mediacloud_key(), topics_id, snapshots_id=snapshots_id, foci_id=foci_id)
    for timespan in timespans:
        if int(timespan['timespans_id']) == int(timespans_id):
            return timespan
    return None
