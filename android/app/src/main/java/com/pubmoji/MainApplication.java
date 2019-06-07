package com.pubmoji;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.oblador.vectoricons.VectorIconsPackage;
<<<<<<< HEAD
import com.dylanvann.fastimage.FastImageViewPackage;
import com.zmxv.RNSound.RNSoundPackage;
=======
import com.airbnb.android.react.maps.MapsPackage;
>>>>>>> ac4de3b0204dcfac618ffbbc9f9702f4692dd29b
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.airbnb.android.react.maps.MapsPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new VectorIconsPackage(),
<<<<<<< HEAD
            new FastImageViewPackage(),
            new RNSoundPackage(),
=======
>>>>>>> ac4de3b0204dcfac618ffbbc9f9702f4692dd29b
            new MapsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
