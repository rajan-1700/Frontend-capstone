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
import { FavouriteService, FavouriteBook } from '../../favourites.service';
import { AuthorSearchService } from '../../author-search';

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
    const favouriteBookIds: string[] = ['123', '456']; // replace with actual IDs from backend
    this.loadFavourites(favouriteBookIds);

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

  // -----------------------------
  // FAVOURITES
  // -----------------------------
  loadFavourites(bookIds: string[]) {
    this.favourites = [];
    bookIds.forEach(bookId => {
      this.favService.getFavourite(bookId).subscribe({
        next: (res) => {
          if (res) {
  const favBook: FavouriteBook = {
  id: bookId as any,
  author_name: this.selectedAuthorName || 'Unknown Author',
  language: (res as any).languages?.[0]?.key?.replace('/languages/', '') || 'N/A',
  publish_date: res.publish_date || 'N/A',
  title: res.title,
};
            this.favourites.push(favBook);
          }
        },
        error: (err) => console.error(`Error loading favourite for bookId ${bookId}:`, err)
      });
    });
  }

  isFavourite(book: any): boolean {
    return this.favourites.some(f => f.id === book.id);
  }

toggleFavourite(book: any) {
  console.log('Book object clicked for favourite:', book);

  // Step 1: Fetch editions to get a valid bookId
  this.http.get<any>(`https://openlibrary.org${book.key}/editions.json`).subscribe({
    next: (editions) => {
      const editionKey = editions.entries?.[0]?.key?.split('/').pop();
      if (!editionKey) {
        alert('Cannot add this book to favourites: missing edition ID');
        return;
      }

      // Step 2: Use editionKey as bookId for backend
      const bookId = editionKey;

      if (this.isFavourite({ id: bookId })) {
        this.favService.removeFavourite(bookId as any).subscribe({
          next: () => {
            this.favourites = this.favourites.filter(f => f.id !== bookId);
          },
          error: (err) => alert('Error removing favourite: ' + err.message)
        });
      } else {
        this.favService.addFavourite(bookId).subscribe({
          next: (res: any) => {
            const favBook: FavouriteBook = {
              id: bookId as any,
              author_name: this.selectedAuthorName || 'Unknown Author',
              language: res.language || 'N/A',
              publish_date: res.publish_date || 'N/A',
              title: res.title,
            };
            this.favourites.push(favBook);
          },
          error: (err) => alert('Error adding favourite: ' + err.message)
        });
      }
    },
    error: (err) => {
      console.error('Error fetching editions:', err);
      alert('Cannot add this book to favourites: cannot fetch edition ID');
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

  searchBook(bookId: string) {
    if (!bookId) return;
    this.authorSearchService.getBookById(bookId, this.token).subscribe({
      next: (data) => this.bookData = data,
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
