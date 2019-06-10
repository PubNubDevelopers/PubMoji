package com.pubmoji;

import android.app.Application;

import com.facebook.react.ReactApplication;
<<<<<<< HEAD
<<<<<<< HEAD
import com.zmxv.RNSound.RNSoundPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
=======
import com.oblador.vectoricons.VectorIconsPackage;
<<<<<<< HEAD
=======
import com.oblador.vectoricons.VectorIconsPackage;
>>>>>>> 91d21e74758dfd133cd3da9df17fe7fbb33d62d9
import com.dylanvann.fastimage.FastImageViewPackage;
import com.zmxv.RNSound.RNSoundPackage;
=======
import com.airbnb.android.react.maps.MapsPackage;
>>>>>>> ac4de3b0204dcfac618ffbbc9f9702f4692dd29b
>>>>>>> 58a218ebf76f3caf26fdb6e40b7dc54057507075
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

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
<<<<<<< HEAD
<<<<<<< HEAD
            new RNSoundPackage(),
            new VectorIconsPackage(),
            new MapsPackage(),
            new FastImageViewPackage()
=======
            new VectorIconsPackage(),
<<<<<<< HEAD
=======
            new VectorIconsPackage(),
>>>>>>> 91d21e74758dfd133cd3da9df17fe7fbb33d62d9
            new FastImageViewPackage(),
            new RNSoundPackage(),
=======
>>>>>>> ac4de3b0204dcfac618ffbbc9f9702f4692dd29b
            new MapsPackage()
>>>>>>> 58a218ebf76f3caf26fdb6e40b7dc54057507075
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
