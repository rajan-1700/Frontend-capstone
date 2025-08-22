import { Component, OnInit } from '@angular/core';
import { FavouriteService, FavouriteBook } from '../../favourites.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favourites.html',
  styleUrls: ['./favourites.css']
})
export class FavouriteComponent implements OnInit {
  favourites: FavouriteBook[] = [];
  isLoading = false;

  constructor(private favService: FavouriteService) {}

  ngOnInit(): void {
    //this.loadFavourites();
  }


  loadFavourites() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    const payload = this.parseJwt(token);
    const userEmail = payload?.email; // depending on your token structure
    if (!userEmail) {
      console.error('User email not found in token');
      return;
    }

    this.isLoading = true;
    this.favourites = [];
    console.log('Fetching favourites for email:', userEmail); // 🔹 debug
    this.favService.getFavouritesByUser(userEmail).subscribe({
      next: (res: FavouriteBook[]) => {
        console.log('Fetched favourites:', res);
        this.favourites = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(`Error loading favourites for user ${userEmail}:`, err);
        this.isLoading = false;
      }
    });
  }

 
  // -----------------------------
  // HELPER: PARSE JWT
  // -----------------------------
  private parseJwt(token: string) {
    try {
      const base64Payload = token.split('.')[1];
      const payload = atob(base64Payload);
      return JSON.parse(payload);
    } catch (e) {
      console.error('Error parsing JWT token', e);
      return null;
    }
  }
}
