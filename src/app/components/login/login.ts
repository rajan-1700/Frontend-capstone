import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(form: NgForm) {
  if (form.valid) {
    this.authService.login(this.credentials).subscribe({
      next: (response: any) => {
        if (response.token) {
          alert('✅ Login successful!');
          this.router.navigate(['/search']); // navigate to protected page
        } else if (response.error) {
          alert('❌ ' + response.error);
        }
        form.reset();
      },
      error: (err: any) => {
        console.error('Login failed:', err);
        alert('❌ Login failed. Check console.');
      }
    });
  }
}

}
