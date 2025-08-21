import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthorSearchService {

  private baseUrl = 'http://localhost:9001/api/authors/books';
  private openLibraryBaseUrl = 'https://openlibrary.org';

  constructor(private http: HttpClient) {}

  getBookById(bookId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Step 1: Fetch book details from backend
    return this.http.get<any>(`${this.baseUrl}/${bookId}`, { headers }).pipe(
      switchMap(book => {
        if (book?.authors?.length > 0) {
          // Step 2: Fetch all authors in parallel
          const authorRequests = book.authors.map((a: any) =>
            this.http.get<any>(`${this.openLibraryBaseUrl}${a.key}.json`).pipe(
              map(authorData => authorData?.name || 'Unknown Author'),
              catchError(err => {
                console.error('Error fetching author:', err);
                return of('Unknown Author');
              })
            )
          );

          return forkJoin(authorRequests).pipe(
            map(authorNames => ({
              ...book,
              authorNames // array of names
            }))
          );
        } else {
          // No authors found
          return of({
            ...book,
            authorNames: ['Unknown Author']
          });
        }
      }),
      catchError(error => {
        console.error('Error fetching book:', error);
        return throwError(() => error);
      })
    );
  }
}
