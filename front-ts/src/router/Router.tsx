import Home from '@components/features/Home';
import Login from '@components/features/login/Login';

import SessionService from '@services/session/SessionService';
import { useObservable } from 'micro-observables';
import { getGlobalInstance } from 'plume-ts-di';
import React from 'react';
import { LOGIN, ROUTE_HOME, routes, UseRoute, useRoute, } from './RouterDefinition';

export default function Router() {
  const sessionService: SessionService = getGlobalInstance(SessionService);

  const isAuthenticated: boolean = useObservable(sessionService.isAuthenticated());

  const route: UseRoute = useRoute();

  if (!isAuthenticated) {
    routes[LOGIN]().push();

    return <Login />;
  }

  if (route.name === false) {
    routes[ROUTE_HOME]().push();

    return <></>;
  }

  return (
    <div>
      {route.name === ROUTE_HOME && <Home />}
    </div>
  );
}
