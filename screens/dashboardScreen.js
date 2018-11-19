import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import WebService from '../services/WebService';
import Autosuggest from 'react-autosuggest';
import  MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

export default class Dashboard extends React.Component {

    state = {
        currentRegion: null,
        allStations: []
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                this.setState({
                    currentRegion: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                    }
                });
                this.getAllStations();
            },
            (error) => this.setState({ error: error.message }),
            { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
        );
    }


    render() {
        return (
            <View style={styles.container}>
                {this.renderMap()}
            </View>
        );
    }

    renderMap() {
        console.log('renderCall', this.state.currentRegion);
        return (
            <MapView style={styles.map}
                region={this.state.currentRegion}
                showsUserLocation={true}
                followsUserLocation={true}
                showsMyLocationButton={true}
                loadingEnabled={true}
            >
                {this.renderStations()}
                <Text>Yash</Text>
            </MapView>
        );
    }

    renderStations() {
        let stations = [];
        this.state.allStations.map((station, index) => {
            if (station.location && station.location.coordinates) {
                stations.push(
                    <Marker
                        key={index}
                        coordinate={{ latitude: station.location.coordinates[1], longitude: station.location.coordinates[0] }}
                        title={station.name}
                        description={station.street_address}
                        image={require('../assets/marker.png')}
                    />
                )
            }
        });
        return stations;
    }

    getAllStations() {
        WebService.getInstance().getStations({}, (response) => {
            console.log(response);
            this.setState({ allStations: response })
        }, (error) => {
            console.log(error);

        })
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
});