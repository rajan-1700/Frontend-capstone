// src/app/components/favourites/favourites.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  private favourites: any[] = [];
  private apiUrl = 'http://localhost:9001/api/favourites'; // ✅ backend endpoint

  constructor(private http: HttpClient) {}

  // --------------------
  // 🔹 Local (UI only)
  // --------------------
  getFavourites() {
    return this.favourites;
  }

  addFavourite(book: any) {
    if (!this.favourites.find(b => b.title === book.title)) {
      this.favourites.push(book);
    }
  }

  removeFavourite(bookTitle: string) {
    this.favourites = this.favourites.filter(b => b.title !== bookTitle);
  }

  // --------------------
  // 🔹 Backend (API calls)
  // --------------------
  getFavouritesFromBackend(userEmail: string): Observable<any[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/${userEmail}`, { headers });
  }

  saveFavouriteToBackend(book: any): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.apiUrl, book, { headers });
  }

  deleteFavouriteFromBackend(bookTitle: string, userEmail: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${this.apiUrl}/${userEmail}/${bookTitle}`, { headers });
  }
}
