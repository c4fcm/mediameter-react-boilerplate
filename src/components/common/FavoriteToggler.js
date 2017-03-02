import React from 'react';
import { injectIntl } from 'react-intl';
import { FavoriteButton, FavoriteBorderButton } from './IconButton';
import messages from '../../resources/messages';

const FavoriteToggler = (props) => {
  const { isFavorited, onSetFavorited } = props;
  const { formatMessage } = props.intl;
  let mainButton = null;
  if (isFavorited) {
    mainButton = (<FavoriteButton
      tooltip={formatMessage(messages.unfavorite)}
      onClick={() => onSetFavorited(false)}
    />);
  } else {
    mainButton = (<FavoriteBorderButton
      tooltip={formatMessage(messages.favorite)}
      onClick={() => onSetFavorited(true)}
    />);
  }
  return (
    <div className="fav-toggle-button">
      { mainButton }
    </div>
  );
};

FavoriteToggler.propTypes = {
  intl: React.PropTypes.object.isRequired,
  isFavorited: React.PropTypes.bool.isRequired,
  onSetFavorited: React.PropTypes.func.isRequired,
};

export default injectIntl(FavoriteToggler);
