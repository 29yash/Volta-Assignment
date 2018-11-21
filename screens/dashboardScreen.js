import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import WebService from '../services/WebService';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import Autocomplete from 'react-native-autocomplete-input';

export default class Dashboard extends React.Component {

    state = {
        currentRegion: null,
        allStations: [],
        queriedStation: []
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                this.setState({
                    currentRegion: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
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
                {this.renderSearchBar()}
                {this.renderMap()}
            </View>
        );
    }

    renderMap() {
        console.log('renderCall', this.state.currentRegion);
        return (
            <MapView style={styles.map}
                ref={(el) => (this.map = el)}
                region={this.state.currentRegion}
                showsUserLocation={true}
                followsUserLocation={true}
                showsMyLocationButton={true}
                loadingEnabled={true}>
                {this.renderStations()}

            </MapView>
        );
    }

    renderSearchBar() {
        console.log(this.state.queriedStation);

        return (
            <Autocomplete
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={styles.autocompleteContainer}
                inputContainerStyle={styles.searchInputContainer}
                listStyle={styles.listContainerStyle}
                data={this.state.queriedStation}
                defaultValue={""}
                onChangeText={(text) => {
                    if (text.trim().length > 1) {
                        this.getAllStations(text);
                    }
                    else {
                        this.setState({ queriedStation: [] });
                    }

                }}
                placeholder="Search Stations"
                renderItem={(station) => (
                    <TouchableOpacity onPress={this.searchStationPress.bind(this, station)}>
                        <View style={styles.itemText}>
                            <Text>{station.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        );
    }

    searchStationPress(station){
        this.setState({ queriedStation: [] });
        this.map.animateToCoordinate({ latitude: station.location.coordinates[1], longitude: station.location.coordinates[0] }, 2);
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

    getAllStations(searchTerm = null) {
        let query = {};
        if (searchTerm) {
            query = { s: searchTerm };
        }
        console.log(query);

        WebService.getInstance().getStations(query, (response) => {
            console.log(response);
            this.setState(searchTerm ? { queriedStation: response } : { allStations: response, queriedStation: [] });
        }, (error) => {
            console.log(error);

        })
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    autocompleteContainer: {
        margin: 20
    },
    itemText: {
        fontSize: 15,
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc'
    },
    listContainerStyle: {
        height: 250
    },
    searchInputContainer: {
    }
});