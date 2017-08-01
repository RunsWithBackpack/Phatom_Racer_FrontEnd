//REACT MODULES
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Button,
  ScrollView
} from 'react-native';
import {StackNavigator} from 'react-navigation';
import MapView from 'react-native-maps';
import {connect} from 'react-redux'
//MISC MODULES
import TimeFormatter from 'minutes-seconds-milliseconds'
import axios from 'axios'
import geolib from 'geolib'
//CUSTOM MODULES
import styles from '../Styles'
import {addNewRoute} from './storeAndReducer'


class ViewRoute extends Component {
	constructor(props) {
		super(props);

    this.submitRoute = this.submitRoute.bind(this)

	}


    submitRoute(){
        let {convCoords, userId, timesArr, startTime, endTime} = this.props.navigation.state.params
        console.log('this is the info', convCoords, timesArr)
        this.props.addNewRoute(convCoords, userId, timesArr, startTime, endTime)
        const { navigate } = this.props.navigation;
        navigate('OurApp')
      }


  render() {

    let givenprops = this.props.navigation.state.params
    console.log('givenprops is ', givenprops)
    let finalTime = givenprops.timesArr[givenprops.timesArr.length-1]
    let totalDistance = (geolib.getPathLength(givenprops.convCoords) * 0.000621371).toFixed(2)//the .000 whatvs is to convert meters to miles (to fixed is making it go to 2 decimal points)
    console.log('this is the total distance', totalDistance)

    console.log("THIS PROPS IS", this.props.navigation.state.params.completeRouteCoords)
    let routeCoordsArr = this.props.navigation.state.params.completeRouteCoords

    return (
      <View style={styles.container}>
         <View style={{flex: 1, justifyContent: 'flex-start', padding: 3, backgroundColor: 'green', marginBottom: 8}}>
           <ScrollView style={{height: 300}}>
            {
              routeCoordsArr.map((coords, idx) => {
                return (
                  <Text key={idx}>{JSON.stringify(coords)}</Text>
                )
              })
            }
          </ScrollView>
          </View>
        </View>
    )
  }
}

const mapDispatchToProps = {addNewRoute}

function mapStateToProps(state){
  return {
    // currentUser: state.currentUser,
    // currentLocation: state.currentLocation
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ViewRoute)
