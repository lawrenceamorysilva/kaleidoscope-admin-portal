import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatSortModule,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [DatePipe],
})
export class ProductsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  loading = true;
  showSearch = false;
  searchTerm = '';

  displayedColumns: string[] = [
    'sku',
    'name',
    'brand',
    'stock_status',
    'dropship_price',
    'surcharge',
    'qty',
    'qty_buffer',
    'shipping_weight',
    'shipping_length',
    'shipping_width',
    'shipping_height',
    'updated_at',
  ];

  constructor(
    private productService: ProductService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.productService.getNetoProducts().subscribe({
      next: (data) => {
        this.dataSource.data = data;

        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'dropship_price':
            case 'surcharge':
            case 'qty':
            case 'shipping_weight':
            case 'shipping_length':
            case 'shipping_width':
            case 'shipping_height':
              return parseFloat(item[property]) || 0;
            case 'updated_at':
              return new Date(item.updated_at);
            default:
              const value = item[property];
              return typeof value === 'string' ? value.toLowerCase() : value;
          }
        };


        // Custom filter logic
        this.dataSource.filterPredicate = (
          data: any,
          filter: string
        ): boolean => {
          const term = filter.trim().toLowerCase();
          const formattedDate =
            this.datePipe.transform(data.updated_at, 'dd MMM yyyy hh:mm a') ||
            '';

          // Normalize and format price fields
          const dropshipPrice = parseFloat(data.dropship_price).toFixed(2);
          const dropshipPriceWithSymbol = `$${dropshipPrice}`;

          const surcharge = parseFloat(data.surcharge).toFixed(2);
          const surchargeWithSymbol = `$${surcharge}`;


          const price = parseFloat(data.price).toFixed(2);
          const priceWithSymbol = `$${price}`;

          // Parse special qty search formats
          const qtyMatch = term.match(
            /(?:^|\s)(?:qty|quantity)?[=:]?\s*(\d+)(?:\s|$)/
          );
          const qtyTerm = qtyMatch ? parseInt(qtyMatch[1], 10) : null;

          return (
            data.sku?.toLowerCase().includes(term) ||
            data.name?.toLowerCase().includes(term) ||
            data.brand?.toLowerCase().includes(term) ||
            data.stock_status?.toLowerCase().includes(term) ||
            formattedDate.toLowerCase().includes(term) || // match formatted date
            (qtyTerm !== null && data.qty === qtyTerm) || //matches qty1 or qty77
            dropshipPrice.includes(term) ||
            dropshipPriceWithSymbol.includes(term) || // ✅ $14.00 style
            price.includes(term) ||
            priceWithSymbol.includes(term) ||
            surcharge.includes(term) || // 👈 new
            surchargeWithSymbol.includes(term) ||
            String(data.dropship_price).toLowerCase().includes(term) ||
            String(data.surcharge).toLowerCase().includes(term) ||
            String(data.qty).toLowerCase().includes(term) ||
            String(data.qty_buffer).toLowerCase().includes(term) ||
            String(data.shipping_weight).toLowerCase().includes(term) ||
            String(data.shipping_length).toLowerCase().includes(term) ||
            String(data.shipping_width).toLowerCase().includes(term) ||
            String(data.shipping_height).toLowerCase().includes(term) ||
            String(data.updated_at).toLowerCase().includes(term)
          );
        };

        this.loading = false;

        // Ensure paginator binds after view initializes
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.loading = false;
      },
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;

    // Focus the input after the search bar becomes visible
    if (this.showSearch) {
      // Use setTimeout to wait for the input to render
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
