// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Subject, Subscription } from 'rxjs';
// import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
// import { AuthorSearchService } from '../../author-search';
// @Component({
//   selector: 'app-search',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './search.html',
//   styleUrls: ['./search.css']
// })
// export class SearchComponent implements OnInit, OnDestroy {
//   query = '';
//   results: any[] = [];
//   works: any[] = [];
//   popularBooks: any[] = [];
//   bookData: any = null;
//   selectedAuthorName: string = '';
//   isLoading = false;
//   fallbackColors = [
//     '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA',
//     '#007AFF', '#5856D6', '#FF2D55', '#FF6B00', '#00E5FF'
//   ];
//   fallbackFonts = ['Georgia', 'Courier New', 'Arial', 'Verdana', 'Trebuchet MS'];
//   imageErrorMap: { [key: string]: boolean } = {};
//   private searchSubject = new Subject<string>();
//   private subscription!: Subscription;
//   private storageKey = 'favourites';
//   constructor(
//     private http: HttpClient,
//     private authorSearchService: AuthorSearchService
//   ) {}
//   ngOnInit() {
//     this.subscription = this.searchSubject.pipe(
//       debounceTime(400),
//       distinctUntilChanged(),
//       switchMap((query) => {
//         if (!query.trim()) {
//           this.results = [];
//           return [];
//         }
//         this.isLoading = true;
//         return this.http.get<any>(`https://openlibrary.org/search/authors.json?q=${query}`);
//       })
//     ).subscribe((res: any) => {
//       this.results = res.docs?.slice(0, 6) || [];
//       this.isLoading = false;
//     });
//     this.http.get<any>('https://openlibrary.org/trending/daily.json')
//       .subscribe({
//         next: (res) => {
//           this.popularBooks = res.works?.slice(0, 12) || [];
//         },
//         error: (err) => console.error('Error fetching popular books:', err)
//       });
//   }
//   onQueryChange() {
//     this.searchSubject.next(this.query);
//   }
//   viewWorks(authorKey: string) {
//     this.isLoading = true;
//     this.works = [];
//     this.http.get<any>(`https://openlibrary.org/authors/${authorKey}/works.json`)
//       .subscribe({
//         next: (res) => {
//           this.works = res.entries?.slice(0, 8) || [];
//           this.isLoading = false;
//         },
//         error: (err) => {
//           console.error('Error fetching works:', err);
//           this.isLoading = false;
//         }
//       });
//   }
//   searchBook(bookId: string) {
//     if (!bookId) return;
//     const token = localStorage.getItem('authToken') || '';
//     this.authorSearchService.getBookById(bookId, token).subscribe({
//       next: (data) => {
//         this.bookData = data;
//       },
//       error: (err) => {
//         console.error("Error fetching book data:", err);
//         alert("Book not found!");
//         this.bookData = null;
//       }
//     });
//   }
//   getCoverImage(book: any): string {
//     if (book.cover_i) {
//       return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
//     } else if (book.cover_id) {
//       return `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
//     } else if (book.edition_key?.length) {
//       return `https://covers.openlibrary.org/b/olid/${book.edition_key[0]}-M.jpg`;
//     } else if (book.isbn?.length) {
//       return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
//     }
//     return 'assets/default-book.png';
//   }
//   onImageError(bookKey: string) {
//     this.imageErrorMap[bookKey] = true;
//   }
//   getColorIndex(title: string): number {
//     const sum = [...title].reduce((acc, c) => acc + c.charCodeAt(0), 0);
//     return sum % this.fallbackColors.length;
//   }
//   getFontIndex(title: string): number {
//     const sum = [...title].reduce((acc, c) => acc + c.charCodeAt(0), 0);
//     return sum % this.fallbackFonts.length;
//   }
//   getUserEmailFromToken(token: string): string {
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.sub || payload.email || 'unknown@example.com';
//     } catch {
//       return 'unknown@example.com';
//     }
//   }
//   getFavourites(): any[] {
//     const data = localStorage.getItem(this.storageKey);
//     return data ? JSON.parse(data) : [];
//   }
//   isFavourite(book: any): boolean {
//     const title = book.title;
//     const author = book.authorNames?.[0] || book.authors?.[0]?.name;
//     return this.getFavourites().some(b => b.title === title && b.authorName === author);
//   }
//   toggleFavourite(book: any) {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert("Please login first!");
//       return;
//     }
//     const title = book.title || 'Untitled';
//     const authorName = book.authorNames?.[0] || book.authors?.[0]?.name || 'Unknown';
//     const language = book.languageNames?.join(', ') || 'N/A';
//     const publishDate = book.publish_date || 'N/A';
//     const userEmail = this.getUserEmailFromToken(token);
//     const favourites = this.getFavourites();
//     const index = favourites.findIndex(b => b.title === title && b.authorName === authorName);
//     if (index !== -1) {
//       favourites.splice(index, 1);
//     } else {
//       favourites.push({ title, authorName, language, publishDate, userEmail });
//     }
//     localStorage.setItem(this.storageKey, JSON.stringify(favourites));
//     // Optional: sync with backend
//     this.http.post(
//       `http://localhost:8080/api/favourites`,
//       { title, authorName, language, publishDate, userEmail },
//       { headers: { Authorization: `Bearer ${token}` } }
//     ).subscribe({
//       next: () => console.log("Synced with backend"),
//       error: () => console.warn("Failed to sync with backend")
//     });
//   }
//   ngOnDestroy() {
//     this.subscription?.unsubscribe();
//   }
// }





// -----------------------------------------------



import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FavouritesService } from '../../favourites.service';
import { AuthorSearchService } from '../../author-search';   // ✅ import service

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  fallbackColors = [
    '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA',
    '#007AFF', '#5856D6', '#FF2D55', '#FF6B00', '#00E5FF'
  ];
  fallbackFonts = ['Arial', 'Georgia', 'Courier New', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Palatino'];

  query = '';
  results: any[] = [];
  works: any[] = [];
  popularBooks: any[] = [];
  selectedAuthorName: string = '';
  isLoading = false;
  imageErrorMap: { [key: string]: boolean } = {};
  favourites: any[] = [];

  bookData: any = null;   // ✅ declare bookData

  private searchSubject = new Subject<string>();
  private subscription!: Subscription;

  @ViewChild('authorWorksSection') authorWorksSection!: ElementRef;

  constructor(
    private http: HttpClient,
    private favService: FavouritesService,
    private authorSearchService: AuthorSearchService   // ✅ inject service
  ) {}

  ngOnInit() {
    this.favourites = this.favService.getFavourites();
    this.subscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query.trim()) {
          this.results = [];
          this.works = [];
          this.selectedAuthorName = '';
          return of({ docs: [] });
        }
        this.isLoading = true;
        return this.http.get<any>(
          `https://openlibrary.org/search/authors.json?q=${query}`
        );
      })
    ).subscribe((res: any) => {
      this.results = res.docs?.slice(0, 6) || [];
      this.isLoading = false;
    });

    this.http.get<any>('https://openlibrary.org/trending/daily.json')
      .subscribe({
        next: (res) => {
          this.popularBooks = res.works?.slice(0, 12) || [];
        },
        error: (err) => console.error('Error fetching popular books:', err)
      });
  }

  getColorIndex(title: string): number {
    const charCodeSum = [...title].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return charCodeSum % this.fallbackColors.length;
  }

  searchBook(bookId: string) {
    if (!bookId) return;
    const token = localStorage.getItem('authToken') || '';
    this.authorSearchService.getBookById(bookId, token).subscribe({
      next: (data) => {
        this.bookData = data;
      },
      error: (err) => {
        console.error("Error fetching book data:", err);
        alert("Book not found!");
        this.bookData = null;
      }
    });
  }

  getFontIndex(title: string): number {
    const charCodeSum = [...title].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return charCodeSum % this.fallbackFonts.length;
  }

  onQueryChange() {
    this.searchSubject.next(this.query);
  }

  viewWorks(authorKey: string) {
    this.isLoading = true;
    this.works = [];
    this.selectedAuthorName = '';
    this.http.get<any>(`https://openlibrary.org/authors/${authorKey}.json`)
      .subscribe({
        next: (author) => {
          this.selectedAuthorName = author.name || 'Unknown Author';
        },
        error: (err) => {
          console.error('Error fetching author name:', err);
        }
      });

    this.http.get<any>(`https://openlibrary.org/authors/${authorKey}/works.json`)
      .subscribe({
        next: (res) => {
          this.works = res.entries?.slice(0, 12) || [];
          this.isLoading = false;
          setTimeout(() => {
            if (this.authorWorksSection) {
              this.authorWorksSection.nativeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }, 200);
        },
        error: (err) => {
          console.error('Error fetching works:', err);
          this.isLoading = false;
        }
      });
  }

  getCoverImage(book: any): string | null {
    if (book.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    } else if (book.cover_id) {
      return `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
    } else if (book.edition_key?.length) {
      return `https://covers.openlibrary.org/b/olid/${book.edition_key[0]}-M.jpg`;
    } else if (book.isbn?.length) {
      return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
    }
    return null;
  }

  onImageError(bookKey: string) {
    this.imageErrorMap[bookKey] = true;
  }

  toggleFavourite(book: any) {
    const existsIndex = this.favourites.findIndex(f => f.key === book.key || f.title === book.title);
    if (existsIndex >= 0) {
      this.favourites.splice(existsIndex, 1);
      this.favService.removeFavourite(book);
    } else {
      this.favourites.push(book);
      this.favService.addFavourite(book);
    }
  }

  isFavourite(book: any): boolean {
    return this.favourites.some(f => f.key === book.key || f.title === book.title);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
