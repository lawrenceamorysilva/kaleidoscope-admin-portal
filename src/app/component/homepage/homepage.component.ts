import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropshipOrderService } from '@app/services/dropship-order.service';
import { RouterModule } from '@angular/router';
import { interval } from 'rxjs';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  groupedOrders: any[] = [];
  loading = true;

  allExpanded = false;
  showExportModal = false;
  exporting = false;
  exportReady = false;
  downloadUrl?: string;

  constructor(private dropshipOrderService: DropshipOrderService) {}

  ngOnInit(): void {
    this.fetchOrders();

    // Auto-refresh every 3 hours (3 hours = 10,800,000 ms)
    interval(10800000).subscribe(() => this.fetchOrders());
  }

  private fetchOrders(): void {
    this.loading = true;
    this.dropshipOrderService.getOrders().subscribe({
      next: (data) => {
        const safeData = Array.isArray(data) ? data : [];
        this.groupedOrders = this.groupByRetailer(safeData);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch dropship orders:', err);
        this.groupedOrders = [];
        this.loading = false;
      }
    });
  }

  private groupByRetailer(orders: any[]): any[] {
    const map = new Map<string, any>();
    for (const order of orders) {
      const retailer = order.username || 'Unknown Retailer';
      if (!map.has(retailer)) {
        map.set(retailer, { retailer, expanded: true, orders: [] });
      }
      map.get(retailer).orders.push({ ...order, expanded: false });
    }
    return Array.from(map.values());
  }

  toggleAll(): void {
    this.allExpanded = !this.allExpanded;
    this.groupedOrders.forEach(group => {
      group.expanded = this.allExpanded;
      group.orders.forEach((order: any) => {
        order.expanded = this.allExpanded;
      });
    });
  }

  onExport(): void {
    if (!this.groupedOrders.length) {
      alert('No orders to export');
      return;
    }
    this.showExportModal = true;
  }

  confirmExport(): void {
    const flatOrders = this.groupedOrders.flatMap(g => g.orders);
    if (!flatOrders.length) return;

    this.exporting = true;
    this.dropshipOrderService.exportOrders(flatOrders).subscribe({
      next: (res) => {
        this.downloadUrl = res.downloadUrl;
        this.exportReady = true;
        this.exporting = false;
        this.showExportModal = false;
      },
      error: (err) => {
        console.error('Export failed:', err);
        this.exporting = false;
        this.showExportModal = false;
        alert('Failed to export orders. Check console for details.');
      }
    });
  }

  closeModal(): void {
    this.showExportModal = false;
    this.exportReady = false;
    this.downloadUrl = '';
    this.fetchOrders();
  }

  downloadAndRefresh(event: Event): void {
    setTimeout(() => {
      this.exportReady = false;
      this.downloadUrl = '';
      this.showExportModal = false;
      this.fetchOrders();
    }, 500);
  }

  cancelExport(): void {
    this.showExportModal = false;
  }

  refreshPage(): void {
    window.location.reload();
  }

  get totalOrders(): number {
    return this.groupedOrders.reduce((sum, group) => sum + group.orders.length, 0);
  }
}
