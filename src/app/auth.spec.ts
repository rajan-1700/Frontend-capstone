import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('Auth', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});



// <div class="mt-5">
//   <h4>Search Book by ID</h4>
//   <input #bookIdInput type="text" placeholder="Enter Book ID" class="form-control w-50 mb-3" />
//   <button (click)="searchBook(bookIdInput.value)" class="btn btn-navy">Search</button>

//   <div *ngIf="bookData" class="mt-4 card p-3 shadow">
//     <h5>{{ bookData.title }}</h5>

//     <!-- ✅ show multiple author names -->
//     <p><b>Author:</b> {{ bookData.authorNames?.length ? bookData.authorNames.join(', ') : 'Unknown' }}</p>

//     <p><b>Publish Date:</b> {{ bookData.publish_date || 'N/A' }}</p>

//     <!-- ✅ show full language names -->
//     <p><b>Language:</b> {{ bookData.languageNames?.join(', ') || 'N/A' }}</p>

//     Add to Favourite button
//    <button  class="btn btn-success mt-3">
//   ❤️ Add to Favourites
// </button>
//   </div>
// </div>




  // searchBook(bookId: string) {
  //   if (!bookId) return;
  //   const token = localStorage.getItem('authToken') || '';
  //   this.authorSearchService.getBookById(bookId, token).subscribe({
  //     next: (data) => {
  //       this.bookData = data;
  //     },
  //     error: (err) => {
  //       console.error("Error fetching book data:", err);
  //       alert("Book not found!");
  //       this.bookData = null;
  //     }
  //   });
  // }
