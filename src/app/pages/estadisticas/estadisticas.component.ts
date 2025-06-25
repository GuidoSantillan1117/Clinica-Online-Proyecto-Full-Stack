import { Component, OnInit, signal } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { GraficosComponent } from '../../graficos/graficos.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { utils, writeFileXLSX } from 'xlsx'



@Component({
  selector: 'app-estadisticas',
  imports: [CommonModule, FormsModule, NgxChartsModule, GraficosComponent, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule],
  providers: [MatDatepickerModule],
  standalone: true,
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit {

  mostrarGrafico = false;
  grafico1: any[] = []
  grafico2: any[] = []
  grafico3: any[] = []
  grafico4: any[] = []

  fechaInicioSolicitados: Date | null = null
  fechaFinalSolicitados: Date | null = null
  fechaInicioFinalizados: Date | null = null
  fechaFinalFinalizados: Date | null = null

  colorGrafico1: Color = {
    domain: ['#F1948A', '#F8C471', '#82E0AA', '#85C1E9'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'graficosArriba',
  };


  colorGrafico2: Color = {
    domain: ['#A3E4D7', '#F9E79F', '#F5CBA7', '#D7BDE2'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'graficosAbajo',
  };

  ingresos = signal<any[]>([]);
  constructor(private dbService: DatabaseService) {

  }

  ngOnInit(): void {
    this.traerIngresos();
  }
  async traerIngresos() {
    const { data } = await this.dbService.traerStatIngreso();
    if (data) {
      this.ingresos.set(data);
    }
  }


  async mostrarEstadisticas(mostrar: boolean) {
    this.mostrarGrafico = mostrar
    if (mostrar) {
      this.grafico1 = await this.graficarTurnos(true)
      this.grafico2 = await this.graficarTurnos()
      this.grafico3 = await this.graficarTurnosTiempo('Pendiente')
      this.grafico4 = await this.graficarTurnosTiempo('Realizado')
    }

  }

  async mostrarEstadisticasPorFecha(estado: string) {
    if (estado === 'Pendiente') {
      this.grafico3 = await this.graficarTurnosTiempo('Pendiente', this.fechaInicioSolicitados!, this.fechaFinalSolicitados!)
    }
    else {
      this.grafico4 = await this.graficarTurnosTiempo('Realizado', this.fechaInicioFinalizados!, this.fechaFinalFinalizados!)
    }

  }


  async graficarTurnosTiempo(estado: string, fechaInicio?: Date, fechaFinal?: Date) {
    const medicos: { name: string; value: number }[] = [];


    console.log(fechaInicio)
    console.log(fechaFinal)
    const { data: DataMedicos } = fechaInicio && fechaFinal ? await this.dbService.cargarTurnosEstado(estado, fechaInicio, fechaFinal) : await this.dbService.cargarTurnosEstado(estado)
    for (let medico of DataMedicos!) {
      const usuarios_clinica = JSON.parse(JSON.stringify(medico.especialistas)).usuarios_clinica
      const nombre = JSON.parse(JSON.stringify(usuarios_clinica.name))
      const apellido = JSON.parse(JSON.stringify(usuarios_clinica.sur_name))
      const nombreCompleto = `Dr. ${nombre} ${apellido}`

      const existente = medicos.find(t => t.name === nombreCompleto);
      if (existente) {
        existente.value += 1;
      } else {
        medicos.push({ name: nombreCompleto, value: 1 });
      }
    }

    return medicos;

  }
  async graficarTurnos(campo?: boolean) {
    this.mostrarGrafico = true;
    const dataFormateada: { name: string; value: number }[] = [];
    const { data } = await this.dbService.cargarTurnos();

    for (let turno of data!) {
      const filtro = campo ? turno.especialidad : turno.fecha
      const existente = dataFormateada.find(t => t.name === filtro);
      if (existente) {
        existente.value += 1;
      } else {
        dataFormateada.push({ name: filtro, value: 1 });
      }
    }

    return dataFormateada

  }


  descargarExcelUsuarios(lista: any, nombreHoja: string, nombreArchivo: string, campo?: string) {

    let rows: any = []

    if (campo) {
      if (campo === 'especialidad') {
        for (let medico of lista) {
          rows.push({ especialidad: medico.name, cantidad_turnos: medico.value })
        }
      }
      else {
        for (let turno of lista) {
          rows.push({ dia: turno.name, cantidad_turnos: turno.value })
        }
      }
    }
    else {

      for (let medico of lista) {
        rows.push({ nombre: medico.name, cantidad_turnos: medico.value })
      }
    }
    this.crearExcel(rows, nombreHoja, nombreArchivo)
  }

  crearExcel(rows: any, nombreHoja: string, nombreArchivo: string) {
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, nombreHoja)
    writeFileXLSX(wb, nombreArchivo + '.xlsx');
  }

}
