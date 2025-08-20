import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isLoggedIn = false;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to login state updates
    this.authService.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  handleProtectedAccess(message: string) {
  window.alert(message);
}

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
    alert('You have logged out!');
    this.router.navigate(['/login']);
  }
}
