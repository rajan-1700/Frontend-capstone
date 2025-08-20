import { Injectable } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // User is logged in, allow access
    return true;
  } else {
    // User not logged in, show message and redirect to login
    alert('❌ You must log in to access this page!');

    // Optional: store attempted URL so you can redirect after login
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
};
