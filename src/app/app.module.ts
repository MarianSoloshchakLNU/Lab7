import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRwl7_IPUNmArioo9Wtq0Zr1_lKr_ywEo",
  authDomain: "lab7-b1f5c.firebaseapp.com",
  projectId: "lab7-b1f5c",
  storageBucket: "lab7-b1f5c.appspot.com",
  messagingSenderId: "92037564013",
  appId: "1:92037564013:web:48d0fb880ad83265246164"
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
