import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipeGenero'
})
export class PipeGeneroPipe implements PipeTransform {

  transform(value: any, genero: any): any {

    const abreviacion = genero === 'H' ? 'Dr.' : 'Dra.';
    const nombreCompleto = abreviacion + ' ' + value;

    return nombreCompleto;
  }
  

}
