import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { GeneralSettingsService } from '@app/services/general-settings.service';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillEditorComponent],
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss'],
})
export class GeneralSettingsComponent implements OnInit {
  loading = false;
  saving = false;

  // 🔹 Portal constants
  settings = {
    minimum_order_value: '',
    dropship_fee: '',
    minimum_freight_charge: '',
    currency: '',
  };

  // 🔹 Content sections
  termsContent = '';
  faqContent: any = null;

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';



  constructor(private generalSettingsService: GeneralSettingsService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;

    this.generalSettingsService.getSettings().subscribe({
      next: (res) => {
        console.log('Raw portal_contents:', res);

        // 🔹 Settings: access using bracket notation to satisfy TS
        const s = res.settings || {};
        this.settings = {
          minimum_order_value: s['minimum_order_value'] || '0',
          dropship_fee: s['dropship_fee'] || '0',
          minimum_freight_charge: s['minimum_freight_charge'] || '0',
          currency: s['currency'] || 'AUD',
        };

        // 🔹 Terms
        this.termsContent = res.terms || '';

        // 🔹 FAQ (parsed JSON)
        this.faqContent = res.faq || null;

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load portal_contents', err);
        this.loading = false;
        alert('Failed to load settings. Please try again.');
      }
    });
  }


  addFaqSection(): void {
    if (!this.faqContent) {
      this.faqContent = { sections: [] };
    }
    this.faqContent.sections.push({ heading: 'New Section', items: [] });
  }

  removeFaqSection(sectionIndex: number): void {
    if (this.faqContent) {
      this.faqContent.sections.splice(sectionIndex, 1);
    }
  }

  removeFaqItem(sectionIndex: number, itemIndex: number): void {
    if (this.faqContent) {
      this.faqContent.sections[sectionIndex].items.splice(itemIndex, 1);
    }
  }

  addFaqItem(sectionIndex: number): void {
    if (this.faqContent) {
      this.faqContent.sections[sectionIndex].items.push({ question: '', answer: '' });
    }
  }


  saveSettings(): void {
    this.saving = true;
    this.toastMessage = '';
    /*this.toastType = '';*/

    const payload = {
      settings: this.settings,
      terms: this.termsContent,
      faq: this.faqContent,
    };

    this.generalSettingsService.saveSettings(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.showToast(res.message || 'Settings saved successfully.', 'success');
      },
      error: (err) => {
        this.saving = false;
        console.error('Save failed', err);
        this.showToast('Failed to save settings. Please try again.', 'error');
      },
    });
  }

  /** 🔹 Simple helper for toast */
  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 4000);
  }





}
