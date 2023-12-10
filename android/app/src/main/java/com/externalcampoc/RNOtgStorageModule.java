package com.externalcampoc;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

public class RNOtgStorageModule extends ReactContextBaseJavaModule {

    private String TAG = "Ishaan";
    private boolean DEBUG = true;
    private UsbManager mUsbManager;
    private List<UsbDevice> mDetectedDevices;
    private PendingIntent mPermissionIntent;

    // private UsbMassStorageDevice mUsbMSDevice;
    private static final String ACTION_USB_PERMISSION = "com.scizers.hello.mytest.USB_PERMISSION";

    private final ReactApplicationContext reactContext;

    public RNOtgStorageModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        IntentFilter filter = new IntentFilter();
        filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
        filter.addAction(ACTION_USB_PERMISSION);
        this.reactContext.registerReceiver(mUsbReceiver, filter);


        mPermissionIntent = PendingIntent.getBroadcast(this.reactContext, 0, new Intent(ACTION_USB_PERMISSION), 0);
        mUsbManager = (UsbManager) this.reactContext.getSystemService(Context.USB_SERVICE);
        mDetectedDevices = new ArrayList<UsbDevice>();

    }

    @NonNull
    @Override
    public String getName() {
        return "RNOtgStorage";
    }

    BroadcastReceiver mUsbReceiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            checkUSBStatus();

            if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(action)) {
               // removedUSB();
            }

            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (this) {

                    UsbDevice device = (UsbDevice) intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);

                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        if (device != null) {
                            // openDevice(device);
                        }
                    } else {
                        Log.e(TAG, "permission denied for device " + device);
                    }
                }
            }

        }
    };

    private void removedUSB() {
        OTGDisconnected();
    }

    public void OTGDisconnected() {
        this.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onOTGDisconnected", "");
    }

    private void logger(String s) {
        this.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("logger", s);
    }

    public void checkUSBStatus() {

        if (DEBUG)
            logger("checkUSBStatus");

        try {
            mDetectedDevices.clear();
            mUsbManager = (UsbManager) this.reactContext.getSystemService(Context.USB_SERVICE);

            if (mUsbManager != null) {
                HashMap<String, UsbDevice> deviceList = mUsbManager.getDeviceList();

                if (!deviceList.isEmpty()) {
                    Iterator<UsbDevice> deviceIterator = deviceList.values().iterator();
                    while (deviceIterator.hasNext()) {
                        UsbDevice device = deviceIterator.next();
                        mDetectedDevices.add(device);
                    }
                }

                if (mDetectedDevices.size() > 0) {
                    String deviceName;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        deviceName = (mDetectedDevices.get(0).getProductName());
                    } else {
                        deviceName = (mDetectedDevices.get(0).getDeviceName());
                    }

                    this.reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("newDeviceConnected", deviceName);
                }

                // Connect device
                if (mDetectedDevices.size() > 0) {
                    String deviceName;
                    String serialNumber;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        deviceName = (mDetectedDevices.get(0).getProductName());
                        serialNumber = (mDetectedDevices.get(0).getSerialNumber());
                    } else {
                        deviceName = (mDetectedDevices.get(0).getDeviceName());
                        serialNumber = (mDetectedDevices.get(0).getSerialNumber());
                    }

                    WritableMap map = Arguments.createMap();
                    map.putString("type", "success");
                    map.putString("deviceName", deviceName);
                    map.putString("serialNumber", serialNumber);
                    mUsbManager.requestPermission(mDetectedDevices.get(0), mPermissionIntent);
                }
            }
        } catch (Exception e) {
            this.reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("logger", e.toString());
        }

    }

    @ReactMethod
    private void connectDevice(Promise p) {
        if (mDetectedDevices.size() > 0) {
            String deviceName;
            String serialNumber;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                deviceName = (mDetectedDevices.get(0).getProductName());
                serialNumber = (mDetectedDevices.get(0).getSerialNumber());
            } else {
                deviceName = (mDetectedDevices.get(0).getDeviceName());
                serialNumber = (mDetectedDevices.get(0).getSerialNumber());
            }

            WritableMap map = Arguments.createMap();
            map.putString("type", "success");
            map.putString("deviceName", deviceName);
            map.putString("serialNumber", serialNumber);
//            UsbMassStorageDevice[] devices = UsbMassStorageDevice.getMassStorageDevices(this.reactContext);
            mUsbManager.requestPermission(mDetectedDevices.get(0), mPermissionIntent);
            p.resolve(map);
        } else {

            WritableMap map = Arguments.createMap();
            map.putString("type", "error");
            map.putString("message", "No Device Found");
            p.resolve(map);

        }
    }
}
