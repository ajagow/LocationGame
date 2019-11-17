import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  AlertIOS
} from "react-native";
import MapView, { Marker, AnimatedRegion } from "react-native-maps";

const screen = Dimensions.get("window");

const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class MapScreen extends Component {
  constructor() {
    super();
    this.state = {
      members: [
        {
          id: "6jmItzqXbT:rT9M2uNHxK", // unique user ID assigned by Scaledrone
          authData: {
            // authData is created by the JWT sent from the authentication server
            color: "#f032e6", // unique color hash from the authentication server
            name: "John" // user is prompted to insert their name
          },
          location: {
            latitude: 42.338142559575566,
            longitude: -71.093457360938,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5
          } // react-native-maps marker location
        }
      ]
    };
  }

  createMarkers() {
    const { members } = this.state;
    const membersWithLocations = members.filter(m => !!m.location);
    return membersWithLocations.map(member => {
      const { id, location, authData } = member;
      const { name, color } = authData;
      return (
        <Marker.Animated
          key={id}
          identifier={id}
          coordinate={location}
          pinColor={color}
          title={name}
        />
      );
    });
  }

  createMembers() {
    const { members } = this.state;
    return members.map(member => {
      const { name, color } = member.authData;
      return (
        <View key={member.id} style={styles.member}>
          <View style={[styles.avatar, { backgroundColor: color }]} />
          <Text style={styles.memberName}>{name}</Text>
        </View>
      );
    });
  }

  fitToMarkersToMap() {
    const { members } = this.state;
    this.map.fitToSuppliedMarkers(members.map(m => m.id), true);
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          ref={ref => {
            this.map = ref;
          }}
          initialRegion={{
            latitude: 37.600425,
            longitude: -122.385861,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }}
        >
          {this.createMarkers()}
        </MapView>
        <View pointerEvents="none" style={styles.members}>
          {this.createMembers()}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.fitToMarkersToMap()}
            style={[styles.bubble, styles.button]}
          >
            <Text>Fit Markers Onto Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 20
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent",
    marginBottom: 400
  },
  members: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 10
  }
});
