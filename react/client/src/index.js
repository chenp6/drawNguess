import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter  as Router,Route,Routes} from 'react-router-dom';
import Lobby from './lobby/Lobby';
import Game from './game/Game';

ReactDOM.render(
  <Router>  
  <Routes>
    <Route exact path="/" element={<Lobby />} />
    <Route exact path="/game" element={<Game />} />
  </Routes>
</Router>,
  document.getElementById('root')
);

