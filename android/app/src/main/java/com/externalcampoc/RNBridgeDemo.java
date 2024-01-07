package com.externalcampoc;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RNBridgeDemo extends ReactContextBaseJavaModule {
    @NonNull
    @Override
    public String getName() {
        return "RNBridgeDemo";
    }

    public RNBridgeDemo(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void createCalendarEvent(String name, String location) {
        Log.d("CalendarModule", "Create event called with name: " + name
                + " and location: " + location);
    }

    @ReactMethod
    public void navigateToNativeScreen() {
        Activity currentActivity = getCurrentActivity();

        Intent i = new Intent(currentActivity,ExternalCameraOptionsActivity.class);
        currentActivity.startActivity(i);
    }
}
