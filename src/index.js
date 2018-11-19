import React, { Fragment } from "react";
import { render } from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import NavBar from "./NavBar";
import Instructions from "./Instructions";
import Wireframe from "./Wireframe";
import Requests from "./Requests";

const ProgrammerTest = () => (
  <BrowserRouter>
    <Fragment>
      <NavBar />
      <Switch>
        <Route path="/requests" component={Requests} exact />
        <Route path="/wireframe" component={Wireframe} exact />
        <Route component={Instructions} />
      </Switch>
    </Fragment>
  </BrowserRouter>
);

render(<ProgrammerTest />, document.getElementById("root"));
