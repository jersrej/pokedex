import React, { Suspense } from 'react';
import { lazy } from '@loadable/component'
import ReactDOM from 'react-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css';
// import App from './App';
// import Pokedex from './components/Pokedex';
// import pokeHome from './assets/gif/poke-home.gif'
import * as serviceWorker from './serviceWorker';

const PokeComponent = lazy(() => import('./components/Pokedex'))

ReactDOM.render(
	<Suspense fallback={<div>Loading</div>}>
		<PokeComponent />
	</Suspense>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
