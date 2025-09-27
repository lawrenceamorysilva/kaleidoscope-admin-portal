import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AdminAuthService } from './admin-auth.service';

@Injectable({
  providedIn: 'root',
})
export class DropshipOrderService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private adminAuth: AdminAuthService
  ) {}

  getOrders(): Observable<any[]> {
    const headers = this.adminAuth.getToken()
      ? new HttpHeaders({ Authorization: `Bearer ${this.adminAuth.getToken()}` })
      : undefined;

    return this.http
      .get<{ orders: any[] }>(`${this.apiUrl}/admin/dropship-orders`, { headers })
      .pipe(map(res => res.orders || []));
  }

  exportOrders(orders: any[]): Observable<{ downloadUrl: string }> {
    const headers = this.adminAuth.getToken()
      ? new HttpHeaders({ Authorization: `Bearer ${this.adminAuth.getToken()}` })
      : undefined;

    return this.http.post<{ downloadUrl: string }>(
      `${this.apiUrl}/admin/export-dropship-orders`,
      { orders }, // <-- wrap in object
      { headers }
    );
  }


}
