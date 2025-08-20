import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FavouritesService } from '../../favourites.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  query = '';
  results: any[] = [];
  works: any[] = [];
  isLoading = false;

  popularBooks: any[] = [];   // ✅ trending books

  private searchSubject = new Subject<string>();
  private subscription!: Subscription;

  constructor(private http: HttpClient, private favService: FavouritesService) {}

  ngOnInit() {
    // Author search
    this.subscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query.trim()) {
          this.results = [];
          return [];
        }
        this.isLoading = true;
        return this.http.get<any>(`https://openlibrary.org/search/authors.json?q=${query}`);
      })
    ).subscribe((res: any) => {
      this.results = res.docs?.slice(0, 6) || []; // ✅ limit to 6 authors
      this.isLoading = false;
    });

    // ✅ Fetch popular books
    this.http.get<any>('https://openlibrary.org/trending/daily.json')
      .subscribe({
        next: (res) => {
          this.popularBooks = res.works?.slice(0, 12) || []; // ✅ only 6 trending books
        },
        error: (err) => console.error('Error fetching popular books:', err)
      });
  }

  onQueryChange() {
    this.searchSubject.next(this.query);
  }

  viewWorks(authorKey: string) {
    this.isLoading = true;
    this.works = [];
    this.http.get<any>(`https://openlibrary.org/authors/${authorKey}/works.json`)
      .subscribe({
        next: (res) => {
          this.works = res.entries?.slice(0, 8) || []; // ✅ only 6 works
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching works:', err);
          this.isLoading = false;
        }
      });
  }

  getCoverImage(book: any): string {
    if (book.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    } else if (book.cover_id) {
      return `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
    } else if (book.edition_key?.length) {
      return `https://covers.openlibrary.org/b/olid/${book.edition_key[0]}-M.jpg`;
    } else if (book.isbn?.length) {
      return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
    }
    return 'assets/default-book.png';
  }

  addToFavourites(book: any) {
    this.favService.addFavourite(book);
    alert(`${book.title} added to favourites!`);
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
