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

  // Example: list of favourite book IDs for the user
  favouriteBookIds: string[] = []; // Replace with real IDs from backend

  constructor(private favService: FavouriteService) {}

  ngOnInit(): void {
    this.loadFavourites();
  }

 loadFavourites() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    const payload = this.parseJwt(token);
    const userEmail = payload?.sub || payload?.email; // depends on your token structure
    if (!userEmail) {
      console.error('User email not found in token');
      return;
    }

    this.isLoading = true;
    this.favourites = [];

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

  removeFavourite(id: number) {
    if (!confirm('Remove this book from favourites?')) return;
    this.favService.removeFavourite(id).subscribe({
      next: () => {
        this.favourites = this.favourites.filter(f => f.id !== id);
      },
      error: (err) => console.error('Error removing favourite:', err)
    });
  }

  private parseJwt(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error parsing JWT token', e);
      return null;
    }
  }


}
