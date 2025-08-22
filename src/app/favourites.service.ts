import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FavouriteBook {
  id?: number;
  author_name: string;
  language: string;
  publish_date: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavouriteService {
  private baseUrl = 'http://localhost:9001/api/authors/books';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ Trigger favourite by GET with bookId
  addFavourite(bookId: string): Observable<FavouriteBook> {
    return this.http.get<FavouriteBook>(`${this.baseUrl}/${bookId}`, {
      headers: this.getHeaders()
    });
  }

  // Fetch a favourite book detail dynamically by bookId
  getFavourite(bookId: string): Observable<FavouriteBook> {
    return this.http.get<FavouriteBook>(`${this.baseUrl}/${bookId}`, {
      headers: this.getHeaders()
    });
  }

  // Remove favourite by book ID
  removeFavourite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
  getFavouritesByUser(email: string) {
  return this.http.get<FavouriteBook[]>(`http://localhost:9001/api/favourites/${email}`, {
    headers: this.getHeaders()
  });
}
}
