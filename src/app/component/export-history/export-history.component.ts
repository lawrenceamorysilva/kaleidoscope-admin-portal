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
    this.dropshipOrderService.getExportHistory().subscribe({
      next: (res: any) => {
        this.exportHistory = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching history:', err);
        this.loading = false;
      }
    });
  }

  toggleExport(expId: number) {
    this.expandedExports[expId] = !this.expandedExports[expId];
  }

  toggleOrder(orderId: number) {
    this.expandedOrders[orderId] = !this.expandedOrders[orderId];
  }
}
