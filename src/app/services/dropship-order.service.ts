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

  getOrders(): Observable<any[]> {
    return this.http
      .get<{ orders: any[] }>(`${this.apiUrl}/admin/dropship-orders`, { withCredentials: true })
      .pipe(map(res => res.orders || []));
  }

  exportOrders(orders: any[]): Observable<{ downloadUrl: string }> {
    return this.http.post<{ downloadUrl: string }>(
      `${this.apiUrl}/admin/export-dropship-orders`,
      { orders },
      { withCredentials: true }
    );
  }

  getExportHistory(): Observable<any[]> {
    return this.http
      .get<{ data: any[] }>(`${this.apiUrl}/admin/dropship-export-history`, { withCredentials: true })
      .pipe(map(res => res.data || []));
  }
}
