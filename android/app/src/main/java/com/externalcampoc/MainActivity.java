package com.externalcampoc;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

public class MainActivity extends ReactActivity {

  private String TAG = "Vijay";
  private UsbManager mUsbManager;
  private List<UsbDevice> mDetectedDevices;
  private PendingIntent mPermissionIntent;

  // private UsbMassStorageDevice mUsbMSDevice;
  // private static final String ACTION_USB_PERMISSION = "android.hardware.usb.action.USB_DEVICE_ATTACHED";
  private static final String ACTION_USB_PERMISSION = "com.externalcampoc.USB_PERMISSION";

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    IntentFilter filter = new IntentFilter();
    filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
    filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
    filter.addAction(ACTION_USB_PERMISSION);
    this.registerReceiver(mUsbReceiver, filter);


    mPermissionIntent = PendingIntent.getBroadcast(
            this, 0
            , new Intent(ACTION_USB_PERMISSION)
            , PendingIntent.FLAG_IMMUTABLE);
    mUsbManager = (UsbManager) this.getSystemService(Context.USB_SERVICE);
    mDetectedDevices = new ArrayList<UsbDevice>();
  }

  BroadcastReceiver mUsbReceiver = new BroadcastReceiver() {
    public void onReceive(Context context, Intent intent) {
      Log.d(TAG, "onReceive: "+intent.getAction());
      String action = intent.getAction();
      checkUSBStatus();

      if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(action)) {
        // removedUSB();
      }

      if ("android.hardware.usb.action.USB_DEVICE_ATTACHED".equals(action)) {
        synchronized (this) {

          UsbDevice device = (UsbDevice) intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);

          if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
            Log.d(TAG, "permission action: granted");
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

  public void checkUSBStatus() {
    try {
      mDetectedDevices.clear();
      mUsbManager = (UsbManager) this.getSystemService(Context.USB_SERVICE);

      if (mUsbManager != null) {
        HashMap<String, UsbDevice> deviceList = mUsbManager.getDeviceList();

        if (!deviceList.isEmpty()) {
          Iterator<UsbDevice> deviceIterator = deviceList.values().iterator();
          while (deviceIterator.hasNext()) {
            UsbDevice device = deviceIterator.next();
            mDetectedDevices.add(device);
          }
        }

        // Connect device
        if (mDetectedDevices.size() > 0) {
          mUsbManager.requestPermission(mDetectedDevices.get(0), mPermissionIntent);
        }
      }
    } catch (Exception e) {
      Log.d(TAG, "checkUSBStatus: "+e.toString());
    }

  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "ExternalCamPoc";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
        );
  }
}
