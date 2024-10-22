package expo.modules.custompassportreader
import expo.modules.custompassportreader.CustomPassportReaderModule

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class CustomPassportReaderPackage : Package {
    override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
        return listOf(CustomPassportReaderModule())
    }
}