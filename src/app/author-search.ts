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
    switchMap(book => {
      const mappedLanguages = this.mapLanguages(book.languages);

      if (book?.authors?.length > 0) {
        const authorRequests = book.authors.map((a: any) =>
          this.http.get<any>(`${this.openLibraryBaseUrl}${a.key}.json`).pipe(
            map(authorData => authorData?.name || 'Unknown Author'),
            catchError(() => of('Unknown Author'))
          )
        );

        return forkJoin(authorRequests).pipe(
          map(authorNames => ({
            ...book,
            authorNames,
            languageNames: mappedLanguages
          }))
        );
      } else {
        return of({
          ...book,
          authorNames: ['Unknown Author'],
          languageNames: mappedLanguages
        });
      }
    }),
    catchError(error => {
      console.error('Error fetching book:', error);
      return throwError(() => error);
    })
  );
}

 private mapLanguages(languages: any[]): string[] {
  if (!languages || languages.length === 0) return ['Unknown'];

  return languages.map(l => {
    const code = l.key?.replace('/languages/', '');
    return this.languageMap[code] || code || 'Unknown';
  });
}
}
