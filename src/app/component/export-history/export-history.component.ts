import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropshipOrderService } from '@app/services/dropship-order.service';

@Component({
  selector: 'app-export-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-history.component.html',
  styleUrls: ['./export-history.component.scss']
})
export class ExportHistoryComponent implements OnInit {

  exportHistory: any[] = [];
  loading = true;

  expandedExports: Record<number, boolean> = {};
  expandedOrders: Record<number, boolean> = {};

  constructor(private dropshipOrderService: DropshipOrderService) {}

  ngOnInit(): void {
    this.fetchExportHistory();
  }

  fetchExportHistory(): void {
    this.loading = true;

    this.dropshipOrderService.getExportHistory().subscribe({
      next: (res: any) => {
        // Normalize and ensure array safety
        this.exportHistory = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching export history:', err);
        this.exportHistory = [];
        this.loading = false;
      }
    });
  }

  toggleExport(expId: number): void {
    this.expandedExports[expId] = !this.expandedExports[expId];
  }

  toggleOrder(orderId: number): void {
    this.expandedOrders[orderId] = !this.expandedOrders[orderId];
  }
}
