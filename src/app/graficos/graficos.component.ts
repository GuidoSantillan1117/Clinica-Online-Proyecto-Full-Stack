import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-graficos',
  imports: [CommonModule,NgxChartsModule],
  standalone:true,
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.css'
})
export class GraficosComponent {
  @Input() colores:any; 
  @Input() data:any;

}
