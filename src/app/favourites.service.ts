// src/app/components/favourites/favourites.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  private favourites: any[] = [];

  getFavourites() {
    return this.favourites;
  }

  addFavourite(book: any) {
    // prevent duplicates
    if (!this.favourites.find(b => b.key === book.key)) {
      this.favourites.push(book);
    }
  }

  removeFavourite(bookKey: string) {
    this.favourites = this.favourites.filter(b => b.key !== bookKey);
  }
}
