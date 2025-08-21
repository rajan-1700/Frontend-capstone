import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthorSearchService {

  private baseUrl = 'http://localhost:9001/api/authors/books';
  
  constructor(private http: HttpClient) {}

  getBookById(bookId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${this.baseUrl}/${bookId}`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching book:', error);
        return throwError(() => error);
      })
    );
  }
}
