import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="max-width: 400px; margin: 60px auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif;">
      <h2 style="margin-top: 0;">LogiTrack {{ isRegisterMode ? 'Register' : 'Login' }}</h2>

      @if (error) {
        <p style="color: #b91c1c; background: #fee2e2; padding: 8px; border-radius: 4px;">{{ error }}</p>
      }
      @if (message) {
        <p style="color: #166534; background: #dcfce7; padding: 8px; border-radius: 4px;">{{ message }}</p>
      }

      <form (ngSubmit)="onSubmit()">
        @if (isRegisterMode) {
          <div style="margin-bottom: 12px;">
            <label>Name</label><br />
            <input [(ngModel)]="name" name="name" required style="width: 100%; padding: 8px; box-sizing: border-box;" />
          </div>
        }

        <div style="margin-bottom: 12px;">
          <label>Email</label><br />
          <input [(ngModel)]="email" name="email" type="email" required style="width: 100%; padding: 8px; box-sizing: border-box;" />
        </div>

        <div style="margin-bottom: 16px;">
          <label>Password</label><br />
          <input [(ngModel)]="password" name="password" type="password" required style="width: 100%; padding: 8px; box-sizing: border-box;" />
        </div>

        <button type="submit" style="width: 100%; padding: 10px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
          {{ isRegisterMode ? 'Create Account' : 'Login' }}
        </button>
      </form>

      <p style="margin-top: 16px; text-align: center;">
        <a href="javascript:void(0)" (click)="toggleMode()">
          {{ isRegisterMode ? 'Already have an account? Login' : 'New user? Create an account' }}
        </a>
      </p>
    </div>
  `,
})
export class LoginComponent {
  isRegisterMode = false;
  name = '';
  email = '';
  password = '';
  error = '';
  message = '';

  constructor(private api: ApiService, private router: Router) {
    if (this.api.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.error = '';
    this.message = '';
  }

  onSubmit(): void {
    this.error = '';
    this.message = '';

    if (this.isRegisterMode) {
      this.api.register(this.name, this.email, this.password).subscribe({
        next: () => {
          this.message = 'Account created! Please log in now.';
          this.isRegisterMode = false;
        },
        error: (err) => {
          this.error = err.error?.detail || 'Registration failed';
        },
      });
    } else {
      this.api.login(this.email, this.password).subscribe({
        next: (res) => {
          this.api.saveToken(res.access_token);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.detail || 'Login failed';
        },
      });
    }
  }
}