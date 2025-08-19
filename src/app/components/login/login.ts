import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  onLogin(form: NgForm) {
    if (form.valid) {
      alert('✅ Login successful!');
    } else {
      alert('⚠️ Please enter valid details.');
    }
  }
}
