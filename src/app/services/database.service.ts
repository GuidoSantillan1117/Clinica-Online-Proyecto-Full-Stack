import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private registroOpenSubject = new BehaviorSubject<boolean>(false);
  registroOpen$ = this.registroOpenSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {

  }
  abrirRegistro() {
    this.registroOpenSubject.next(true);
  }

  cerrarRegistro() {
    this.registroOpenSubject.next(false);
  }

  async insertSignUp(id: string | undefined, name: string, sur_name: string, age: number, dni: number, rol: string) {
    const { error } = await this.supabaseService.supabase
      .from('usuarios_clinica')
      .insert([
        { id: id, name: name, sur_name: sur_name, age: age, dni: dni, rol: rol }
      ]);

    return { error };
  }

  async insertSignUpPaciente(table: string, obraS: string, id: string) {
    await this.supabaseService.supabase
      .from(table)
      .insert([
        { id: id, obra_social: obraS }
      ]);
  }

  async insertSignUpEspecialista(table: string, id: string, especialidades: string[]) {
    console.log(especialidades)
    await this.supabaseService.supabase
      .from(table)
      .insert([
        { id: id, }
      ]);

    this.insertEspecialidad(especialidades, id, table)
  }

  async insertEspecialidad(especialidades: string[], id: string, table: string) {
    for (let i = 0; i < especialidades.length; i++) {
      const campo = `especialidad_${i + 1}`;
      const valor = especialidades[i];

      const { error } = await this.supabaseService.supabase
        .from(table)
        .update({ [campo]: valor })
        .eq('id', id);

      if (error) {
        console.error(`Error`);
      }
    }
  }
  async insertSignUpAdmin(table: string, id: string) {
    await this.supabaseService.supabase
      .from(table)
      .insert([
        { id: id }
      ]);

  }





  async insertPhoto(path: string, id: string, file: File, bucket: string) {

    const { error: errorStorage } = await this.supabaseService.supabase.storage.from
      (bucket)
      .upload(path, file)


    if (!errorStorage) {

      const publicUrl = this.supabaseService.supabase
        .storage
        .from(bucket)
        .getPublicUrl(path).data.publicUrl;


      const campo = (bucket === 'perfil' ? 'foto_perfil' : 'foto_fondo')
      const { error } = await this.supabaseService.supabase
        .from('usuarios_clinica')
        .update({
          [campo]: publicUrl,
        })
        .eq('id', id);
    }
  }

  async traerUsuarios() {
    const { data, error } = await this.supabaseService.supabase
      .from('usuarios_clinica')
      .select('*');

    return { data, error };

  }

  async obtenerEstadoEspecialista(id: string) {
    const { data, error } = await this.supabaseService.supabase.from('especialistas')
      .select('estado')
      .eq('id', id)
      .single();

    return { data, error };

  }

  async obtenerIdEspecialista(id: string) {
    const { data } = await this.supabaseService.supabase.from('especialistas')
      .select('id_especialista')
      .eq('id', id)
      .single()

    return { data }
  }

  async actualizarEstadoEspecialista(id: string, habilitado: boolean) {
    const estadoUsuario = (habilitado ? 'Aprobado' : 'Rechazado');
    const { error } = await this.supabaseService.supabase.from('especialistas')
      .update({ estado: estadoUsuario })
      .eq('id', id);

    return { estadoUsuario, error };
  }

  async cargarTurnos() {
    const { data, error } = await this.supabaseService.supabase
      .from('turnos_clinica')
      .select(`id_turno, id_paciente, id_especialista, estado, especialidad, fecha, hora, pacientes(id, usuarios_clinica(name, sur_name)),
       especialistas(id, usuarios_clinica(name, sur_name))`)
      .order('fecha', { ascending: false });

    return { data, error };
  }

  async cargarTurnosEstado(estado: string, min?: Date, max?: Date) {



    let query = this.supabaseService.supabase
      .from('turnos_clinica').
      select(` id_especialista,estado,especialistas:id_especialista (id, usuarios_clinica:id (name,sur_name))`)
      .eq('estado', estado)
      .order('fecha', { ascending: false });

      if(min && max)
      {
      // const desde = min!.toISOString();
      // const hasta = max!.toISOString();
      query = query.gte('fecha', min)
      query = query.lte('fecha', max)
      }

      
      const{data,error }= await query;
      console.log(data)
  
      console.log(error)
    return { data, error };
  }
  async cargarTurnosPaciente(id: string, tipoUsuario: string) {
    const { data: dataPaciente, error: pacienteError } = await this.supabaseService.supabase
      .from('pacientes')
      .select('id_paciente')
      .eq('id', id)
      .single();

    const { data, error } = await this.supabaseService.supabase
      .from('turnos_clinica')
      .select(`id_turno, id_especialista, estado, comentario_especialista,encuesta_paciente, comentario_paciente,diagnostico,calificacion, especialidad, fecha, hora, especialistas(id, usuarios_clinica(name, sur_name))`)
      .eq('id_paciente', dataPaciente!.id_paciente)
      .order('fecha', { ascending: false });

    const turnosModificado = data?.map(turno => ({
      ...turno,
      boton_comentario_presionado: false,
      boton_diagnostico_presionado: false
    }));

    return { data: turnosModificado, error };
  }

  async cargarTurnosEspecialista(id: string, tipoUsuario: string) {
    const { data: dataEspecialista, error: especialistaError } = await this.supabaseService.supabase
      .from('especialistas')
      .select('id_especialista')
      .eq('id', id)
      .single();

    const { data, error } = await this.supabaseService.supabase
      .from('turnos_clinica')
      .select(`id_turno, id_paciente, estado, comentario_especialista, comentario_paciente,encuesta_paciente, calificacion, especialidad, fecha, hora, pacientes(id, usuarios_clinica(name, sur_name,dni))`)
      .eq('id_especialista', dataEspecialista!.id_especialista)
      .order('fecha', { ascending: false });

    const turnosModificado = data?.map(turno => ({
      ...turno,
      boton_comentario_presionado: false,
      boton_encuesta_presionado: false
    }));

    return { data: turnosModificado, error };
  }

  async cargarDatos(id_turno: number, altura: any, peso: any, temperatura: any, presion: any, datosExtra: any) {
    const { data, error } = await this.supabaseService.supabase.from('turnos_datos')
      .insert([{ id_turno: id_turno, altura: altura, peso: peso, temperatura: temperatura, presion: presion }])
    if (!error) {
      console.log(error)
      const camposExtras: any = {};
      let index = 1;
      for (let grupo of datosExtra) {
        const clave = grupo.clave
        const valor = grupo.valor
        camposExtras[`dato_${index}`] = { clave, valor };
        index++

        const { error: errorT } = await this.supabaseService.supabase.from('turnos_datos')
          .update(camposExtras)
          .eq('id_turno', id_turno)

        console.log(errorT)
      }
    }

  }
  async cargarComentario(id: number, comentarioData: any) {
    const { error } = await this.supabaseService.supabase
      .from('turnos_clinica')
      .update(comentarioData)
      .eq('id_turno', id);
    return { error };
  }

  async cargarDiagnostico(id: number, diagnostico: any) {
    const { error } = await this.supabaseService.supabase
      .from('turnos_clinica')
      .update({ diagnostico: diagnostico.diagnostico })
      .eq('id_turno', id);
  }

  async modificarEstadoTurno(id: number, estado: string) {
    const { error } = await this.supabaseService.supabase
      .from('turnos_clinica')
      .update({ estado: estado })
      .eq('id_turno', id);

    return { error }
  }

  async cargarEncuesta(id: number, encuesta: any) {
    const { error } = await this.supabaseService.supabase
      .from('turnos_clinica')
      .update({ encuesta_paciente: encuesta })
      .eq('id_turno', id);
    return { error }
  }

  async cargarValoracion(id: number, data: any) {
    const { error } = await this.supabaseService.supabase
      .from('turnos_clinica')
      .update({ calificacion: data.valoracion, comentario_paciente: data.comentario })
      .eq('id_turno', id);

    return { error };
  }

  async cargarEspecialidades(id: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('especialistas')
      .select('id_especialista,especialidad_1, especialidad_2, especialidad_3, especialidad_4')
      .eq('id', id)
      .single();

    return { data, error };
  }

  async cargarHorarios(id: number) {
    const { data, error } = await this.supabaseService.supabase
      .from('especialistas_horario')
      .select('dia,hora_inicio,hora_final')
      .eq('id_especialista', id)

    return { data, error }
  }

  async filtrarDiaEspecialidad(id: string, especialidad: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('especialistas_horario')
      .select('dia,hora_inicio,hora_final')
      .eq('id_especialista', id)
      .eq('especialidad', especialidad);

    return { data, error };
  }


  async subirHorario(especialidad: any, id_especialista: number) {
    const diaFormateado = (especialidad.dia + '').toLowerCase();
    const { data, error } = await this.supabaseService.supabase
      .from('especialistas_horario')
      .insert([{ id_especialista: id_especialista, dia: diaFormateado, hora_inicio: especialidad.inicio, hora_final: especialidad.final, especialidad: especialidad.valor }])

    return { data, error }
  }

  async traerDatosEspecialistas() {
    const { data, error } = await this.supabaseService.supabase.from('especialistas')
      .select('id_especialista,id,especialidad_1,especialidad_2,especialidad_3,especialidad_4,usuarios_clinica(name,sur_name,foto_perfil)')
      .eq('estado', 'Aprobado')

    return { data, error }
  }

  async verificarDisponibilidad(id_especialista: number, especialidad: string, fecha: string) {
    const { data, error } = await this.supabaseService.supabase.from('turnos_clinica')
      .select('hora')
      .eq('id_especialista', id_especialista)
      .eq('especialidad', especialidad)
      .eq('fecha', fecha)

    return { data, error }
  }

  async verificarDiaYaAsignado(dia: string, id_paciente: number, id_especialista: number, especialidad: string) {
    const { data } = await this.supabaseService.supabase.from('turnos_clinica')
      .select('id_turno')
      .eq('id_especialista', id_especialista)
      .eq('especialidad', especialidad)
      .eq('id_paciente', id_paciente)
      .eq('fecha', dia)

    return { data }
  }

  async traerIdPaciente(id: string) {
    const { data, error } = await this.supabaseService.supabase.from('pacientes')
      .select('id_paciente')
      .eq('id', id)
      .single()

    return { data, error }
  }

  async crearTurno(id_paciente: number, id_especialista: number, hora: string, fecha: string, especialidad: string) {
    const { error } = await this.supabaseService.supabase.from('turnos_clinica')
      .insert([{ id_especialista: id_especialista, id_paciente: id_paciente, especialidad: especialidad, fecha: fecha, hora: hora }])

    return { error }
  }

  async traerTodosPacientes() {
    const { data, error } = await this.supabaseService.supabase.from('pacientes')
      .select('id_paciente,id,usuarios_clinica(name,sur_name)')

    return { data, error }
  }

  async cargarHistorialClinicoPaciente(id: string) {
    const { data: dataId } = await this.traerIdPaciente(id)

    const { data, error } = await this.supabaseService.supabase.from('turnos_clinica')
      .select('id_turno,especialidad,comentario_especialista,diagnostico,fecha,turnos_datos(altura,peso,temperatura,presion,dato_1,dato_2,dato_3)')
      .eq('id_paciente', dataId?.id_paciente)
      .eq('estado', 'Realizado')

    return { data, error }

  }


  async cargarEspecialistasAtendidos(id: string) {

    const { data } = await this.traerIdPaciente(id);

    const { data: dataTurno } = await this.supabaseService.supabase.from('turnos_clinica')
      .select('id_especialista,especialistas(id,usuarios_clinica(name,sur_name))')
      .eq('id_paciente', data!.id_paciente)

    return { dataTurno };

  }
  async cargarPacientesAtendidos(filtrarPorEspecialista: boolean, id?: string,) {
    let idEspecialista = null;
    if (id) {

      const { data: dataEspecialista } = await this.obtenerIdEspecialista(id);
      idEspecialista = dataEspecialista?.id_especialista

    }

    let query = this.supabaseService.supabase
      .from('turnos_clinica')
      .select('id_paciente,id_especialista,pacientes(id,usuarios_clinica(name,sur_name,foto_perfil))')
      .eq('estado', 'Realizado');

    if (filtrarPorEspecialista && idEspecialista) {
      query = query.eq('id_especialista', idEspecialista);
    }

    const { data, error } = await query;

    return { data, error };
  }

  async cargarHistorialClinicoPacienteEspecialista(filtrarPorEspecialista: boolean, id_paciente: number, id?: string) {

    let idEspecialista = null;
    if (id) {

      const { data: dataEspecialista } = await this.obtenerIdEspecialista(id);
      idEspecialista = dataEspecialista?.id_especialista
    }

    let query = this.supabaseService.supabase.from('turnos_clinica')
      .select('id_turno,especialidad,comentario_paciente,diagnostico,fecha,turnos_datos(altura,peso,temperatura,presion,dato_1,dato_2,dato_3)')
      .eq('id_paciente', id_paciente)
      .eq('estado', 'Realizado')
      .order('fecha', { ascending: false });

    if (filtrarPorEspecialista && idEspecialista) {
      query = query.eq('id_especialista', idEspecialista);
    }

    const { data, error } = await query

    return { data, error }
  }


  async cargarHistorialConEspecialista(id: string, id_especialista: number) {
    const { data: dataPaciente } = await this.traerIdPaciente(id);

    const { data, error } = await this.supabaseService.supabase.from('turnos_clinica')
      .select('id_turno,especialidad,comentario_especialista,diagnostico,fecha,turnos_datos(altura,peso,temperatura,presion,dato_1,dato_2,dato_3)')
      .eq('estado', 'Realizado')
      .eq('id_paciente', dataPaciente?.id_paciente)
      .eq('id_especialista', id_especialista)

    return { data }
  }

  async subirIngreso(id: string) {
    await this.supabaseService.supabase.from('ingresos_clinica')
      .insert([{ id_usuario: id }])

  }

  async traerStatIngreso() {
    const { data } = await this.supabaseService.supabase.from('ingresos_clinica')
      .select('id_ingreso,id_usuario,fecha,usuarios_clinica(name,sur_name)')
      .order('fecha', { ascending: false });

    return { data }
  }



}
