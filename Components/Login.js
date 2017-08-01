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
  Linking,
  KeyboardAvoidingView,
} from 'react-native';
import {StackNavigator} from 'react-navigation';
import {connect} from 'react-redux'
import BackgroundGeolocation from "react-native-background-geolocation";
//CUSTOM MODULES
import styles from '../Styles';

import {fetchUser, fetchSession} from './storeAndReducer';
import {redish, blueish, beige, yellowish} from './Constants'




class Login extends Component {
  constructor(props){
    super(props)
    this.state={email:'',password:''}
    this.login=this.login.bind(this);
    this.changeTextHandlerEmail = this.changeTextHandlerEmail.bind(this)
    this.changeTextHandlerPw = this.changeTextHandlerPw.bind(this)

  }

  changeTextHandlerEmail(email){//you can also do onChangeText={(email) => this.setState({email})}   down there at the textinput thing.. just for future reference
    this.setState({email})
  }

  changeTextHandlerPw(password){//you can also do onChangeText={(password) => this.setState({password})}   down there at the textinput thing.. just for future reference
    this.setState({password})
  }

  onLocation(){
    //do nothing... we just want a listener so the thing woulD STOP FUCKING TELLING US IT'S SENDING LOCAITON WITH NO LISTENERS!!!
  }

  componentWillMount(){
    console.disableYellowBox = true;
    BackgroundGeolocation.configure({
      // Geolocation Config
      desiredAccuracy: 0,
      stationaryRadius: 25,
      distanceFilter: 10,
      // Activity Recognition
      stopTimeout: 1,
      // Application config
      debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: true,   // <-- Allow the background-service to continue tracking when user closes the app. //KEEP THIS ON TRUE... DO NOT FORGET ABOUT THIS
      startOnBoot: true,        // <-- Auto start tracking when device is powered-up. //WE MAY NEED TO HAVE THIS TURNED OFF UNTIL THIS RUN COMPONENT MOUNTS (otherwise a lot of events emitted with no listeners, causing some yellow warnings)
      // HTTP / SQLite config
      url: 'http://yourserver.com/locations',
      batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
      headers: {              // <-- Optional HTTP headers
        "X-FOO": "bar"
      },
      params: {               // <-- Optional HTTP params
        "auth_token": "maybe_your_server_authenticates_via_token_YES?"
      }
    }, function(state) {
      console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);

      if (!state.enabled) {
        BackgroundGeolocation.start(function() {
          console.log("- Start success");
        });
      }

    });

    BackgroundGeolocation.on('location', this.onLocation)
  }


  componentWillUnmount(){
    BackgroundGeolocation.un('location', this.onLocation)
  }

  componentDidMount(){
    const { navigate } = this.props.navigation;
    this.props.fetchSession()
    .then(user => {
      if (user){
        navigate('OurApp')
      }
    })
  }

  login(){
    const { navigate } = this.props.navigation;
    // this.state={email: 'Charles@charles.com', password: '1234'}//COMMENT THIS WHEN WE ARE READY TO DO OUR PRESENTATION
    this.props.fetchUser(this.state)
      .then(fetchUserRes=>{
        if(fetchUserRes==='userSetAllGravy') navigate('OurApp');
      })
      .catch(console.error)

    // navigate('OurApp');//Uncomment if you want to test on iphone (but server is not deployed)
  }




  render(){

    return (
      <View style={styles.containerLogin}>

        <View style={styles.loginTopSpacer}>
          <Image source={require('../assets/runningred.gif')} />
            <Text style={styles.loginTitlePhantom}>PHANTOM</Text>
          <Text style={styles.loginTitleRacer}>Racer</Text>
        </View>
        <View style={styles.loginCenterer}>

          <View style={styles.loginTopSpacer2}>
          </View>

            <View style={styles.loginTopSpacer3}>

              <Text style={styles.loginInputLabel}>Email:</Text>
              <TextInput style={styles.input} onChangeText={this.changeTextHandlerEmail} />
              <Text style={styles.loginInputLabel}>Password:</Text>
              <TextInput secureTextEntry={true} style={styles.input} onChangeText={this.changeTextHandlerPw} />

              <Text onPress={this.login} style={styles.loginBtnText}>Login</Text>
              <View style={styles.loginBtnView}></View>
            </View>


        </View>

      </View>
    )
  }
}


const mapDispatchToProps = {fetchUser, fetchSession}

const mapStateToProps = null;

var ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login);

export default ConnectedLogin;
