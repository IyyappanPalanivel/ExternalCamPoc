import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import {NativeModules} from 'react-native';

const {RNBridgeDemo} = NativeModules;

const RNBridge = () => {

    const onPress = () => {
        //RNBridgeDemo.createCalendarEvent('testName', 'testLocation');
        RNBridgeDemo.navigateToNativeScreen();
    };
      
  return (
    <View style={styles.container} >
      <Text>RNBridge</Text>

      <TouchableOpacity style={styles.menuItemContainer}
        onPress={() => onPress()}
      >
        <Text style={{ color: 'white', marginLeft: 20, fontSize: 17 }}>RNBridge Demo Button</Text>
      </TouchableOpacity>
    </View>
  )
}

export default RNBridge

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      padding: 20,
    },
    splashText: {
      color: 'white',
      fontSize: 40,
      marginTop: 20,
  
    },
    splashLogo: {
      width: '95%',
      height: 500,
    },
    menuItemContainer: {
      flexDirection: 'row',
      marginTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'green',
      paddingBottom: 20,
    },
    item: {
      backgroundColor: '#f9c2ff',
      padding: 10,
      marginVertical: 8,
    },
    title: {
      fontSize: 12,
    },
  });