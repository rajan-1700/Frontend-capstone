// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterService, User } from '../../register-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  // No default values, form will populate this
  user: Partial<User> = {};

  constructor(
    private router: Router,
    private registerService: RegisterService
  ) {}

  onRegister(form: NgForm) {
    if (form.valid) {
      this.registerService.registerUser(this.user as User).subscribe({
        next: () => {
          alert('✅ Registration successful! Redirecting to login...');
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Registration failed:', err);
          alert('❌ Registration failed. Please try again.');
        }
      });
    }
  }
}
