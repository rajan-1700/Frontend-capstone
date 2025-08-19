import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  books = [
    { img: 'assets/book1.jpg' },
    { img: 'assets/book2.jpg' },
    { img: 'assets/book3.jpg' },
    { img: 'assets/book4.jpg' },
    { img: 'assets/book5.jpg' }
  ];
}
