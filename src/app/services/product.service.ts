/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Hardcode the staging URL for now:
  private apiUrl = 'https://staging-api.kaleidoscope.com.au/api';

  constructor(private http: HttpClient) {}

  getNetoProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/neto-products`);
  }
}*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getNetoProducts(params?: { dropship?: string | null }) {
    const query = params?.dropship != null ? `?dropship=${params.dropship}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/neto-products${query}`);
  }
}
