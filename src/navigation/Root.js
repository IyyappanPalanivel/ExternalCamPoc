import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ExternalCameraScreen from '../screens/ExternalCameraScreen';
import MenuScreen from '../screens/MenuScreen';
import { PermissionsPage } from '../screens/PermissionsPage';
import { DevicesPage } from '../screens/DeviceScreen';
import { CameraPage } from '../screens/CameraPage';

const Stack = createNativeStackNavigator();

const Root = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{title: 'Menu'}}
        />
        <Stack.Screen name="ExternalCamera" component={ExternalCameraScreen} />
        <Stack.Screen name="Permissions" component={PermissionsPage} />
        <Stack.Screen name="DevicesPage" component={DevicesPage} />
        <Stack.Screen name="CameraPage" component={CameraPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Root;