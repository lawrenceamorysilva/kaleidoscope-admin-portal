import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable, Subject} from 'rxjs';
import { environment } from '@environments/environment';


@Injectable({
  providedIn: 'root',
})
export class DropshipOrderService {
  private apiUrl = environment.apiUrl;

  public refreshPendingCount$ = new Subject<void>();

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

  updateOrderStatus(orderId: number, status: string) {
    const token = localStorage.getItem('adminToken') || '';
    const adminUserStr = localStorage.getItem('adminUser');
    let adminUserId = null;

    if (adminUserStr) {
      const adminUser = JSON.parse(adminUserStr);
      adminUserId = adminUser.id;
    }

    return this.http.put(
      `${this.apiUrl}/admin/dropship-orders-admin/${orderId}`,
      { admin_user_id: adminUserId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // 🔹 Convenience method to tell MainLayout to refresh
  triggerPendingCountRefresh() {
    this.refreshPendingCount$.next();
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
