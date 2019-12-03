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
import { isPointWithinRadius } from "geolib";

const screen = Dimensions.get("window");

const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const RADIUS = 200;

export default class MapScreen extends Component {
  constructor() {
    super();
    this.state = {
      position: null,
      error: null,
      isWithinPointRadius: false,
      members: [
        {
          id: "6jmItzqXbT:rT9M2uNHxK", // unique user ID assigned by Scaledrone
          authData: {
            // authData is created by the JWT sent from the authentication server
            color: "#f032e6", // unique color hash from the authentication server
            name: "pencil" // user is prompted to insert their name
          },
          location: {
            latitude: 43.33673132323687,
            longitude: -71.09021056333766,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5
          } // react-native-maps marker location
        },
        {
          id: "6jmItzqXbT:rT9M2uNHxL", // unique user ID assigned by Scaledrone
          authData: {
            // authData is created by the JWT sent from the authentication server
            color: "#f032e6", // unique color hash from the authentication server
            name: "golden apple" // user is prompted to insert their name
          },
          location: {
            latitude: 42.3429,
            longitude: -71.0858,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5
          } // react-native-maps marker location
        }
      ]
    };
  }

  isUserInRadius(position) {
    const { members } = this.state;
    let isOneInRange = false;
    members.forEach(member => {
      const { id, location, authData } = member;
      const isPoint = isPointWithinRadius(
        {
          latitude: position["coords"].latitude,
          longitude: position["coords"].longitude
        },
        { latitude: location.latitude, longitude: location.longitude },
        RADIUS
      );

      if (isPoint) {
        isOneInRange = true;
      }
    });

    if (isOneInRange) {
      this.setState({ isWithinPointRadius: true });
    }
  }

  componentDidMount() {
    navigator.geolocation.watchPosition(
      position => {
        this.setState({
          position: {
            longitude: position["coords"].longitude,
            latitude: position["coords"].latitude
          }
        });
        this.isUserInRadius(position);
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 }
    );
  }

  createMarkers() {
    const { members } = this.state;
    const membersWithLocations = members.filter(m => !!m.location);
    return membersWithLocations.map(member => {
      const { id, location, authData } = member;
      const { name, color } = authData;
      return (
        <View>
          <Marker.Animated
            key={id}
            identifier={id}
            coordinate={location}
            pinColor={color}
            title={name}
          />
          <MapView.Circle
            key={id}
            center={location}
            radius={RADIUS}
            strokeWidth={2}
            strokeColor="#3399ff"
            fillColor="rgba(51,153,255,.5)"
          />
        </View>
      );
    });
  }

  createYou() {
    const { position } = this.state;
    if (position) {
      return (
        <MapView.Marker
          coordinate={this.state.position}
          title="you"
          description="This is where you are"
        />
      );
    }
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

  fitMeToMap() {
    console.log("dkfjlsdkf" + this.state.position);
    let something = {
      ...this.state.position,
      ...{ latitudeDelta: 0.001, longitudeDelta: 0.001 }
    };
    this.map.animateToRegion(something, 100);
  }

  render() {
    const { position, isWithinPointRadius } = this.state;
    if (!position) {
      return <View style={styles.container}></View>;
    }
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          ref={ref => {
            this.map = ref;
          }}
          initialRegion={{
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }}
        >
          {this.createMarkers()}
          {this.createYou()}
        </MapView>
        <View pointerEvents="none" style={styles.members}>
          {this.createMembers()}
        </View>
        <View style={[styles.buttonContainer, { marginBottom: 20 }]}>
          <TouchableOpacity
            onPress={() => this.fitToMarkersToMap()}
            style={[styles.bubble, styles.button]}
          >
            <Text>Find all Markers</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.buttonContainer, { marginBottom: 10 }]}>
          <TouchableOpacity
            onPress={() => this.fitMeToMap()}
            style={[styles.bubble, styles.button]}
          >
            <Text>Find Me</Text>
          </TouchableOpacity>
        </View>
        {isWithinPointRadius && (
          <View style={[styles.buttonContainer, { marginBottom: 200 }]}>
            <TouchableOpacity
              onPress={() => console.warn("you are within radius")}
              style={[styles.bubble, styles.button]}
            >
              <Text>You are within radius</Text>
            </TouchableOpacity>
          </View>
        )}
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
