import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShippingService } from '../../services/shipping.service';

@Component({
  selector: 'app-sandbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.scss'],
})
export class SandboxComponent {
  postcode: string = '';
  suburb: string = '';
  weight: number | null = null;
  inputSuburb: string = '';
  shippingData: any = null;
  error: string = '';
  loading: boolean = false; // <-- Add this

  constructor(private shippingService: ShippingService) {}

  onSuburbInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.suburb = input.value.toUpperCase();
  }

  clearForm() {
    this.postcode = '';
    this.suburb = '';
    this.weight = null;
    this.shippingData = null;
    this.error = '';
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Allow digits only (charCode 48-57)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onSubmit() {
    this.error = '';
    this.shippingData = null;
    this.loading = true; // <-- Start loading

    if (
      !this.postcode ||
      !this.suburb ||
      this.weight === null ||
      this.weight <= 0
    ) {
      this.error =
        'Please fill all fields with valid values (postcode, suburb, and weight > 0).';
      this.loading = false; // <-- Stop loading if validation fails
      return;
    }

    this.inputSuburb = this.suburb;
    this.shippingService
      .getShippingCost(this.postcode, this.suburb, this.weight)
      .subscribe({
        next: (data) => {
          this.loading = false; // <-- Stop loading on success
          if (data.error) {
            this.error = data.error;
            this.shippingData = null;
          } else {
            this.shippingData = data;
          }
        },
        error: (err) => {
          this.loading = false; // <-- Stop loading on error
          this.error =
            err.error?.error ||
            'Error fetching shipping costs. Please check your connection and try again.';
          this.shippingData = null;
        },
      });
  }
}
