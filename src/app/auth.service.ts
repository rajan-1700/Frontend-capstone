import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  private baseUrl = 'http://localhost:9001/api/v1/login'; // backend login endpoint

  constructor(private http: HttpClient) {}

  // Check if token exists in localStorage
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  // Call backend login
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl, credentials).pipe(
      tap(response => {
        if (response.token) {
          // store token
          localStorage.setItem('token', response.token);
          // update navbar
          this.loggedIn.next(true);
        }
      })
    );
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
  }

  // Synchronous check
  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }
}
