import React from 'react';
import Route from 'react-router/lib/Route';
import IndexRedirect from 'react-router/lib/IndexRedirect';
import ToolsApp from '../components/tools/ToolsApp';
import ToolsHomeContainer from '../components/tools/ToolsHomeContainer';
import userRoutes from './userRoutes';

const toolsRoutes = (
  <Route path="/" component={ToolsApp}>

    <IndexRedirect to="/home" />

    <Route path="home" component={ToolsHomeContainer} />

    {userRoutes}

  </Route>
);

export default toolsRoutes;
