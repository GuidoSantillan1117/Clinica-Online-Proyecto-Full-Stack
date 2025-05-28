import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router ,RouterModule} from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule,FormsModule,RouterModule],
  standalone:true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  mail:string;
  password:string;
  constructor() {
    this.mail = "";
    this.password ="";


  }
}
