import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  onRegister(form: NgForm) {
    if (form.valid) {
      alert('🎉 Registration successful!');
      console.log('Form Data:', form.value);
      form.reset();
    } else {
      alert('⚠️ Please fill all required fields correctly.');
    }
  }
}
