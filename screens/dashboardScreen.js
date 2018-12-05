import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import WebService from '../services/WebService';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import Autocomplete from 'react-native-autocomplete-input';
import Touchable from '../components/Touchable';
import geolib from 'geolib';
import * as Progress from 'react-native-progress';
import LaunchNavigator from 'react-native-launch-navigator';
import NetworkController from '../services/NetworkController';
const dismissKeyboard = require('../components/dismissKeyboard');
const { width, height } = Dimensions.get('window');


export default class Dashboard extends React.Component {

    state = {
        currentRegion: null,
        allStations: [],
        selectedText: null,
        queriedStation: [],
        selectedStation: null,
        nearByStation: null,
        isStationSelected: false,
        allSiteMetrics: []
    }

    componentDidMount() {
        this.getUserLocation();
        this.setNetworkCallback();
    }

    setNetworkCallback() {
        NetworkController.getController().callBack = () => {
            this.getAllStations();
            this.getAllSiteMetrics()
        }
    }

    getUserLocation() {
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
                this.getAllSiteMetrics();
            },
            (error) => {
                console.log(error);
                this.setState({ error: error.message })
            },
            { enableHighAccuracy: true },
        );
    }



    render() {
        console.log(NetworkController.getController().netstate);
        return (
            <View style={styles.container}>
                {this.renderMap()}
                {this.renderSearchBar()}
            </View>
        );
    }

    renderDrawer() {
        if (NetworkController.getController().netstate) {
            return (
                <View style={styles.drawerContent}>
                    {this.state.isStationSelected ? this.renderStationInfo() : this.showNearBy()}
                </View>
            );
        }
        else {
            return (
                <View style={styles.drawerContent}>
                    <View style={styles.showStation}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={[styles.nearStationName, {color: 'red'}]} ellipsizeMode={"tail"} numberOfLines={1}>Network Not Available</Text>
                        </View>
                    </View>
                </View>
            );
        }
    }

    openDirections(station) {
        LaunchNavigator.navigate([station.location.coordinates[1], station.location.coordinates[0]]).then(() => console.log("Launched navigator"))
            .catch((err) => console.error("Error launching navigator: " + err));
    }

    showNearBy() {
        if (this.state.nearByStation) {
            return (
                <View style={styles.showStation}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.nearestText}>Nearest Station</Text>
                        <Text style={styles.nearStationName} ellipsizeMode={"tail"} numberOfLines={1}>{this.state.nearByStation.name}</Text>
                    </View>
                    <Touchable style={styles.directionButton} onPress={this.openDirections.bind(this, this.state.nearByStation)}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: 'white' }}>Directions</Text>
                            <Text style={{ color: 'white' }}>{this.state.nearByDistance + " meters"}</Text>
                        </View>
                    </Touchable>
                </View>
            );
        }
        else {
            <View style={styles.showStation}>
                <Text style={styles.stationName}>No Nearest Station</Text>
            </View>
        }
    }

    renderStationInfo() {
        if (this.state.selectedStation) {
            let stationMetrics = this.state.allSiteMetrics.find((site) => {
                return site.id === this.state.selectedStation.id;
            });
            let availableCharger = stationMetrics.chargers[0].available;
            let totalCharger = stationMetrics.chargers[0].total;
            return (
                <View style={styles.showStation}>
                    <Text style={styles.stationName} ellipsizeMode={"tail"} numberOfLines={1}>{this.state.selectedStation.name}</Text>
                    <Progress.Bar showsText={true} progress={availableCharger / totalCharger} width={300} height={20} color="#00c8ef" />
                    <Text style={styles.progessBarText}>{availableCharger + ' OF ' + totalCharger + ' CHARGERS AVAILABLE'}</Text>
                    <Touchable style={styles.directionButton} onPress={this.openDirections.bind(this, this.state.selectedStation)}>
                        <Text style={{ color: 'white' }}>Directions</Text>
                    </Touchable>
                </View>
            );
        }
        else {
            <View style={styles.showStation}>
                <Text style={styles.stationName}>Station Information Not Available</Text>
            </View>
        }
    }

    renderMap() {
        console.log('renderCall', this.state.currentRegion);
        return (
            <View style={styles.container}>
                <MapView style={styles.map}
                    ref={(el) => (this.map = el)}
                    region={this.state.currentRegion}
                    showsUserLocation={true}
                    followsUserLocation={true}
                    showsMyLocationButton={true}
                    loadingEnabled={true}>
                    {this.renderStations()}
                </MapView>
                {this.renderDrawer()}
            </View>
        );
    }

    renderSearchBar() {
        return (
            <Autocomplete
                value={this.state.selectedText}
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={styles.autocompleteContainer}
                inputContainerStyle={styles.searchInputContainer}
                listStyle={styles.listContainerStyle}
                data={this.state.queriedStation}
                defaultValue={""}
                onChangeText={(text) => {
                    this.setState({ selectedText: text })
                    if (text.trim().length > 2) {
                        this.getAllStations(text);
                    }
                    else {
                        this.setState({ queriedStation: [], isStationSelected: false, selectedStation: null });
                    }

                }}
                placeholder="Search Stations"
                renderItem={(station) => (
                    <Touchable onPress={this.searchStationPress.bind(this, station)}>
                        <View style={styles.itemText}>
                            <Text>{station.name}</Text>
                        </View>
                    </Touchable>
                )}
            />
        );
    }

    searchStationPress(station) {
        dismissKeyboard();
        setTimeout(() => {
            this.map.animateToCoordinate({ latitude: station.location.coordinates[1], longitude: station.location.coordinates[0] }, 2);
        }, 50)
        this.setState({ queriedStation: [], selectedText: station.name, selectedStation: station, isStationSelected: true });
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
                        onPress={() => { this.searchStationPress(station) }}
                        description={station.street_address}
                        image={require('../assets/marker.png')}>
                    </Marker>
                )
            }
        });
        return stations;
    }

    getAllStations(searchTerm = null) {
        if (NetworkController.getController().netstate) {
            let query = {};
            if (searchTerm) {
                query = { s: searchTerm };
            }
            WebService.getInstance().getStations(query, (response) => {
                console.log(response);
                this.setState(searchTerm ? { queriedStation: response } : { allStations: response, queriedStation: [] });
                if (!searchTerm) {
                    this.findNearByStations(response);
                }
            }, (error) => {
                console.log(error);
            });
        }
    }

    getAllSiteMetrics() {
        if (NetworkController.getController().netstate) {
            WebService.getInstance().getAllSiteMetrics((response) => {
                console.log(response);
                this.setState({ allSiteMetrics: response });
            }, (error) => {
                console.log(error);
            });
        }
    }

    findNearByStations(stations) {
        let stationCords = []
        if (stations) {
            stations.map((station) => {
                let latLng = { latitude: station.location.coordinates[1], longitude: station.location.coordinates[0] };
                stationCords.push(latLng);
            });
            let nearByIndex = geolib.findNearest(this.state.currentRegion, stationCords, 1);
            this.setState({ nearByStation: stations[nearByIndex.key], nearByDistance: nearByIndex.distance });
        }
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
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1,
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
        height: 180
    },
    drawerContent: {
        flex: 1,
        width,
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        padding: 20
    },
    showStation: {
        flex: 1,
        alignItems: "center",
    },
    stationName: {
        fontSize: 20,
        fontWeight: "500",
        padding: 10,
        marginBottom: 5
    },
    progessBarText: {
        fontSize: 13,
        color: "#9b9b97",
        marginTop: 10
    },
    nearestText: {
        fontSize: 15,
        color: "#9b9b97",
        fontWeight: "bold"
    },
    nearStationName: {
        fontSize: 17,
        fontWeight: "500",
        marginLeft: 10
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '500',
        color: 'white'
    },
    directionButton: {
        backgroundColor: "#fc5ead",
        marginTop: 15,
        padding: 15,
        borderRadius: 5,
        width: "80%",
        alignItems: "center"
    }
});