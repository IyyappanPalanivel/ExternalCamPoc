import * as React from 'react'
import { useRef, useState, useCallback, useMemo } from 'react'
import { StyleSheet, Text, View,TouchableOpacity } from 'react-native'
import { CameraRuntimeError, PhotoFile, useCameraDevice, useCameraFormat, useFrameProcessor, VideoFile } from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera'
import { CONTENT_SPACING, CONTROL_BUTTON_SIZE, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING, SCREEN_HEIGHT, SCREEN_WIDTH } from '../utils/Constants'
import { useEffect } from 'react'
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated'
import type { Routes } from '../utils/Routes'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useIsFocused } from '@react-navigation/core'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { usePreferredCameraDevice } from '../hooks/usePreferredCameraDevice'
import { useIsForeground } from '../hooks/useIsForeground'


const SCALE_FULL_ZOOM = 3

type Props = NativeStackScreenProps<Routes, 'CameraPage'>
export function CameraPage({ navigation }: Props): React.ReactElement {
    const camera = useRef<Camera>(null)
    const [isCameraInitialized, setIsCameraInitialized] = useState(false)
    const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false)
    const zoom = useSharedValue(0)
    const isPressingButton = useSharedValue(false)

    // check if camera page is active
    const isFocussed = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocussed && isForeground

    const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back')
    const [enableHdr, setEnableHdr] = useState(false)
    const [flash, setFlash] = useState<'off' | 'on'>('off')
    const [enableNightMode, setEnableNightMode] = useState(false)

    // camera device settings
    const [preferredDevice] = usePreferredCameraDevice()
    let device = useCameraDevice(cameraPosition)

    if (preferredDevice != null && preferredDevice.position === cameraPosition) {
        // override default device with the one selected by the user in settings
        device = preferredDevice
    }

    const [targetFps, setTargetFps] = useState(60)

    const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH
    const format = useCameraFormat(device, [
        { fps: targetFps },
        { videoAspectRatio: screenAspectRatio },
        { videoResolution: 'max' },
        { photoAspectRatio: screenAspectRatio },
        { photoResolution: 'max' },
    ])

    const fps = Math.min(format?.maxFps ?? 1, targetFps)

    const supportsFlash = device?.hasFlash ?? false
    const supportsHdr = format?.supportsPhotoHdr
    const supports60Fps = useMemo(() => device?.formats.some((f) => f.maxFps >= 60), [device?.formats])
    const canToggleNightMode = device?.supportsLowLightBoost ?? false

    //#region Animated Zoom
    // This just maps the zoom factor to a percentage value.
    // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
    const minZoom = device?.minZoom ?? 1
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)

    const cameraAnimatedProps = useAnimatedProps(() => {
        const z = Math.max(Math.min(zoom.value, maxZoom), minZoom)
        return {
            zoom: z,
        }
    }, [maxZoom, minZoom, zoom])
    //#endregion

    //#region Callbacks
    const setIsPressingButton = useCallback(
        (_isPressingButton: boolean) => {
            isPressingButton.value = _isPressingButton
        },
        [isPressingButton],
    )
    // Camera callbacks
    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
    }, [])
    const onInitialized = useCallback(() => {
        console.log('Camera initialized!')
        setIsCameraInitialized(true)
    }, [])
    const onMediaCaptured = useCallback(
        (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
            console.log(`Media captured! ${JSON.stringify(media)}`)
            navigation.navigate('MediaPage', {
                path: media.path,
                type: type,
            })
        },
        [navigation],
    )
    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))
    }, [])
    const onFlashPressed = useCallback(() => {
        setFlash((f) => (f === 'off' ? 'on' : 'off'))
    }, [])
    //#endregion

    //#region Tap Gesture
    const onDoubleTap = useCallback(() => {
        onFlipCameraPressed()
    }, [onFlipCameraPressed])
    //#endregion

    //#region Effects
    const neutralZoom = device?.neutralZoom ?? 1
    useEffect(() => {
        // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
        zoom.value = neutralZoom
    }, [neutralZoom, zoom])

    useEffect(() => {
        Camera.getMicrophonePermissionStatus().then((status) => setHasMicrophonePermission(status === 'granted'))
    }, [])
    //#endregion


    useEffect(() => {
        const f =
            format != null
                ? `(${format.photoWidth}x${format.photoHeight} photo / ${format.videoWidth}x${format.videoHeight}@${format.maxFps} video @ ${fps}fps)`
                : undefined
        console.log(`Camera: ${device?.name} | Format: ${f}`)
    }, [device?.name, format, fps])

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'

        console.log(`${frame.timestamp}: ${frame.width}x${frame.height} ${frame.pixelFormat} Frame (${frame.orientation})`)
    }, [])

    const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
    Reanimated.addWhitelistedNativeProps({
        zoom: true,
    })

    return (
        <View style={styles.container}>
            {device != null && (
                <ReanimatedCamera
                    ref={camera}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    format={format}
                    fps={fps}
                    photoHdr={enableHdr}
                    videoHdr={enableHdr}
                    lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                    isActive={isActive}
                    onInitialized={onInitialized}
                    onError={onError}
                    enableZoomGesture={false}
                    animatedProps={cameraAnimatedProps}
                    exposure={0}
                    enableFpsGraph={true}
                    orientation="portrait"
                    photo={true}
                    video={true}
                    audio={hasMicrophonePermission}
                    frameProcessor={frameProcessor}
                />
            )}

            {/* <CaptureButton
                style={styles.captureButton}
                camera={camera}
                onMediaCaptured={onMediaCaptured}
                cameraZoom={zoom}
                minZoom={minZoom}
                maxZoom={maxZoom}
                flash={supportsFlash ? flash : 'off'}
                enabled={isCameraInitialized && isActive}
                setIsPressingButton={setIsPressingButton}
            /> */}

            {/* <StatusBarBlurBackground /> */}

            <View style={styles.rightButtonRow}>
                <TouchableOpacity style={styles.button} onPress={onFlipCameraPressed} disabledOpacity={0.4}>
                    <IonIcon name="camera-reverse" color="white" size={24} />
                </TouchableOpacity>
                {supportsFlash && (
                    <TouchableOpacity style={styles.button} onPress={onFlashPressed} disabledOpacity={0.4}>
                        <IonIcon name={flash === 'on' ? 'flash' : 'flash-off'} color="white" size={24} />
                    </TouchableOpacity>
                )}
                {supports60Fps && (
                    <TouchableOpacity style={styles.button} onPress={() => setTargetFps((t) => (t === 30 ? 60 : 30))}>
                        <Text style={styles.text}>{`${targetFps}\nFPS`}</Text>
                    </TouchableOpacity>
                )}
                {supportsHdr && (
                    <TouchableOpacity style={styles.button} onPress={() => setEnableHdr((h) => !h)}>
                        <MaterialIcon name={enableHdr ? 'hdr' : 'hdr-off'} color="white" size={24} />
                    </TouchableOpacity>
                )}
                {canToggleNightMode && (
                    <TouchableOpacity style={styles.button} onPress={() => setEnableNightMode(!enableNightMode)} disabledOpacity={0.4}>
                        <IonIcon name={enableNightMode ? 'moon' : 'moon-outline'} color="white" size={24} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Devices')}>
                    <IonIcon name="settings-outline" color="white" size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CodeScannerPage')}>
                    <IonIcon name="qr-code-outline" color="white" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    captureButton: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: SAFE_AREA_PADDING.paddingBottom,
    },
    button: {
        marginBottom: CONTENT_SPACING,
        width: CONTROL_BUTTON_SIZE,
        height: CONTROL_BUTTON_SIZE,
        borderRadius: CONTROL_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(140, 140, 140, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightButtonRow: {
        position: 'absolute',
        right: SAFE_AREA_PADDING.paddingRight,
        top: SAFE_AREA_PADDING.paddingTop,
    },
    text: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
})