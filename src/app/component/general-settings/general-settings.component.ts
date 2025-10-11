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
  settings: Record<string, any> = {}; // values only
  settingsKeys: string[] = [];
  settingsTypes: Record<string, 'string' | 'number' | 'boolean' | 'json'> = {}; // types only


  // 🔹 Content sections
  termsContent = '';
  faqContent: any = null;

  // 🔹 Toast
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
        const rawSettings = res.settings || {};

        this.settings = {};
        this.settingsKeys = [];
        this.settingsTypes = {};

        Object.keys(rawSettings).forEach(key => {
          let valueObj: SettingItem;

          // If backend already returns {value, type}, use it
          if (
            rawSettings[key] &&
            typeof rawSettings[key] === 'object' &&
            'value' in rawSettings[key] &&
            'type' in rawSettings[key]
          ) {
            valueObj = rawSettings[key] as SettingItem;
          } else {
            // If backend sent a raw value, fallback to string type
            valueObj = { value: rawSettings[key], type: 'string' };
          }

          this.settings[key] =
            valueObj.value !== null && valueObj.value !== undefined
              ? valueObj.value
              : valueObj.type === 'number'
                ? 0
                : '';

          this.settingsTypes[key] = valueObj.type;
          this.settingsKeys.push(key);
        });

        this.termsContent = res.terms || '';
        this.faqContent = res.faq || null;

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load portal_contents', err);
        this.loading = false;
        alert('Failed to load settings. Please try again.');
      },
    });
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }


  isValid(key: string): boolean {
    const value = this.settings[key];
    const type = this.settingsTypes[key];

    // 🔹 Detect email dynamically by key name only
    const isEmail = key.toLowerCase().includes('email');

    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }

    switch (type) {
      case 'number':
        return value !== '' && !isNaN(Number(value));
      case 'boolean':
        return value === true || value === false;
      case 'string':
        return value !== null && value !== undefined && value.toString().trim() !== '';
      case 'json':
        try {
          JSON.stringify(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }


  getValidationMessage(key: string): string {
    const type = this.settingsTypes[key];
    const isEmail = key.toLowerCase().includes('email');

    if (isEmail) {
      return 'Must be a valid email address';
    }

    switch (type) {
      case 'number':
        return 'Must be a valid number';
      case 'boolean':
        return 'Must be true or false';
      case 'string':
        return 'Cannot be empty';
      case 'json':
        return 'Invalid JSON';
      default:
        return 'Invalid value';
    }
  }



  canSave(): boolean {
    return this.settingsKeys.every(key => this.isValid(key));
  }







  // 🔹 FAQ helpers
  addFaqSection(): void {
    if (!this.faqContent) this.faqContent = { sections: [] };
    this.faqContent.sections.push({ heading: 'New Section', items: [] });
  }

  removeFaqSection(sectionIndex: number): void {
    this.faqContent?.sections.splice(sectionIndex, 1);
  }

  addFaqItem(sectionIndex: number): void {
    this.faqContent?.sections[sectionIndex].items.push({ question: '', answer: '' });
  }

  removeFaqItem(sectionIndex: number, itemIndex: number): void {
    this.faqContent?.sections[sectionIndex].items.splice(itemIndex, 1);
  }

  saveSettings(): void {
    this.saving = true;
    this.toastMessage = '';

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

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 4000);
  }
}

// 🔹 Interfaces at the bottom of the component
interface SettingItem {
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
}

interface SettingsResponse {
  [key: string]: SettingItem;
}
