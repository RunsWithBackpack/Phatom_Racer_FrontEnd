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
} from 'react-native';
import {StackNavigator} from 'react-navigation';
import MapView from 'react-native-maps';
import {connect} from 'react-redux'
import BackgroundGeolocation from "react-native-background-geolocation";
//MISC MODULES
import TimeFormatter from 'minutes-seconds-milliseconds'
import axios from 'axios'

//CUSTOM MODULES
import styles from '../Styles'
import {addNewRoute, fetchFitBitHeartrateInfo} from './storeAndReducer'
import {promisifiedGetCurrPos} from './Utils'
import {accessKey, snapToRoad} from '../config'
import {Btn, BtnHolder, BtnMakeRoute} from './Wrappers'
import {redish, blueish, beige, yellowish, orangeish, lightGrey} from './Constants'



class MakeRoute extends Component {
  constructor(props) {
   super(props);
   this.state = {
     currentPosition: {latitude: 0, longitude: 0} , //THIS WILL BE TAKEN FROM THE STORE TO RENDER INITIAL RUNNER STATE
     isRunning: false,
     timer: 0,
     timerStart: 0,
     timerEnd: 0,
     personalCoords: [],
     personalTimeMarker: [],
     checkpointTimeMarker: [],

     snappedTesting: false,
     snappedPosCoords: [],//PURELY for testing (and maybe presentation?) purposes...
     unsnappedPosCoords: [],//PURELY for testing (and maybe presentation?) purposes...

   }
    this.startStopButton = this.startStopButton.bind(this)
    this.viewRoute = this.viewRoute.bind(this)
    this.onLocation = this.onLocation.bind(this)
    // this.snapOption = this.snapOption.bind(this)
  }

  componentWillMount() {
      promisifiedGetCurrPos()//BackgroundGeolocation is still far superior to navigator.geolocation.getCurrentPosition, but the latter is still good to use for getting position at a specified time
        .then((position) => {
          // console.log('here')
          let lng = position.coords.longitude
          let lat = position.coords.latitude
          let newPosition = {latitude: lat, longitude: lng}
          return this.setState({//not actually sure if this will actually wait for setState to complete before adding the BackgroundGeolocation onlocation listener.. we can put in the setState callback function later, if this causes problems
            currentPosition: newPosition
          })
        })
        .then(()=>{
          // console.log('attaching geolocation listener')
          BackgroundGeolocation.on('location', this.onLocation)
        })
    }

  componentWillUnmount(){
    clearInterval(this.timerInterval)
    BackgroundGeolocation.un('location', this.onLocation)//needed to remove listener
    this.setState({//this is need to set things to default.
      currentPosition: {latitude: 0, longitude: 0} ,
      isRunning: false,
      timer: 0,
      timerStart: 0,
      timerEnd: 0,
      personalCoords: [],
      personalTimeMarker: [0]
    })
  }

  // snapOption(snapProm, rawPositionProm, bool){
  //   this.setState({snappedTesting: bool})
  //   if(bool) return snapProm
  //   else return rawPositionProm
  // }

  startStopButton(){
     if(this.state.isRunning){
        let heartRateInfo;
        clearInterval(this.timerInterval)
       this.setState({
         isRunning: false,
          timerEnd: Date.now(),
          heartRateInfo: heartRateInfo

       })
       return;
     } else {
        this.timerInterval = setInterval (()=> {
          this.setState({timer: Date.now() - this.state.timerStart})
        }, 50)
        let lat = this.state.currentPosition.latitude
        let lng = this.state.currentPosition.longitude
        let firstRouteCoord = [{latitude: lat, longitude: lng}]
         this.setState({
         isRunning: true,
         timerStart: Date.now(),
         personalCoords: firstRouteCoord,
         personalTimeMarker: [0],
         checkpointTimeMarker: [0]
       })
    }
  }

  onLocation(locInp){
    // console.log('onLoc listeners invoked (make sure this is NOT being run when outside components like makeroute and runaroute that need to watch location!)')
    let lng = locInp.coords.longitude
    let lat = locInp.coords.latitude
    let rawPosition= {latitude: lat, longitude: lng}
    let rawPositionProm=Promise.resolve(rawPosition)
    // console.log('raw is ',rawPosition)

    //FOR TESTING (and maybe presentation)?
    let unsnappedPosCoords = this.state.unsnappedPosCoords.slice(0)
    unsnappedPosCoords.push(rawPosition)
    this.setState({unsnappedPosCoords})

    let snapProm= axios.get(`https://roads.googleapis.com/v1/snapToRoads?path=${lat},%20${lng}&key=AIzaSyAxTRVcG76wG9oMYdRVNPCIcfXKBlljBVc`)
       .then(res => {
          // console.log('in snappedLoc block')
          let snappedLoc= res.data.snappedPoints[0].location
          let snappedPosition = {latitude: snappedLoc.latitude, longitude: snappedLoc.longitude }

          let snappedPosCoords = this.state.snappedPosCoords.slice(0)
          snappedPosCoords.push(snappedPosition)
          this.setState({snappedPosCoords})

          return snappedPosition
        })
       .catch(err => {
        //  if(err.message.includes('code 429')){return rawPosition}//if googleapis returns a code 429 error (meaning we've reached our daily limit for requests), just return the rawposition
        //  else {throw err.message}
         return rawPosition
       })

    //if set to true, then make axios request to googlemaps snap to roads API, and return either the snapped coordinates (or rawcoordinates if daily quota reached)
    //if set to false, just immediately return the rawPosition
    // this.snapOption(snapProm, rawPositionProm, true)//get this working later

    this.setState({snappedTesting: true}); snapProm
    // rawPositionProm
       .then(position=>{
        //  console.log('resolved position is ',position)
          this.setState({ currentPosition: position })
          // console.log('should not be running ',this.state.isRunning)
          if(this.state.isRunning){
              let elapsedTime= Date.now() - this.state.timerStart
              this.setState({
                timer: elapsedTime
            })

            let newrouteCoords = this.state.personalCoords.slice(0)
            let newtimeMarker = this.state.personalTimeMarker
            let newcheckpointTimeMarker = this.state.checkpointTimeMarker

            if (newrouteCoords.length % 10 === 0){
                newcheckpointTimeMarker.push(elapsedTime)
            }

            newrouteCoords.push(position)
            newtimeMarker.push(elapsedTime)

            this.setState({
              personalCoords: newrouteCoords,
              personalTimeMarker: newtimeMarker,
              checkpointTimeMarker: newcheckpointTimeMarker
            })
          }
       })
      .catch(err=>console.error(err))
  }

  viewRoute(){
      let personalCoords = this.state.personalCoords;
      let userId = this.props.user.id;
      let personalTimeMarker = this.state.personalTimeMarker
      let startTime = this.state.timerStart
      let endTime = this.state.timerEnd
      let currentPosition = this.state.currentPosition
      let checkpointTimeMarker = this.state.checkpointTimeMarker
      let heartRateInfo = this.state.heartRateInfo

      const { navigate } = this.props.navigation;
      navigate('ViewRoute', {personalCoords, userId, personalTimeMarker, startTime, endTime, currentPosition, checkpointTimeMarker, heartRateInfo})

  }


  render() {

    const position = this.state.currentPosition;
    const routerDisplayCoords = this.state.personalCoords.slice(0)

    const unsnappedPosCoords = this.state.unsnappedPosCoords
    const snappedPosCoords = this.state.snappedPosCoords

    // console.log('this is the info ', this.state.isRunning, this.state.timerEnd)
    return (
      <View>
       <View style={styles.mapcontainerNoNav}>
         <BtnHolder>
        {!this.state.isRunning && this.state.timerEnd !== 0 ?
              <BtnMakeRoute>
                    {/* <TouchableOpacity onPress={this.viewRoute}> */}
                      <Text onPress={this.viewRoute}>View Run</Text>
                    {/* </TouchableOpacity> */}
                </BtnMakeRoute> :
                <BtnMakeRoute>
                  {/* <TouchableOpacity onPress={this.startStopButton}> */}
                    <Text onPress={this.startStopButton}>{this.state.isRunning ? 'Stop' : 'Start'}</Text>
                  {/* </TouchableOpacity> */}
               </BtnMakeRoute> }

             <BtnMakeRoute>
               <Text>{TimeFormatter(this.state.timer)}</Text>

               {/* <Text>{this.state.currentPosition.latitude}</Text>
               <Text>{this.state.currentPosition.longitude}</Text> */}

             </BtnMakeRoute>
          </BtnHolder>
           <MapView
             region={{latitude: position.latitude, longitude: position.longitude, latitudeDelta: .0005, longitudeDelta: .0005}}
         style={styles.map}>

       {/* {routerDisplayCoords.map((coord, idx) =>{
       //   let coord1=coord;
       //   // let coord2={latitude:coord.latitude, longitude:coord.longitude+.001}
       //   // let coord3={latitude:coord.latitude+.001, longitude:coord.longitude}
       //  //  let stringified = JSON.stringify(coord1)
       //  //  let easy2readCoords = stringified.slice()
       //  //  return(<MapView.Polygon coordinates={[coord1,coord2,coord3]} strokewidth={5}/>)
       //   return(<MapView.Marker coordinate={coord1} title={JSON.stringify(coord1)} key={''+idx}/>)
       // })}

       {/* <MapView.Marker
         coordinate={{latitude: routeObj.convCoords[routeObj.convCoords.length-1].latitude, longitude: routeObj.convCoords[routeObj.convCoords.length-1].longitude}}
         pinColor='blue'
         title='End'
         identifier={routeID}
         onSelect={goToRaceView}
       /> */}

       {/* { unsnappedPosCoords.map((coord,idx)=>{
        //  console.log('marker at ',coord,' idx at ', idx)
         return(<MapView.Marker coordinate={coord} title={JSON.stringify(coord)} key={''+idx}/>)
       })} */}

      {this.state.snappedTesting && this.state.isRunning ?
        //BELOW IS FOR *BOTH* SNAPPED AND UNSNAPPED (snapped is green polyline.. unsnapped are markers) .. note if google maps api not working there will only be unsnapped positions)
        <View>

            <MapView.Polyline coordinates={snappedPosCoords} strokeColor='green' strokeWidth= {10} />

            {/* for some reason... the unsnappedPosCoords thing at the bottom won't work here in this view,
            but it will work outside (see above the snapped testing and is running code block) */}

            {/* { unsnappedPosCoords.map((coord,idx)=>{
              // console.log('marker at ',coord,' idx at ', idx)
              return(<MapView.Marker coordinate={coord} title={JSON.stringify(coord)} key={''+idx}/>)
            })} */}

        </View> :
        //BELOW IS FOR ONLY UNSNAPPED POSITIONS
        <MapView.Polyline coordinates={routerDisplayCoords} strokeColor={redish} strokeWidth= {10} />
      }

      </MapView>
       </View>

      </View>
    )
  }
}



const mapDispatchToProps = null


function mapStateToProps(state){
  return {
    user: state.user,
    fitbitAccessToken: state.fitbitAccessToken
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MakeRoute)
