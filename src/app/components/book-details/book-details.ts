import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css']
})
export class BookDetailsComponent implements OnInit {
  book: any = null;
  isLoading = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const olid = this.route.snapshot.paramMap.get('olid');
    if (olid) {
      this.http.get<any>(`https://openlibrary.org/works/${olid}.json`)
        .subscribe({
          next: (res) => {
            this.book = res;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching book details:', err);
            this.isLoading = false;
          }
        });
    }
  }
}
