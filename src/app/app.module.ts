import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpConfigInterceptor} from './core/interceptors/httpInterceptor';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {AgmCoreModule} from '@agm/core';
import {environment} from 'src/environments/environment';
import {SharedModule} from './shared/shared.module';
import {CurrencyPipe} from '@angular/common';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';
import * as Sentry from '@sentry/angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GOOGLE_MAPS_API_KEY
    }),
    SharedModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GooglePlus,
    InAppBrowser,
    ScreenOrientation,
    {
      provide: RouteReuseStrategy, useClass: IonicRouteStrategy
    },
    {
      provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true
    },
    {
      provide: ErrorHandler, useValue: Sentry.createErrorHandler({
        showDialog: false,
      })
    },
    CurrencyPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
