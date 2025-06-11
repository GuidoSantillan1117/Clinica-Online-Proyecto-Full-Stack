import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Fecha } from './Fecha';
import { Pipe } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { TurnoInfoService } from '../turno-info.service';


@Component({
  selector: 'app-modal-elegir-turno',
  imports: [CommonModule, FormsModule, TitleCasePipe],
  standalone: true,
  templateUrl: './modal-elegir-turno.component.html',
  styleUrl: './modal-elegir-turno.component.css'
})
export class ModalElegirTurnoComponent implements OnInit {
  @Input() info: any;


  turnoAbierto: boolean = false
  private turnoAbiertoSub!:Subscription

  tituloModal = "Seleccione una especialidad"
  especialidadElegida = "";
  seleccionEspecialidad =false;
  seleccionUsuario = true;
  mostrarHorariosTurnos = false;
  mostrarDiasTurnos = false;
  listaDias: Fecha[] = [];
  listaHorariosDisponibles : string [] = []
  listaHorariosTomados : string [] | any = []
  diaEspecialidad = ""
  filtroDias : any;
  diaElegido : any;
  idPaciente : any;
  listaPacientes : any [] =  []

  constructor(private dbService: DatabaseService,private turnoInfoService:TurnoInfoService) {

    
      this.turnoAbiertoSub = this.turnoInfoService.elegirTurnoAbierto$.subscribe(abierto=>{
      this.turnoAbierto = abierto
    })

  }

    ngOnInit(){
    if(this.info.rol==='administrador')
      {
        this.tituloModal = "Seleccione un paciente"
        this.traerPacientes()
      }
      else{
        
        this.idPaciente = this.info.id_paciente
    }
  }

  async traerPacientes()
  {
    const {data} = await this.dbService.traerTodosPacientes()
    if(data)
    {
      this.listaPacientes = data
    }
  }

  seleccionarPaciente (id_paciente:number)
  {
    this.idPaciente = id_paciente
    this.seleccionUsuario = false;
    this.seleccionEspecialidad = true;
    this.tituloModal = "Seleccione una especialidad"
  }
  async elegirEspecialidad(especialidad: any) {
    this.especialidadElegida = especialidad
    this.seleccionEspecialidad = false;
    this.mostrarDiasTurnos = true;
    this.tituloModal = "Seleccione el dia del turno"
    await this.traerDiasEspecialista();
  }

  async traerDiasEspecialista() {
    this.listaDias = [];
    this.filtroDias = []; 
    const { data, error } = await this.dbService.filtrarDiaEspecialidad(this.info.id_especialista, this.especialidadElegida)
    this.filtroDias = data![0]

    if (!error) {
      this.diaEspecialidad = this.filtroDias!.dia
      for (let i = 0; i < 16; i++) {
        const dia = this.sumarDia(i)
        if (dia.nombreDia === this.diaEspecialidad)
        {
          this.listaDias.push(dia);
        }
      }
    }
  }

 async elegirHoraTurno(dia:any)
  {
    
    const fechaElegida = `${dia.anio}-${String(dia.mes).padStart(2, '0')}-${String(dia.dia).padStart(2, '0')}`;
    const {data:dataVerificacion} = await this.dbService.verificarDiaYaAsignado(fechaElegida,this.idPaciente,this.info.id_especialista,this.especialidadElegida)

    if(dataVerificacion?.length===0)
    {
      this.listaHorariosTomados = [];
      this.mostrarDiasTurnos = false;
      this.mostrarHorariosTurnos = true;
      this.diaElegido = fechaElegida
      const {data,error} = await this.dbService.verificarDisponibilidad(this.info.id_especialista,this.especialidadElegida,fechaElegida)
      this.tituloModal = "Seleccione la hora del turno"
      console.log(data)
      if(data!?.length>0)
      {
        this.listaHorariosTomados = data
      }
      const horaInicioFormateada = this.convertirAFecha(this.filtroDias.hora_inicio)
      const horaFinalFormateada = this.convertirAFecha(this.filtroDias.hora_final)
  
      const actual = new Date(horaInicioFormateada);
      
      const turnosDisponibles : string [] =  []
      while(actual<=horaFinalFormateada)
      {
        const hora = actual.getHours().toString()
        let minutos = actual.getMinutes().toString()
        if(minutos.length ===1)
        {
          minutos = `${minutos}0`
        }
        turnosDisponibles.push(`${hora}:${minutos}`);
        actual.setMinutes(actual.getMinutes()+60)
      }
  
      this.listaHorariosDisponibles = turnosDisponibles
  
      this.mostrarHorariosTurnos = true;
    }
    else{
      Swal.fire({
    title: 'Error',
    text: 'Ya tienes un turno asignado ese dia',
    icon: 'error'
});
    }
  }

  verificarHorarioTomado(hora:any)
  {
    for(let hora_tomada of this.listaHorariosTomados)
    {
      if(hora_tomada.hora === hora+':00')
      {
        return true
      }
    }
    return false
  }

  async enviarTurno(hora:string)
  {
    const {error} = await this.dbService.crearTurno(this.idPaciente,this.info.id_especialista,hora,this.diaElegido,this.especialidadElegida)
    if(!error)
    {
      Swal.fire({
      title: '¡Éxito!',
      text: 'El turno fue guardado correctamente',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then((resultado)=>{
      if(resultado.isConfirmed)
      {
        this.turnoInfoService.cerrarTurno()
      }
    })

    }
  }

    convertirAFecha(tiempo:string)
    {
        const [horas,minutos] = tiempo.split(':').map(Number);
        const hora = new Date()
        hora.setHours(horas,minutos)

        return hora
    }

  sumarDia(dia: number) {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + dia)
    const nombreDia = hoy.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaHoy = hoy.getDate();
    const mesHoy = hoy.getMonth()+1;
    const anio = hoy.getFullYear();

    const fecha = new Fecha(nombreDia, diaHoy, mesHoy,anio)
    return fecha

  }

  salir()
  {
    this.turnoInfoService.cerrarTurno();
  }

  volver()
  {
    if(this.mostrarHorariosTurnos && !this.mostrarDiasTurnos)
    {
      this.mostrarHorariosTurnos = false
      this.mostrarDiasTurnos = true;
    }
    else if(this.mostrarDiasTurnos && !this.seleccionEspecialidad)
    {
      this.mostrarDiasTurnos = false;
      this.seleccionEspecialidad = true;
      this.filtroDias = [];
       this.listaHorariosTomados = [];
      this.especialidadElegida = "";
    }
    else if(this.seleccionEspecialidad && !this.seleccionUsuario)
    {
      this.seleccionEspecialidad = false;
      this.seleccionUsuario = true;
      this.tituloModal = "Seleccione un paciente"
    }
  }
}
