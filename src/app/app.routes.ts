import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { SearchComponent } from './components/search/search';
import { FavouritesComponent } from './components/favourites/favourites';
import { AuthGuard } from './auth-guard';
import { BookDetailsComponent } from './components/book-details/book-details';

export const routes: Routes = [
  // Default redirect to home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Public routes
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes (require login)
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'favourites', component: FavouritesComponent, canActivate: [AuthGuard] },

  // Dynamic route for book details
  { path: 'book/:olid', component: BookDetailsComponent },

  // Wildcard route (catch all)
  { path: '**', redirectTo: '/home' }
];
