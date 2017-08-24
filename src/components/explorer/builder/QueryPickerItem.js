import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import TextField from 'material-ui/TextField';
import ColorPicker from '../../common/ColorPicker';
import { getShortDate } from '../../../lib/dateUtil';

const localMessages = {
  emptyMedia: { id: 'explorer.querypicker.emptyMedia',
    defaultMessage: 'no media sources or collections' },
  sourceStatus: { id: 'explorer.querypicker.sources', defaultMessage: '{srcCount, plural, \n =1 {# source} \n other {# sources }\n}' },
  collOneStatus: { id: 'explorer.querypicker.coll', defaultMessage: '{label}' },
  collStatus: { id: 'explorer.querypicker.coll', defaultMessage: '{collCount, plural, \n =1 {# collection} \n other {# collections }\n}' },
  searchHint: { id: 'explorer.querypicker.searchHint', defaultMessage: 'keywords' },
};

class QueryPickerItem extends React.Component {
  handleColorClick(color) {
    this.setState({ showColor: color });
  }
  handleMenuItemKeyDown = (evt) => {
    const { handleSearch } = this.props;
    switch (evt.key) {
      case 'Enter':
        handleSearch();
        break;
      default: break;
    }
  };

  render() {
    const { query, isEditable, isSelected, displayLabel, onQuerySelected, updateQueryProperty } = this.props;
    const { formatMessage } = this.props.intl;
    let nameInfo = null;
    let subT = null;

    if (query) {
      if (isEditable) {
        nameInfo = (
          <div>
            <ColorPicker
              color={query.color}
              onChange={e => updateQueryProperty(e.name, e.value)}
            />
            <TextField
              className="query-picker-editable-name"
              id="q"
              name="q"
              value={query.q}
              hintText={query.q || formatMessage(localMessages.searchHint)}
              onChange={(e, val) => updateQueryProperty('q', val)}
              onKeyPress={this.handleMenuItemKeyDown}
            />
          </div>
        );
      } else {
        nameInfo = (
          <div>
            <ColorPicker
              color={query.color}
              onChange={e => updateQueryProperty(e.name, e.value)}
            />&nbsp;
            <span className="query-picker-name">{query.q}</span>
          </div>
        );
      }

      const collCount = query.collections ? query.collections.length : 0;
      const srcCount = query.sources ? query.sources.length : 0;
      // const srcDesc = query.media;
      const totalCount = collCount + srcCount;
      const queryLabel = query.label;
      const oneCollLabelOrNumber = query.collections[0] && query.collections[0].label ? query.collections[0].label : query.collections[0].tags_id;
      const oneCollLabel = collCount === 1 ? oneCollLabelOrNumber : '';

      const oneCollStatus = <FormattedMessage {...localMessages.collOneStatus} values={{ label: oneCollLabel }} />;
      subT = <FormattedMessage {...localMessages.emptyMedia} values={{ totalCount }} />;

      if (srcCount === 0 && collCount === 1) {
        // TODO start_date vs startDate
        subT = (
          <div className="query-info">
            {displayLabel ? query.label : ''}
            {oneCollStatus}<br />
            {query.startDate ? getShortDate(query.startDate) : ''} to {query.endDate ? getShortDate(query.endDate) : ''}
          </div>
        );
      } else if (totalCount > 0) {
        subT = (
          <div className="query-info">
            {displayLabel ? query.label : ''}
            <FormattedMessage {...localMessages.collStatus} values={{ collCount, label: queryLabel }} /><br />
            <FormattedMessage {...localMessages.sourceStatus} values={{ srcCount, label: queryLabel }} /><br />
            {query.startDate ? getShortDate(query.startDate) : ''} to {query.endDate ? getShortDate(query.endDate) : ''}
          </div>
        );
      }
    }
    const extraClassNames = (isSelected) ? 'selected' : '';
    return (
      <div className={`query-picker-item ${extraClassNames}`} onTouchTap={onQuerySelected}>
        {nameInfo}
        {subT}
      </div>
    );
  }
}

QueryPickerItem.propTypes = {
  // from parent
  query: React.PropTypes.object,
  isSelected: React.PropTypes.bool.isRequired,
  isEditable: React.PropTypes.bool.isRequired,
  displayLabel: React.PropTypes.bool.isRequired,
  onQuerySelected: React.PropTypes.func,
  updateQueryProperty: React.PropTypes.func.isRequired,
  handleSearch: React.PropTypes.func.isRequired,
  // from composition
  intl: React.PropTypes.object.isRequired,
};


export default
  injectIntl(
    QueryPickerItem
  );
