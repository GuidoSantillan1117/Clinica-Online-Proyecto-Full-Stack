import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private supabaseService: SupabaseService) {

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

  async actualizarEstadoEspecialista(id: string, habilitado: boolean) {
    const estadoUsuario = (habilitado ? 'Aprobado' : 'Rechazado');
    const { error } = await this.supabaseService.supabase.from('especialistas')
      .update({ estado: estadoUsuario })
      .eq('id', id);

    return { estadoUsuario, error };
  }

  async cargarTurnos()
  {
    const {data,error} = await this.supabaseService.supabase
    .from('turnos_clinica')
    .select(`id_turno, id_paciente, id_especialista, estado, especialidad, fecha, hora, pacientes(id, usuarios_clinica(name, sur_name)),
       especialistas(id, usuarios_clinica(name, sur_name))`)
    .order('fecha', { ascending: false });
    
    return { data, error  };
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

}
