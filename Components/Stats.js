//REACT MODULES
import React, { Component } from 'react';
import store from './storeAndReducer'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Button,
  ScrollView,
  Linking,
} from 'react-native';
import {StackNavigator} from 'react-navigation';
import {connect} from 'react-redux'
//CUSTOM MODULES
import styles from '../Styles'
import {fetchUserStats, fetchFitBitHeartrateInfo, insertHeartRateInfo, setFitBitToken, logout} from './storeAndReducer'
import config from '../config'
import qs from 'qs'

import TimeFormatter from 'minutes-seconds-milliseconds'
import  {Btn, BigBtn, BtnHolder, BtnHolderLow, BtnTwo} from './Wrappers'
import {redish, blueish, beige, yellowish, orangeish, lightGrey} from './Constants'


function OAuth(client_id, cb) {

 // Listen to redirection
Linking.addEventListener('url', handleUrl);
function handleUrl(event){
  // console.log(event.url);
  Linking.removeEventListener('url', handleUrl);
  const [, query_string] = event.url.match(/\#(.*)/);
  // console.log(query_string);

  const query = qs.parse(query_string);
  // console.log(`query: ${JSON.stringify(query)}`);

  store.dispatch(setFitBitToken(query.access_token))
  cb(query.access_token);
}

 // Call OAuth
const oauthurl = 'https://www.fitbit.com/oauth2/authorize?'+
          qs.stringify({
            client_id,
            response_type: 'token',
            scope: 'heartrate activity activity profile sleep',
            redirect_uri: 'runningapp://oauth',
            expires_in: '31536000',
            //state,
          });
// console.log(oauthurl);
Linking.openURL(oauthurl).catch(err => console.error('Error processing linking', err));
}

//getting heartrate data for the day... no need to actually have this besides seeing what data we have to work with for the day
function getData(access_token) {
fetch(
   'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    //body: `root=auto&path=${Math.random()}`
  })
  .then((res) => {
    return res.json()
  })
  .then((res) => {
  console.log(`res: ${JSON.stringify(res)}`);
  })
  .catch((err) => {
  console.error('Error: ', err);
  })
}

class Stats extends Component {
  constructor(props) {
    super(props);

    this.viewRoute = this.viewRoute.bind(this)
    this.connectToFitBit = this.connectToFitBit.bind(this)
    this.logout = this.logout.bind(this)
  }

   viewRoute(event){
        let {personalCoords, personalTimeMarker, startTime, endTime, phantomRacerRoutetimeId, routetimeId, heartrateInfo} = event //the touchable opacity is bound to the route.id to use that as an identifier... it comes out as event
        phantomRacerRoutetimeId = 35 //TAKE THIS OUT AFTER PRESENTATION!!!! **************
        let userId = this.props.user.id
        let oldRoute = true
        // let heartRateInfo;
        // console.log('this props ', this.props, heartrateInfo)
        if (this.props.fitbitAccessToken && !heartrateInfo){
          console.log('about to fetch')
        return this.props.fetchFitBitHeartrateInfo(startTime, endTime, routetimeId)
        .then((heartRateInfoReceived) => {
          // console.log('and we got this info ', heartRateInfoReceived)
          if (typeof(heartRateInfoReceived) === 'string'){
            alert('Your heartrate data is not available yet')
          }
          else { heartrateInfo = heartRateInfoReceived
          this.props.insertHeartRateInfo(routetimeId, heartrateInfo)
          }
          const { navigate } = this.props.navigation
          navigate('ViewRoute', {personalCoords, personalTimeMarker, userId, startTime, endTime, oldRoute, phantomRacerRoutetimeId, heartrateInfo})
        })
        .catch(err => {
          console.log(err)
        })
        } else {
        const { navigate } = this.props.navigation;
        navigate('ViewRoute', {personalCoords, personalTimeMarker, userId, startTime, endTime, oldRoute, phantomRacerRoutetimeId, heartrateInfo})
      }
    }


  connectToFitBit(){
    OAuth(config.client_id, getData);
  }

  componentWillMount() {

    let userId = this.props.user.id
    // console.log('this is front end fetch stats', userId)
    this.props.fetchUserStats(userId)

  }

  logout () {
    this.props.logout()
    const { navigate } = this.props.navigation;
    navigate('Login')
  }

  render() {
    console.log('user info', this.props.fitbitAccessToken)
    let userStats = this.props.userStats
    //{{borderWidth: 3, borderColor: 'red'}}
    //textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3,
    return (
      <View style={styles.container2}>
        <Image source={require('../assets/chicagoSkylineSmaller.jpg')}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsUsername}>{userStats.username}</Text>
          <Text style={styles.statsUserLocation}>{userStats.city}</Text>
        </View>
      </Image>

        <View style={styles.statsStatsHeadingWrapper}>
          <View style={styles.statsStatsHeadingBox}>
            <Text style={styles.scrollListHeader}>Route ID</Text>
            <Text style={styles.scrollListHeader}>Distance (mi)</Text>
            <Text style={styles.scrollListHeader}>Time(s)</Text>
          </View>


        <ScrollView>
        {userStats.routes && userStats.routes.map(route => {
          let rowStyle = route.id % 2 === 0 ? styles.scrollListRowEven : styles.scrollListRowOdd
          return (<View key={route.id} style={rowStyle} key={route.id}>
                      <Text style={styles.scrollListItem}> {route.id} </Text>
                      <Text style={styles.scrollListItem}>{route.totalDist}</Text>
                      {route.routetimes.map(routetime => {
                        let id = {routetimeId: routetime.id, personalCoords: routetime.personalCoords, personalTimeMarker: routetime.personalTimeMarker, startTime: routetime.startTime, endTime: routetime.endTime, phantomRacerRoutetimeId: routetime.RacerTimeId, heartrateInfo: routetime.heartrateInfo}
                        return (
                          <TouchableOpacity
                          style={styles.scrollListItem}
                          onPress={this.viewRoute.bind(this, id)}
                          key={routetime.id}>
                              <Text style={styles.statsTime}>
                                 {TimeFormatter(routetime.runtime)}
                              </Text>
                          </TouchableOpacity>)
                      })}
                  </View>)
        }) }
        </ScrollView>

        <BtnHolderLow>
        {!this.props.fitbitAccessToken ?

        <BtnTwo>
          <Text onPress={this.connectToFitBit}>Connect to Fitbit</Text>
        </BtnTwo> : null }

          <BtnTwo>
            <Text onPress={this.logout}>Logout</Text>
          </BtnTwo>
        </BtnHolderLow>


         </View>
      </View>
    )
  }
}

const mapDispatchToProps = {fetchUserStats, fetchFitBitHeartrateInfo, insertHeartRateInfo, setFitBitToken, logout}

function mapStateToProps(state){
  return {
    user: state.user,
    userStats: state.userStats,
    fitbitAccessToken: state.fitbitAccessToken
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Stats)
