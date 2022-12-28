import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHBsHN2_deJxSF3IFiaixY7Qii1sLH-t0",
  authDomain: "l6-algoritms.firebaseapp.com",
  projectId: "l6-algoritms",
  storageBucket: "l6-algoritms.appspot.com",
  messagingSenderId: "173058638424",
  appId: "1:173058638424:web:df580a368d968b2934c02d"
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
