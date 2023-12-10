import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera'
import { useIsFocused } from '@react-navigation/native';
import {useAppState} from '@react-native-community/hooks'

const ExternalCameraScreen = () => {

    const { hasCamPermission, requestCamPermission } = useCameraPermission();
    const { hasMicPermission, requestMicPermission } = useMicrophonePermission();

    const devices = Camera.getAvailableCameraDevices()

    const device = useCameraDevice('back')
    const usbCamera = useCameraDevice('external')

    const isFocused = useIsFocused()
    const appState = useAppState()
    const isActive = isFocused && appState === "active"

    useEffect(() => {
        console.log(
            'has cam permission', hasCamPermission,
            'has mic permission', hasMicPermission,
            'usb devices', usbCamera
        )

        devices.map(device => {
            console.log("device", device.name);
            // Alert.alert(device.name)
        })
    }, [])

    if (device == null) return <NoCameraDeviceError />
    return (
        <Camera
            style={{ flex: 1 }}
            device={device}
            isActive={isActive}
        />
    )
}

export default ExternalCameraScreen

const styles = StyleSheet.create({

})