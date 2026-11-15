import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Shipment {
  id: number;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  driver_name?: string;
  created_by: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 
    window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000/api'
    : 'https://logitrack-api-nxb5.onrender.com/api';

  constructor(private http: HttpClient) {}

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken() || ''}`,
    });
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, { name, email, password });
  }

  login(email: string, password: string): Observable<{ access_token: string; token_type: string }> {
    const body = new HttpParams().set('username', email).set('password', password);
    return this.http.post<{ access_token: string; token_type: string }>(
      `${this.baseUrl}/auth/login`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
    );
  }

  getShipments(status?: string): Observable<Shipment[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Shipment[]>(`${this.baseUrl}/shipments/`, {
      headers: this.authHeaders(),
      params,
    });
  }

  createShipment(data: {
    tracking_number: string;
    origin: string;
    destination: string;
    driver_name?: string;
  }): Observable<Shipment> {
    return this.http.post<Shipment>(`${this.baseUrl}/shipments/`, data, {
      headers: this.authHeaders(),
    });
  }

  updateShipmentStatus(id: number, status: string): Observable<Shipment> {
    return this.http.patch<Shipment>(
      `${this.baseUrl}/shipments/${id}`,
      { status },
      { headers: this.authHeaders() }
    );
  }

  deleteShipment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/shipments/${id}`, {
      headers: this.authHeaders(),
    });
  }
}