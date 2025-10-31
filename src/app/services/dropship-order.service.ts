import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DropshipOrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all dropship orders (admin)
   */
  getOrders(): Observable<any[]> {
    const token = localStorage.getItem('adminToken') || '';
    return this.http
      .get<{ orders: any[] }>(`${this.apiUrl}/admin/dropship-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .pipe(map(res => res.orders || []));
  }

  getPendingExportCount(): Observable<number> {
    const token = localStorage.getItem('adminToken') || '';
    return this.http
      .get<{ count: number }>(`${this.apiUrl}/admin/dropship-orders/pending-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(map(res => res.count || 0));
  }



  /**
   * Export orders (admin)
   */
  exportOrders(orders: any[]): Observable<{ downloadUrl: string }> {
    const token = localStorage.getItem('adminToken') || '';
    return this.http.post<{ downloadUrl: string }>(
      `${this.apiUrl}/admin/export-dropship-orders`,
      { orders },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }

  /**
   * Get export history (admin)
   */
  getExportHistory(): Observable<any[]> {
    const token = localStorage.getItem('adminToken') || '';
    return this.http
      .get<{ data: any[] }>(`${this.apiUrl}/admin/dropship-export-history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .pipe(map(res => res.data || []));
  }

}
