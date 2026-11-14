import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Shipment } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="max-width: 900px; margin: 30px auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">LogiTrack — Shipment Dashboard</h2>
        <button (click)="onLogout()" style="padding: 8px 14px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Logout
        </button>
      </div>

      @if (error) {
        <p style="color: #b91c1c; background: #fee2e2; padding: 10px; border-radius: 4px;">{{ error }}</p>
      }

      <!-- Create Shipment Form -->
      <div style="background: #f8fafc; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin-top: 0;">Create New Shipment</h3>
        <form (ngSubmit)="onCreate()" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
          <input [(ngModel)]="tracking_number" name="tracking_number" placeholder="Tracking # (TRK-102)" required style="padding: 8px;" />
          <input [(ngModel)]="origin" name="origin" placeholder="Origin (Pune)" required style="padding: 8px;" />
          <input [(ngModel)]="destination" name="destination" placeholder="Destination (Delhi)" required style="padding: 8px;" />
          <input [(ngModel)]="driver_name" name="driver_name" placeholder="Driver Name" style="padding: 8px;" />
          <button type="submit" style="grid-column: span 4; padding: 10px; background: #16a34a; color: white; border: none; border-radius: 4px; cursor: pointer;">
            + Add Shipment
          </button>
        </form>
      </div>

      <!-- Filter -->
      <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">Your Shipments ({{ shipments.length }})</h3>
        <div>
          <label>Filter by Status: </label>
          <select [(ngModel)]="selectedStatus" (change)="loadShipments()" style="padding: 6px;">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      <!-- Shipments Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Tracking #</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Route</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Driver</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Status</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Action</th>
          </tr>
        </thead>
        <tbody>
          @for (s of shipments; track s.id) {
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>{{ s.tracking_number }}</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">{{ s.origin }} → {{ s.destination }}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">{{ s.driver_name || 'Unassigned' }}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <select [value]="s.status" (change)="onStatusChange(s.id, $event)" style="padding: 4px;">
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <button (click)="onDelete(s.id)" style="padding: 4px 10px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Delete
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5" style="padding: 20px; text-align: center; color: #64748b;">No shipments found. Add one above!</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  shipments: Shipment[] = [];
  selectedStatus = '';
  error = '';

  tracking_number = '';
  origin = '';
  destination = '';
  driver_name = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    if (!this.api.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadShipments();
  }

  loadShipments(): void {
    this.error = '';
    this.api.getShipments(this.selectedStatus).subscribe({
      next: (data) => (this.shipments = data),
      error: (err) => {
        if (err.status === 401) {
          this.onLogout();
        } else {
          this.error = 'Failed to load shipments';
        }
      },
    });
  }

  onCreate(): void {
    this.error = '';
    this.api
      .createShipment({
        tracking_number: this.tracking_number,
        origin: this.origin,
        destination: this.destination,
        driver_name: this.driver_name || undefined,
      })
      .subscribe({
        next: () => {
          this.tracking_number = '';
          this.origin = '';
          this.destination = '';
          this.driver_name = '';
          this.loadShipments();
        },
        error: (err) => {
          this.error = err.error?.detail || 'Could not create shipment';
        },
      });
  }

  onStatusChange(id: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.api.updateShipmentStatus(id, select.value).subscribe({
      next: () => this.loadShipments(),
      error: () => (this.error = 'Failed to update status'),
    });
  }

  onDelete(id: number): void {
    this.api.deleteShipment(id).subscribe({
      next: () => this.loadShipments(),
      error: () => (this.error = 'Failed to delete shipment'),
    });
  }

  onLogout(): void {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}