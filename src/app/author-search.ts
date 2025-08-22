import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthorSearchService {


  private baseUrl= 'http://localhost:9001/api/authors/booooks';
  private favouriteUrl = 'http://localhost:9001/api/authors/favourite';  // ✅ declared properly
  private openLibraryBaseUrl = 'https://openlibrary.org';

  private languageMap: { [key: string]: string } = {
    eng: 'English',
    fre: 'French',
    ger: 'German',
    spa: 'Spanish',
    ita: 'Italian',
    rus: 'Russian',
    hin: 'Hindi',
    jpn: 'Japanese',
    chi: 'Chinese',
    ara: 'Arabic',
    por: 'Portuguese',
    dut: 'Dutch'
  };

  constructor(private http: HttpClient) {}

getBookById(bookId: string, token: string): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<any>(`${this.baseUrl}/${bookId}`, { headers }).pipe(
    map(book => ({
      id: bookId,
      title: book.title,
      authorName: book.authorName || 'Unknown',
      publishDate: book.publishDate || 'N/A',
      language: book.language || 'N/A'
    })),
    catchError(error => {
      console.error('Error fetching book:', error);
      return throwError(() => error);
    })
  );
}


//  ✅ Save a book to favourites
// Remove the addFavourite method and replace with:
// In author-search.ts
// Revert back to original method
addFavourite(book: any, headers?: HttpHeaders): Observable<any> {
  // Use baseUrl + /favourite instead of favouriteUrl
  const fullUrl = `${this.favouriteUrl}`;
  console.log('🔍 Base URL:', this.favouriteUrl);
  console.log('🔍 Full URL:', fullUrl);
  return this.http.post<any>(fullUrl, book, { headers });
}
  private mapLanguages(languages: any[]): string[] {
    if (!languages || languages.length === 0) return ['Unknown'];

    return languages.map(l => {
      const code = l.key?.replace('/languages/', '');
      return this.languageMap[code] || code || 'Unknown';
    });
  }
}

