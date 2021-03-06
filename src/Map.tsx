import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { compose, withProps, withHandlers } from 'recompose';
import { fetch } from 'isomorphic-fetch';
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import * as React from 'react';
import autobind from 'autobind-decorator'
import AppState from './AppState';

const InnerComponent = compose(
  withProps({
    googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA9J_Gmk6p51rs4y6fB6MlUkA07QpkOuEU&v=3.exp&libraries=geometry,drawing,places',
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div className="mapContainer" style={{ height: `100vh` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withHandlers({
    onMarkerClustererClick: () => (markerClusterer) => {
      const clickedMarkers = markerClusterer.getMarkers()
      console.log(`Current clicked markers length: ${clickedMarkers.length}`)
      console.log(clickedMarkers)
    },
  }),
  withScriptjs,
  withGoogleMap
)((props) =>
    <GoogleMap
      defaultZoom={8}
      defaultCenter={{ lat: 41.9028, lng: 12.4964 }}
      onClick={props.handleMapClick}
    >
      {props.markers.map(marker => (
        <Marker
          key={marker.ID}
          position={{ lat: parseFloat(marker.latitude), lng: parseFloat(marker.longitude) }}
          onClick={props.onDispMarkerClick}
        />
      ))}

      <Marker
        key={0}
        position={{ lat : props.displayLat, lng : props.displayLng }}
      />
    </GoogleMap>
)

export default class Map extends React.Component<{ appState: AppState }, {}> {
  state = {
    markers : [],
    userlat : 0.00,
    userlng : 0.00,
  }

  componentWillMount() {
    this.setState({ markers: [] })
  }

  @autobind
  sendMarker() {
    const data = {userIdx: this.props.appState.username, command: "RequestPoint", latitude: this.state.userlat, longitude: this.state.userlng};
    this.props.appState.ws.send(JSON.stringify(data));
    this.setMarkers()
  }

//  @autobind
  setMarkers() {
    let reMark = {latitude: this.props.appState.remlat, longitude: this.props.appState.remlng, ID: this.props.appState.remID}
    let mark = {latitude: this.props.appState.recvlat, longitude: this.props.appState.recvlng, ID: this.props.appState.ID}
    console.log(this.state.markers.length)
    let array = this.state.markers.slice();
    let index = array.indexOf(reMark);
    array.splice(index, 1);
    array.push(mark);
    this.setState({markers: array });
  }

  handleMapClick = (center) => {

    this.setState({ userlat : center.latLng.lat() })
    this.setState({ userlng : center.latLng.lng() })
  }

 /* onDispMarkerClick = ({latLng}) => {
    this.setState{};
  }*/

  render() {
    return (
      <div>
        <InnerComponent
          handleMapClick={this.handleMapClick}
          displayLat = {this.state.userlat}
          displayLng = {this.state.userlng}
          markers = {this.state.markers}
        />
        <div className="searchContainer">
          <input className="searchLocation" type="text" placeholder="Search for places"></input>
          <button className="microphoneButton" onClick={this.sendMarker}>
            <i className="fas fa-microphone"></i>
          </button>
        </div>
        <div className="requestContainer">
          <button className="primaryButton" onClick={this.sendMarker}>
            Make Request
          </button>
        </div>
      </div>
    )
  }
}
