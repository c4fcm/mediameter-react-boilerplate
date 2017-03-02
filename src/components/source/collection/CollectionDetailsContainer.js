import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import RaisedButton from 'material-ui/RaisedButton';
import Lock from 'material-ui/svg-icons/action/lock';
import Unlock from 'material-ui/svg-icons/action/lock-open';
import IconButton from 'material-ui/IconButton';
import { Row, Col } from 'react-flexbox-grid/lib';
import { favoriteCollection, updateFeedback } from '../../../actions/sourceActions';
import CollectionIcon from '../../common/icons/CollectionIcon';
import SourceList from '../../common/SourceList';
import CollectionSentenceCountContainer from './CollectionSentenceCountContainer';
import CollectionTopWordsContainer from './CollectionTopWordsContainer';
import CollectionGeographyContainer from './CollectionGeographyContainer';
import CollectionSourceRepresentation from './CollectionSourceRepresentation';
import CollectionSimilarContainer from './CollectionSimilarContainer';
import FavoriteToggler from '../../common/FavoriteToggler';
import CollectionMetadataCoverageSummaryContainer from './CollectionMetadataCoverageSummaryContainer';
import messages from '../../../resources/messages';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';


const localMessages = {
  searchNow: { id: 'collection.details.searchNow', defaultMessage: 'Search on the Dashboard' },
  collectionDetailsTitle: { id: 'collection.details.title', defaultMessage: 'Collection: {name}' },
  noHealth: { id: 'collection.details.noHealth', defaultMessage: 'Sorry, we can\'t show collection-level health yet.' },
  sourceTableTitle: { id: 'collection.details.sourceTable.title', defaultMessage: 'Sources' },
  sourceTableIntro: { id: 'collection.details.sources.intro',
    defaultMessage: 'This collection includes {count, plural,\n =0 {no media sources} \n =1 {one media source} \n other {# media sources}\n}.',
  },
  favoritedSourcesTitle: { id: 'source.details.sources.favorited.title', defaultMessage: 'Favorited Sources' },
  favoritedSourcesIntro: { id: 'source.details.sources.favorited.intro',
    defaultMessage: 'You have favorited {count, plural,\n =0 {no sources}\n =1 {one source}\n other {# sources}\n}.',
  },
  collectionIsOrIsnt: { id: 'collection.details.isOrIsnt', defaultMessage: 'This is a {shows, plural,\n =0 {dynamic collection; sources can be added and removed from it}\n =1 {static collection; the sources that are part of it will not change}\n}.' },
  collectionIsNotStatic: { id: 'collection.details.isStatic', defaultMessage: 'This is a dynamic collection; sources can be added and removed from it' },
  collectionIsStatic: { id: 'collection.details.isNotStatic', defaultMessage: 'This is a static collection; the sources that are part of it will not change.' },
  collectionShowOn: { id: 'collection.details.showOn', defaultMessage: 'This collection {onMedia, plural,\n =0 {does not show}\n =1 {shows}\n} up on media and {onStories, plural,\n =0 {does not show}\n =1 {shows}\n other {does not show}\n} up on stories.' },
  collectionFavorited: { id: 'collection.favorited', defaultMessage: 'Marked this as a favorite' },
  collectionUnFavorited: { id: 'collection.unfavorited', defaultMessage: 'Marked this as not a favorite' },
};

class CollectionDetailsContainer extends React.Component {

  searchOnDashboard = () => {
    const { collection } = this.props;
    const dashboardUrl = `https://dashboard.mediacloud.org/#query/["*"]/[{"sets":[${collection.tags_id}]}]/[]/[]/[{"uid":1,"name":"${collection.label}","color":"55868A"}]`;
    window.open(dashboardUrl, '_blank');
  }

  render() {
    const { collection, onChangeFavorited } = this.props;
    const { formatMessage } = this.props.intl;
    const filename = `SentencesOverTime-Collection-${collection.tags_id}`;
    const publicMessage = (collection.show_on_media === 1) ? `• ${formatMessage(messages.public)}` : '';
    const editMessage = ( // TODO: permissions around this
      <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
        <span className="collection-edit-link">
          •&nbsp;
          <Link to={`/collections/${collection.tags_id}/edit`} >
            <FormattedMessage {...messages.edit} />
          </Link>
        </span>
      </Permissioned>
    );
    let lockIcon = null;
    if (collection.is_static === 1) {
      lockIcon = (<IconButton style={{ marginTop: 5 }} tooltip={formatMessage(localMessages.collectionIsStatic)}><Lock /></IconButton>);
    } else {
      lockIcon = (<IconButton style={{ marginTop: 5 }} tooltip={formatMessage(localMessages.collectionIsNotStatic)}><Unlock /></IconButton>);
    }

    let mainButton = null;
    mainButton = (<FavoriteToggler
      isFavorited={collection.isFavorite}
      onSetFavorited={isFavNow => onChangeFavorited(collection.id, isFavNow)}
    />);

    return (
      <div>
        <Row>
          <Col lg={12}>
            <h1>
              <CollectionIcon height={32} />
              <FormattedMessage {...localMessages.collectionDetailsTitle} values={{ name: collection.label }} />
              <div className="actions">{mainButton}</div>
              <small className="subtitle">{lockIcon} ID #{collection.id} {publicMessage} {editMessage} </small>
            </h1>
            <p><b>{collection.description}</b></p>
            <p>
              <li><FormattedMessage {...localMessages.collectionIsOrIsnt} values={{ shows: collection.is_static }} /></li>
              <li><FormattedMessage {...localMessages.collectionShowOn} values={{ onMedia: collection.show_on_media, onStories: collection.show_on_stories }} /></li>
            </p>
            <RaisedButton label={formatMessage(localMessages.searchNow)} primary onClick={this.searchOnDashboard} />
          </Col>
        </Row>
        <Row>
          <Col lg={6} xs={12}>
            <CollectionTopWordsContainer collectionId={collection.tags_id} />
          </Col>
          <Col lg={6} xs={12}>
            <CollectionSentenceCountContainer collectionId={collection.tags_id} filename={filename} />
          </Col>
        </Row>
        <Row>
          <Col lg={12} md={12} xs={12}>
            <CollectionGeographyContainer collectionId={collection.tags_id} collectionName={collection.label} />
          </Col>
        </Row>
        <Row>
          <Col lg={12} md={12} xs={12}>
            <CollectionMetadataCoverageSummaryContainer collectionId={collection.tags_id} collection={collection} sources={collection.media} />
          </Col>
        </Row>
        <Row>
          <Col lg={6} xs={12}>
            <SourceList collectionId={collection.tags_id} sources={collection.media} />
          </Col>
          <Col lg={6} xs={12}>
            <CollectionSourceRepresentation collectionId={collection.tags_id} />
            <CollectionSimilarContainer collectionId={collection.tags_id} filename={filename} />
          </Col>
        </Row>
      </div>
    );
  }

}

CollectionDetailsContainer.propTypes = {
  intl: React.PropTypes.object.isRequired,
  // from context
  params: React.PropTypes.object.isRequired,       // params from router
  collectionId: React.PropTypes.number.isRequired,
  // from dispatch
  onChangeFavorited: React.PropTypes.func.isRequired,
  // from state
  collection: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  collectionId: parseInt(ownProps.params.collectionId, 10),
  collection: state.sources.collections.selected.collectionDetails.object,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onChangeFavorited: (mediaId, isFavorite) => {
    dispatch(favoriteCollection(mediaId, isFavorite))
      .then(() => {
        const msg = (isFavorite) ? localMessages.collectionFavorited : localMessages.collectionUnFavorited;
        dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(msg) }));
        // dispatch(fetchFavoriteCollections());  // to update the list of favorites
      });
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      CollectionDetailsContainer
    )
  );
