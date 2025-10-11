import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSection {
  heading: string;
  items: FAQItem[];
}

export interface FAQ {
  sections: FAQSection[];
}

export interface GeneralSettingsResponse {
  settings: Record<string, string>;
  terms: string | null;
  faq: FAQ | null;
}

@Injectable({
  providedIn: 'root',
})
export class GeneralSettingsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private adminAuth: AdminAuthService
  ) {}

  // Fetch existing general settings
  getSettings(): Observable<GeneralSettingsResponse> {
    const headers = this.adminAuth.getToken()
      ? new HttpHeaders({ Authorization: `Bearer ${this.adminAuth.getToken()}` })
      : undefined;

    return this.http
      .get<GeneralSettingsResponse>(`${this.apiUrl}/admin/general-settings`, { headers })
      .pipe(map(res => res));
  }

  // Save or update general settings
  saveSettings(payload: {
    settings: Record<string, string>,
    terms: string | null,
    faq: FAQ | null
  }): Observable<{ success: boolean; message: string }> {
    const headers = this.adminAuth.getToken()
      ? new HttpHeaders({ Authorization: `Bearer ${this.adminAuth.getToken()}` })
      : undefined;

    // Serialize FAQ as JSON if present
    const body = {
      settings: payload.settings,
      terms: payload.terms,
      faq: payload.faq ? JSON.stringify(payload.faq) : null,
    };

    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/admin/general-settings/save-all`, // 🔹 point to save-all route
      body,
      { headers }
    );
  }


}
