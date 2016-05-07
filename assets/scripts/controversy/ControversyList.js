import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router';

class ControversyListItem extends React.Component {
  getStyles() {
    const styles = {
      nameColumn: {
        width: '20%',
      },
    };
    return styles;
  }
  render() {
    const { controversy } = this.props;
    const styles = this.getStyles();
    return (
      <TableRow>
        <TableRowColumn styles={styles.nameColumn}>
          <Link to={`/controversy/${controversy.controversies_id}`}>{controversy.name}</Link></TableRowColumn>
        <TableRowColumn>{controversy.description}</TableRowColumn>
      </TableRow>
    );
  }
}

ControversyListItem.propTypes = {
  controversy: React.PropTypes.object.isRequired,
};

const ControversyList = (props) => {
  const { controversies } = props;
  const controversiesArray = Object.keys(controversies).map((idx) => controversies[idx]);
  return (
    <Table>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Description</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        {controversiesArray.map(controversy =>
          <ControversyListItem key={controversy.controversies_id} controversy={controversy} />
        )}
      </TableBody>
    </Table>);
};

ControversyList.propTypes = {
  controversies: React.PropTypes.object.isRequired,
  intl: React.PropTypes.object.isRequired,
};

export default injectIntl(ControversyList);
