import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../clases/User';
import { RegisterComponent } from '../register/register.component';
import { PdfService } from '../../services/pdf.service';
import { utils, writeFileXLSX } from 'xlsx'
import { ResaltarDirective } from '../../../resaltar.directive';


@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, RegisterComponent,ResaltarDirective],
  standalone: true,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  registroAbierto = false;
  usuarios = signal<User[]>([]);
  usuariosAtendidos = signal<any[]>([]);

  historial = false;
  constructor(private dbService: DatabaseService, private pdfService: PdfService) {
    this.dbService.registroOpen$.subscribe(abierto => {
      this.registroAbierto = abierto;
    })
  }

  ngOnInit(): void {
    this.traerUsers();
  }

  mostrarRegistro() {
    this.dbService.abrirRegistro();
  }



  async descargarExcelHistorial(paciente: any) {
    let rows: any = []
    const { data, error } = await this.dbService.cargarHistorialClinicoPacienteEspecialista(false, paciente.id_paciente)
    for (let turno of data!)
      rows.push({
        fecha: turno.fecha,
        especialidad: turno.especialidad,
        diagnostico: turno.diagnostico,
        altura: turno.turnos_datos?.[0]?.altura ,
        peso: turno.turnos_datos?.[0]?.peso ,
        temperatura: turno.turnos_datos?.[0]?.temperatura,
        presion: turno.turnos_datos?.[0]?.presion ,
        dato_extra_1: turno.turnos_datos?.[0]?.dato_1?.clave || '',
        valor_extra_1: turno.turnos_datos?.[0]?.dato_1?.valor || '',
        dato_extra_2: turno.turnos_datos?.[0]?.dato_2?.clave || '',
        valor_extra_2: turno.turnos_datos?.[0]?.dato_2?.valor || '',
        dato_extra_3: turno.turnos_datos?.[0]?.dato_3?.clave || '',
        valor_extra_3: turno.turnos_datos?.[0]?.dato_3?.valor || ''
      });

    this.crearExcel(rows, 'historial_paciente', 'historial')

  }
  descargarExcelUsuarios() {
    let rows: any = []
    for (let usuario of this.usuarios()) {
      rows.push({ rol: usuario.rol, nombre: usuario.nombre, apellido: usuario.apellido, dni: usuario.dni, edad: usuario.edad })
    }
    this.crearExcel(rows, 'datos_usuarios', 'usuarios')
  }

  crearExcel(rows: any, nombreHoja: string, nombreArchivo: string) {
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, nombreHoja)
    writeFileXLSX(wb, nombreArchivo + '.xlsx');
  }

  async mostrarHistorial(valor: boolean) {
    this.historial = valor
    const atendidos: string[] = [];
    const pacientes = [];
    if (valor) {
      const { data, error } = await this.dbService.cargarPacientesAtendidos(false)

      for (let paciente of data!) {
        if (!atendidos.includes(paciente.id_paciente)) {
          atendidos.push(paciente.id_paciente)
          pacientes.push(paciente);
        }
      }
    }

    this.usuariosAtendidos.set(pacientes)
  }

  async traerUsers() {
    const { data, error } = await this.dbService.traerUsuarios();

    if (data) {
      const listaUsuarios: User[] = [];
      for (let usuario of data) {
        const user = new User(usuario.id_user, usuario.id, usuario.name, usuario.sur_name, usuario.age, usuario.dni, usuario.rol, usuario.foto_perfil);
        if (usuario.rol === "especialista") {
          user.estado = await this.consultarEstadoEspecialista(usuario.id);
          console.log("Estado del especialista:", user.estado);
        }
        listaUsuarios.push(user);
      }

      this.usuarios.set(listaUsuarios);

    }
  }

  async consultarEstadoEspecialista(id: string) {
    let estado = "";
    const { data, error } = await this.dbService.obtenerEstadoEspecialista(id)
    if (!error) {
      estado = data?.estado
    }

    return estado;
  }

  async actualizarEstadoEspecialista(user: User, estado: boolean) {
    const { error, estadoUsuario } = await this.dbService.actualizarEstadoEspecialista(user.id, estado);
    if (!error) {
      user.estado = estadoUsuario;

    }
  }
}
