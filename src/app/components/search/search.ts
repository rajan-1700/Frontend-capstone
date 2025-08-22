// import { FavouriteBook } from '../../favourites.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FavouriteService, FavouriteBook } from '../../favourites.service';
import { AuthorSearchService } from '../../author-search';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  bookData: any = null;

  favourites: FavouriteBook[] = [];
  token: string = localStorage.getItem('token') || '';
  imageErrorMap: { [key: string]: boolean } = {};

  private searchSubject = new Subject<string>();
  private subscription!: Subscription;

  @ViewChild('authorWorksSection') authorWorksSection!: ElementRef;

  constructor(
    private http: HttpClient,
    private authorSearchService: AuthorSearchService,
    private favService: FavouriteService
  ) {}

  ngOnInit() {
    // Example: load user favourites at init
    const favouriteBookIds: string[] = []; // replace with actual IDs from backend
   // this.loadFavourites();

    // live author search
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

    // popular books
    this.http.get<any>('https://openlibrary.org/trending/daily.json')
      .subscribe({
        next: (res) => {
          this.popularBooks = res.works?.slice(0, 12) || [];
        },
        error: (err) => console.error('Error fetching popular books:', err)
      });
  }
  searchedBookId: string = '';
  // -----------------------------
  // FAVOURITES
  // -----------------------------
loadFavourites() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    return;
  }

  const payload = this.parseJwt(token);
  const userEmail = payload?.sub || payload?.email;
  if (!userEmail) {
    console.error('User email not found in token');
    return;
  }

  this.isLoading = true;
  this.favourites = [];

  this.favService.getFavouritesByUser(userEmail).subscribe({
    next: (res: FavouriteBook[]) => {
      this.favourites = res || [];
      this.isLoading = false;
    },
    error: (err) => {
      console.error(`Error loading favourites for user ${userEmail}:`, err);
      this.isLoading = false;
    }
  });
}


// Helper function to decode JWT
private parseJwt(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    console.error('Error parsing JWT', e);
    return null;
  }
}

addToFavourite(book: any) {
  console.log('🔍 Complete book object:', book);

  if (!book) {
    alert('❌ No book data');
    return;
  }

  const token = localStorage.getItem('token') || '';

  // Use the data you already have in frontend
  const payload = {
    title: book.title || 'Unknown Title',
    authorName: book.authorNames || book.authorName || 'Unknown',
    language: book.languages || book.language || 'Unknown',
    publishDate: book.publishDate || 'Unknown',
    bookId: book.id || 'Unknown',
    userEmail: '' // Backend will set this from token
  };

  console.log('🔍 Final payload:', payload);

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  // Send complete data to backend
  this.authorSearchService.addFavourite(payload, headers).subscribe({
    next: (res) => {
      console.log('✅ Success response:', res);
      alert(`✅ "${payload.title}" added to favourites successfully!`);
    },
    error: (err) => {
      console.error('❌ Error details:', err);
      console.error('❌ Request URL:', err.url);
      alert(`❌ Failed: ${err.status} - ${err.error?.message || 'Unknown error'}`);
    }
  });
}


  // -----------------------------
  // UTIL
  // -----------------------------
  getColorIndex(title: string): number {
    const charCodeSum = [...title].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return charCodeSum % this.fallbackColors.length;
  }

  getFontIndex(title: string): number {
    const charCodeSum = [...title].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return charCodeSum % this.fallbackFonts.length;
  }

  getCoverImage(book: any): string | null {
    if (book.cover_i) return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    if (book.cover_id) return `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
    if (book.edition_key?.length) return `https://covers.openlibrary.org/b/olid/${book.edition_key[0]}-M.jpg`;
    if (book.isbn?.length) return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
    return null;
  }

  onImageError(bookKey: string) {
    this.imageErrorMap[bookKey] = true;
  }

  // -----------------------------
  // AUTHOR + BOOK SEARCH
  // -----------------------------
  onQueryChange() {
    this.searchSubject.next(this.query);
  }

// search.ts
searchBook(bookId: string) {
  if (!bookId) return;

  this.authorSearchService.getBookById(bookId, this.token).subscribe({
    next: (data) => {
      // Backend already returns the correct fields
      this.bookData = {
        title: data.title,
        authorName: data.authorName,
        publishDate: data.publishDate,
        language: data.language,
        id: bookId  // save the bookId so you can use it for adding to favourites
      };
    },
    error: (err) => {
      console.error("Error fetching book data:", err);
      alert("Book not found!");
      this.bookData = null;
    }
  });
}



  viewWorks(authorKey: string) {
    this.isLoading = true;
    this.works = [];
    this.selectedAuthorName = '';

    this.http.get<any>(`https://openlibrary.org/authors/${authorKey}.json`).subscribe({
      next: (author) => this.selectedAuthorName = author.name || 'Unknown Author',
      error: (err) => console.error('Error fetching author name:', err)
    });

    this.http.get<any>(`https://openlibrary.org/authors/${authorKey}/works.json`).subscribe({
      next: (res) => {
        this.works = res.entries?.slice(0, 12) || [];
        this.isLoading = false;
        setTimeout(() => {
          if (this.authorWorksSection) {
            this.authorWorksSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      },
      error: (err) => {
        console.error('Error fetching works:', err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
