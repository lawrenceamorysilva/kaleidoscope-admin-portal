import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropshipOrderService } from '@app/services/dropship-order.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  orders: any[] = [];
  loading = true;

  allExpanded = false;
  showExportModal = false;
  exporting = false;
  exportReady = false;
  downloadUrl?: string;

  constructor(private dropshipOrderService: DropshipOrderService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  private fetchOrders(): void {
    this.dropshipOrderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch dropship orders', err);
        this.loading = false;
      }
    });
  }

  toggleAll() {
    this.allExpanded = !this.allExpanded;
    this.orders.forEach(order => (order.expanded = this.allExpanded));
  }

  onExport(): void {
    if (!this.orders.length) {
      alert('No orders to export');
      return;
    }
    this.showExportModal = true;
  }



  confirmExport() {
    if (!this.orders.length) return;

    this.exporting = true;

    this.dropshipOrderService.exportOrders(this.orders).subscribe({
      next: (res) => {
        // URL returned by Laravel
        this.downloadUrl = res.downloadUrl;
        this.exportReady = true;
        this.exporting = false;
        this.showExportModal = false; // close "Are you sure?" modal
      },
      error: (err) => {
        console.error('Export failed', err);
        this.exporting = false;
        this.showExportModal = false;
        alert('Failed to export orders. Check console for details.');
      },
    });
  }

  closeModal() {
    this.showExportModal = false;
    this.exportReady = false;
    this.downloadUrl = '';

    // Refresh homepage/orders after export
    this.fetchOrders();
  }


  downloadAndClose(event: Event) {
    // allow the browser to do the download
    // then close modal
    this.exportReady = false;
    this.downloadUrl = '';
    this.showExportModal = false;
  }




  cancelExport() {
    this.showExportModal = false;
  }

  refreshPage() {
    window.location.reload();
  }

}
