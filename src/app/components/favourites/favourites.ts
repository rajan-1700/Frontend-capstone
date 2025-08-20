// src/app/components/favourites/favourites.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavouritesService } from '../../favourites.service';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favourites.html',
  styleUrls: ['./favourites.css']
})
export class FavouritesComponent {
  constructor(private favService: FavouritesService) {}

  get favourites() {
    return this.favService.getFavourites();
  }

  remove(bookKey: string) {
    this.favService.removeFavourite(bookKey);
  }
}
