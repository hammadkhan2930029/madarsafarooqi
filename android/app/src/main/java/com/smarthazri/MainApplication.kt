package com.smarthazri

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    // The app handles English/Urdu direction declaratively in JavaScript.
    // Reset legacy persisted forceRTL before React creates its root view so
    // English is never mirrored and Urdu is not reversed twice.
    I18nUtil.instance.allowRTL(this, false)
    I18nUtil.instance.forceRTL(this, false)
    I18nUtil.instance.swapLeftAndRightInRTL(this, false)
    loadReactNative(this)
  }
}
