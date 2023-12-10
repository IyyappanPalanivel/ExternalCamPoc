import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera'

const MenuScreen = ({ navigation }) => {

  const devices = Camera.getAvailableCameraDevices();

  const [cameraPermission, setCameraPermission] = useState();
  const [microphonePermission, setMicrophonePermission] = useState();


  useEffect(() => {
    Camera.getCameraPermissionStatus().then(setCameraPermission);
    Camera.getMicrophonePermissionStatus().then(setMicrophonePermission);
  }, []);

  console.log(`Re-rendering Navigator. Camera: ${cameraPermission} | Microphone: ${microphonePermission}`);

  if (cameraPermission == null || microphonePermission == null) {
    // still loading
    return null;
  }

  const showPermissionsPage = cameraPermission !== 'granted' || microphonePermission === 'not-determined';

  const listener = Camera.addCameraDevicesChangedListener((devices) => {
    console.log(`Devices changed: ${devices}`)
    Alert.alert(devices);
    // this.usbCamera = devices.find((d) => d.position === "external")
  })
  // ...
  listener.remove()

  const Item = ({title}) => (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text>Available Cameras</Text>

      <FlatList
        data={devices}
        renderItem={({ item }) => <Item title={item.name} />}
        keyExtractor={item => item.id}
      />

      <TouchableOpacity style={styles.menuItemContainer}
        onPress={() => navigation.navigate('ExternalCamera')}
      >
        <Text style={{ color: 'white', marginLeft: 20, fontSize: 17 }}>External Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItemContainer}
        onPress={() => navigation.navigate('Permissions')}
      >
        <Text style={{ color: 'white', marginLeft: 20, fontSize: 17 }}>Permissions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItemContainer}
        onPress={() => navigation.navigate('DevicesPage')}
      >
        <Text style={{ color: 'white', marginLeft: 20, fontSize: 17 }}>DevicesPage</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItemContainer}
        onPress={() => navigation.navigate('CameraPage')}
      >
        <Text style={{ color: 'white', marginLeft: 20, fontSize: 17 }}>CameraPage</Text>
      </TouchableOpacity>

    </SafeAreaView>
  )
}

export default MenuScreen

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