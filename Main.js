import React from 'react';
import {StyleSheet, Text} from 'react-native';
import { Router, ActionConst, Scene } from 'react-native-router-flux';
import Dashboard from './screens/dashboardScreen';

const Routing = () => {
    return (
        <Router>
            <Scene key="root">
                <Scene key="dashboard" component={Dashboard} headerMode="none" title="VOLTA"/>
            </Scene>
        </Router>
    );
}

export default class Main extends React.Component {
    render() {
        return (
            <Routing />
        );
    }
}