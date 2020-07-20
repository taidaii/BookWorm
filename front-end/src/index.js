import React from 'react';
import ReactDOM from 'react-dom';
import Search from './pages/search'
import HomePage from './pages/homepage';
// import './index.css';

import './stylus/index.less'
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux'
import store from './store'
import {BrowserRouter, Route, BrowserRouter as Router} from 'react-router-dom'

const Main = () =>{
    return (
        <Provider store={store}>
            <BrowserRouter basename='/'>

                <Route path={`/`} component={App}></Route>

            </BrowserRouter>

        </Provider>
    )
}

export default class Routing extends React.Component {
    render() {
        return (
            <Router >
                <div>
                    {/*index.js不做任何界面渲染，只引入跳转路径，初始界面为/（homepage），使用‘exact’防止NavigateBar界面的重复渲染*/}
                    <Route exact path="/search" component={Search} />
                    <Route exact path="/" component={HomePage} />
                </div>
            </Router>
        );
    }
}



ReactDOM.render(<Main />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
